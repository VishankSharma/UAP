import {Schema , model } from 'mongoose';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import crypto from 'crypto';
import { subscribe } from 'diagnostics_channel';

const userSchema =  new Schema({
     name : {
        type:String,
        required:true,
        minlength:[5,'name must be at least 5 characters '],
        maxlength:[20,'name should be less than 20 characters'],
        trim:true
     },
     email:{ 
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        trim: true,
match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, 'Please enter a valid email address']
     },
     password:{type:String,
        required:true,
        minlength:[8,'password must be at least 8 characters'],
        select:false
        },
    avatar:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
    },
    role:{
        type:String,
        enum:['USER','ADMIN'],
        default:'USER'
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry: Date,
    subscription:{
      id:String,
      status:String

    }
},{
    timestamps:true
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next()
    }

    this.password = await bcrypt.hash(this.password,10)
})

userSchema.methods = {
  jwtToken() {
    return JWT.sign(
      { id: this._id, email: this.email ,subscription:this.subscription,role:this.role,avatar:this.avatar},
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  comparePassword: async function (textpassword) {
    return await bcrypt.compare(textpassword, this.password);
  },

  generatePasswordResetToken: function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.forgotPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    return resetToken;
  }
};

const User = model('User', userSchema);

export default User