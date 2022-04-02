const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const wallet = require('../models/wallet.js');

const algosdk = require('algosdk')

const server = "https://testnet-algorand.api.purestake.io/ps2";
const port = '';

const token = {
   'X-API-Key': 'BFzlkNCYOkxXwEtQXnGl6X7u2iwmyYd146i92hHb'
}

const algodClient = new algosdk.Algodv2(token, server, port);

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

router.post('/', (req, res, next)=>{
    
    
    if(!req.body.address){
        res.status(200).json({
            message: "must include address", status : "fail"
            })
            return;
    }
    if(!req.body.token){
        res.status(200).json({
            message: "must include token", status : "fail"
            })
            return;
    }
    if(!req.body.storeAssets){
        res.status(200).json({
            message: "must include storeAssets", status : "fail"
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
    Wallet.findOne({ 'sellerAddress': req.body.address }, async (err, walletObj) =>{
        if (err){
            return res.status(500).json({ message: err, status : "fail"})
        } 
        if(walletObj === null){
            return res.status(500).json({message : "must have saved store wallet to complete transaction"})
        }
        bcrypt.compare(walletObj.apiKey, req.body.token, async(err, result) =>{
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
            let params = req.body.params
            let sender = walletObj.storeAddress;
            let recipient = walletObj.storeAddress;
            let revocationTarget = undefined;
            let closeRemainderTo = undefined;
            let amount = 0;
            //opt into all assets
            if(req.body.storeAssets.length){
                return
            }
            for(let asset of req.body.storeAssets) {
                let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget,
                amount, note, asset.index, params);
                let arr = new Uint8Array(Buffer.from(walletObj.storePK,'base64')); 
                let rawSignedTxn = opttxn.signTxn(arr);
                let opttx = (await algodClient.sendRawTransaction(rawSignedTxn).do());
                await waitForConfirmation(algodClient, opttx.txId, 4);
                console.log("Transaction : " + opttx.txId);
            }
            res.status(200).json({
                message: "completed opt ins", status : "success"
                })
                return;
        });
    });
    
})

module.exports = router;
