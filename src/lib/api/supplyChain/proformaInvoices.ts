import { supabase } from "../../supabase";
import { getFilenameFromUrl } from "../../utils/fileUtils";

export type ProformaInvoice = {
  id: string;
  pi_id: string;
  supplier_name: string;
  invoice_number: string;
  total_amount: number;
  currency: string;
  issue_date: string;
  expiry_date: string;
  payment_status: "pending" | "paid" | "canceled";
  document_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type ProformaInvoiceInsert = Omit<
  ProformaInvoice,
  "id" | "pi_id" | "created_at" | "updated_at" | "created_by" | "updated_by"
>;

export type ProformaInvoiceUpdate = Partial<
  Omit<
    ProformaInvoice,
    "id" | "pi_id" | "created_at" | "updated_at" | "created_by" | "updated_by"
  >
>;

// Get all proforma invoices with pagination and filtering
export async function getProformaInvoices({
  page = 1,
  limit = 10,
  status,
  currency,
  search,
  startDate,
  endDate,
  sortBy = "issue_date",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  status?: "pending" | "paid" | "canceled";
  currency?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) {
  try {
    let query = supabase
      .from("proforma_invoices")
      .select("*", { count: "exact" });

    // Apply filters
    if (status) {
      query = query.eq("payment_status", status);
    }

    if (currency) {
      query = query.eq("currency", currency);
    }

    if (search) {
      query = query.or(
        `supplier_name.ilike.%${search}%,pi_id.ilike.%${search}%,invoice_number.ilike.%${search}%`,
      );
    }

    if (startDate) {
      query = query.gte("issue_date", startDate);
    }

    if (endDate) {
      query = query.lte("issue_date", endDate);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data as ProformaInvoice[],
      count: count || 0,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error fetching proforma invoices:", error);
    throw error;
  }
}

// Get a single proforma invoice by ID
export async function getProformaInvoiceById(id: string) {
  try {
    const { data, error } = await supabase
      .from("proforma_invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data as ProformaInvoice;
  } catch (error) {
    console.error(`Error fetching proforma invoice with id ${id}:`, error);
    throw error;
  }
}

// Create a new proforma invoice
export async function createProformaInvoice(
  proformaInvoice: ProformaInvoiceInsert,
) {
  try {
    // Generate a unique PI ID (e.g., PI-2023-0001)
    const piId = `PI-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 10000,
    )
      .toString()
      .padStart(4, "0")}`;

    // Get current user
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    // First create the proforma invoice record
    const { data, error } = await supabase
      .from("proforma_invoices")
      .insert({
        ...proformaInvoice,
        pi_id: piId,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Document URL is now directly provided in the proformaInvoice object
    // No need to upload files here as it's handled by the FileUpload component

    return data as ProformaInvoice;
  } catch (error) {
    console.error("Error creating proforma invoice:", error);
    throw error;
  }
}

// Update an existing proforma invoice
export async function updateProformaInvoice(
  id: string,
  proformaInvoice: ProformaInvoiceUpdate,
) {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    // First get the current invoice to check if we need to delete an existing file
    const { data: currentInvoice, error: fetchError } = await supabase
      .from("proforma_invoices")
      .select("document_url, pi_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Document URL is now directly provided in the proformaInvoice object
    // No need to upload files here as it's handled by the FileUpload component

    // If there's a new document URL and it's different from the current one,
    // we might want to delete the old file, but we'll skip that for now
    // as the FileUpload component handles the upload part

    // Update the proforma invoice
    const { data, error } = await supabase
      .from("proforma_invoices")
      .update({
        ...proformaInvoice,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as ProformaInvoice;
  } catch (error) {
    console.error(`Error updating proforma invoice with id ${id}:`, error);
    throw error;
  }
}

// Delete a proforma invoice
export async function deleteProformaInvoice(id: string) {
  try {
    // First get the invoice to check if there's a document to delete
    const { data: invoice, error: fetchError } = await supabase
      .from("proforma_invoices")
      .select("document_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // If there's a document, delete it from storage
    if (invoice?.document_url) {
      try {
        console.log("Deleting file reference:", invoice.document_url);

        // Extract the file path from the URL
        const pathMatch = invoice.document_url.match(
          /\/storage\/v1\/object\/public\/documents\/([^?]+)/,
        );
        if (pathMatch && pathMatch[1]) {
          const filePath = decodeURIComponent(pathMatch[1]);

          // Delete the file from storage
          const { error: removeError } = await supabase.storage
            .from("documents")
            .remove([filePath]);

          if (removeError) {
            console.error("Error removing file:", removeError);
          } else {
            console.log("File deleted successfully");
          }
        } else {
          console.log(
            "Could not extract file path from URL, skipping deletion",
          );
        }
      } catch (deleteError) {
        console.error("Error deleting document:", deleteError);
        // Continue with deletion even if file removal fails
      }
    }

    // Delete related document files from the database
    const { error: deleteFilesError } = await supabase
      .from("document_files")
      .delete()
      .eq("related_to", "proforma_invoice")
      .eq("related_id", id);

    if (deleteFilesError) {
      console.error("Error deleting related document files:", deleteFilesError);
      // Continue with invoice deletion even if file records deletion fails
    }

    // Delete the invoice record
    const { error } = await supabase
      .from("proforma_invoices")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting proforma invoice with id ${id}:`, error);
    throw error;
  }
}

// Mark a proforma invoice as paid
export async function markProformaInvoiceAsPaid(id: string, notes?: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const { data, error } = await supabase
      .from("proforma_invoices")
      .update({
        payment_status: "paid",
        notes: notes || null,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as ProformaInvoice;
  } catch (error) {
    console.error(
      `Error marking proforma invoice as paid with id ${id}:`,
      error,
    );
    throw error;
  }
}

// Cancel a proforma invoice
export async function cancelProformaInvoice(id: string, notes?: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const { data, error } = await supabase
      .from("proforma_invoices")
      .update({
        payment_status: "canceled",
        notes: notes || null,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as ProformaInvoice;
  } catch (error) {
    console.error(`Error canceling proforma invoice with id ${id}:`, error);
    throw error;
  }
}
