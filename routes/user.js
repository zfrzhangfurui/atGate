const express = require('express');
const { getUserInfo } = require('../controllers/user');
const { getUserToken } = require('../middleware/user');
const router = express.Router();


router.get('/me', getUserToken, getUserInfo);
module.exports = router;