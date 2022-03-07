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
        return res.status(200).json({
            message: "no wallet found with that address", status : "fail"
            })
        
    }
    else{
        console.log(walletObj);
            return res.status(200).json(walletObj);

            
    }      
    })

})

module.exports = router;