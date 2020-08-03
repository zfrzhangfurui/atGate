const express = require('express');
const { register, login, sendTokenResponse, validateEmail } = require('../controllers/auth');
const { addMemberToCommunity } = require('../controllers/community')
const router = express.Router();


// router.post('/register', register,addMemberToCommunity,sendTokenResponse);
router.post('/register', register, sendTokenResponse);
router.get('/validate_email/:email', validateEmail)
// router.post('/register', register, addMemberToCommunity, sendTokenResponse);

router.post('/login', login, sendTokenResponse);
module.exports = router;