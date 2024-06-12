const Iyzipay = require('iyzipay');

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_API_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL
});

const createSubMerchant = async (mentor) => {
    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: mentor._id.toString(),
        subMerchantExternalId: mentor._id.toString(),
        subMerchantType: Iyzipay.SUBMERCHANT_TYPE.PERSONAL, // veya LIMITED/PERSONAL_COMPANY, mentorun şirket tipine göre
        address: mentor.address,
        email: mentor.email,
        gsmNumber: mentor.phone,
        name: mentor.name,
        surname: mentor.surname,
        identityNumber: mentor.identityNumber,
        currency: Iyzipay.CURRENCY.TRY,
        iban: mentor.iban 
    };

    return new Promise((resolve, reject) => {
        iyzipay.subMerchant.create(request, (err, result) => {
            if (err) {
                reject(err);
            } else {
                mentor.iyzicoSubMerchantKey = result.subMerchantKey;
                mentor.save()
                    .then(() => resolve(result))
                    .catch(saveError => reject(saveError));
            }
        });
    });
};

module.exports = {
    createSubMerchant
};
