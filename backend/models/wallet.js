const mongoose = require('mongoose')

const Wallet = new mongoose.Schema({
  sellerAddress : String,
  storeAddress : String,
  storePK : String,
  storePhrase : String
})

module.exports = Wallet