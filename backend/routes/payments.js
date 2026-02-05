const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { createPaymentValidation, paginationValidation } = require('../middleware/validator');

router.get('/', authenticateToken, paginationValidation, paymentController.getAllPayments);
router.post('/', authenticateToken, createPaymentValidation, paymentController.createPayment);
router.get('/student/:studentId', authenticateToken, paymentController.getPaymentsByStudent);

module.exports = router;