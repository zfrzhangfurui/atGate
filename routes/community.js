const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCommunities, becomeMemberWithoutName, linkToMember, getMembers } = require('../controllers/community')



//get Communities
router.route('/get_communities').get(protect, getCommunities);

//get Member
router.route('/get_members').get(protect, getMembers);

//user become a member without existing name
router.route('/user_become_member_without_name').put(protect, becomeMemberWithoutName);

//user become a memeber with name
router.route('/user_link_to_member').put(protect, linkToMember);
module.exports = router;