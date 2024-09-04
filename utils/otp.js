async function generateOTP() {
    const otp = Math.floor(1000 + Math.random() * 9000);
    // Set expiration time for the OTP (in milliseconds)
    const expirationTime = Date.now() + 5 * 60 * 1000;
    return {
        otpcode: otp.toString(),
    };
}




module.exports= generateOTP;