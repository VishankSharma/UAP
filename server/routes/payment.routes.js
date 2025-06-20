import { Router} from 'express';
import { allPayment, buySubscription, cancelSubscription, getRazorpayApiKey, verifySubscription } from '../controllers/payment.controller.js';
import { isLoggedIn ,authorizedRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router
    .route('/razopay-key')
    .get(isLoggedIn,getRazorpayApiKey)

router
    .route('/subscription')
    .post(isLoggedIn,buySubscription)

router
    .route('verify')
    .post(isLoggedIn,verifySubscription)

router
    .route('unsubscribe')
    .post(isLoggedIn,cancelSubscription)

router
    .route('/')    
    .get(isLoggedIn,authorizedRoles('ADMIN'),allPayment);

export default router;