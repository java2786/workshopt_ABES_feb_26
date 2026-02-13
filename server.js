// import var from "package";

import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import pdfParse from "pdf-parse";
// import { PDFParse } from "pdf-parse";
import Tesseract from "tesseract.js";
import {GoogleGenerativeAI} from "@google/generative-ai";


//  Function to extract text from images using Tesseract
async function extractTextFromImage(imageBuffer) {
  try {
    console.log(" Attempting OCR extraction...");
    
    //  Updated Tesseract.js API (Feb 2026)
    const result = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: m => console.log(m) // Optional: see progress
      }
    );
    
    return result.data.text;
  } catch (error) {
    console.error(" OCR Error:", error.message);
    return "";
  }
}


dotenv.config();
const PORT = process.env.PORT;

const server = express()

const upload = multer({ storage: multer.memoryStorage() });

server.use(
    express.static('public'),
    express.json()
)

server.get("/", function(req, res){
    res.json({message: "this message is from server"})
})

server.post("/resume/upload", upload.single("resume"), async function(req, res){

    if(!req.file){
        res.status(400).json({error: "File not uploaded"})
    }

    let resumeText = await pdfParse(req.file.buffer).text?.trim()

    if(!resumeText){
        // res.status(400).json({error: "PDF is scanned."})
        resumeText = await extractTextFromImage(req.file.buffer);
        if(!resumeText){
            res.status(400).json({error: "PDF is scanned."})
        }
    }
    console.log("Resume: "+!!resumeText)
    res.json({demo: "some data"})
})


server.listen(PORT, function(){
    console.log("App is running at: "+PORT)
})