const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
// const User = require('../models/User');


//Find User with Token 
exports.getUserToken = (req, res, next) => {

    if (req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return next(new ErrorResponse('Not authorize to access this route', 401))
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        req.decoded = decoded;
        next()
    } catch (err) {
        return next(new ErrorResponse('Not authorize to access this route', 401))
    }

}
