const ErrorResponse = require('../utils/errorResponse');
const errorHandler = (err, req, res, next) => {
    let error = { ...err }
    error.message = err.message;
    //Log to console for dev
    console.log(err.stack.red);

    //Mongoose bad ObjectId
    // next(new errorResponse(`Bootcamp not found with id of '${req.params.id}' and ID is not formatted`,404));
    if (err.name === 'CastError') {
        let message;
        if (err.hasOwnProperty('format')) {
            message = `Resource not found with id of ${err.value} and ${error.format}`;
        } else {
            message = `Resource not found with id of ${err.value}`;
        }
        error = new ErrorResponse(message, 404);
    }
    //Mongoose duplicate key
    console.log(err.code);
    if (err.code === 11000) {
        const message = `Error code: ${err.code}. Duplicate key error : at index ${err.index}`;
        error = new ErrorResponse(message, 400);
    }

    //Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
}

module.exports = errorHandler;