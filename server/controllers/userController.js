import cloudinary from "../library/cloudinary.js";
import { generateToken } from "../library/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"

// signup a new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        // console.log(fullname, email, phoneNumber, password, role)
        if (!fullName || !email || !password || !bio) {
            return res.json({
                message: "Something is Missing...",
                success: false
            });
        };

        const user = await User.findOne({ email });
        if (user) {
            return res.json({
                message: "User Already Exists with this Email...",
                success: false
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        })

        const token = generateToken(newUser._id)

        return res.json({
            userData: newUser,
            token,
            message: "Account Created Successfully...",
            success: true
        })

    } catch (error) {
        console.log(error)
        return res.json({
            message: error.message,
            success: false
        })
    }
}

// controller to login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email })
        const isPasswordCorrect = await bcrypt.compare(password, userData.password)

        if (!isPasswordCorrect) {
            return res.json({
                success: false,
                message: "Invalid Credentials..."
            })
        }

        const token = generateToken(userData._id)

        return res.json({
            userData,
            token,
            message: "Login Successfully...",
            success: true
        })

    } catch (error) {
        console.log(error)
        return res.json({
            message: error.message,
            success: false
        })
    }
}

// controller to check user is authenticated
export const checkAuth = (req, res) => {
    res.json({
        success: true,
        user: req.user
    })
}

// controller to update profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body
        const userId = req.user._id
        let updatedUser

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
        } else {
            const upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true })
        }

        res.json({
            success: true,
            user: updatedUser
        })

    } catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        })
    }
}