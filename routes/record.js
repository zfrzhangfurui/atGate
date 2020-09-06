const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createRecords, validateFields, getRecords, downloadXlsx, getDashboardData } = require('../controllers/record');



//get Records
router.route('/get_records').get(protect, getRecords);

//batch Create records
router.route('/batch_create').post(protect, validateFields, createRecords)

//download xlsx
router.route('/download_xlsx').get(protect, downloadXlsx);
//getDashboardData
router.route('/get_dashboard_data').get(protect, getDashboardData);
module.exports = router;