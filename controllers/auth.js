const User = require('../models/User');
const Community = require('../models/Community');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc Register user
//@route POST /api/v1/auth/register
//@access Public

exports.register = asyncHandler(async (req, res, next) => {
    const { email, password, community_id } = req.body;
    //Create user
    const user = await User.create({
        email, password, community_id
    })
    console.log(user);
    if (user) {
        res.locals.user = user;
    }
    next();
    //Create token and send response
    // sendTokenResponse(user, 200, res);
})

// @desc Login user
//@route POST /api/v1/auth/login
//@access Public

exports.validateEmail = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
        return res.status(200).json({
            success: true,
            isEmailAvailable: true
        })
    }

    return res.status(200).json({
        success: true,
        isEmailAvailable: false
    })
})


exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    //Validate email & password
    if (!email || !password) {
        return next(new errorResponse('Please provide an email and password', 400));
    }

    //check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new errorResponse('Invalid credentials', 401));
    }

    //check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new errorResponse('Invalid credentials', 401));
    }
    res.locals.user = user;
    next();
})



exports.sendTokenResponse = (req, res) => {
    //Create token
    const token = res.locals.user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }


    //production mode set secure to true,it means only https protocol is allowed 
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    res.status(200).cookie('token', token, options).json({
        success: true,
        token
    })
}