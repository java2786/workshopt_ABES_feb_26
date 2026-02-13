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

const upload = multer({ storage: multer.memoryStorage() });

server.use(
    express.static('public'),
    express.json()
)

server.get("/", function(req, res){
    res.json({message: "this message is from server"})
})

server.post("/resume/upload", upload.single("resume"), function(req, res){


    console.log(!!req.file)
    res.json({demo: "some data"})
})


server.listen(PORT, function(){
    console.log("App is running at: "+PORT)
})