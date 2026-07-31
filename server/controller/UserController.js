import User from "../models/User.js"
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"
import Chat from "../models/chat.js"

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {

        expiresIn: '30d'
    })
}


//API for register user
export const registerUser = async (req, res) => {
 const {name, email, password} = req.body

 try {
    const userExists = await User.findOne({email})

    if(userExists){
        return res.json({success: false, message: 'User  already exists'})
    }

    const user = await User.create({name, email, password})

   const token = generateToken(user._id)
   res.json({success: true, token})
 } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: error.message})
    
 }
}

//API to login user
export const loginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email})
        if(user){
            const isMatch = await bcrypt.compare(password, user.password)
            if(isMatch){
                const token = generateToken(user._id);
                return res.json({success: true, token})
            }
        }
        return res.json({success: false, message: 'invalid email or password'})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

//API to get user data
export const getUser = async (req, res) => {
    try {
        const user = req.user;
        return res.json({success: true, user})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

//API to get published images
export const getPushlishedImages = async(req, res) => {
    try {
        const publishedImageMessage = await Chat.aggregate([
            {$unwind: "$message"},
            {
                $match: {
                    "message.isImage": true,
                    "message.isPublished": true
                }
            },
            {
            $project: {
                _id: 0,
                imageUrl: "$message.content",
                userName: "$userName"
            }
        }
        ])
        res.json({success: true, images:error.message})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

