const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createRecords,
    validateFields,
    getRecords,
    downloadXlsx,
    getDashboardGeneralData,
    getDashboardRecordData,
    deleteRecord
} = require('../controllers/record');



//get Records
router.route('/get_records').get(protect, getRecords);

//batch Create records
router.route('/batch_create').post(protect, validateFields, createRecords)

//download xlsx
router.route('/download_xlsx').get(protect, downloadXlsx);
//getDashboardGeneralData
router.route('/get_dashboard_general_data').get(protect, getDashboardGeneralData);
//getDashboardRecordData
router.route('/get_dashboard_record_data').get(protect, getDashboardRecordData);
//delete Reocrd 
router.route('/delete_record').delete(protect, deleteRecord);

module.exports = router;