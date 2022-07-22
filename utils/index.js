const CryptoJS = require("crypto-js");

const encrypt = (jsonObject) => {
  const text = JSON.stringify(jsonObject);
  const cipher = CryptoJS.AES.encrypt(
    text,
    "autopay-ninja-secret-key"
  ).toString();
  return encodeURIComponent(cipher);
};

module.exports = { encrypt };
