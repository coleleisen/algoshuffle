const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const wallet = require('../models/wallet.js');
const algosdk = require('algosdk');
const BlockchainPull = require('../services/blockchainpull.js')

let block = new BlockchainPull();

const baseServer = 'https://mainnet-algorand.api.purestake.io/ps2';
const testServer = "https://testnet-algorand.api.purestake.io/ps2";
let gateway = "https://gateway.pinata.cloud/ipfs/"
const placeHolder ='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII='
const port = '';

const token = {
   'X-API-Key': 'BFzlkNCYOkxXwEtQXnGl6X7u2iwmyYd146i92hHb'
}

//const algodClient = new algosdk.Algodv2('', 'https://api.algoexplorer.io/', '');
const algodClient = new algosdk.Algodv2(token, testServer, port);


// Function used to wait for a tx confirmation
const waitForConfirmation = async function (algodClient, txId, timeout) {
    if (algodClient == null || txId == null || timeout < 0) {
        throw new Error("Bad arguments");
    }

    const status = (await algodClient.status().do());
    if (status === undefined) {
        throw new Error("Unable to get node status");
    }

    const startround = status["last-round"] + 1;
    let currentround = startround;

    while (currentround < (startround + timeout)) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo !== undefined) {
            if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
                //Got the completed Transaction
                return pendingInfo;
            } else {
                if (pendingInfo["pool-error"] != null && pendingInfo["pool-error"].length > 0) {
                    // If there was a pool error, then the transaction has been rejected!
                    throw new Error("Transaction " + txId + " rejected - pool error: " + pendingInfo["pool-error"]);
                }
            }
        }
        await algodClient.statusAfterBlock(currentround).do();
        currentround++;
    }

    throw new Error("Transaction " + txId + " not confirmed after " + timeout + " rounds!");
};

router.post('/', async (req, res, next)=>{
    if(!req.body.address){
        res.status(200).json({
            message: "must include address", status : "fail"
            })
            return;
    }
    if(!req.body.token){
        res.status(200).json({
            message: "must include address", status : "fail"
            })
            return;
    }
    if(!req.body.params){
        res.status(200).json({
            message: "must include params", status : "fail"
            })
            return;
    }
    

    let Wallet;
    Wallet = mongoose.model("Wallet", wallet);
    Wallet.findOne({ 'sellerAddress': req.body.address }, async (err, walletObj)=> {
        if (err){
            return res.status(500).json({ message: err, status : "fail"})
        } 
        bcrypt.compare(walletObj.apiKey, req.body.token, async (err, result) =>{
            if(err){
                return res.status(200).json({
                    message: "Incorrect api key", status : "fail", error : err
                    })
            }
            if(!result){
                return res.status(200).json({
                    message: "Incorrect api key", status : "fail"
                    })
            }           
            if(walletObj === null){
                return res.status(500).json({message : "must have saved store wallet to create shuffle"})
            }else{
                //opt out of all amount 0 assets
                let acc = await block.algoGetAccount(walletObj.storeAddress)
                    console.log(acc)
                    let storeWallet = acc.data.account
                    let storeAssets = storeWallet.assets.filter(asset => asset.amount === 0)
                    console.log(storeAssets)
                    let account = walletObj.storeAddress
                    let params = req.body.params
                    let sender = account;
                    let recipient = account;
                    let revocationTarget = undefined;
                    let closeRemainderTo = account;
                    const enc = new TextEncoder();
                    const note = enc.encode("Opt out");
                    let amount = 0;
                    let optOutTrans = []
                    for(let asset of storeAssets) {
                        let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget,
                            amount, note, asset['asset-id'], params);
                        optOutTrans.push(opttxn)
                    }
                
                    
                    for(let txn of optOutTrans){   
                        let privateSig = new Uint8Array(Buffer.from(walletObj.storePK,'base64'));
                        let transfertxn = txn
                        let rawSignedTxn = transfertxn.signTxn(privateSig);
                        let opttx = await algodClient.sendRawTransaction(rawSignedTxn).do();
                        await waitForConfirmation(algodClient, opttx.txId, 4);
                        console.log("Transaction : " + opttx.txId);
                    }   
                    return res.status(200).json({message : "opted out of all assets", status : "success"})     
            }
        });
       
    })

})

module.exports = router;

