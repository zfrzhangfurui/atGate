const User = require('../models/User');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

//get user information (role, name, email, etc...)
exports.getUserInfo = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.decoded.id);

        res.status(200).json({
            success: true,
            userInfo: {
                email: user.email,
                role: user.role,
                name: user.name
            }
        })
    } catch (err) {
        return next(new ErrorResponse('Not authorize to access this route', 401))
    }

    // res.status(200).json({
    //     success: true,
    //     userInfo: {
    //         email: req.user.email,
    //         role: req.user.role,
    //         name: req.user.name
    //     }
    // })
})
