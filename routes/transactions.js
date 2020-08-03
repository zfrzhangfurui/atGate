const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateAndAddSeqFields } = require('../middleware/transactions');
const { getTransactions, createTransactions, updateTransactions, deleteTransaction } = require('../controllers/transactions')



//get transaction
router.route('/get_transactions').get(protect, getTransactions)


//create transaction
router.route('/batch_create').post(protect, validateAndAddSeqFields, createTransactions);

//update transaction
router.route('/batch_update').put(protect, updateTransactions);

//delete transaction
router.route('/delete_single/:id').delete(protect, deleteTransaction)


module.exports = router;