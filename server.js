// import var from "package";

import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
// import pdfParse from "pdf-parse";
import { PDFParse } from "pdf-parse";
import Tesseract from "tesseract.js";
import {GoogleGenerativeAI} from "@google/generative-ai";

dotenv.config();
const PORT = process.env.PORT;

const server = express()


server.use(
    express.static('public'),
    express.json()
)

server.get("/", function(req, res){
    res.json({message: "this message is from server"})
})

server.post("/resume/upload", multer, function(req, res){

})


server.listen(PORT, function(){
    console.log("App is running at: "+PORT)
})