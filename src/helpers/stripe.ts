import Stripe from "stripe";
import "dotenv/config";


const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripeInstance;