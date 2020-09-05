const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateAndAddSeqFields } = require('../middleware/transactions');
const { getTransactions, createTransactions, updateTransactions, deleteTransaction, deleteAllTransactionAfterSubmit } = require('../controllers/transactions')



//get transaction
router.route('/get_transactions').get(protect, getTransactions)


//create transaction
router.route('/batch_create').post(protect, validateAndAddSeqFields, createTransactions);

//update transaction
router.route('/batch_update').put(protect, updateTransactions);

//delete transaction
router.route('/delete_single/:id').delete(protect, deleteTransaction);

//delete transactions after submit
router.route('/batch_delete').delete(protect, deleteAllTransactionAfterSubmit);

module.exports = router;