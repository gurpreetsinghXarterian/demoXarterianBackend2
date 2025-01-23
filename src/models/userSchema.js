const { Schema, model } = require("mongoose")

const userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    userDetailsId: {
        type: Schema.Types.ObjectId,
        ref: "userDetails",
        required: false,
    },
    followers: [
        {
          type: Schema.Types.ObjectId,
          ref: "users",
          required: false,
        },
      ],
      following: [
        {
          type: Schema.Types.ObjectId,
          ref: "users",
          required: false,
        },
      ],
},
    {
        timestamps: true
    }
)

const userModal = model("users", userSchema)

module.exports = userModal