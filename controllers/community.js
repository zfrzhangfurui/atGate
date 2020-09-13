const Community = require('../models/Community');
const Member = require('../models/Member');
const Counter = require('../models/Counter');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// @desc Admin Get all Communities
//@route GET /api/v1/community/adminGetCommunities
//@access Private
exports.adminGetCommunities = asyncHandler(async (req, res, next) => {
    let communities = await Community.find({}, 'community').populate('admin');
    let communitiesClone = []
    if (communities) {
        for (let i = 0; i < communities.length; i++) {
            communitiesClone[i] = {}
            communitiesClone[i].community = communities[i].community;
            communitiesClone[i].community_id = communities[i]._id;
            let adminNames = [];
            for (let j of communities[i].admin) {
                adminNames.push((await Member.findOne({ user_id: j._id })).name);
            }
            communitiesClone[i].adminNames = adminNames;
        }
    }
    res.status(200).json({
        success: true, count: communities.length, list: communitiesClone
    })
})

// @desc Get all Communities
//@route GET /api/v1/community/adminGetCommunities
//@access Private
exports.getCommunities = asyncHandler(async (req, res, next) => {
    const communities = await Community.find({}, 'community contactPerson communityEmail contactNumber');
    let communities_clone = [];
    for (let item of communities) {
        communities_clone.push(item.toClient());
    }
    res.status(200).json({
        success: true, count: communities.length, list: communities_clone
    })
})

// @desc Get communitySettings
//@route GET /api/v1/community/get_community_settings
//@access Private
exports.getCommunitySettings = asyncHandler(async (req, res, next) => {
    const community_id = res.locals.user.community_id;
    const community = await Community.findOne({ _id: community_id }, 'contactPerson communityEmail contactNumber');
    if (community) {
        res.status(200).json({
            success: true,
            communitySetting: community
        })
    }
})

// @desc put communitySettings
//@route Put /api/v1/community/edit_community_settings
//@access Private
exports.editCommunitySettings = asyncHandler(async (req, res, next) => {
    const community_id = res.locals.user.community_id;
    const { communityEmail, contactNumber, contactPerson } = req.body;
    console.log(communityEmail, contactNumber, contactPerson, community_id);
    const community = await Community.updateOne({ _id: community_id }, { communityEmail, contactNumber, contactPerson }, { new: true });

    if (community) {
        res.status(200).json({
            success: true,
            communitySetting: community
        })
    }
})


// @desc add Security code for a community
//@route POST /api/v1/community/add_community
//@access Private
exports.addCommunity = asyncHandler(async (req, res, next) => {
    if (res.locals.user.role !== 'root') {
        return next(new errorResponse('user do not have promission to add community', 403));
    }
    const { communityName } = req.body;
    const communityAdded = await Community.create({ community: communityName });
    if (communityAdded) {
        // res.status(200).json({
        //     success: true
        // })
        res.locals.community_id = communityAdded._id;
        next();
    }

})

// @desc Set Security code for a community
//@route PUT /api/v1/community/set_secruity_code
//@access Private
exports.setSecurityCode = asyncHandler(async (req, res, next) => {
    const role = res.locals.user.role;
    if (role !== 'root' && role !== 'admin') {
        return next(new errorResponse('user do not have promission to set Security Code', 403));
    }
    const { securityCode } = req.body;
    await Community.findOneAndUpdate({ _id: res.locals.user.community_id }, { securityCode }, { new: true }, function (err, doc) {
        if (err) {
            return next(err);
        }
        if (doc) {
            res.status(200).json({
                success: true
            })
        }

    });
    // await Community.findOneAndUpdate({ _id: '5f53842d5e83011f24238cc0' }, { securityCode: '123456' });
})

// @desc new Community Set Security code 
//@route PUT /api/v1/community/new_community_set_security_code
//@access Private
exports.newCommunitySetSecurityCode = asyncHandler(async (req, res, next) => {
    const role = res.locals.user.role;
    if (role !== 'root') {
        return next(new errorResponse('user do not have promission to set Security Code', 403));
    }
    const { securityCode } = req.body;
    const community_id = res.locals.community_id;
    await Community.findOneAndUpdate({ _id: community_id }, { securityCode }, { new: true }, function (err, doc) {
        if (err) {
            return next(err);
        }
        if (doc) {
            res.status(200).json({
                success: true
            })
        }

    });
})




// @desc check Security code for a community
//@route 
//@access Private
exports.signupCheckSecurityCode = asyncHandler(async (req, res, next) => {

    const { securityCode, community_id } = req.body;
    const community = await Community.findOne({ _id: community_id }).select('+securityCode').exec();
    const isMatch = await community.matchSecurityCode(securityCode);
    if (isMatch) {
        next()
    } else {
        res.status(403).json({
            success: false, securityCode: false
        })
    }
})


// @desc check Security code for a community
//@route 
//@access Private
exports.CheckSecurityCode = asyncHandler(async (req, res, next) => {

    const { securityCode } = req.body;
    const community_id = res.locals.user.community_id;
    const community = await Community.findOne({ _id: community_id }).select('+securityCode').exec();
    const isMatch = await community.matchSecurityCode(securityCode);
    if (isMatch) {
        res.status(200).json({
            success: true, isMatch
        })
    } else {
        res.status(403).json({
            success: false, securityCode: false
        })
    }
})





