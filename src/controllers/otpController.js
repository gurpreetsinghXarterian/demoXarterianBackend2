const userModal = require("../models/userSchema");
const otpDetailsModal = require("../models/otpDetailsSchema");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: "gurpreet.singh@xarterian.com",
    pass: "cjca abkq axuk bhmm", // xarterian mail password
  },
});

async function sendEmail(to, subject, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Xarterian Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Your OTP Code</h2>
        <p>Please use the following OTP to complete your verification:</p>
        <div style="text-align: center;">
          <h1 style="color: #4CAF50; font-size: 30px;">Your OTP is <br> ${otp}</h1>
        </div>
        <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        <p>Thank you for using our service!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
console.log("email",email)
    if (!email) {
      return res.status(400).json({ status:"fail", message: 'Mail is required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status:"fail", message: 'Provide a valid Mail ID' });
    }

    const user = await userModal.findOne({ email });
    if (!user) {
      return res.status(404).json({ status:"fail", message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes
    let otpRecord = await otpDetailsModal.findOne({ email });

    if (!otpRecord) {
      otpRecord = new otpDetailsModal({
        email,
        otpDetails: [{ otp, expiresAt }]
      });
    } else {
      otpRecord.otpDetails.push({ otp, expiresAt });
    }

    await otpRecord.save();

    await sendEmail(user.email, 'Your OTP Code', otp);

    res.status(200).json({ status:"success", message: 'OTP sent successfully to your Email' });
  } catch (error) {
    res.status(500).json({ status:"fail", message: 'Internal Server Error', error: error.message });
  }
}

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ status:"fail", message: 'Email ID and OTP are required' });
    }

    const otpRecord = await otpDetailsModal.findOne({ email });

    if (!otpRecord || otpRecord.otpDetails.length === 0) {
      return res.status(404).json({ status:"fail", message: 'OTP not found' });
    }

    const latestOtpEntry = otpRecord.otpDetails[otpRecord.otpDetails.length - 1];

    if (latestOtpEntry.otp !== Number(otp)) {
      return res.status(400).json({ status:"fail", message: 'Invalid OTP' });
    }

    if (new Date() > latestOtpEntry.expiresAt) {
      return res.status(400).json({ status:"fail", message: 'OTP has expired' });
    }

    res.status(200).json({ status:"success", message: 'OTP verified successfully' });

    await otpDetailsModal.updateOne(
      { email },
      { $set: { otpDetails: [] } }
    );
  } catch (error) {
    res.status(500).json({ status:"fail", message: 'Internal Server Error', error: error.message });
  }
}


module.exports = { sendOtp, verifyOtp};
