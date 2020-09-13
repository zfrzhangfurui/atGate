const express = require('express');
const { register, login, sendTokenResponse, validateEmail, logout } = require('../controllers/auth');
const { addMemberToCommunity, signupCheckSecurityCode } = require('../controllers/community')
const router = express.Router();


// router.post('/register', register,addMemberToCommunity,sendTokenResponse);
router.post('/register', signupCheckSecurityCode, register, sendTokenResponse);

router.get('/validate_email/:email', validateEmail)
// router.post('/register', register, addMemberToCommunity, sendTokenResponse);

router.post('/login', login, sendTokenResponse);
router.get('/logout', logout);
module.exports = router;