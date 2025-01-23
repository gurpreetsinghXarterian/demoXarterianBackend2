const userModal = require("../models/userSchema");
const userDetailsModal = require("../models/userDetailsSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { encrypt } = require("../handlers/helperFunction");
const s3Service = require("../services/s3Services");
const multer = require('multer');
const mongoose = require('mongoose');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

const getAllUserData = async (req, res) => {
    try {
        const data = await userModal.find();
        res.status(200).send({ message: "success", data: data });
    }
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

const signupUser = async (req, res) => {
    try {
        const { email, password, phone } = req.body

        if (!email || !password || !phone) {
            return res.status(400).send({ status: "fail", message: "All Credentails are required" });
        }

        const dublicateMail = await userModal.find({ email })

        if (dublicateMail.length > 0) {
            res.status(200).send({ status: "fail", message: "Mail already Exist" });
            return;
        }

        const salt = bcrypt.genSaltSync(10)
        const securepassword = bcrypt.hashSync(password, salt);

        const userData = await userModal.create({ email, password: securepassword, phone, followers: [], following: []  });

        const userDetails = await userDetailsModal.create({ userId: userData._id });

        await userModal.findByIdAndUpdate(userData._id, { userDetailsId: userDetails._id });

        res.status(200).send({ status: "success", message: "Signup Successfully Done", data: { email, phone } });
    } catch (err) {
        res.status(500).send({ status: "fail", message: err.message });
    }
}

const loginuser = async (req, res) => {
    const { email, password } = req.body
    try {
        const userValid = await userModal.findOne({ email })
            .populate('userDetailsId')
            .populate({
                path: 'followers',
                select: 'email _id userDetailsId', 
                populate: {
                  path: 'userDetailsId', 
                  select: 'profilePicture fullName' 
                }
              })
              .populate({
                path: 'following',
                select: 'email _id userDetailsId',
                populate: {
                  path: 'userDetailsId',
                  select: 'profilePicture fullName'
                }
              })
            .lean()

        if (userValid) {
            
            const isValidPassword = bcrypt.compareSync(password, userValid.password);
            if (isValidPassword) {
                
                const encryptedUserId = encrypt(userValid._id);
                const encryptedEmail = encrypt(userValid.email);
                const encryptedPhone = encrypt(userValid.phone);
                
                console.log(userValid._id,userValid.email,userValid.phone)
                const token = jwt.sign({
                    userId: encryptedUserId,
                    email: encryptedEmail,
                    phone: encryptedPhone,
                }, process.env.SECRET_KEY, {
                    expiresIn: 60 * 60 * 24 // expires in 24 hours
                });
                // console.log("token",token);
                const { password, ...other } = userValid;

                res.status(200).send({ status: "success", message: "Logged in successfully", token: token, data: { ...other } });
            }
            else {
                res.status(200).send({ status: "fail", message: "Password is Wrong" })
            }
        }
        else {
            res.status(200).send({ status: "fail", message: "Email does not exist" })

        }
    } catch (err) {
        res.status(500).send({ status: "fail", message: err.message });
    }

}

const forgotPassword = async (req, res) => {
    const { email } = req.params;
    const { newPassword } = req.body;
    try {

        const userValid = await userModal.findOne({ email }).lean();

        const PreviousPassword = bcrypt.compareSync(newPassword, userValid.password);

        if (PreviousPassword) {
            return res.status(404).send({ status: "fail", message: "New password cannot be the same as the current password" });
        }

        if (userValid) {
            const hashedPassword = bcrypt.hashSync(newPassword, 10);

            await userModal.updateOne({ email }, { password: hashedPassword });

            res.status(200).send({ status: "success", message: "Password updated successfully" });
        } else {
            res.status(404).send({ status: "fail", message: "User not found" });
        }
    } catch (err) {
        res.status(500).send({ status: "fail", message: err.message });
    }

}


const getProfile = async (req, res) => {
    try {
        const { userId } = req.user;

        let query = userModal.findById(userId)
        .select("-password")
        .populate("userDetailsId")
        .populate({
            path: 'followers',
            select: 'email _id userDetailsId', 
            populate: {
              path: 'userDetailsId', 
              select: 'profilePicture fullName' 
            }
          })
          .populate({
            path: 'following',
            select: 'email _id userDetailsId',
            populate: {
              path: 'userDetailsId',
              select: 'profilePicture fullName'
            }
          })
        .lean();

        const data = await query;

        if (!data) {
            return res.status(404).send({ status: "fail", message: "User not found" });
        }


        res.status(200).send({ status: "success", data });
    } catch (err) {
        console.error("Error fetching profile details:", err);
        res.status(500).send({ status: "fail", message: err.message });
    }
};

const getAnonymousProfile = async (req, res) => {
    try {
        const { email } = req.query;

        let query = userModal
            .findOne({ email })
            .select("-password -phone -createdAt -updatedAt")
            .populate({
                path: "userDetailsId",
                select: "profilePicture fullName"
            })
            .populate("followers")
            .populate("following") 
            .lean();

        const data = await query;

        if (!data) {
            return res.status(201).send({ status: "fail", message: "User not found" });
        }


        res.status(200).send({ status: "success", data });
    } catch (err) {
        console.error("Error fetching profile details:", err);
        res.status(500).send({ status: "fail", message: err.message });
    }
};

const updateUserDetails = async (req, res) => {
    upload(req, res, async (err) => {
        try {
            const { userId } = req.user;
            const {
                fullName,
                city,
                state,
                country,
                postalCode,
                street,
                dateOfBirth,
                gender
            } = req.body;

            const profilePicture = req.file

            const existingUserDetails = await userDetailsModal.findOne({ userId });

            if (!existingUserDetails) {
                let obj = { userId: userId }
                if (fullName) obj.fullName = fullName
                if (city) obj.city = city
                if (state) obj.state = state
                if (country) obj.country = country
                if (postalCode) obj.postalCode = postalCode
                if (street) obj.street = street
                if (dateOfBirth) obj.dateOfBirth = dateOfBirth
                if (gender) obj.gender = gender

                if (profilePicture) {
                    await s3Service.uploadFileToS3(profilePicture);
                    const fileUrl = `https://xarteriandemo.s3.us-east-1.amazonaws.com/${profilePicture.originalname}`;
                    obj.profilePicture = fileUrl;
                }

                let existingUserDetails = new userDetailsModal(obj);

                await existingUserDetails.save();
                const user = await userModal.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), { userDetailsId: existingUserDetails._id });

                return res.status(201).send({
                    status: "success",
                    message: "User details updated successfully",
                    data: existingUserDetails
                });
            }

            if (profilePicture) {
                await s3Service.uploadFileToS3(profilePicture);
                const fileUrl = `https://xarteriandemo.s3.us-east-1.amazonaws.com/${profilePicture.originalname}`;
                existingUserDetails.profilePicture = fileUrl || existingUserDetails.profilePicture;
            }

            existingUserDetails.fullName = fullName || existingUserDetails.fullName;
            existingUserDetails.dateOfBirth = dateOfBirth || existingUserDetails.dateOfBirth;
            existingUserDetails.gender = gender || existingUserDetails.gender;
            existingUserDetails.street = street || existingUserDetails.street;
            existingUserDetails.city = city || existingUserDetails.city;
            existingUserDetails.state = state || existingUserDetails.state;
            existingUserDetails.country = country || existingUserDetails.country;
            existingUserDetails.postalCode = postalCode || existingUserDetails.postalCode;

            await existingUserDetails.save();

            res.status(200).send({
                status: "success", message: "User details updated successfully", data: existingUserDetails
            });
        } catch (error) {
            console.error("Error updating user details:", error);
            return res.status(500).send({ status: "fail", message: error.message });
        }
    });
}

