import { request } from 'express'
import stripe from 'stripe'
import Transaction from '../models/Transaction.js'

export const stripeWebhook = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
    const sig = request.headers["stripe-signature"]

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.
            STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        return response.status(400).send(`webhook Error: ${error.message}`)
    }

    try {
        switch(event.type){
            case "payment_intent.succeeded":{
                const paymentIntent = event.data.object;
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                })

                const session = sessionList.data[0];
                const {transactionId, appId} = session.metadata;

                if(appId === 'quickgpt'){
                    const transaction = await Transaction.findOne({_id:transactionId, 
                        isPaid:false})

                await User.updateOne({_id: transaction.userId}, {$inc:{
                    credits: transaction.credits
                }})

                transaction.isPaid = true;
                await transaction.save();
                }else {
                    return response.json({received:true, message: "ignore event: invalid app "})
                }
                break;
            } 

            default:
                console.log("unhanlded event type:", event.type)
                break;
        }
        response.json({received: true})
    } catch (error) {
        console.log("webhook  processing error:", )
        res.status(500).send("Internal server error")
    }
}