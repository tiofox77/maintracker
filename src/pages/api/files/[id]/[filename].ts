import { supabase } from "../../../../lib/supabase";

// This is a simple API route that serves files from the document_files table
export default async function handler(req, res) {
  const { id, filename } = req.query;

  if (!id || !filename) {
    return res.status(400).json({ error: "Missing file ID or filename" });
  }

  try {
    // Get the file from the database
    const { data, error } = await supabase
      .from("document_files")
      .select("file_name, content_type, file_content")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error fetching file:", error);
      return res.status(404).json({ error: "File not found" });
    }

    // Set the appropriate content type
    res.setHeader("Content-Type", data.content_type);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${data.file_name}"`,
    );

    // The file_content is stored as a base64 data URL, so we need to extract the actual data
    const base64Data = data.file_content.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // Send the file
    res.send(buffer);
  } catch (err) {
    console.error("Error serving file:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
