const express = require('express')
const interestController = require('../controllers/interest.controller')
const router = express.Router()

router
    .route('/')
    .get(interestController.getCategories)

router
    .route('/')
    .post( interestController.createCategory)

module.exports = router