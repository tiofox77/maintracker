import { useState, useEffect, useCallback } from "react";
import {
  getDocumentFiles,
  getDocumentFileById,
  getDocumentFilesByRelation,
  deleteDocumentFile,
  updateDocumentFileRelation,
  DocumentFile,
} from "../api/documentFiles";
import { toast } from "../utils/toast";

export function useDocumentFiles(relatedTo?: string, relatedId?: string) {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data: DocumentFile[];

      if (relatedTo && relatedId) {
        data = await getDocumentFilesByRelation(relatedTo, relatedId);
      } else {
        data = await getDocumentFiles();
      }

      setFiles(data);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load document files");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [relatedTo, relatedId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const getFileById = async (id: string) => {
    try {
      setLoading(true);
      const data = await getDocumentFileById(id);
      return data;
    } catch (err) {
      toast.error("Failed to load document file details");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFile = async (id: string) => {
    try {
      setLoading(true);
      await deleteDocumentFile(id);
      setFiles((prev) => prev.filter((file) => file.id !== id));
      toast.success("Document file deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete document file");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFileRelation = async (
    id: string,
    relatedTo: string,
    relatedId: string,
  ) => {
    try {
      setLoading(true);
      const updatedFile = await updateDocumentFileRelation(
        id,
        relatedTo,
        relatedId,
      );
      setFiles((prev) =>
        prev.map((file) => (file.id === id ? updatedFile : file)),
      );
      toast.success("Document file relation updated successfully");
      return updatedFile;
    } catch (err) {
      toast.error("Failed to update document file relation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    files,
    loading,
    error,
    fetchFiles,
    getFileById,
    removeFile,
    updateFileRelation,
  };
}
