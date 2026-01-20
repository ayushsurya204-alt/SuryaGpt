import imagekit from "../configs/imageKit.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import axios from "axios";
import openai from "../configs/openai.js";


//Text-based Ai Chat Controller
export const textMessageController = async(req,res) =>{
    try {
        const userId = req.user._id;

        if(req.user.credits <1){
            return res.json({success:false,message:"You don't have enough credits to use this feature"})
        }

        const {chatId,prompt} = req.body;
        
        const chat = await Chat.findOne({userId,_id:chatId})
        chat.messages.push({role:"user",content:prompt,timestamp: Date.now(),isImage:false})

        const {choices} = await openai.chat.completions.create({
          model: "gemini-3-flash-preview",
          messages: [
             {
               role: "user",
               content:prompt,
             },
         ], 
       });

       const reply =  {...choices[0].message,timestamp: Date.now(),isImage:false}
       res.json({success:true,reply})

       chat.messages.push(reply)
       await chat.save()
       await User.updateOne({_id:userId},{$inc :{credits: -1}})
 
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}
//Image Generation Message Controller

/*export const imageMessageController = async(req,res) =>{
    try {
        const userId = req.user._id;
        //Check credits
        if(req.user.credits <2){
            return res.json({success:false,message:"You don't have enough credits to use this feature"})
        }
        const {prompt,chatId,isPublished} = req.body;
        //Find chat
        const chat = await Chat.findOne({userId,_id:chatId})
         
        //Push user chat
        chat.messages.push({
            role:"user",
            content:prompt,
            timestamp:Date.now(),
            isImage:false});
      
     //Encode the prompt
     const encodedPrompt = encodeURIComponent(prompt)

     //Construct Imagekit Ai generation URL
     const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/
     ik-genming-prompt-${encodedPrompt}/suryagpt/${Date.now()}.png?tr=w-800,
     h-800`;

     //Trigger generation by fetching from ImageKit
     const aiImageResponse = await axios.get(generatedImageUrl,{responseType:
        "arraybuffer"})

     //Convert to Base64
     const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.
     data,"binary").toString('base64')}`;

     //Upload to ImageKit media library
     const uploadResponse = await imagekit.upload({
        file: base64Image,
        fileName: `${Date.now()}.png`,
        folder:"suryagpt"
     })

     const reply =  {
        role:'assistant',
        content:uploadResponse.url,
        timestamp: Date.now(),
        isImage:true,
        isPublished
    }

     res.json({success:true,reply})

     chat.messages.push(reply)
     await chat.save()

     await User.updateOne({_id:userId},{$inc :{credits: -2}})



    } catch (error) {
        res.json({success:false,message:error.message})
    }
}*/
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check credits
    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { prompt, chatId, isPublished } = req.body;

    // Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // ============================
    // 🔹 Generate Image using Gemini
    // ============================

    const geminiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage",
      {
        prompt: {
          text: prompt,
        },
      },
      {
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );

    const imageBase64 =
      geminiResponse.data.candidates[0].content.parts[0].inlineData.data;

    const base64Image = `data:image/png;base64,${imageBase64}`;

    // ============================
    // 🔹 Upload to ImageKit
    // ============================

    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "suryagpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    res.json({ success: true, reply });

    chat.messages.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    console.error("Image Controller Error:", error.response?.data || error);
    res.json({ success: false, message: error.message });
  }
};
