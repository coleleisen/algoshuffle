const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
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
    if(!req.body.token){
        res.status(200).json({
            message: "must include token", status : "fail"
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
        console.log(walletObj)
        bcrypt.compare(walletObj.apiKey, req.body.token, function(err, result) {
            if(err){
                return res.status(200).json({
                    message: "Incorrect api key", status : "fail", error : err
                    })
            }
            if(result){
                console.log(walletObj);
                return res.status(200).json(walletObj);
            }else{
                return res.status(200).json({
                    message: "Incorrect api key", status : "fail"
                    })
            }
            
        });
             
    }      
    })

})

module.exports = router;