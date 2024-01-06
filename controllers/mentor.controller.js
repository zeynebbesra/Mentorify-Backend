const httpStatus = require('http-status')
const bcrypt = require('bcrypt')
const ApiError = require('../responses/error/api-error')
const ApiDataSuccess = require('../responses/success/api-success')
const Mentor = require('../models/mentor.model')


//Register

const register = async(req,res,next)=>{
    //generate new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword =  await bcrypt.hash(req.body.password, salt)

    try {
        //create new mentor
        const newMentor = new Mentor({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            desc: req.body.desc
        })
        const mentor = await newMentor.save()
        ApiDataSuccess.send("Register succesfull!", httpStatus.CREATED, res, mentor)
    } catch (error) {
        console.log(error)
        return next(new ApiError(error.message, httpStatus.BAD_REQUEST))
        
    }

}

module.exports = {
    register
}