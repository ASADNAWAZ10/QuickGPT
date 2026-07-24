import Transaction from "../models/Transaction.js"
import Stripe from "stripe";

 const plans = [
    {
    _id : "basic", 
    name : "Basic",
    price : 10,
    credits : 100,
    Features : ['100 text generators', '50 images generators',
        'standard support', 'Access to the basic models']
},

{
    _id : "pro", 
    name : "Pro",
    price : 20,
    credits : 100,
    Features : ['500 text generators', '50 images generators',
        'standard support', 'Access to the pro models']
},

{
  _id : "premium", 
  name : "Premium",
  price : 30,
  credits : 1000,
  Features : ['1000 text generators', '500 images generators',
      'standard support', '24/7 VIP support', 'Access to the pro models', 
    'Dedicated account manager' ]
},
]

export const getPlans = async (req, res) => {
    try {
        res.json({success: true, plans})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const purchasePlans = async (req, res) => {
    try {
        const{planId} = req.body
        const userId = req.user._id
        const plan = plans.find(plan => plan._id)

        if(!plan){
            return res.json({success:false, message:"Invalid plan"})
        }

        const transaction = await Transaction.create({
            userId: userId, 
            planId: plan._id, 
            amount: plan.price,
            credits: plan.credits,
            isPaid: false
        })

        const {origin} = req.headers
        const session = await Stripe.Checkout.sessions.create({
       
            lines_items: [
                {
                    price_data: {
                        currency: 'usd', 
                        unit_amount: plan.price * 100,
                        product_data: {
                            name: plan.name
                        }
                    }, 
                    quantity: 1 
                },
            ],
            mode: 'payment', 
            success_url: `${origin}/loading`,
            cancel_url: `${origin}`,
            metadata:  {transactionId: transaction._id.toString(), appId: 'quickgpt'},
            expire_at: Math.floor(Date.now() / 1000) + 30 * 60, //expire in 30 minutes
        });
        res.json({success: true, url: session.url})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}
