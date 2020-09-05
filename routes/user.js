const express = require('express');
const { getUserInfo, upgradeUser } = require('../controllers/user');
const { getUserToken } = require('../middleware/user');
const { protect } = require('../middleware/auth');
const router = express.Router();


router.get('/me', getUserToken, getUserInfo);
router.put('/upgrade_user', protect, upgradeUser)

module.exports = router;