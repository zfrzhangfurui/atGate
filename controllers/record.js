const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Record = require('../models/Record');
const moment = require('moment');
const Member = require('../models/Member');
const xlsx = require('xlsx');


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
    const startTime = req.query.starttime || '1970-01-01';
    const endTime = req.query.endtime || '2100-01-01';
    filterQuery.createdAt = {
        "$gte": startTime,
        "$lt": endTime
    }
    filterQuery.community_id = res.locals.user.community_id;
    filterQuery.status = 'active';
    req.query.member_id !== '' ? filterQuery.member_id = req.query.member_id : 123;
    const docs = await Record.find(filterQuery)
        // .populate('member_id', '_id m_id')
        .select('-_id name transfer p c g type  createdAt')
        .sort({ createdAt: -1 })
        .lean()
        .exec()
    let workBook = xlsx.utils.book_new();
    let worksheet = xlsx.utils.json_to_sheet(docs);
    xlsx.utils.book_append_sheet(workBook, worksheet, 'new record');
    let buffer = xlsx.write(workBook, { type: 'base64', bookType: 'xlsx', bookSST: false });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.end(new Buffer(buffer, 'base64'));
})



// @desc get_dashboard_data
//@route /record/get_dashboard_data
//@access Private

exports.getDashboardData = asyncHandler(async (req, res, next) => {
    const user_id = res.locals.user._id;
    const member = await Member.findOne({ user_id });
    const member_id = member._id;
    await Record.aggregate(
        [{
            $match: {
                member_id: member_id
            }
        },
        {
            $bucket: {
                groupBy: "$type",
                boundaries: [0, 1],
                output: {
                    "totaltransfer": {
                        $accumulator: {
                            init: function () {
                                return { transfer: 0 }
                            },
                            accumulate: function (state) {
                                console.log(state)
                            }
                        }
                    }
                }
            }
        }]

    )
})

