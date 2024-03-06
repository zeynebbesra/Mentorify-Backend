const httpStatus = require('http-status')
const bcrypt = require('bcrypt')
const ApiError = require('../responses/error/api-error')
const ApiDataSuccess = require('../responses/success/api-success')
const Mentor = require('../models/mentor.model')
const { createLoginToken } = require('../helpers/jwt.helper')
const passwordHelper = require('../helpers/password.helper')

//Get Mentors
const getMentors = async(req, res, next)=> {
    const mentors = await Mentor.find()
    try {
        if(!mentors){
            return next(
                new ApiError(
                    "Mentors failed to load",
                    httpStatus.NOT_FOUND
                )
            )
        }
        ApiDataSuccess.send("Mentors loaded successfully", httpStatus.OK, res, mentors)
    } catch (error) {
        return next(
            new ApiError(
                "An error ocured",
                httpStatus.INTERNAL_SERVER_ERROR
            )
        )
    }
}

//Register
const register = async(req, res, next) => {
    const mentorPassword = (await passwordHelper.passwordToHash(req.body.password))
    try {
        //create new mentor
        const newMentor = new Mentor({
            username: req.body.username,
            email: req.body.email,
            password: mentorPassword,
            category: req.body.category,
            interests: req.body.interests,
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


//Update Mentor

const updateMentor = async (req, res, next) => {
    try {
        const mentorExist = await Mentor.findById(req.params.id)
        if(!mentorExist){
            return next(
                new ApiError(
                    "Mentor not found.",
                    httpStatus.NOT_FOUND
                )
            )
        }

        let newPassword

        if(req.body.password){
            newPassword = await passwordHelper.passwordToHash(req.body.password)
            
            mentorExist.password = newPassword
            await mentorExist.save()

            return ApiDataSuccess.send("Password changed successfully!", httpStatus.CREATED, res, userExist)
        }

        const updatedMentor = await Mentor.findByIdAndUpdate(
            req.params.id,
            {
                username: req.body.username,
                email: req.body.email,
                password: newPassword,
                desc: req.body.desc,
                category: req.body.category,
                interest: req.body.interest,
                experience: req.body.experience,
                price: req.body.price,
            },
            {new: true}
        )

        if(!updatedMentor){
            return next(
                new ApiError(
                    "Mentor could not be updated due to an unexpected condition.",
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            )
        }

        return ApiDataSuccess.send("Profile changed successfully!", httpStatus.CREATED, res, updatedMentor)
    
    } catch (error) {
        return next(
            new ApiError(
                'Something went wrong :(',
                httpStatus.BAD_REQUEST,
                error.message
            )
        )
    }
}

const deleteUser = async(req, res, next) => {

}

module.exports = {
    register,
    login,
    updateMentor,
    getMentors,
    deleteUser
}