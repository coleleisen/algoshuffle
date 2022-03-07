const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const instantShuffle = require('../models/instantshuffle.js');

router.get('/', (req, res, next)=>{

    let Shuffle

    Shuffle = mongoose.model("InstantShuffle", instantShuffle);
    Shuffle.find({}, function (err, shufflesObj) {
    if (err){
        return res.status(500).json({ message: err, status : "fail"})
        
    } 
    else if(shufflesObj==null){
        return res.status(200).json({
            message: "no shuffles found", status : "fail"
            })
        
    }
    else{
        console.log(shufflesObj);
            return res.status(200).json(shufflesObj);            
    }      
    })

})

module.exports = router;