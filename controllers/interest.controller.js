const httpStatus = require('http-status')
const ApiError = require('../responses/error/api-error')
const ApiDataSuccess = require('../responses/success/api-success')
const Interest = require("../models/interest.model")
const Category = require('../models/category.model')

const createInterest = async (req, res, next) => {
    try {
        const { name, categoryId } = req.body;
  
        const category = await Category.findById(categoryId);
        if (!category) {
            return next(
                new ApiError(
                    "Category not found!",
                    httpStatus.NOT_FOUND
                )
            );
        }
        const interest = new Interest({
            name,
            category: categoryId
        });

        await interest.save();

        ApiDataSuccess.send("Interest created successfully", httpStatus.OK, res, interest);

    } catch (error) {
        return next(
            new ApiError(
                console.error("error:",error),
                "Failed to create interest!",
                httpStatus.INTERNAL_SERVER_ERROR
            )
        );
    }
};


module.exports = {
    createInterest
}