const mongoose = require('mongoose');
const commentSchema = require("../models/commentSchema");
const likePostsSchema = require("../models/likePostsSchema");
const userModal = require("../models/userSchema");
const PostsSchema = require("../models/postsSchema");
const s3Service = require("../services/s3Services");
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');


const createPost = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload failed', details: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file Found' });
        }
        
        try {
          
            const { userId } = req.user;
            const { caption, fileType } = req.body;
            const file = req.file;
            
            if (fileType !== 'image' && fileType !== 'video') {
                return res.status(400).json({ error: 'Invalid file type specified' });
            }
            if(!file){
                return res.status(400).json({ error: 'file not found' });
            }
            await s3Service.uploadFileToS3(file);
            

            const fileUrl = `https://xarteriandemo.s3.us-east-1.amazonaws.com/${file.originalname}`;

            const fileObject = {
                name: file.originalname,
                size: String(file.size),
                caption: caption,
                user: new mongoose.Types.ObjectId(userId)
            };

            if(fileType == 'image'){
                fileObject.imageUrl=fileUrl;
                fileObject.mediaType="image";
            }
            if(fileType == 'video'){
                fileObject.videoUrl=fileUrl;
                fileObject.mediaType="video";
            }

            const uploadedPost = await PostsSchema.create(fileObject);

            res.status(201).json({status: "success", message:"Post Successfully Uploaded",data:uploadedPost});
        } catch (err) {
            res.status(500).json({ error: err.message });
            console.log("errorUploading",err)
        }
    });
};

// Like a post
const likePost = async (req, res) => {
    const { userId } = req.user;
    const { postId } = req.query;
    const like = new likePostsSchema({
        user: userId,
        post: postId,
    });
    await like.save();
    res.status(200).send({ status: "success", message: "Post Liked Successfully" });
};

// Comment on a post
const commentOnPost = async (req, res) => {
    const { userId } = req.user;
    const { postId, content } = req.query;
    const comment = new commentSchema({
        user: userId,
        post: postId,
        content: content,
    });
    await comment.save();
    res.status(200).send({ status: "success", message: "Comment Added Successfully" });
};

// Get all posts of the authenticated user
const getAllPosts = async (req, res) => {
    try {
        const posts = await PostsSchema.find().populate({ path: 'user', select: 'email _id userDetailsId', populate: {path: 'userDetailsId', select: 'profilePicture fullName'}});
        res.status(200).send({ status: "success", posts });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
};``

// Get all posts of the authenticated user
const getAllPostsVideos = async (req, res) => {
    try {
        const posts = await PostsSchema.aggregate([
            {
              $match: {
                videoUrl: { $exists: true, $ne: null, $ne: "" },
                $or: [
                    { imageUrl: { $exists: false } },
                    { imageUrl: { $eq: "" } },
                    { imageUrl: { $eq: null } }
                  ]
              }
            },
            {
              $group: {
                _id: "$mediaType",
                posts: {
                  $push: {
                    _id: "$_id",
                    size: "$size",
                    name: "$name",
                    caption: "$caption",
                    videoUrl: "$videoUrl",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                mediaType: "$_id",
                posts: 1
              },
            },
          ]);
          console.log(posts);

        res.status(200).send({ status: "success", data: posts });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
};

// Get all posts seperted by image and videos of the authenticated user
const allUserPosts = async (req, res) => {
    try {
        const { userId } = req.user;

        const posts = await PostsSchema.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: "$mediaType", 
                    posts: {
                        $push: {
                            _id: "$_id",
                            size: "$size",
                            name: "$name",
                            caption: "$caption",
                            imageUrl: "$imageUrl",
                            videoUrl: "$videoUrl",
                            createdAt: "$createdAt",
                            updatedAt: "$updatedAt",
                            user: "$user",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    mediaType: "$_id",
                    posts: 1,
                },
            },
        ]);

        const result = {
            images: posts.find(group => group.mediaType === "image")?.posts || [],
            videos: posts.find(group => group.mediaType === "video")?.posts || [],
        };

        res.status(200).send({ status: "success", data: result });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
};

// Get all Anonymous User posts seperted by image and videos of the authenticated user
const allAnonymousUserPosts = async (req, res) => {
    try {
        const { email } = req.query; 

        const user = await userModal.findOne({ email });

        if (!user) {
            return res.status(404).send({
                status: "fail",
                message: "User not found with the provided email",
            });
        }

        const posts = await PostsSchema.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(user._id ) } },
            {
                $group: {
                    _id: "$mediaType",
                    posts: {
                        $push: {
                            _id: "$_id",
                            size: "$size",
                            name: "$name",
                            caption: "$caption",
                            imageUrl: "$imageUrl",
                            videoUrl: "$videoUrl",
                            createdAt: "$createdAt",
                            updatedAt: "$updatedAt",
                            user: "$user",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    mediaType: "$_id",
                    posts: 1,
                },
            },
        ]);

        const result = {
            images: posts.find(group => group.mediaType === "image")?.posts || [],
            videos: posts.find(group => group.mediaType === "video")?.posts || [],
        };

        res.status(200).send({ status: "success", data: result });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
};


// Get all liked posts by the authenticated user
const getLikedPosts = async (req, res) => {
    try {
        const likedPosts = await likePostsSchema.find({ user: req.user.userId })
            .populate('post', 'caption imageUrl')
            .populate('user', 'username');
        res.status(200).send({ status: "success", likedPosts });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
};

// Get all comments for a specific post
const getComments = async (req, res) => {
    const { postId } = req.query;
    try {
        const comments = await commentSchema.find({ post: postId })
            .populate('user', 'username');
        res.status(200).send({ status: "success", comments });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
};

const deletePost = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.user;

    try {
        const post = await PostsSchema.findById(postId);
        
        if (!post) {
            return res.status(404).json({ status: "fail", message: "Post not found" });
        }

        if (post.user.toString() !== userId) {
            return res.status(403).json({ status: "fail", message: "You are not authorized to delete this post" });
        }
        await PostsSchema.findByIdAndDelete(postId);

        if (post.mediaType === 'image') {
            await s3Service.deleteFileFromS3(post.imageUrl);
        } else if (post.mediaType === 'video') {
            await s3Service.deleteFileFromS3(post.videoUrl);
        }

        res.status(200).json({ status: "success", message: "Post deleted successfully" });
        
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ status: "fail", message: err.message });
    }
};


module.exports = { createPost, likePost, commentOnPost, getAllPosts, getLikedPosts, getComments, allUserPosts, allAnonymousUserPosts, getAllPostsVideos, deletePost };
