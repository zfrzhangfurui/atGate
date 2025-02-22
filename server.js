const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
var path = require('path');
global.appRoot = path.resolve(__dirname);
//const logger = require('./logger/logger');

//load env vars
dotenv.config({ path: './config/config.env' });


//Connect to database
connectDB();
//Route files
const transactions = require('./routes/transactions');
const record = require('./routes/record');
const auth = require('./routes/auth');
const user = require('./routes/user');
const community = require('./routes/community');
const member = require('./routes/member');
const email = require('./routes/email');
const app = express();

//Body parser
app.use(express.json())
//Cookie parser
app.use(cookieParser());
//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
//app.use(logger);

//CORS 
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/transactions', transactions);
app.use('/api/v1/record', record);
app.use('/api/v1/user', user);
app.use('/api/v1/community', community);
app.use('/api/v1/member', member);
app.use('/api/v1/email', email);
app.use(errorHandler);
//console.log(process.env.PORT);
// /const PORT = 5000;
// app.get('/',(req,res)=>{
//     res.sendStatus(400);
//     res.send('Hello');

// })

const PORT = process.env.PORT || 80;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))

// Handle unhandled promise rejections
process.on('unhandleReejection', (err, promise) => {
    console.log(`unhandled rejection(promise): ${err.message}`.red);
    server.close(() => process.exit(1));
})


