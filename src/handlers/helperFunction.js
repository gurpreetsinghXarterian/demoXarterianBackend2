const CryptoJS = require('crypto-js');

const encrypt = (value) => {
    const stringValue = value.toString();
    const encryptedCookie = CryptoJS.AES.encrypt(stringValue, process.env.TOKEN_DECRYPTION_SECRET_KEY).toString();
    return encryptedCookie;
}

const decrypt = (value) => {
        const bytes = CryptoJS.AES.decrypt(value, process.env.TOKEN_DECRYPTION_SECRET_KEY);
        const originalvalue = bytes.toString(CryptoJS.enc.Utf8);
        return originalvalue;
};

module.exports = { encrypt, decrypt};
