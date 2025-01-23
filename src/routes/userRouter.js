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
<<<<<<< HEAD
    { path: "/toggleFollow", method: "put", permission: true, handler: toggleFollow },
=======
>>>>>>> ca8473b (authdone)
];

const userRoutes = [
    { path: "/alluserdata", method: "get", handler: getAllUserData }, //done
    { path: "/profile", method: "get" , permission:true, handler: getProfile }, //done
<<<<<<< HEAD
    { path: "/anonymousprofile", method: "get" , handler: getAnonymousProfile }, //done
=======
>>>>>>> ca8473b (authdone)
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
<<<<<<< HEAD
        Router[route.method](route.path, authenticateToken(), route.handler);
=======
        Router[route.method](route.path, authenticateToken(route.permission), route.handler);
>>>>>>> ca8473b (authdone)
    } 
    else {
        Router[route.method](route.path, route.handler);
    }
 
});


module.exports = Router;