const mongoose = require('mongoose')

const Royalty = new mongoose.Schema({
  sellerAddress : String,
  price : Number
})

module.exports = Royalty