const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
/**
 * @name registerUserController
 * @description register a new user, expects username, email and password int the required 
 * @access Public
 */


async function registerUserController(req,res){
    const { username, email, password}=req.body

    if(!username || !email || !password){
        return res.status(400).json({
            message:"Please provide username, email and password"
        })
    }
    const isUserAlreadyExists = await userModel.findOne({
        $or:[{username},{email}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message:"Account already exists with this email addres or username"
        })
    }
    const hash = await bcrypt.hash(password,10)
    const user = await userModel.create({
  email,
  username,
  password: hash
})
    //  ({
    //     username,
    //     email,
    //     password: hash
    // })
    const token= jwt.sign(
        {id:user._id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )

    const cookieOptions = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000
    }

    res.cookie("token", token, cookieOptions)

    res.status(201).json({
        message:"User registered seccessfully",
        user:{
            id:user._id,
            username: user.username,
            email:user.email
        }
    })

}

/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */

async function loginUserController(req,res){

    const{ email, password }=req.body
    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password,user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token =jwt.sign(
        {id:user._id,username: user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )

    const cookieOptions = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000
    }

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        message:"User loggedIn succesfully",
        user:{
            id:user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * 
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req,res){
    const token = req.cookies.token
    if(token){
       await tokenBlacklistModel.create({ token })
    }
    const clearCookieOptions = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production"
    }

    res.clearCookie("token", clearCookieOptions)

    res.status(200).json({
        message:"User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details, expects token in the request 
 * @access private
 */


async function getMeController(req, res) {
    
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message: " User details fetched successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

async function googleAuthRedirect(req, res) {
    // In a real implementation, redirect to Google OAuth consent screen.
    return res.status(501).json({ message: 'Google OAuth is not configured on this demo server.' })
}

async function googleAuthCallback(req, res) {
    // In a real implementation, handle Google callback and issue auth token.
    return res.status(501).json({ message: 'Google OAuth callback is not configured on this demo server.' })
}

module.exports={
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    googleAuthRedirect,
    googleAuthCallback
}