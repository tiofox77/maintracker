import { supabase } from "../../supabase";
import { Database } from "../../../types/database.types";

export type MaterialRequest = {
  id: string;
  request_id: string;
  requester_name: string;
  department: string;
  request_date: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  items?: MaterialRequestItem[];
};

export type MaterialRequestItem = {
  id: string;
  material_request_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type MaterialRequestInsert = Omit<
  MaterialRequest,
  "id" | "created_at" | "updated_at" | "items" | "request_id"
> & {
  items: Omit<
    MaterialRequestItem,
    "id" | "material_request_id" | "created_at" | "updated_at"
  >[];
};

export type MaterialRequestUpdate = Partial<
  Omit<
    MaterialRequest,
    "id" | "created_at" | "updated_at" | "items" | "request_id"
  >
>;

export type MaterialRequestItemInsert = Omit<
  MaterialRequestItem,
  "id" | "created_at" | "updated_at"
>;

export type MaterialRequestItemUpdate = Partial<
  Omit<
    MaterialRequestItem,
    "id" | "material_request_id" | "created_at" | "updated_at"
  >
>;

// Get all material requests with pagination and filtering
export async function getMaterialRequests({
  page = 1,
  limit = 10,
  status,
  department,
  search,
  startDate,
  endDate,
  sortBy = "request_date",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  department?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) {
  try {
    let query = supabase
      .from("material_requests")
      .select("*, material_request_items(*)", { count: "exact" });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (department) {
      query = query.eq("department", department);
    }

    if (search) {
      query = query.or(
        `requester_name.ilike.%${search}%,request_id.ilike.%${search}%`,
      );
    }

    if (startDate) {
      query = query.gte("request_date", startDate);
    }

    if (endDate) {
      query = query.lte("request_date", endDate);
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

    // Transform the data to include items property
    const transformedData =
      data?.map((request) => {
        const items = request.material_request_items || [];
        delete request.material_request_items;
        return {
          ...request,
          items,
        };
      }) || [];

    return {
      data: transformedData as MaterialRequest[],
      count: count || 0,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error fetching material requests:", error);
    throw error;
  }
}

// Get a single material request by ID
export async function getMaterialRequestById(id: string) {
  try {
    const { data, error } = await supabase
      .from("material_requests")
      .select("*, material_request_items(*)")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    // Transform the data to include items property
    if (data) {
      const items = data.material_request_items || [];
      delete data.material_request_items;
      return {
        ...data,
        items,
      } as MaterialRequest;
    }
    return null as unknown as MaterialRequest;
  } catch (error) {
    console.error(`Error fetching material request with id ${id}:`, error);
    throw error;
  }
}

// Create a new material request with items
export async function createMaterialRequest(
  materialRequest: MaterialRequestInsert,
) {
  try {
    // Generate a unique request ID (e.g., PO-2023-0001)
    const requestId = `PO-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 10000,
    )
      .toString()
      .padStart(4, "0")}`;

    // Start a transaction
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    // Extract items from the request and remove them from the main object
    const { items, ...requestDataWithoutItems } = materialRequest;

    // Create the material request
    const { data: requestData, error: requestError } = await supabase
      .from("material_requests")
      .insert({
        ...requestDataWithoutItems,
        request_id: requestId,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (requestError) {
      throw requestError;
    }

    // Create the material request items
    const itemsToInsert = items.map((item) => ({
      ...item,
      material_request_id: requestData.id,
    }));

    const { error: itemsError } = await supabase
      .from("material_request_items")
      .insert(itemsToInsert);

    if (itemsError) {
      throw itemsError;
    }

    // Get the complete material request with items
    return await getMaterialRequestById(requestData.id);
  } catch (error) {
    console.error("Error creating material request:", error);
    throw error;
  }
}

// Update an existing material request
export async function updateMaterialRequest(
  id: string,
  materialRequest: MaterialRequestUpdate,
) {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const { data, error } = await supabase
      .from("material_requests")
      .update({
        ...materialRequest,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as MaterialRequest;
  } catch (error) {
    console.error(`Error updating material request with id ${id}:`, error);
    throw error;
  }
}

// Delete a material request (and its items via cascade)
export async function deleteMaterialRequest(id: string) {
  try {
    const { error } = await supabase
      .from("material_requests")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting material request with id ${id}:`, error);
    throw error;
  }
}

// Add an item to a material request
export async function addMaterialRequestItem(item: MaterialRequestItemInsert) {
  try {
    const { data, error } = await supabase
      .from("material_request_items")
      .insert(item)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as MaterialRequestItem;
  } catch (error) {
    console.error("Error adding material request item:", error);
    throw error;
  }
}

// Update a material request item
export async function updateMaterialRequestItem(
  id: string,
  item: MaterialRequestItemUpdate,
) {
  try {
    const { data, error } = await supabase
      .from("material_request_items")
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as MaterialRequestItem;
  } catch (error) {
    console.error(`Error updating material request item with id ${id}:`, error);
    throw error;
  }
}

// Delete a material request item
export async function deleteMaterialRequestItem(id: string) {
  try {
    const { error } = await supabase
      .from("material_request_items")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting material request item with id ${id}:`, error);
    throw error;
  }
}

// Approve a material request
export async function approveMaterialRequest(id: string, notes?: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const { data, error } = await supabase
      .from("material_requests")
      .update({
        status: "approved",
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

    return data as MaterialRequest;
  } catch (error) {
    console.error(`Error approving material request with id ${id}:`, error);
    throw error;
  }
}

// Reject a material request
export async function rejectMaterialRequest(id: string, notes?: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const { data, error } = await supabase
      .from("material_requests")
      .update({
        status: "rejected",
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

    return data as MaterialRequest;
  } catch (error) {
    console.error(`Error rejecting material request with id ${id}:`, error);
    throw error;
  }
}
