const Iyzipay = require('iyzipay');
const dotenv = require("dotenv");
dotenv.config();

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_API_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL
});
// console.log("iyzipay",iyzipay)
const createSubMerchant = async (mentor) => {
    console.log("GİRDİ")
    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: mentor._id.toString(),
        subMerchantExternalId: mentor._id.toString(),
        subMerchantType: Iyzipay.SUB_MERCHANT_TYPE.PERSONAL, // veya LIMITED_OR_JOINT_STOCK_COMPANY SUB_MERCHANT_TYPE.PERSONAL
        address: mentor.address,
        email: mentor.email,
        gsmNumber: mentor.phone,
        name: mentor.name,
        surname: mentor.surname,
        identityNumber: mentor.identityNumber,
        currency: Iyzipay.CURRENCY.TRY,
        iban: mentor.iban
    };

    console.log("req",request)
    return new Promise((resolve, reject) => {
        iyzipay.subMerchant.create(request, async (err, result) => {
            if (err) {
                console.error('Error creating submerchant:', err);
                reject(err);
            } else {
                console.log('Submerchant created:', result);
                mentor.iyzicoSubMerchantKey = result.subMerchantKey;
                try {
                    await mentor.save();  // Submerchant key'i kaydetmek için mentor modelini kaydet
                    resolve(result);
                } catch (saveError) {
                    reject(saveError);
                }
            }
        });
    });
};

module.exports = {
    createSubMerchant
};
