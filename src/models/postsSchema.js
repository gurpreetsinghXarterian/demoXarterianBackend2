const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  size: {type:String},
  name: {type: String},
  caption: { type: String },
  mediaType: { type: String, enum: ['image', 'video']},
  imageUrl: { type: String , default:null },
  videoUrl: { type: String ,default:null},
}, { timestamps: true });

postSchema.index({ user: 1 });

module.exports = mongoose.model('Posts', postSchema);