const searchUser = async (req, res) => {
    try {

        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({ message: "Keyword is required" });
        }

        const users = await userModal.find({
            email: { $regex: keyword, $options: 'i' }
        })
            .select("email userDetailsId followers following")
            .populate({
                path: 'userDetailsId',
                select: 'profilePicture'
            })
            .populate("followers")
            .populate("following") 

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found matching the email" });
        }

        res.status(200).json({ status: "success", message: "Users found", data: users });
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).json({ status: "fail", message: "Server error. Please try again later." });
    }
}

const toggleFollow = async (req, res) => {
    try {
        const { userId } = req.user;
        const { followUserId } = req.body;

        if (userId === followUserId) {
            return res.status(400).send({ status: "fail", message: "You cannot follow yourself" });
        }

        const userToFollow = await userModal.findById(followUserId);
        if (!userToFollow) {
            return res.status(404).send({ status: "fail", message: "User to follow/unfollow not found" });
        }

        const alreadyFollowing = userToFollow.followers.includes(userId);

        if (alreadyFollowing) {
            await userModal.findByIdAndUpdate(userId, { $pull: { following: followUserId } });
            await userModal.findByIdAndUpdate(followUserId, { $pull: { followers: userId } });
            return res.status(200).send({ status: "success", message: "Unfollowed successfully" });
        } else {
            await userModal.findByIdAndUpdate(userId, { $addToSet: { following: followUserId } });
            await userModal.findByIdAndUpdate(followUserId, { $addToSet: { followers: userId } });
            return res.status(200).send({ status: "success", message: "Followed successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "fail", message: error.message });
    }
};

module.exports = { getAllUserData, signupUser, loginuser, getProfile, forgotPassword, updateUserDetails, searchUser, getAnonymousProfile, toggleFollow };