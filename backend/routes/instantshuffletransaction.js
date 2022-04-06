const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const wallet = require('../models/wallet.js');
const royalty = require('../models/royalty');
const algosdk = require('algosdk')

const server = "https://testnet-algorand.api.purestake.io/ps2";
const port = '';

const token = {
   'X-API-Key': 'BFzlkNCYOkxXwEtQXnGl6X7u2iwmyYd146i92hHb'
}

const algodClient = new algosdk.Algodv2(token, server, port);




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
    if(!req.body.shuffle){
        res.status(200).json({
            message: "must include shuffle", status : "fail"
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
    let Royalty;
    Wallet = mongoose.model("Wallet", wallet);
    Royalty = mongoose.model("Royalty", royalty);
    Wallet.findOne({ 'storeAddress': shuffle.storeAddress }, function (err, walletObj) {
        if (err){
            return res.status(500).json({ message: err, status : "fail"})
        } 
        if(walletObj === null){
            return res.status(500).json({message : "must have saved store wallet to complete transaction"})
        }
        bcrypt.compare(walletObj.apiKey, req.body.token, function(err, result) {
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
            Royalty.findOne({ 'sellerAddress': shuffle.storeAddress }, function (err, royaltyFound) {
                if (err){
                    return res.status(500).json({ message: err, status : "fail"})
                } 
                let royaltyAmount;
                if(royaltyFound === null){
                    royaltyAmount = 0.10
                }else{
                    royaltyAmount = royaltyFound.price
                }
                let account = req.body.address
                let params = req.body.params
                let shuffle = req.body.shuffle
                let storeAssets = req.body.storeAssets
                let sender = account;
                let recipient = account;
                let revocationTarget = undefined;
                let closeRemainderTo = undefined;
                let royaltyPrice = shuffle.price * royaltyAmount
                const enc = new TextEncoder();
                const note = enc.encode("Hello World");
                let amount = 0;
                let submitTxnArr=[]
                const receiver = shuffle.storeAddress;
                let price = shuffle.price; 
                let lankz = "LANKZYW5QDFPDB4RYI3BH7MMCAYKOZUAFIE4VNDSKKTY26YCCSSRFRTYAA"
                let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender, 
                    to: receiver, 
                    amount: price - royaltyPrice, 
                    node: note, 
                    suggestedParams: params
                });
                let royaltytxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender, 
                    to: lankz, 
                    amount: royaltyPrice, 
                    node: note, 
                    suggestedParams: params
                });
                submitTxnArr.push(txn)
                submitTxnArr.push(royaltytxn)
                let noteOpt = enc.encode("Opt in");
                let selectedIndex = Math.floor(Math.random() * storeAssets.length)
                const randomElement = storeAssets[selectedIndex];
                
                for(let asset of storeAssets) {
                    if(asset['asset-id'] === randomElement['asset-id']){
                        let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget,
                            amount, noteOpt, asset['asset-id'], params);
                        submitTxnArr.push(opttxn)
                    }
                }

                sender = shuffle.storeAddress
                recipient = account
                amount = 1;
                let noteFlag = enc.encode("Asset Transfer");
            
                let xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget,
                    amount,  noteFlag, randomElement['asset-id'] ,params);

                submitTxnArr.push(xtxn)       
                let txgroup = algosdk.assignGroupID(submitTxnArr);

                
                let signArray = []
                console.log(submitTxnArr)
                let objJsonStr = algosdk.encodeUnsignedTransaction(submitTxnArr[0]);
                console.log(objJsonStr)
                let objJsonB64 = Buffer.from(objJsonStr).toString("base64");
                signArray.push(objJsonB64)
                let objJsonStr1 = algosdk.encodeUnsignedTransaction(submitTxnArr[1]);
                let objJsonB641 = Buffer.from(objJsonStr1).toString("base64");
                signArray.push(objJsonB641)
                //recieve response and convert to bytes for signing
                for(let asset of storeAssets){
                    let copiedTxn = submitTxnArr[2]
                    let asaid = asset['asset-id']
                    copiedTxn.assetIndex = asaid
                    console.log(copiedTxn)
                    let objJsonStr2 = algosdk.encodeUnsignedTransaction(copiedTxn);
                    let objJsonB642 = Buffer.from(objJsonStr2).toString("base64");
                    signArray.push(objJsonB642)
                }
                let privateSig = new Uint8Array(Buffer.from(walletObj.storePK,'base64'));
                let transfertxn = submitTxnArr[3]
                let rawSignedTxn = transfertxn.signTxn(privateSig);
                let rawSignedTxnB64 = Buffer.from(rawSignedTxn).toString("base64");
                
                res.status(200).json({
                    signArray : signArray, message : "delivering transactions", assets : storeAssets, selectedIndex : selectedIndex,  rawSignedTxn : rawSignedTxnB64
                    })
                    return;
                })
         
        });
    });
    
})




module.exports = router;