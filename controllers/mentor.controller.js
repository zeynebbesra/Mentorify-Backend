const httpStatus = require('http-status')
const bcrypt = require('bcrypt')
const ApiError = require('../responses/error/api-error')
const ApiDataSuccess = require('../responses/success/api-success')
const Mentor = require('../models/mentor.model')
const { createLoginToken } = require('../helpers/jwt.helper')


//Register
const register = async(req, res, next) => {
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

//Login
const login = async(req, res, next) => {
    try {
        const user = await Mentor.findOne({email: req.body.email})
        if(!user){
            return next(
                new ApiError(
                    "Email or password is incorrect!",
                    httpStatus.BAD_REQUEST
                )
            )
        }
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        )
        if(!validPassword){
            return next(
                new ApiError(
                    "Password is incorrect!",
                    httpStatus.BAD_REQUEST
                )
            )
        }
        const accessToken = createLoginToken(user, res)
        ApiDataSuccess.send("Login succesfull!", httpStatus.OK, res, accessToken)
    } catch (error) {
        return next(
            new ApiError(
                console.log(error),
                "Something went wrong :(",
                httpStatus.INTERNAL_SERVER_ERROR,
                error.message
            )
        )
        
    }
}


module.exports = {
    register,
    login
}