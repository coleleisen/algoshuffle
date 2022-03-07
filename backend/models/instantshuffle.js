const mongoose = require('mongoose')

const InstantShuffle = new mongoose.Schema({
  sellerAddress : String,
  storeAddress : String,
  price : Number,
  image : String
})

module.exports = InstantShuffle