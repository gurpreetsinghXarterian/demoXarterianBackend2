const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const OtpDetailSchema = new mongoose.Schema(
    {
      otp: {
        type: Number,
        required: true
      },
      expiresAt: {
        type: Date,
        required: true
      }
    },
    { _id: false }
  );

const otpDetailsSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
      },
      otpDetails: {
        type: [OtpDetailSchema],
        required: true
      }
},
    {
        timestamps: true
    }
)

const otpDetailsModal = model("otpDetails", otpDetailsSchema)

module.exports = otpDetailsModal;