import { supabase } from "../supabase";

export type DocumentFile = {
  id: string;
  file_name: string;
  original_name: string;
  content_type: string;
  file_size: number;
  file_path: string;
  document_url: string;
  related_to?: string;
  related_id?: string;
  uploaded_by: string | null;
  created_at: string;
};

// Get all document files
export async function getDocumentFiles() {
  try {
    const { data, error } = await supabase
      .from("document_files")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as DocumentFile[];
  } catch (error) {
    console.error("Error fetching document files:", error);
    throw error;
  }
}

// Get document file by ID
export async function getDocumentFileById(id: string) {
  try {
    const { data, error } = await supabase
      .from("document_files")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data as DocumentFile;
  } catch (error) {
    console.error(`Error fetching document file with id ${id}:`, error);
    throw error;
  }
}

// Get document files by related entity
export async function getDocumentFilesByRelation(
  relatedTo: string,
  relatedId: string,
) {
  try {
    const { data, error } = await supabase
      .from("document_files")
      .select("*")
      .eq("related_to", relatedTo)
      .eq("related_id", relatedId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as DocumentFile[];
  } catch (error) {
    console.error(
      `Error fetching document files for ${relatedTo} ${relatedId}:`,
      error,
    );
    throw error;
  }
}

// Delete document file
export async function deleteDocumentFile(id: string) {
  try {
    // First get the file info to delete from storage
    const { data: fileData, error: fetchError } = await supabase
      .from("document_files")
      .select("file_path")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Delete from storage
    if (fileData?.file_path) {
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([fileData.file_path]);

      if (storageError) {
        console.error("Error removing file from storage:", storageError);
        // Continue with DB deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("document_files")
      .delete()
      .eq("id", id);

    if (dbError) {
      throw dbError;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting document file with id ${id}:`, error);
    throw error;
  }
}

// Update document file relation
export async function updateDocumentFileRelation(
  id: string,
  relatedTo: string,
  relatedId: string,
) {
  try {
    const { data, error } = await supabase
      .from("document_files")
      .update({
        related_to: relatedTo,
        related_id: relatedId,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as DocumentFile;
  } catch (error) {
    console.error(`Error updating document file relation for id ${id}:`, error);
    throw error;
  }
}
