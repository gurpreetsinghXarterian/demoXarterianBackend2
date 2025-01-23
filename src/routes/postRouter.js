const express = require("express");
const Router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const {
    createPost,
    likePost,
    commentOnPost,
    getAllPosts,
    getLikedPosts,
    getComments,
    allUserPosts,
    allAnonymousUserPosts,
    getAllPostsVideos,
    deletePost, 
} = require("../controllers/postController");

const postRoutes = [
    { path: "/createPost", method: "post", permission:true, handler: createPost },
    { path: "/likePost", method: "post", handler: likePost },
    { path: "/commentOnPost", method: "post", handler: commentOnPost },

    { path: "/allPosts", method: "get", handler: getAllPosts },
    { path: "/allPostsVideos", method: "get", handler: getAllPostsVideos },
    { path: "/allUserPosts", method: "get", permission:true, handler: allUserPosts },
    { path: "/allAnonymousUserPosts", method: "get", handler: allAnonymousUserPosts },
    { path: "/likedPosts", method: "get", handler: getLikedPosts }, 
    { path: "/comments", method: "get", handler: getComments },
    { path: "/delete/:postId", method: "delete", permission:true, handler: deletePost },
];

postRoutes.forEach((route) => {
    if (route.permission) {
        Router[route.method](route.path, authenticateToken(), route.handler);
    } 
    else {
        Router[route.method](route.path, route.handler);
    }
});

module.exports = Router;
