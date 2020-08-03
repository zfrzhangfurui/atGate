const Transaction = require('../models/Transaction');
const Counter = require('../models/Counter');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.validateAndAddSeqFields = asyncHandler(async (req, res, next) => {
    let transactions = [];
    let err;
    for (let [index, item] of req.body.entries()) {
        item.createdBy = req.user._id;
        item.community = req.user.community;
        const i = await Counter.findOneAndUpdate({ name: 'transAutoInc' }, { $inc: { seq: 1 } })
        item.seq = 10000 + i.seq;
        let doc = new Transaction(item);
        err = doc.validateSync()
        if (err) {
            const message = Object.values(err.errors).map(val => val.message);
            err = new errorResponse(`ValidationError, on resource index: ${index}, error Message: ${message}`, 400)
            break;
        }
        transactions.push(item);
    }
    if (err) {
        return next(err)
    } else {
        req.body = transactions;
        next();
    }

})



exports.validateFields = asyncHandler(async (req, res, next) => {
    for (let i of req.body) {
        const transaction = await Transaction.findById(i.id);
        if (!transaction) {
            return next(new errorResponse(`Transaction not found with id of ${i.id}`, 404));
        }
    }

})

