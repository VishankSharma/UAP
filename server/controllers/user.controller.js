import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";
import cloudinary from "cloudinary"
import fs from 'fs/promises'
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto'
import { assert } from "console";


 const cookieOption = {
      maxAge : 24*60*60*1000,
      httpOnly:true,
    //   secure:true
      }


const register =async (req,res,next)=>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return next(new AppError('All fields are required',400));
    }

    const user = await User.findOne({email});

    if(user){
        return next(new AppError('Email already in use',400));
    }

    const newUser = await User.create({name,
        email,
        password,
        avatar:{
            public_id:email,
            secure_url:'https://res.cloudinary.com/dfwqzjz4j/image/upload'
        }
    });

   if(!newUser){
    return next(new AppError('Failed to create user',500));
   }

   //todo: file upload
   if(req.file){
    console.log(req.file);
    
    try{
        const result = await cloudinary.v2.uploader.upload(req.file.path,{
            folder: 'lms',
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
        });

        if(result){
            newUser.avatar.public_id = result.public_id;
            newUser.avatar.secure_url = result.secure_url;

            //remove file from local server
        await  fs.rm(`uploads/${req.file.filename}`)

        }
    }catch(e){
        return next(new AppError(e.message || 'file not upload,please try again ',500))
    }
   }

   await newUser.save()
   newUser.password = undefined
   
   const token =  newUser.jwtToken()

   res.cookie("token",token,cookieOption)
   res.status(201).json({
    status:'success',
    message:'User Registration successful',
    newUser
   })

}
const login = async (req,res)=>{
try {
    
    const {email,password} = req.body

    if(!email || !password){
        return next(new AppError('Please provide email and password',400))
    }

    const user = await User.findOne({email}).select('+password')
     
    if(!user || !(await user.comparePassword(password))){
        return next(new AppError('Invalid email or password',401))
    }
     
    const token =  user.jwtToken()
    user.password=undefined

    res.cookie("token",token,cookieOption)

  return  res.status(200).json({
        status:'success',
        message:'User logged in successfully',
        user
    })
} catch (error) {
    return res.status(400).json({
        status:'error',
        message:error.message
     })
}

}
const logout = (req,res)=>{
  
    register.cookie("token",null,{
        secure:false,
        httpOnly:true,
        maxAge:0
    })

   return res.status(200).json({
        status:'success',
        message:'User logged out successfully',
    })
}
const getprofile =async (req,res)=>{
   
    try {
       const userid = req.user.id
    const user = await User.findById(userid)
   return res.status(200).json({
        success:true,
        message:"user detail",
        user
    })
 
    } catch (error) {
        return next(new AppError("failed to fetch profile. please login again",400))
    }
}

const forgotPassword = async (req,res,next)=>{
    const {email} = req.body

    if(!email){
        return next( new AppError('email is required',500));
    }

    const user = await User.findOne({email});
    if(!user){
        return next(new AppError('email not registered',400))
    }
   
     const resetToken = user.generatePasswordResetToken();
 

    await user.save()
    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    const subject = 'Reset password'
    const message = `you can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for dome reason then copy paste this link in new tab ${resetPasswordURL}.\n if you have not requested this,kindly ignore.`
    
    console.log(resetPasswordURL)
    try {
        await sendEmail(email,subject,message);

        res.status(200).json({
          success:true,
          message: `reset password link sent to your ${email} successfully`,
        })
    } catch (e) {
        user.forgotPasswordExpiry=undefined
        user.passwordResetToken=undefined

        await user.save()
        return next(new AppError(e.message,500))
    }
}

const resetPassword = async (req,res,next)=>{
   const { resetToken } = req.params

   const { password }= req.body

   const forgotPasswordToken = crypto
       .createHash('sha256')
       .update(resetToken)
       .digest('hex')

    const user = await User.findOne({forgotPasswordToken,forgotPasswordExpiry:{$gt:Date.now()}})

if(!user){
    return next(new AppError('invalid token',400))
}

user.password = password;
user.forgotPasswordExpiry = undefined;
user.forgotPasswordToken = undefined;
user.save();

res.status(200).json({
    success:true,
    message: 'password reset successfully',
})

}

const changePassword = async (req,res,next)=>{
    const {oldPassword,newPassword}=req.body
    const {id} = await req.user

    if(!oldPassword || !newPassword){
        return next(new AppError('old and new password are required',400))
    }
    const user = await User.findById(id).select('+password')

    if(!user){
        return next(new AppError('user not found! login again',400))
    }

    const isPasswordValid = await user.correctPassword(oldPassword)

    if(!isPasswordValid){
        return next(new AppError('old password is incorrect',400))
    }

    user.password = newPassword

    await user.save()

    user.password = undefined

    res.status(200).json({
        success:true,
        message: 'password changed successfully',
    })
    
}

const updateUser = async(req,res,next)=>{
    const { fullName } = req.body
   const { id } = req.user
   const user = await User.findById(id)
   
   if(!user){
    return next(new AppError('user does not exist',400))
   }

   if(req.fullName){
       user.name = fullName
   }

   if(req.file){
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

      try{
        const result = await cloudinary.v2.uploader.upload(req.file.path,{
            folder: 'lms',
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
        });

        if(result){
            newUser.avatar.public_id = result.public_id;
            newUser.avatar.secure_url = result.secure_url;

            //remove file from local server
        await  fs.rm(`uploads/${req.file.filename}`)

        }
    }catch(e){
        return next(new AppError(e.message || 'file not upload,please try again ',500))
    }
    
   }

   await user.save()

   res.status(200).json({
    success:true,
    message:'user deatil update successfully'
   })

}

export {
    register,login,logout,getprofile,forgotPassword,resetPassword,changePassword,updateUser
}