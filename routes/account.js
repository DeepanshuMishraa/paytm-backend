const express = require("express");
const { authMiddleWare } = require("../middleware");
const { Account } = require("../models/UserSchema");
const { default: mongoose } = require("mongoose");

const router = express.Router();


router.get("/balance",authMiddleWare,async(req,res)=>{
    try{
        const account = await Account.findOne({
            userId:req.userId
        })
        res.status(200).json({
            balance : account.balance
        })
    }catch(err){
        res.status(501).json({
            message:"something went wrong"
        })
    }
})

router.post("/transfer",authMiddleWare,async(req,res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    const {amount,to} = req.body;

    //fetch account to transact
    const account = await Account.findOne({
        userId:req.body.userId
    }).session(session)

    if(!account || account.balance<amount){
        await session.abortTransaction();
        res.status(400).json({
            message:"Insufficient Balanace"
        })
    }

    const toAccount = await Account.findOne({
        userId:to
    }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        res.status(400).json({
            message:"Invaild account"
        })
    }

    //perform transaction 

    await Account.updateOne({
        userId:req.userId,
        $inc:{balance:-amount}        
    }).session(session)
    await Account.updateOne({
        userId:to,
        $inc:{balance:amount}
    }).session(session)

    await session.commitTransaction()

    res.status(200).json({
        message:"Transfer Successfull"
    })

})

module.exports = router;