const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminGetCommunities, getCommunities, addCommunity, setSecurityCode, newCommunitySetSecurityCode } = require('../controllers/community')

//login get Communities
router.route('/get_communities').get(getCommunities);

//get Communities
router.route('/admin_get_communities').get(protect, adminGetCommunities);

//add Community
router.route('/add_community').post(protect, addCommunity, newCommunitySetSecurityCode);

//set Security Code 
router.route('/set_security_code').put(protect, setSecurityCode);
// router.route('/set_security_code').put(setSecurityCode);
module.exports = router;