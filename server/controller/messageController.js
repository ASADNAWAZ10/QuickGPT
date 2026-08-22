// import axios from "axios"
import Chat from "../models/chat.js"
import User from "../models/User.js" 
import openai from '../config/openai.js'
import imagekit from "../config/imagekit.js"


//Text-based AI chat Message controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id

        if(req.user.credits < 1){
            return res.json({success: false, message: "you don't have enough credits to use this feature"})
        }

        const {chatId, prompt} = req.body

        const chat = await Chat.findOne({userId, _id: chatId})
        chat.message.push({role: "user", content: prompt, timestamps: Date.now(),
    isImage: false})

    const {choices} = await openai.chat.completions.create({
        model: "gemini-3-flash-preview",
        messages: [
            {
                role: "user",
                content:prompt,
            },
        ],
    });

    const reply = {...choices[0].message, timestamps:Date.now(), isImage: false}
    res.json({success: true, reply})
    chat.message.push(reply)
    await chat.save()

    await User.updateOne({_id: userId}, {$inc: {credits: -1}})


    } catch (error) {
        res.json({success: false, message: error.message})
    }
} 

//Image Generator Message Controller
export const imageGeneratorController = async (req, res) => {
    try {
        const userId = req.user._id;
        if(req.user.credits < 2){
            return res.json({success: false, message: "you don't have enough credits to use this feature"})
        }
        const {prompt, chatId, isPublished} = req.body
        const chat = await Chat.findOne({userId, _id: chatId})

        chat.message.push({
            role: "user",
            content: prompt,
            timestamps: Date.now(), 
            isImage: true
        })
        const encodedPrompt = encodeURIComponent(prompt)

        const result = await openai.images.generate({
            model: "gpt-image-1",
            prompt: encodedPrompt,
            size: "1024 * 1024",
            quality: "medium",
        })

        const base64Image = result.data?.[0]?.b64_json;

        if(!base64Image){
            return res.status(500).json({
                success: false,
                message: "AI did not return an image"
            });
        }

        const imageBuffer = Buffer.from(base64Image, "base64");

        const UploadResponse = await imagekit.upload({
            file:imageBuffer,
            fileName: `ai-${Date.now()}.png`,
            folder: "/quick-gpt/generated-images",
        });

        const reply = {
            role: 'assistant',
            content: UploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        }
        res.json({success:true, reply})
        chat.message.push(reply)
        await chat.save()
        await User.updateOne({_id:userId}, {$inc: {credits: -2}})
    } catch (error) {
         res.json({success: false, message: error.message})
    }
   
}
