import AppError from '../utils/error.util.js'  
import jwt from 'jsonwebtoken'

const isLoggedIn = async (req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return next(new AppError("unaunthentication,please login again",400))
    }

    const userDetails = await jwt.verify(token,process.env.JWT_SECRET)
    req.user = userDetails

    next( )
}

const authorizedRoles = (...roles) => async (req, res, next) =>{
   const currentUserRole = req.user.role
   console.log(currentUserRole)
   if(!roles.includes(currentUserRole)){
    return next(new AppError("you do not have permission to perform this action",403))
}

next()
}
export {
    isLoggedIn,authorizedRoles
}