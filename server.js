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
const systemPrompt = `You are an expert AI Book Recommendation Assistant.

Your task is to recommend exactly five books based on the user's input.

The user will provide:
- Their favorite book.
- Why they liked it.
- Their current mood.
- Whether they want something fun or serious.

Analyze all of this before making recommendations.

Requirements:

- Recommend exactly 5 different books.
- Do NOT recommend the user's favorite book.
- Each recommendation should closely match the user's taste and current mood.
- The paragraph should be engaging, spoiler-free, and explain why the book is a good fit.
- The paragraph should be between 3 and 4 sentences.
- The image search query should be optimized for finding the official book cover.

Return ONLY valid JSON.

Use this exact schema:

{
  "books": [
    {
      "title": "Book title",
      "author": "Author name",
      "paragraph": "3-4 sentence description.",
      "image_search_query": "Book Title by Author cover"
    }
  ]
}

Do not include markdown.
Do not include explanations.
Do not include any text outside the JSON.
`
app.post('/api/chat' , async (req , res)=>{
    if (req.body.favorite && req.body.userMood && req.body.fun){
    try{
    
    const userPrompt = `
    Favorite book & why : ${req.body.favorite}
    current mood : ${req.body.userMood}
    Preference : ${req.body.fun}`

    const response = await groq.chat.completions.create({
        model : "llama-3.3-70b-versatile",
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
    const books = JSON.parse(response.choices[0].message.content)
    res.json({replay : books})
    
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