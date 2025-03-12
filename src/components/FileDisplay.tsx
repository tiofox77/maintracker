import React from "react";
import { Button } from "./ui/button";
import { Download, File, FileText, Image, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface FileDisplayProps {
  fileUrl: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

const FileDisplay: React.FC<FileDisplayProps> = ({
  fileUrl,
  onDelete,
  showDeleteButton = true,
}) => {
  if (!fileUrl) return null;

  // Extract filename from URL
  const getFilenameFromUrl = (url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      const segments = pathname.split("/");
      return segments[segments.length - 1];
    } catch (error) {
      return url.substring(url.lastIndexOf("/") + 1);
    }
  };

  // Get file extension
  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  // Determine file type icon
  const getFileIcon = (extension: string) => {
    switch (extension) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const filename = getFilenameFromUrl(fileUrl);
  const extension = getFileExtension(filename);
  const fileIcon = getFileIcon(extension);

  // Handle file deletion from storage
  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      // Extract the path from the URL
      const url = new URL(fileUrl);
      const pathMatch = url.pathname.match(
        /\/storage\/v1\/object\/public\/documents\/(.*)/i,
      );

      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];

        // Delete from Supabase storage
        const { error } = await supabase.storage
          .from("documents")
          .remove([filePath]);

        if (error) throw error;
      }

      // Call the onDelete callback to update the parent component
      onDelete();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
      {fileIcon}
      <span className="flex-1 truncate text-sm">{filename}</span>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => window.open(fileUrl, "_blank")}
        >
          <Download className="h-4 w-4" />
        </Button>

        {showDeleteButton && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileDisplay;
