const httpStatus = require("http-status");
const Mentee = require("../models/mentee.model");
const Mentor = require("../models/mentor.model");
const ApiError = require("../responses/error/api-error");
const NewApiDataSuccess = require("../responses/success/api-success2");
const Iyzipay = require('iyzipay');

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_API_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL
});

const payment = async (req, res, next) => {
    const { mentorId, menteeId, paymentCard, buyer } = req.body;

    try {
        const mentor = await Mentor.findById(mentorId);
        const mentee = await Mentee.findById(menteeId);

        if (!mentor || !mentee) {
            return next(new ApiError("Mentor or Mentee not found", httpStatus.NOT_FOUND));
        }

        if (!mentee.approvedMentors.includes(mentorId)) {
            return next(new ApiError("Mentee is not approved by this mentor", httpStatus.BAD_REQUEST));
        }

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: '123456789',
            price: mentor.price.toString(),
            paidPrice: mentor.price.toString(),
            currency: Iyzipay.CURRENCY.TRY,
            installment: '1',
            basketId: mentorId.toString(),
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            paymentCard: paymentCard,
            buyer: buyer,
            basketItems: [
                {
                    id: mentorId.toString(),
                    name: mentor.jobTitle,
                    category1: mentor.category,
                    itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                    price: mentor.price.toString()
                }
            ]
        };

        iyzipay.payment.create(request, async (err, result) => {
            if (err) {
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            }

            if (result.status === 'success') {
                return NewApiDataSuccess.send("Payment processed successfully", httpStatus.OK, res, result);
            } else {
                return res.status(httpStatus.BAD_REQUEST).json(result);
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    payment
};
