-- Add file_content column to document_files table if it doesn't exist
ALTER TABLE document_files ADD COLUMN IF NOT EXISTS file_content TEXT;
