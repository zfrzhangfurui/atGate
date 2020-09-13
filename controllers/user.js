const User = require('../models/User');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Member = require('../models/Member');

//get user information (role, name, email, etc...)
exports.getUserInfo = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.decoded.id);
        const user_id = user._id;
        const member = await Member.findOne({ user_id });
        const name = member.name;
        const address = member.address;
        console.log(user);
        res.status(200).json({
            success: true,
            userInfo: {
                email: user.email,
                role: user.role,
                name,
                address
            }
        })
    } catch (err) {
        return next(new ErrorResponse('Not authorize to access this route', 401))
    }

    // res.status(200).json({
    //     success: true,
    //     userInfo: {
    //         email: res.locals.user.email,
    //         role: res.locals.user.role,
    //         name: res.locals.user.name
    //     }
    // })
})


exports.upgradeUser = asyncHandler(async (req, res, next) => {
    if (res.locals.user.role !== 'root' && res.locals.user.role !== 'admin') {
        return next(new errorResponse('Not authorize to access this route', 401))
    }
    const { role, user_id } = req.body;
    const admin_user_id = res.locals.user._id.toString();
    if (user_id === admin_user_id) {
        return res.status(401).json({
            success: true,
            message: `You cannot change your own role`
        })
    }
    console.log(user_id);
    const user = await User.findByIdAndUpdate(user_id, { role: role }, { new: true });
    console.log(user);
    if (user) {
        res.status(200).json({
            success: true,
            message: `client has been upgrade to ${user.role}`
        })
    }


})

exports.userSelfUpgrade = asyncHandler(async (req, res, next) => {
    if (res.locals.user.role === 'user') {
        const user = await User.findByIdAndUpdate(res.locals.user._id, { role: 'member' }, { new: true });
        if (user) {
            res.status(200).json({
                success: true,
                message: `client has been upgrade to ${user.role}`
            })
        }
    }
})
