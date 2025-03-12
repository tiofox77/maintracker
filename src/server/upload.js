const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../public/documentos");
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Add timestamp to filename to avoid duplicates
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}_${originalName}`);
  },
});

// Configure multer upload limits and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only specific file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.",
        ),
      );
    }
  },
});

const router = express.Router();

// File upload endpoint
router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get file information
    const fileName = req.file.filename;
    const filePath = `/documentos/${fileName}`;

    // Get invoice data from request body
    const invoiceData = req.body;

    // Generate a unique PI ID
    const piId = `PI-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 10000,
    )
      .toString()
      .padStart(4, "0")}`;

    // Insert into Supabase
    const { data, error } = await supabase
      .from("proforma_invoices")
      .insert({
        pi_id: piId,
        supplier_name: invoiceData.supplier_name,
        invoice_number: invoiceData.invoice_number,
        total_amount: parseFloat(invoiceData.total_amount),
        currency: invoiceData.currency,
        issue_date: invoiceData.issue_date,
        expiry_date: invoiceData.expiry_date,
        payment_status: "pending",
        document_url: filePath,
        notes: invoiceData.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting into database:", error);
      return res.status(500).json({ error: "Failed to save invoice data" });
    }

    res.status(201).json({
      success: true,
      data: data,
      file: {
        name: fileName,
        path: filePath,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: error.message || "An error occurred during file upload",
    });
  }
});

module.exports = router;
