const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Member = require('../models/Member');
const Counter = require('../models/Counter');
const Community = require('../models/Community');
const Record = require('../models/Record');

// @desc first login get Member
//@route GET  /api/v1/member/first_login_get_members
//@access Private
exports.firstLoginGetMembers = asyncHandler(async (req, res, next) => {
    const pattern = req.query.pattern;
    let query = {};
    query.community_id = res.locals.user.community_id;
    query.name = new RegExp(pattern, 'i');
    query.user_id = null;
    docs = await Member.find(query).exec();
    res.status(200).json({
        success: true,
        count: docs.length,
        list: docs
    })
})


// @desc  admin add member to community
//@route PUT /api/v1/member/add_Member
//@access Private
exports.addMember = asyncHandler(async (req, res, next) => {
    if (res.locals.user.role !== 'admin' && res.locals.user.role !== 'root') {
        return next(new errorResponse('user do not have permissions to add member', 403));
    }
    const i = await Counter.findOneAndUpdate({ name: 'memberAutoInc' }, { $inc: { seq: 1 } })
    const m_id = 10000 + i.seq;

    if (res.locals.user.role === 'admin' || res.locals.user.role === 'root') {
        const { name, address } = req.body;
        const { community_id } = res.locals.user;
        console.log(community_id);
        const doc = await Community.findById(community_id);
        const member = await Member.create({ name, address, community_id: doc._id, community: doc.community, m_id });
        doc.member.push(
            member._id,
        )
        const i = await doc.save();
        console.log(i);

        if (i) {
            res.status(200).json({
                success: true
            })
        }
    }
    // if (res.locals.user.role === 'root') {
    //     let { community_id, name, address } = req.body;
    //     if (!community_id) {
    //         community_id = res.locals.user.community_id;
    //     }
    //     const doc = await Community.findById(community_id);
    //     const member = await Member.create({ name, address, community_id: doc._id, community: doc.community });
    //     doc.member.push({
    //         member_id,
    //     })
    //     const i = await doc.save();
    //     console.log(i);
    //     if (i) {
    //         res.status(200).json({
    //             success: true
    //         })
    //     }
    // }
})


// @desc  become member with a name
//@route PUT /api/v1/member/user_link_to_member
//@access Private
exports.linkToMember = asyncHandler(async (req, res, next) => {
    const { member_id } = req.body;
    if (res.locals.user.role !== 'user') {
        return res.status(403).json({
            success: false,
            message: "you are already a member"
        })
    }
    const doc = await Member.findByIdAndUpdate({ "_id": member_id }, { user_id: res.locals.user._id });
    if (doc) {
        next();
    } else {

    }
    console.log(doc);
})


// @desc  become member without existing name
//@route PUT /api/v1/member/user_become_member_without_name
//@access Private
exports.becomeMemberWithoutName = asyncHandler(async (req, res, next) => {
    const community_id = res.locals.user.community_id;
    const { name, address } = req.body;
    const i = await Counter.findOneAndUpdate({ name: 'memberAutoInc' }, { $inc: { seq: 1 } })
    const m_id = 10000 + i.seq;
    const doc = await Community.findById(community_id);
    const member = await Member.create({ name, address, community_id: doc._id, user_id: res.locals.user._id, community: doc.community, m_id: m_id });
    doc.member.push(member._id)
    doc.save(function (err) {
        if (err) next(err);
        next();
    })
})

// @desc  get Members
//@route GET  /api/v1/member/get_members
//@access Private
exports.getMembers = asyncHandler(async (req, res, next) => {
    const community_id = req.query.community_id || res.locals.user.community_id;
    const status = req.query.status || ['active', 'deactived'];
    console.log(status);
    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    let count, docs;
    if (res.locals.user.role === 'admin') {
        count = await Member.countDocuments({ 'community_id': res.locals.user.community_id, name: new RegExp(req.query.pattern, 'i'), status });
        docs = await Member.find({ 'community_id': res.locals.user.community_id, name: new RegExp(req.query.pattern, 'i'), status })
            .populate('user_id', 'role')
            .collation({ locale: "en" })
            .select('name address status community_id user_id community m_id')
            .sort({ m_id: 1 })
            .skip(skip)
            .limit(limit).exec();

    } else if (res.locals.user.role === 'root') {
        count = await Member.countDocuments({ 'community_id': community_id, name: new RegExp(req.query.pattern, 'i'), status });
        docs = await Member.find({ 'community_id': community_id, name: new RegExp(req.query.pattern, 'i'), status })
            .populate('user_id', 'role')
            .collation({ locale: "en" })
            .select('name address status community_id user_id community m_id')
            .sort({ m_id: 1 })
            .skip(skip)
            .limit(limit).exec();
    } else {
        next(new errorResponse('Unauthorized to access this route', 401))
    }
    console.log(docs);
    res.status(200).json({
        success: true, count: count, list: docs
    })
})


// @desc  select get member
//@route GET  /api/v1/member/select_get_member
//@access Private
exports.selectGetMember = asyncHandler(async (req, res, next) => {
    const member_id = req.query.member_id;
    const docs = await Member.find({ _id: req.query.member_id }).exec();
    res.status(200).json({
        success: true, count: 1, list: docs
    })
})

// @desc  setStatus member
//@route GET  /api/v1/member/setStatus
//@access Private
exports.setStatus = asyncHandler(async (req, res, next) => {
    if (res.locals.user.role !== 'admin' && res.locals.user.role !== 'root') {
        return next(new errorResponse('user do not have permissions to set Status member', 403));
    }
    const adminCommunity_id = res.locals.user.community_id.toString();
    const { community_id, member_id, statusSetTo } = req.body;

    console.log(community_id, member_id, statusSetTo)
    if (community_id !== adminCommunity_id) {
        return next(new errorResponse('user do not have permissions to set Status member from other community', 403));
    }
    const member = await Member.findByIdAndUpdate(member_id, { status: statusSetTo }, { new: true });
    const record = await Record.updateMany({ member_id }, { status: statusSetTo }, { new: true });
    console.log(member);

    if (member && record) {
        res.status(200).json({
            success: true
        })
    }


})

// @desc  Edit member
//@route GET  /api/v1/member/edit_member
//@access Private
exports.editMember = asyncHandler(async (req, res, next) => {
    if (res.locals.user.role !== 'admin' && res.locals.user.role !== 'root') {
        return next(new errorResponse('user do not have permissions to set Status member', 403));
    }
    const { name, address, member_id } = req.body;
    const member = await Member.findByIdAndUpdate(member_id, { name, address }, { new: true });
    const record = await Record.updateMany({ member_id }, { name }, { new: true });
    if (member && record) {
        res.status(200).json({
            success: true
        })
    }
})