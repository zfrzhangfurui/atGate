const Transaction = require('../models/Transaction');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// @desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getTransactions = asyncHandler(async (req, res, next) => {

    const transactions = await Transaction.find();
    res.status(200).json({
        success: true, count: transactions.length, list: transactions
    })

    // res.status(200).json({success:true,msg:'Show all bootcamps'});
})

// @desc Get single bootcamps
//@route GET /api/v1/bootcamps/:id
//@access Public
exports.getTransaction = asyncHandler(async (req, res, next) => {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
        return next(new errorResponse(`Transaction not found with id of ${req.params.id}`, 404));
        // return res.status(400).json({
        //     success: false
        // })
    } else {
        return res.status(200).json({ success: true, list: transaction });
    }
})

// @desc Create new bootcamp
//@route GET /api/v1/bootcamps
//@access Private
exports.createTransaction = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const transaction = await Transaction.create(req.body);
    res.status(201).json(
        {
            success: true,
            list: transaction
        }
    );
})

// @desc Update bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access Private
exports.updateTransaction = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!transaction) {
        return next(new errorResponse(`Transaction not found with id of ${req.params.id}`, 404));
        // return res.status(400).json({success:false})
    }
    res.status(200).json({ success: true, list: transaction });
})

// @desc Update transactions
//@route PUT /api/v1/transaction/update_transactions
//@access Private
exports.updateTransactions = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    //find if any transaction is not in the database
    for (let i of req.body) {
        const transaction = await Transaction.findById(i.id);
        if (!transaction) {
            return next(new errorResponse(`Transaction not found with id of ${i.id}`, 404));
        }
    }

    for (let i of req.body) {
        const transaction = await Transaction.findByIdAndUpdate(i.id, i.data);
    }

    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    // if (!transaction) {
    //     return next(new errorResponse(`Transaction not found with id of ${req.params.id}`, 404));
    //     // return res.status(400).json({success:false})
    // }
    // res.status(200).json({ success: true, list: transaction });
})

// @desc Delete bootcamp
//@route DELETE /api/v1/bootcamps/:id
//@access Private
exports.deleteTransaction = asyncHandler(async (req, res, next) => {

    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
        return next(new errorResponse(`Transaction not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: {} });

})