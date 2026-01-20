import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from 'jsonwebtoken'
import Chat from "../models/Chat.js";

//Generate jwt
/*const generateToken = (id) =>{
   return jwt.sign({id},process.env.JWT_SECRET,{
      expiresIn: '30d'
   })
}

//Api to register User
export const userRegister = async(req,res) =>{
   const {name,email,password} = req.body;
   try {
     const userExists = await User.findOne({email})
     if(userExists){
      return res.json({success:false,message:"User already Exists"})
     }
     const user = await User.create({name,email,password})
     const token = generateToken(user._id)
     res.json({success:true,token})

   } catch (error) {
      return res.json({success:false,message:error.message})
   }
}
//Api to login user
export const loginUser = async(req,res) =>{
   const {email,password} = req.body;
   try {
      const user = await User.findOne({email})
      if(user){
         const isMatch = await bcrypt.compare(password,user.password)
         if(isMatch){
            const token = generateToken(user._id)
            return res.json({success:true,token})
         }
      }
      return res.json({success:false,message:"inavalid email or password"})
   } catch (error) {
      return res.json({success:false,message:error.message})
   }
}*/
export const userRegister= async (req, res) => {
    try {
        // get data
        const { name, email, password } = req.body;

        // check if user already exist 
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User Already Exists",
            })
        }

        // Secured password 
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                message: "Error in hashing password",
            })
        }

        // Create Entry for User
        let user = await User.create({
            name,email,password:hashedPassword
        });

        return res.status(200).json({
            success : true,
            message : "User Created Successfully",
            data : user
        });
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "User cannot be register,Please try again later",
        })
    }
}

// Login
export const loginUser = async (req,res) => {
    try
    {
        const {email,password} = req.body;
        if(!email || !password)
        {
            return res.status(400).json({
                success:false,
                message : "Please fill all the details carefully",
            })
        }

        // check for register user 
        let user = await User.findOne({email});
        if(!user)
        {
            return res.status(401).json({
                success : false,
                message : "User does not exist",
            });
        }

        // Verify password & generate a JWT token

        const payload = {
            email : user.email,
            id : user._id,
        };


        if(await bcrypt.compare(password,user.password)){
            // password match
            let token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn : "2h",
            });

            user = user.toObject();
            user.token = token;
            user.password = undefined;

            const options = {
                expires : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly : true,
            }

            res.cookie("token",token,options).status(200).json({
                success : true,
                token,
                user,
                message:"User logged in successfully"
            });
        }
        else {
            // password not match
            return res.status(403).json({
                success : false,
                message : "Password does not match",
            })
        }
    }
    catch(err){
        console.error(err)
        return res.status(500).json({
            success : false,
            message : "Login false" 
        })
    }
}



//Api to get userData

export const getUser = async(req,res) =>{
   try {
      const user = req.user;
      return res.json({success:true,user})
   } catch (error) {
      return res.json({success:false,message:error.message})
   }
}
//Api to get published images
/*export const getPublishedImages = async(req,res)=>{
    try {
        const publishedImagesMessages = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match:{
                    "messages.isImage":true,
                    "messages.isPublished":true
                }
            },
            {
                $project:{
                    _id:0,
                    imageUrl:"$messages.content",
                    userName:"$userName"
                }
            }
        ])

        res.json({success:true,images: publishedImagesMessages.reverse()})
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}*/