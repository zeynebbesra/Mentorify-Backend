const express = require('express')
const interestController = require('../controllers/interest.controller')
const router = express.Router()


router
    .route('/')
    .post( interestController.createInterest)

module.exports = router