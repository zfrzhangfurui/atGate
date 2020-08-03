const Community = require('../models/Community');
const Counter = require('../models/Counter');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// @desc Get all Communities
//@route GET /api/v1/community/getCommunities
//@access Private
exports.getCommunities = asyncHandler(async (req, res, next) => {
    console.log(req.query);
    const communities = await Community.find({ community: 'Hobart' }, 'community member memberMatched');
    console.log(communities);
    // res.status(200).json({
    //     success: true, count: communities.length, list: communities
    // })
})



// @desc get Member
//@route GET  /api/v1/community/get_members
//@access Private
exports.getMembers = asyncHandler(async (req, res, next) => {
    const doc = await Community.findOne({ community: req.user.community });
    let member = doc.member;
    let member_clone = [];
    if (member.length > 0) {
        for (let i = 0; i < member.length; i++) {
            const j = {
                member_id: member[i].member_id,
                name: member[i].name,
                address: member[i].address,
                user_id: member[i].user_id
            }
            member_clone.push(j);
        }
    }
    // console.log(member_clone);
    res.status(200).json({
        success: true,
        count: member_clone.length,
        list: member_clone
    })
})

// @desc  become member without existing name
//@route PUT /api/v1/community/user_become_member_without_name
//@access Private
exports.becomeMemberWithoutName = asyncHandler(async (req, res, next) => {
    const community = req.user.community;
    const data = req.body;
    const doc = await Community.findOne({ community });
    const i = await Counter.findOneAndUpdate({ name: 'memberAutoInc' }, { $inc: { seq: 1 } })
    const member_id = 10000 + i.seq;
    doc.member.push({
        member_id: member_id,
        name: data.name,
        address: data.address,
        user_id: req.user._id,
    })
    console.log(req.user._id);
    doc.save(function (err) {
        if (err) next(err);
    })

    // res.status(200).json({
    //     success: true
    // })
})

// @desc  become member with a name
//@route PUT /api/v1/community/user_link_to_member
//@access Private
exports.linkToMember = asyncHandler(async (req, res, next) => {
    const data = req.body

})