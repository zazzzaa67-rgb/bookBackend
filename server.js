import Groq from "groq-sdk"
import cors from 'cors'
import dotenv from "dotenv"
import {marked} from 'marked' 
import express from 'express'
dotenv.config()
const app = express()
app.use(cors(
    {origin : "*"}
))
app.use(express.json())
const groq = await new Groq({
    apiKey  : process.env.GROQ_API
})
const systemPrompt = `You are an expert AI Book Recommender. Your job is to analyze the user's input, which consists of three variables: Their favorite book and why they like it, their current mood, and whether they want something fun or serious. 

Based on this data, recommend ONE perfect book that matches their preferences. 

You must strictly respond ONLY with a JSON object. Do not include any conversational text, markdown formatting (like json), or explanations outside the JSON.

The JSON object must contain exactly these four keys:
1. "title": The exact title of the recommended book.
2. "author": The author of the book.
3. "paragraph": A brief, engaging description (3-4 sentences) explaining why this book fits their current mood and preference.
4. "image_search_query": A clean search query keywords string (e.g., "Book Title by Author cover") that the developer can use to fetch the book cover image from an external image API.
`
app.post('/api/chat' , async (req , res)=>{
    if (req.body.favorite && req.body.userMood && req.body.fun){
    try{
    
    const userPrompt = `
    Favorite book & why : ${req.body.favorite}
    current mood : ${req.body.userMood}
    Preference : ${req.body.fun}`

    const response = await groq.chat.completions.create({
        model : "llama3-8b-8192",
        temperature : .5,
        messages : [
            {role : "system" , 
            content : systemPrompt
            },
            {role : "user" , 
            content : userPrompt
            }
        ]
    }

    )
    const html = marked.parse(response.choices[0].message.content)
    res.json({replay : html})
    
}catch(err){
    console.error(err)
    res.status(500).json({
            error:"Interal server Error"
        })
}}else{
    res.json({wrong : "please Enter all sections "})
}

})
export default app