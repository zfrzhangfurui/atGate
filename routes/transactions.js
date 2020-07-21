const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTransactions, getTransaction, createTransaction, updateTransaction, updateTransactions, deleteTransaction } = require('../controllers/transactions')



//get transaction
router.route('/get_transactions').get(getTransactions)
router.route('/get_single_transaction/:id').get(getTransaction)


//create transaction
router.route('/create_single_transaction').post(protect, createTransaction);

//update transaction
router.route('/update_transactions').put(protect, updateTransactions);
router.route('/update_single_transaction/:id').put(protect, updateTransaction);

//delete transaction
router.route('/delete_single_transaction/:id').delete(protect, deleteTransaction)




// router.route('/create_single_transaction').post(protect, createTransaction);

// router.route('/update_transactions').put(protect,);
// router.route('/update_single_transaction/:id').put(protect,updateTransaction);
// router.route('/get_transactions').get(getTransactions).post(protect, createTransaction);
// router.route('/').get(getTransactions).post(protect, createTransaction);
// router.route('/get_single_transaction/:id').get(getTransaction)
// router.route('/delete_single_transaction/:id').delete(protect, deleteTransaction)

module.exports = router;