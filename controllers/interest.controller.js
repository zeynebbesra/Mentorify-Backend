const httpStatus = require('http-status')
const ApiError = require('../responses/error/api-error')
const ApiDataSuccess = require('../responses/success/api-success')
const Interest = require("../models/interest.model")

const createInterest = async(req, res, next) => {
    const category = await new Category(req.body).save()
    try {
        if(!category){
            return next(
                new ApiError(
                    "Failed to create interest!",
                    httpStatus.BAD_REQUEST
                )
            )   
        }
        ApiDataSuccess.send("Interests loaded successfully", httpStatus.OK, res, category)
        
    } catch (error) {
        return next(
            new ApiError(
                "Failed to create interest!",
                httpStatus.INTERNAL_SERVER_ERROR
            )
        )
    }

}

module.exports = {
    createInterest
}