const {Router}=require('express')
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { getGenAiClient } = require("../services/ai.service")
const authRouter=Router()


/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register",authController.registerUserController)


/**
 * @route POST /api/auth/login
 * @descripton login user with email and password
 * @access Public
 */
authRouter.post("/login",authController.loginUserController)

/**
 * @route GET /api/auth/logout
 * @description clear token form user cookie
 * @access public
 */
authRouter.get("/logout",authController.logoutUserController)

/**
 * @route GET/api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */

 authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)

// very small debugging endpoint to inspect model availability
authRouter.get("/list-models", async (req, res) => {
    try {
        const aiClient = await getGenAiClient()
        const listed = await aiClient.models.list()
        return res.status(200).json({ message: "Model list fetched", models: listed?.models || [] })
    } catch (err) {
        console.error("list-models error", err)
        return res.status(500).json({ message: "Unable to list models", error: err?.message || err })
    }
})

// Google OAuth placeholder routes (implement plain OAuth/Passport in production)
authRouter.get("/oauth/google", authController.googleAuthRedirect)
authRouter.get("/oauth/google/callback", authController.googleAuthCallback)

module.exports=authRouter