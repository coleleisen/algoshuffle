const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const shuffle = require('../models/instantshuffle.js');
const wallet = require('../models/wallet.js');


router.post('/', (req, res, next)=>{
    if(!req.body.price){
        res.status(200).json({
            message: "must include price", status : "fail"
            })
            return;
    }

    if(!req.body.image){
        res.status(200).json({
            message: "must include image", status : "fail"
            })
            return;
    }
     
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
                newShuffle = new Shuffle();
                newShuffle.sellerAddress = walletObj.sellerAddress
                newShuffle.storeAddress = walletObj.storeAddress
                newShuffle.price = req.body.price
                newShuffle.image = req.body.image
            
                newShuffle.save().then(savedShuffle => {
                    console.log(savedShuffle)
                    return res.status(200).json(savedShuffle);
                });  
            }
            else{
                return res.status(200).json({
                    message: "Shuffle already in progress", status : "fail"
                    })     
            }      
            })
    })

})

module.exports = router;