const httpStatus = require("http-status");
const PaymentIntent = require("../models/paymentIntent.model")
const Mentee = require("../models/mentee.model");
const Mentor = require("../models/mentor.model");
const ApiError = require("../responses/error/api-error");
const NewApiDataSuccess = require("../responses/success/api-success2");
const dotenv = require("dotenv");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

dotenv.config();

// const createPayment = async (req, res, next) => {
//     const {menteeId, mentorId} = req.body

//     try {

//         const mentor = await Mentor.findById(mentorId)
//         const amount = mentor.price * 100 //Cent cinsinden

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount,
//             currency: 'usd',
//             payment_method_types: ['card'],
//         })
        
//         const paymentRecord = new PaymentIntent({
//             mentee: menteeId,
//             mentor: mentorId,
//             paymentIntentId: paymentIntent.id,
//             status: 'pending'
//         })
//         await paymentRecord.save()

//         await addApplication(menteeId, mentorId)

//         const responseData = {
//             paymentRecord,
//             clientSecret: paymentIntent.client_secret
//         };

//         NewApiDataSuccess.send(
//             "payment created",
//             httpStatus.OK,
//             res,
//             responseData
//         )
//         console.log("client id:", clientSecret)

//     } catch (error) {
//         return next(
//             new ApiError("An error ocured", httpStatus.INTERNAL_SERVER_ERROR),
//             error.message,
//             console.log("Error:",error.message)
//         )
//     }
// }

// const addApplication = async (menteeId, mentorId) => {
//     await Mentee.findByIdAndUpdate(menteeId, {
//         $push: { applications: mentorId }
//     })
//     await Mentor.findByIdAndUpdate(mentorId, {
//         $push: { applicants: menteeId }
//     })
// }

const createPayment = async (req, res, next) => {
    const { menteeId, mentorId } = req.body;

    try {
        const mentor = await Mentor.findById(mentorId);
        const amount = mentor.price * 100; // Cent cinsinden

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });

        const paymentRecord = new PaymentIntent({
            mentee: menteeId,
            mentor: mentorId,
            paymentIntentId: paymentIntent.id,
            status: 'requires_confirmation'
        });
        await paymentRecord.save();

        await addApplication(menteeId, mentorId);

        const responseData = {
            paymentRecord,
            clientSecret: paymentIntent.client_secret
        };

        NewApiDataSuccess.send(
            "Payment intent created",
            httpStatus.OK,
            res,
            responseData
        );
        console.log("client id:", paymentIntent.client_secret);

    } catch (error) {
        return next(
            new ApiError("An error occurred", httpStatus.INTERNAL_SERVER_ERROR),
            error.message,
            console.log("Error:", error.message)
        );
    }
};

const addApplication = async (menteeId, mentorId) => {
    await Mentee.findByIdAndUpdate(menteeId, {
        $push: { applications: mentorId }
    });
    await Mentor.findByIdAndUpdate(mentorId, {
        $push: { applicants: menteeId }
    });
};



module.exports = {
    createPayment,
}