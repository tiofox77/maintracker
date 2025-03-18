-- Add related_to and related_id columns to document_files table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_files' AND column_name = 'related_to') THEN
        ALTER TABLE document_files ADD COLUMN related_to TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_files' AND column_name = 'related_id') THEN
        ALTER TABLE document_files ADD COLUMN related_id UUID;
    END IF;
    
    -- Create index for faster lookups
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_document_files_related') THEN
        CREATE INDEX idx_document_files_related ON document_files(related_to, related_id);
    END IF;
END
$$;
