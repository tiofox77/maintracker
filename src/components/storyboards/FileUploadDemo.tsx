import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import FileUpload from "../FileUpload";
import FileDisplay from "../FileDisplay";
import { useDocumentFiles } from "../../lib/hooks";

export default function FileUploadDemo() {
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const { files, loading, error, fetchFiles, removeFile } = useDocumentFiles();

  const handleFileUpload = (url: string) => {
    setDocumentUrl(url);
    console.log("File uploaded:", url);
    // Refresh the files list after upload
    fetchFiles();
  };

  const handleFileDelete = async (id: string) => {
    try {
      await removeFile(id);
      setDocumentUrl("");
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>File Upload Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload
            onFileUpload={handleFileUpload}
            folder="demo-uploads"
            buttonText="Upload Document"
          />

          {documentUrl && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Uploaded Document</h3>
              <FileDisplay
                fileUrl={documentUrl}
                onDelete={() => setDocumentUrl("")}
              />

              <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                <p>Document URL (saved to database):</p>
                <p className="mt-1">{documentUrl}</p>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Files in Database</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading files...</span>
              </div>
            ) : error ? (
              <div className="text-center py-6 text-red-500">
                Error loading files. Please try again.
              </div>
            ) : files.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">
                          {file.original_name}
                        </TableCell>
                        <TableCell>{file.content_type}</TableCell>
                        <TableCell>
                          {Math.round(file.file_size / 1024)} KB
                        </TableCell>
                        <TableCell>
                          {new Date(file.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(file.document_url, "_blank")
                              }
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleFileDelete(file.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border rounded-md">
                No files uploaded yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
