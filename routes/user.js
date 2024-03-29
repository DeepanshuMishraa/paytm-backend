const express = require("express");
const zod = require("zod");
const User = require("../models/UserSchema");
const connectDB = require("../db");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const bcrypt = require("bcryptjs");
const { authMiddleWare } = require("../middleware");

connectDB();
const SignupBody = zod.object({
  username: zod.string(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

router.post("/signup", async (req, res) => {
  try {
    const body = req.body;
    const { success } = SignupBody.safeParse(body);
    if (!success) {
      return res.status(411).json({
        message: "email already taken/incorrect inputs",
      });
    }

    const existingUser = await User.findOne({
      username: req.body.username,
    });

    if (existingUser) {
      res.status(411).json({
        message: "user already exists",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    const userId = user._id;
    //---Create Account finished

    const Account = require("../models/UserSchema");
    await Account.create({
      userId,
      balance: 1 + Math.random() * 10000,
    });

    const token = jwt.sign(
      {
        userId,
      },
      JWT_SECRET
    );

    res.json({
      message: "user created succesfully",
      token: token
    });
  } catch (err) {
    console.log(err);
    res.status(411).json({
      message: "something went wrong",
    });
  }
});

const signinBody = zod.object({
  username: zod.string(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  try {
    const body = req.body;
    const { success } = signinBody.safeParse(body);
    if (!success) {
      return res.status(411).json({
        message: "incorrect credentials",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const checkPassword = bcrypt.compareSync(req.body.username, hashedPassword);

    const user = await User.find({
      username: req.body.username,
      password: checkPassword,
    });

    if (user) {
      const token = jwt.sign(
        {
          userId: user._id,
        },
        JWT_SECRET
      );

      res.status(200).json({
        message: "Successfully Logged In",
        token: token,
      });
    } else {
      res.status(411).json({
        message: "user not found",
      });
    }
  } catch (Err) {
    res.status(401).json({
      message: "something went wrong",
    });
  }
});
const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.put("/",authMiddleWare,async(req,res)=>{
    const {success} = updateBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message:"Error while updating information"
        })
    }

    await User.updateOne({_id:req.userId},req.body)

    res.status(200).json({
        message:"Information updated successfully"
    })
})


router.get("/bulk",async(req,res)=>{
    const filter = req.query.filter || "";

    const users = await User.find({
        $or:[
            {
                firstName:{
                    "$regex" : filter
                }
            },{
                lastName:{
                    "$regex" : filter
                }
            }
        ]
    })

    res.json({
      user: users.map((user) => ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      })),
    });
})

module.exports = router;
