import {model,Schema} from 'mongoose';

const paymentSchema = new Schema({
  razorpay_payment_id:{
    type:String,
    required:true
  },
  rezorpay_subscription_id:{
    type:String,
    required:true
  },
  razorpay_signature:{
    type:String,
    required:true
  }
},{
    timestamps:true
})

const Payment = model('payment', paymentSchema);

export default Payment;