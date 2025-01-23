const { Schema, model } = require("mongoose")


const userDetailsSchema = new Schema({
    profilePicture: { type: String, required: false },
    fullName: { type: String, unique: false, required: false },
    dateOfBirth: { type: String, required: false  },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: false  },
    street: { type: String, required: false },
    city: { type: String, required: false  },
    state: { type: String, required: false  },
    country: { type: String, required: false  },
    postalCode: { type: String, required: false  },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    }
}, {
    timestamps: true
});

const userDetailsModal = model("userDetails", userDetailsSchema)

module.exports = userDetailsModal;