import axios from "axios"
import Chat from "../models/chat.js"
import User from "../models/User.js"
import imageKit from '../config/imagekit.js'
import openai from '../config/openai.js'

//Text-based AI chat Message controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id
        const {chatId, prompt} = req.body

        const chat = await Chat.findOne({userId, _id: chatId})
        chat.message.push({role: "user", content: prompt, timestamp: Date.now(),
    isImage: false})

    const {choices} = await openai.chat.completions.create({
        model: "gemini-3-flash-preview",
        messages: [
            {
                role: "user",
                content: "Explain to me how AI works",
            },
        ],
    });

    const reply = {...choices[0].message, timestamp:Date.now(), isImage: false}
    res.json({success: true, reply})
    chat.message.push(reply)
    await chat.save()

    await User.updateOne({_id: userId}, {$inc: {credits: -1}})


    } catch (error) {
        res.json({success: false, message: error.message})
    }
} 

//Image Generator Message Controller
export  const imageGeneratorController = async(req, res) => {
    try {
        const userId = req.user._id;
        if(req.user.credits < 2){
            return res.json({success: false, message: "you don't have enough credits to use this feature"})
        }
        const {prompt, chatId, isPublished} = req.body
        const chat = await Chat.findOne({userId, _id: chatId})

        chat.mesages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(), 
            isIamge: false
        })
        const encodedPrompt = encodeURIComponent(prompt)

        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/
        ik-gening-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

        const aiImageResponse = await axios.get(generatedImageUrl, {responseType:
            "arraybuffer"
        })
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.
            data, "binary"
        ).toString('base64')}`;
        const UploadResponse = await imageGeneratorController.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt"
        })

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
