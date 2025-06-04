import express from 'express'
const router = express.Router()
import {register,login,logout,getprofile,forgotPassword,resetPassword, changePassword, updateUser} from '../controllers/user.controller.js'
import {isLoggedIn} from '../middlewares/auth.middleware.js'
import upload from '../middlewares/multer.middleware.js'

router.post('/register',upload.single("avatar"),register)
router.post('/login',login)
router.get('/logout',logout)
router.get('/me',isLoggedIn,getprofile)
router.post('/reset',forgotPassword)
router.post('/reset/:resetToken',resetPassword)
router.post('/changepassword',changePassword)
router.put('/update',isLoggedIn,upload.single("avatar"),updateUser)

export default router