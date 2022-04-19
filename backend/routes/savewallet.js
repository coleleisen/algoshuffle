const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const wallet = require('../models/wallet.js');
const algosdk = require('algosdk');
const nobleEd25519 = require('@noble/ed25519');
const crypto = require('crypto');

router.post('/', async (req, res, next)=>{
     
    if(!req.body.address){
        res.status(200).json({
            message: "must include address", status : "fail"
            })
            return;
    }
    if(!req.body.txn){
        res.status(200).json({
            message: "must include txn", status : "fail"
            })
            return;
    }
    if(!req.body.unsignedTxn){
        res.status(200).json({
            message: "must include unsignedTxn", status : "fail"
            })
            return;
    }
    let Wallet;

    Wallet = mongoose.model("Wallet", wallet);
    Wallet.findOne({ 'sellerAddress': req.body.address }, async (err, walletObj)=> {
    if (err){
        return res.status(500).json({ message: err, status : "fail"})
        
    } 
    else if(walletObj==null){

        // validate a algoconnect

        let signedTxn = Buffer.from(req.body.txn, 'base64');
        let unsignedTxn = Buffer.from(req.body.unsignedTxn, 'base64');
        const dTxn = algosdk.decodeSignedTransaction(signedTxn)
        let unsigned = algosdk.decodeUnsignedTransaction(unsignedTxn)
        const publicKey = unsigned.from.publicKey
        // get the bytes to sign from the transaction
        const hTxn = Buffer.from(unsigned.bytesToSign()).toString('hex');
        // get the signature from the signed transaction
        const sig = Buffer.from(dTxn.sig)
        // verify signature
        const verified = await nobleEd25519.verify(sig, hTxn, publicKey);

        if(verified){
            newWallet = new Wallet();
            newWallet.sellerAddress = req.body.address
            //generate store wallet
            let account = algosdk.generateAccount();
            newWallet.storeAddress = account.addr
            let str = Buffer.from(account.sk).toString('base64');
            newWallet.storePK = str
            let passphrase = algosdk.secretKeyToMnemonic(account.sk);
            
            newWallet.storePhrase = passphrase;
            //create API key
            const saltRounds = 10;
            const token = crypto.randomUUID();
            newWallet.apiKey = token;
            newWallet.save().then(async (savedWallet) => {
                console.log(savedWallet)
                const hashedToken = await bcrypt.hash(token, saltRounds);
                savedWallet.apiKey = hashedToken
                console.log(savedWallet)
                return res.status(200).json(savedWallet);
            });  
            
        }else{
            return res.status(200).json({
                message: "failure verifying address", status : "fail"
                })  
        }
    }
    else{
        return res.status(200).json({
            message: "wallet already exists", status : "fail"
            })     
    }      
    })

})

module.exports = router;