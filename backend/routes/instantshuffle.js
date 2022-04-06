const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const shuffle = require('../models/instantshuffle.js');
const wallet = require('../models/wallet.js');


router.post('/end', (req, res, next)=>{
     
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
    let Shuffle;
    let Wallet;
    Wallet = mongoose.model("Wallet", wallet);
    Wallet.findOne({ 'sellerAddress': req.body.address }, function (err, walletObj) {
        if (err){
            return res.status(500).json({ message: err, status : "fail"})
        } 
        if(walletObj === null){
            return res.status(500).json({message : "must have saved store wallet to end shuffle"})
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

            Shuffle = mongoose.model("InstantShuffle", shuffle);
            Shuffle.findOne({ 'storeAddress': walletObj.storeAddress }, function (err, shuffleObj) {
                if (err){
                    return res.status(500).json({ message: err, status : "fail"})
                    
                } 
                else if(shuffleObj==null){
                    return res.status(200).json({
                        message: "No shuffle found", status : "success"
                        })
                }
                else{
                    Shuffle.deleteOne({ 'storeAddress': walletObj.storeAddress }, function (err) {
                        if (err) {
                            return res.status(500).json({
                            message: "Error deleting document", status : "fail", error : err
                            }) 
                        }   
                        return res.status(200).json({
                            message: "Deleted shuffle", status : "success"
                            })    
                    });
                    
                }      
                })
            
        });


        
    })

})


router.post('/checkexists', (req, res, next)=>{
     
    if(!req.body.address){
        res.status(200).json({
            message: "must include address", status : "fail"
            })
            return;
    }
    let Shuffle;
    let Wallet;
    Wallet = mongoose.model("Wallet", wallet);
    Wallet.findOne({ 'sellerAddress': req.body.address }, function (err, walletObj) {
        if (err){
            return res.status(500).json({ message: err, status : "fail"})
        } 
        if(walletObj === null){
            return res.status(200).json({message : "must have saved store wallet to have shuffle", inProgress : false, status : "success"})
        }
        


        Shuffle = mongoose.model("InstantShuffle", shuffle);
        Shuffle.findOne({ 'storeAddress': walletObj.storeAddress }, function (err, shuffleObj) {
            if (err){
                return res.status(500).json({ message: err, status : "fail"})
                
            } 
            else if(shuffleObj==null){
                return res.status(200).json({
                    message: "No shuffle found", status : "success", inProgress : false
                    })
            }
            else{

                return res.status(200).json({
                    message: "Shuffle already in progress", status : "fail", inProgress : true
                    })     
            }      
            })
    })

})

router.post('/find', (req, res, next)=>{
     
    if(!req.body.address){
        res.status(200).json({
            message: "must include address", status : "fail"
            })
            return;
    }
    let Shuffle;
    let Wallet;
    Wallet = mongoose.model("Wallet", wallet);
    Wallet.findOne({ 'sellerAddress': req.body.address }, function (err, walletObj) {
        if (err){
            return res.status(500).json({ message: err, status : "fail"})
        } 
        if(walletObj === null){
            return res.status(500).json({message : "must have saved store wallet to create shuffle"})
        }
        


        Shuffle = mongoose.model("InstantShuffle", shuffle);
        Shuffle.findOne({ 'storeAddress': walletObj.storeAddress }, function (err, shuffleObj) {
            if (err){
                return res.status(500).json({ message: err, status : "fail"})
                
            } 
            else if(shuffleObj==null){
                return res.status(200).json({
                    message: "No shuffle found", status : "success"
                    })
            }
            else{

                return res.status(200).json({
                    message: "Shuffle found", status : "success", shuffle : shuffleObj
                    })     
            }      
            })
    })

})



module.exports = router;