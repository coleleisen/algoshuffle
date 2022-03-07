const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const wallet = require('../models/wallet.js');
const algosdk = require('algosdk');

router.post('/', (req, res, next)=>{
     
    if(!req.body.address){
        res.status(200).json({
            message: "must include address", status : "fail"
            })
            return;
    }
    let Wallet;

    Wallet = mongoose.model("Wallet", wallet);
    Wallet.findOne({ 'sellerAddress': req.body.address }, function (err, walletObj) {
    if (err){
        return res.status(500).json({ message: err, status : "fail"})
        
    } 
    else if(walletObj==null){
        newWallet = new Wallet();
        newWallet.sellerAddress = req.body.address
        //generate store wallet
        let account = algosdk.generateAccount();
        newWallet.storeAddress = account.addr
        let str = Buffer.from(account.sk).toString('base64');
        newWallet.storePK = str
        let passphrase = algosdk.secretKeyToMnemonic(account.sk);
        
        newWallet.storePhrase = passphrase;
        newWallet.save().then(savedWallet => {
            console.log(savedWallet)
            return res.status(200).json(savedWallet);
          });  
    }
    else{
        return res.status(200).json({
            message: "wallet already exists", status : "fail"
            })     
    }      
    })

})

module.exports = router;