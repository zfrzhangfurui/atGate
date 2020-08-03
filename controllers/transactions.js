const Transaction = require('../models/Transaction');
const Counter = require('../models/Counter');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc Get all Transactions
//@route GET /api/v1/transactions/get_transactions
//@access private
exports.getTransactions = asyncHandler(async (req, res, next) => {
    const transactions = await Transaction.find({ community: req.user.community }, 'name member_Id p c g type createdAt seq entryTime transfer');
    let trans_clone = [];
    for (let item of transactions) {
        trans_clone.push(item.toClient());
    }
    res.status(200).json({
        success: true, count: trans_clone.length, list: trans_clone
    })

    // res.status(200).json({success:true,msg:'Show all bootcamps'});
})


// @desc Create new transactions
//@route GET /api/v1/transactions/batch_create
//@access Private
exports.createTransactions = asyncHandler(async (req, res, next) => {
    let transactionsToClient = [];
    for (let item of req.body) {
        let transaction = await Transaction.create(item);
        transaction = transaction.toClient();
        transactionsToClient.push(transaction);
    }

    res.status(201).json(
        {
            success: true,
            count: transactionsToClient.length,
            list: transactionsToClient
        }
    );
})


// @desc Update transactions
//@route PUT /api/v1/transaction/update_transactions
//@access Private
exports.updateTransactions = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const form = req.body;
    let list = [];
    if (form.length === 0) {
        res.status(200).json({ success: true, count: form.length, list: list });
    } else {
        const bulkUpdate = async () => {
            for (let i of req.body) {
                const transaction = await Transaction.findByIdAndUpdate(
                    i.trans_id,
                    {
                        createdAt: i.createdAt,
                        g: i.g,
                        p: i.p,
                        c: i.c,
                        member_Id: i.member_Id,
                        name: i.name,
                        transfer: i.transfer,
                        type: i.type


                    }, {
                    new: true,
                }, function (err) {
                    next(err);
                }
                );
                // console.log(transaction);
                list.push(transaction);
            }
            // console.log(list);
            return 1;
        }
        if (bulkUpdate()) {
            res.status(200).json({ success: true, count: req.body.length, list: list });
        }
    }

    //find if any transaction is not in the database

    // for (let i of req.body) {
    //     const transaction = await Transaction.findByIdAndUpdate(i.trans_id, i.data);
    // }

    // const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    //     new: true,
    //     runValidators: true
    // })
    // if (!transaction) {
    //     return next(new errorResponse(`Transaction not found with id of ${req.params.id}`, 404));
    //     // return res.status(400).json({success:false})
    // }
    // res.status(200).json({ success: true, list: transaction });
})

// @desc Delete bootcamp
//@route DELETE /api/v1/transactions/delete_single/:id
//@access Private
exports.deleteTransaction = asyncHandler(async (req, res, next) => {
    console.log(req.params.id);
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
        return next(new errorResponse(`Transaction not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true });

})