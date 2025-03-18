import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface FileUploadProps {
  onFileUpload: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  folder?: string;
  buttonText?: string;
  relatedTo?: string; // e.g., 'proforma_invoice'
  relatedId?: string; // The ID of the related record
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSize = 10, // Default 10MB
  folder = "uploads",
  buttonText = "Upload File",
  relatedTo,
  relatedId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Create a unique filename to prevent collisions
      const timestamp = new Date().getTime();
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${timestamp}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // First, ensure the bucket exists
      const { data: bucketData, error: bucketError } =
        await supabase.storage.getBucket("documents");

      if (bucketError && bucketError.message.includes("not found")) {
        // Create the bucket if it doesn't exist
        const { error: createBucketError } =
          await supabase.storage.createBucket("documents", {
            public: true,
          });

        if (createBucketError) {
          throw createBucketError;
        }
      } else if (bucketError) {
        throw bucketError;
      }

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Save file metadata to document_files table
      const { error: dbError } = await supabase.from("document_files").insert({
        file_name: fileName,
        original_name: selectedFile.name,
        content_type: selectedFile.type,
        file_size: selectedFile.size,
        file_path: filePath,
        document_url: publicUrl,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id || null,
        related_to: relatedTo || null,
        related_id: relatedId || null,
      });

      if (dbError) {
        console.error("Error saving file metadata to database:", dbError);
        // Continue even if DB save fails, but log the error
      }

      // If this is for a proforma invoice, update the document_url in the proforma_invoices table
      if (relatedTo === "proforma_invoice" && relatedId) {
        const { error: updateError } = await supabase
          .from("proforma_invoices")
          .update({ document_url: publicUrl })
          .eq("id", relatedId);

        if (updateError) {
          console.error(
            "Error updating proforma invoice with document URL:",
            updateError,
          );
          // Continue even if update fails, but log the error
        } else {
          console.log(
            `Successfully updated proforma invoice ${relatedId} with document URL: ${publicUrl}`,
          );
        }
      }

      // Pass the URL back to the parent component
      onFileUpload(publicUrl);

      // Reset the file input
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Upload Document</Label>
        <Input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {selectedFile && (
          <p className="text-xs text-green-600">
            Selected: {selectedFile.name} (
            {(selectedFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-xs text-gray-500">
          Supported formats: {accept.replace(/\./g, "").replace(/,/g, ", ")}{" "}
          (max {maxSize}MB)
        </p>
      </div>

      <Button
        type="button"
        onClick={uploadFile}
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>
    </div>
  );
};

export default FileUpload;
