const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  follower: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
}, { timestamps: true });

<<<<<<< HEAD
=======
// Ensure a user can follow another user only once
followerSchema.index({ follower: 1, followed: 1 }, { unique: true });

>>>>>>> ca8473b (authdone)
module.exports = mongoose.model('Followers', followerSchema);