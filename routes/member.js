const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { userSelfUpgrade } = require('../controllers/user');
const { becomeMemberWithoutName, linkToMember, firstLoginGetMembers, getMembers, addMember, selectGetMember, setStatus, editMember } = require('../controllers/member');

//first login get Members
router.route('/first_login_get_members').get(protect, firstLoginGetMembers);

//get members
router.route('/get_members').get(protect, getMembers);
//select get member
router.route('/select_get_member').get(protect, selectGetMember);
//add Member 
router.route('/add_member').put(protect, addMember);

//user become a member without existing name
router.route('/user_become_member_without_name').post(protect, becomeMemberWithoutName, userSelfUpgrade);

//user become a memeber with name
router.route('/user_link_to_member').put(protect, linkToMember, userSelfUpgrade);

//delete member
router.route('/set_status').put(protect, setStatus);

//edit_member
router.route('/edit_member').put(protect, editMember);
module.exports = router;