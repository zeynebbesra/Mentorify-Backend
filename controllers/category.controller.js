const httpStatus = require('http-status')
const ApiError = require('../responses/error/api-error')
const ApiDataSuccess = require('../responses/success/api-success')
const Category = require('../models/category.model')

const getCategories = async(req, res, next) => {
    const  categories = await Category.find()
    try {
        if(!categories){
            return next(
                new ApiError(
                    "Categories failed to load",
                    httpStatus.BAD_REQUEST
                )
            )
        }
        ApiDataSuccess.send("Categories loaded successfully", httpStatus.OK, res, categories)
    } catch (error) {
        return next(
            new ApiError(
                "An error occurred",
                httpStatus.INTERNAL_SERVER_ERROR
            )
        )   
    }
    
}

const createCategory = async(req, res, next) => {
    const category = await new Category(req.body).save()
    try {
        if(!category){
            return next(
                new ApiError(
                    "Failed to create category!",
                    httpStatus.BAD_REQUEST
                )
            )   
        }
        ApiDataSuccess.send("Category loaded successfully", httpStatus.OK, res, category)
        
    } catch (error) {
        return next(
            new ApiError(
                "Failed to create category!",
                httpStatus.INTERNAL_SERVER_ERROR
            )
        )
    }

}




module.exports = {
    getCategories,
    createCategory

}