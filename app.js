// server.js
// ✅ Upload Resume PDF -> Extract Text -> Gemini Analysis -> Score + Gaps
// ✅ Beginner-friendly: simple, clean, lots of comments
// ✅ Updated for Feb 2026 with correct library usage

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import pdfParse from "pdf-parse"; // ✅ Fixed: default import
import Tesseract from 'tesseract.js'; // ✅ Fixed: correct import
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set the public directory
app.use(express.static('public'));

// ✅ Multer setup: store uploaded file in memory (easy for demo)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Function to extract text from images using Tesseract
async function extractTextFromImage(imageBuffer) {
  try {
    console.log("📸 Attempting OCR extraction...");
    
    // ✅ Updated Tesseract.js API (Feb 2026)
    const result = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: m => console.log(m) // Optional: see progress
      }
    );
    
    return result.data.text;
  } catch (error) {
    console.error("❌ OCR Error:", error.message);
    return "";
  }
}

// ✅ Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Helper: Ask Gemini and force JSON output
async function askGeminiForJSON(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const jsonOnlyPrompt = `
You are an API. Return ONLY valid JSON.
No markdown. No backticks. No extra explanation.

${prompt}
`;

  const result = await model.generateContent(jsonOnlyPrompt);
  const raw = result.response.text();

  // ✅ Try JSON.parse directly
  try {
    return JSON.parse(raw);
  } catch {
    // ✅ Fallback: extract JSON block if Gemini adds extra text
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first === -1 || last === -1) throw new Error("Gemini did not return JSON.");
    const cleaned = raw.slice(first, last + 1);
    return JSON.parse(cleaned);
  }
}

// ✅ Health check
app.get("/", (req, res) => res.send("Resume Analyzer running 🚀"));

/**
 * ✅ POST /resume/upload
 * Form-data:
 * - resume (PDF file)
 * - targetRole (text)   e.g. "Node.js Backend Developer (Fresher)"
 *
 * Output:
 * - ATS Score
 * - Strengths
 * - Weak Areas
 * - Missing Skills
 * - Quick Fixes
 */
app.post("/resume/upload", upload.single("resume"), async (req, res) => {
  try {
    // ✅ 1) Validate input
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a PDF file with key: resume" });
    }

    const targetRole = req.body.targetRole || "Software Developer (Fresher)";

    // ✅ 2) Ensure it's PDF
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF resumes are supported in this demo." });
    }

    // ✅ 3) Extract text from PDF
    console.log("📄 Extracting text from PDF...");
    let resumeText = "";
    
    try {
      // ✅ Fixed: correct pdf-parse usage
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = (pdfData.text || "").trim();
      console.log(`✅ Extracted ${resumeText.length} characters from PDF`);
    } catch (pdfError) {
      console.error("❌ PDF extraction failed:", pdfError.message);
    }

    // ✅ 4) If PDF text extraction failed, try OCR
    if (!resumeText) {
      console.log("⚠️ PDF text is empty. Attempting OCR...");
      
      try {
        resumeText = await extractTextFromImage(req.file.buffer);
        
        if (!resumeText || resumeText.trim().length === 0) {
          return res.status(400).json({
            error: "Could not extract text from PDF. The file might be an image-based PDF without text layer, or the OCR failed. Please try a text-based PDF.",
          });
        }
        
        console.log(`✅ OCR extracted ${resumeText.length} characters`);
      } catch (ocrError) {
        return res.status(400).json({
          error: "Could not extract text from PDF using OCR. Error: " + ocrError.message,
        });
      }
    }

    // ✅ Final check
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "Extracted text is too short or empty. Please upload a valid resume PDF.",
      });
    }

    // ✅ 5) Ask Gemini to analyze resume
    console.log("🤖 Sending to Gemini for analysis...");
    
    const prompt = `
Analyze this resume for the target role: "${targetRole}"

Return JSON in EXACT shape:
{
  "atsScore": number (0-100),
  "strengths": ["..."],
  "weakAreas": ["..."],
  "missingSkills": ["..."],
  "projectGaps": ["..."],
  "quickFixes": ["..."],
  "oneLineVerdict": "..."
}

Rules:
- Be beginner-friendly.
- Be realistic (no fake praise).
- Mention projects/deployment/GitHub if missing.

Resume Text:
"""
${resumeText}
"""
`;

    const analysis = await askGeminiForJSON(prompt);
    console.log("✅ Analysis complete!");

    // ✅ 6) Return response
    res.json({
      targetRole,
      fileName: req.file.originalname,
      extractedChars: resumeText.length,
      analysis,
    });
    
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({
      error: err.message || "Something went wrong",
    });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));