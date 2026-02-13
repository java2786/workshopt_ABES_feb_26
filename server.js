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
// console.log(PORT)
// console.log("Type is: "+ typeof(express))

const server = express()

server.listen(PORT, function(){
    console.log("App is running at: "+PORT)
})