import mongoose, { Schema } from 'mongoose'

const transactionSchema = new Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required:true},
    planId: {type: String, required: true},
    amount: {type: String, required: true},
    credits: {type: String, required: true},
    isPaid: {type: Boolean, default:false},
}, {timestamps: true})

const Transaction = mongoose.model('Transaction',  transactionSchema);

export default Transaction;