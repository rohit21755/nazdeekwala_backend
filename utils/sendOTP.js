const env = require("dotenv");
env.config({ path: "config/config.env" });
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const sendOTP = (otp, phone) => {
  client.messages
    .create({
      body: `Your NAZDIKWALA Verification code is ${otp}`,
      messagingServiceSid: "MGee4abc77450e11e7bf1aef6680e1d2e4",
      to: `+91${phone}`,
    })
    .then((message) => console.log(`OTP Sent Successfully`))
    .catch((err) => console.log(err));
};

module.exports = sendOTP;
