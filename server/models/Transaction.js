import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",require:true},
    planId:{type:String,require:true},
    amount:{type:Number,require:true},
    credits:{type:Number,require:true},
    isPaid:{type:Boolean,require:true}
})

const Transaction = mongoose.model("Transaction",transactionSchema);

export default Transaction;