const express = require("express");
const Router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const {
    getAllUserData,
    signupUser,
    loginuser,
    getProfile,
    updateUserDetails,
    forgotPassword,
    searchUser,
    getAnonymousProfile,
    toggleFollow,
} = require("../controllers/userController");

const authRoutes = [
    { path: "/signupuser", method: "post", handler: signupUser }, //done
    { path: "/loginuser", method: "post", handler: loginuser }, //done
    { path: "/forgot/Password/:email", method: "put", handler: forgotPassword }, //done
    { path: "/toggleFollow", method: "put", permission: true, handler: toggleFollow },
];

const userRoutes = [
    { path: "/alluserdata", method: "get", handler: getAllUserData }, //done
    { path: "/profile", method: "get" , permission:true, handler: getProfile }, //done
    { path: "/anonymousprofile", method: "get" , handler: getAnonymousProfile }, //done
];

const userDetails = [
    { path: "/Details", method: "put",permission:true, handler: updateUserDetails },
    { path: "/search", method: "get", handler: searchUser },
];


const routeList = [
    ...authRoutes,
    ...userRoutes,
    ...userDetails
];


routeList.forEach(route => {
    if (route.permission) {
        Router[route.method](route.path, authenticateToken(), route.handler);
    } 
    else {
        Router[route.method](route.path, route.handler);
    }
 
});


module.exports = Router;