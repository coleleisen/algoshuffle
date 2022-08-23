const express = require('express');
const app = express();
const mongoose = require('mongoose')
const morgan = require('morgan'); // logging module
const bodyParser = require('body-parser');
const saveWalletRoutes = require('./routes/savewallet');
const findWalletRoutes = require('./routes/findwallet');
const saveInstantShuffleRoutes = require('./routes/saveinstantshuffle');
const instantShuffleRoutes = require('./routes/instantshuffle');
const findInstantShufflesRoutes = require('./routes/findinstantshuffles');
const instantShuffleTransactionRoutes = require('./routes/instantshuffletransaction');
const optOutRoutes = require('./routes/optout');
const optInRoutes = require('./routes/optin');
const getApiKeyRoutes = require('./routes/getapikey');

let cors = require('cors')
app.use(cors())
require('dotenv').config();
//log to dev console
app.use(morgan('dev'));

// Handle json and urlencoded requests (adds req.body)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handle CORS enabled 

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    //Could be list of allowed headers, here '*' means all headers
    res.header('Access-Control-Allow-Headers', '*')
    if (req.method === 'OPTIONS') {
        // Update to include all methods
        res.header('Access-Control-Allow-Methods', 'PUT, POST')
        // dont process further if options request and will res here
        return res.status(200).json({})
    }
    next();
})
console.log(process.env.DB_USER)

const connectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@algoshuffle.p2rygjh.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(connectionString, {
  useNewUrlParser : true,
  useUnifiedTopology : true
})
mongoose.connection.on('connected', function() {
  console.log("connected to db")
})

//Routes
app.use('/savewallet', saveWalletRoutes)
app.use('/findwallet', findWalletRoutes)
app.use('/saveinstantshuffle', saveInstantShuffleRoutes)
app.use('/instantshuffle', instantShuffleRoutes)
app.use('/findinstantshuffles', findInstantShufflesRoutes)
app.use('/instantshuffletransaction', instantShuffleTransactionRoutes)
app.use('/getapikey', getApiKeyRoutes)
app.use('/optout', optOutRoutes)
app.use('/optin', optInRoutes)
// Error request, 
app.use((req, res, next) => {
    const error = new Error('Route Not Found')
    error.status = 404;
    next(error)
})

// Catch all errors from all parts of the app
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    console.log(error.message)
    res.json({
        error: {
            message: error.message
        }
    })
})

app.listen('3001', () => {
    console.log("backend is listening")
})

module.exports = app;