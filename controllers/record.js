const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Record = require('../models/Record');
const moment = require('moment');
const Member = require('../models/Member');
const xlsx = require('xlsx');
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId;
const { findByIdAndDelete } = require('../models/Member');


// @desc  get Members
//@route GET  /api/v1/record/get_records
//@access Private
exports.getRecords = asyncHandler(async (req, res, next) => {
    //filter time
    const startTime = req.query.starttime || '1970-01-01';
    const endTime = req.query.endtime || '2100-01-01';
    const createdAt = {
        "$gte": startTime,
        "$lt": endTime
    }
    //sort time
    const sortTime = req.query.sorttime;
    const sortAlphabet = req.query.sortalphabet;
    let sort = [];
    if (sortAlphabet === 'true') {
        sort.push(["name", 1]);
    }
    if (sortTime === 'true') {
        sort.push(["createdAt", 1])
        // sort.createdAt = 1;
    } else if (sortTime === 'false') {
        sort.push(["createdAt", -1]);
    }
    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    //compose filter query
    let filterQuery = {};
    filterQuery.community_id = res.locals.user.community_id;
    switch (req.query.status) {
        case '': filterQuery; break;
        case 'active': filterQuery.status = 'active'; break;
        case 'deactived': filterQuery.status = 'deactived'; break;
    }
    req.query.member_id !== '' ? filterQuery.member_id = req.query.member_id : 123;
    filterQuery.createdAt = createdAt;
    const count = await Record.countDocuments(filterQuery);
    const docs = await Record.find(filterQuery)
        .populate('member_id', '_id m_id')
        .collation({ locale: "en" })
        .select('name transfer p c g type createdBy createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limit).exec();

    res.status(200).json({
        success: true, count: count, list: docs
    })
})






// @desc Create new Records
//@route POST /api/v1/record/batch_create
//@access Private
exports.createRecords = asyncHandler(async (req, res, next) => {
    let RecordsToClient = [];


    for (let item of req.body) {
        const memberDetail = { ...item, community_id: res.locals.user.community_id, createdBy: res.locals.user._id }

        let records = await Record.create(memberDetail);
        RecordsToClient.push(records);
    }
    res.status(201).json(
        {
            success: true,
            count: RecordsToClient.length,
            list: RecordsToClient
        }
    );

})


// @desc validate record fields before insert into database 
//@route 
//@access Private
exports.validateFields = asyncHandler(async (req, res, next) => {
    const data = req.body;

    try {
        data.forEach((element, index) => {

            const memberDetail = { ...element, community_id: res.locals.user.community_id, createdBy: res.locals.user._id }
            console.log(memberDetail);
            const doc = new Record(memberDetail);
            const err = doc.validateSync();
            if (err) {
                const message = Object.values(err.errors).map(val => val.message);
                const error = new errorResponse(`ValidationError, on resource index: ${index}, error Message: ${message}`, 400);
                throw error;
            }
        });
    } catch (err) {
        next(err);
    }
    next();
})


// @desc download xlsx
//@route /record/download_xlsx
//@access Private
exports.downloadXlsx = asyncHandler(async (req, res, next) => {
    let filterQuery = {};
    if (req.query.member_id === '') {
        return next(errorResponse(400, 'must pick a member'));
    }
    console.log(req.query.member_id);
    filterQuery.member_id = req.query.member_id;
    const record = await Record.aggregate(
        [
            {
                $match: {
                    // member_id: req.query.member_id
                    member_id: ObjectId(filterQuery.member_id)
                }
            },
            {
                $group: {
                    _id: { type: "$type" },
                    transfer: {
                        $sum: "$transfer"
                    },
                    c: {
                        $sum: "$c"
                    },
                    p: {
                        $sum: "$p"
                    },
                    g: {
                        $sum: "$g"
                    }
                }
            }
        ]

    )

    let transBalance = 0, cBalance = 0, pBalance = 0, cDeposit, pDeposit, cWithdrow, pWithdrow;
    for (let i of record) {
        if (i._id.type) {
            transBalance = transBalance + i.transfer
            cBalance = cBalance + i.c;
            pBalance = pBalance + i.p;
            cDeposit = i.c;
            pDeposit = i.p;

        } else {
            transBalance = transBalance - i.transfer;
            cBalance = cBalance - i.c;
            pBalance = pBalance - i.p;
            cWithdrow = i.c;
            pWithdrow = i.p;

        }
    }
    console.log(transBalance, cBalance, pBalance, cDeposit, pDeposit, cWithdrow, pWithdrow);

    const member = await Member.findOne({ _id: filterQuery.member_id }, 'm_id name');
    console.log(member);
    const m_id = member.m_id;
    const name = member.name;
    const memberXlsxSummary = [
        {
            'name': name,
            'Member id': m_id,
            'transfer Balance': transBalance,
            'C balance': cBalance,
            'P balance': pBalance,
            'C Total Deposit': cDeposit,
            'P Total Deposit': pDeposit,
            'C Total withdrow': cWithdrow,
            'P Total withdrow': pWithdrow
        }
    ]
    /***********************************************************************************************/
    const startTime = req.query.starttime || '1970-01-01';
    const endTime = req.query.endtime || '2100-01-01';
    filterQuery.community_id = res.locals.user.community_id;
    filterQuery.status = 'active';

    filterQuery.createdAt = {
        "$gte": startTime,
        "$lt": endTime
    }

    const docs = await Record.find(filterQuery)
        .select('-_id name transfer p c g type  createdAt')
        .sort({ name: 1, createdAt: -1 })
        .lean()
        .exec()

    docs.forEach((doc) => {
        if (doc.type) {
            delete doc.type
        } else {
            doc.transfer = -doc.transfer;
            doc.p = -doc.p;
            doc.c = -doc.c;
            doc.g = -doc.g;
            delete doc.type
        }
        return doc
    })
    let workBook = xlsx.utils.book_new();
    let worksheet1 = xlsx.utils.json_to_sheet(memberXlsxSummary);
    let worksheet2 = xlsx.utils.json_to_sheet(docs);
    xlsx.utils.book_append_sheet(workBook, worksheet1, 'Member Summary');
    xlsx.utils.book_append_sheet(workBook, worksheet2, 'Member Transaction');
    let buffer = xlsx.write(workBook, { type: 'base64', bookType: 'xlsx', bookSST: false });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.end(new Buffer.from(buffer, 'base64'));
})



// @desc get_dashboard_general_data
//@route /record/get_dashboard_general_data
//@access Private

exports.getDashboardGeneralData = asyncHandler(async (req, res, next) => {
    const user_id = res.locals.user._id;
    const member = await Member.findOne({ user_id });
    const member_id = member._id;
    const record = await Record.aggregate(
        [{
            $match: {
                member_id: member_id
            }
        },
        {
            $group: {
                _id: { type: "$type" },
                transfer: {
                    $sum: "$transfer"
                },
                c: {
                    $sum: "$c"
                },
                p: {
                    $sum: "$p"
                },
                g: {
                    $sum: "$g"
                }
            }
        }]

    )

    res.status(200).json({
        success: true, record
    })
})

// @desc get_dashboard_Record_data
//@route /record/get_dashboard_Record_data
//@access Private
exports.getDashboardRecordData = asyncHandler(async (req, res, next) => {
    const user_id = res.locals.user._id;
    const member = await Member.findOne({ user_id });
    const member_id = member._id;
    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const record = await Record.find({ member_id })
        .select('name transfer p c g type createdBy createdAt')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit).exec();
    res.status(200).json({
        success: true, record: record
    })
})


// @desc get_dashboard_Record_data
//@route /record/get_dashboard_Record_data
//@access Private
exports.deleteRecord = asyncHandler(async (req, res, next) => {

    const { delete_id } = req.query;
    console.log(delete_id);
    const deleted = await Record.findByIdAndDelete({ _id: delete_id });
    if (deleted) {
        res.status(200).json({
            success: true
        })
    }
})
