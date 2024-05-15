const express = require('express')
const paymentController = require('../controllers/payment.controller')
const router = express.Router()

router
    .route('/create-payment-intent')
    .post(paymentController.createPayment)


module.exports = router