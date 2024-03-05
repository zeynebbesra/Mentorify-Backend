const express = require('express')
const categoryController = require('../controllers/category.controller')
const router = express.Router()

router
    .route('/')
    .get(categoryController.getCategories)

module.exports = router