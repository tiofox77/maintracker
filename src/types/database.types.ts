export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          description: string;
          location: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          location?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          location?: string;
          created_at?: string;
        };
      };
      equipment: {
        Row: {
          id: string;
          name: string;
          serial_number: string;
          category_id: string;
          department_id: string;
          status: "operational" | "maintenance" | "out-of-service";
          purchase_date: string;
          last_maintenance: string;
          next_maintenance: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          serial_number: string;
          category_id: string;
          department_id: string;
          status?: "operational" | "maintenance" | "out-of-service";
          purchase_date?: string;
          last_maintenance?: string;
          next_maintenance?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          serial_number?: string;
          category_id?: string;
          department_id?: string;
          status?: "operational" | "maintenance" | "out-of-service";
          purchase_date?: string;
          last_maintenance?: string;
          next_maintenance?: string;
          notes?: string;
          created_at?: string;
        };
      };
      maintenance_tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          equipment_id: string;
          category_id: string;
          scheduled_date: string;
          completed_date: string | null;
          estimated_duration: number;
          actual_duration: number | null;
          priority: "low" | "medium" | "high" | "critical";
          status:
            | "scheduled"
            | "in-progress"
            | "completed"
            | "cancelled"
            | "partial";
          assigned_to: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          equipment_id: string;
          category_id?: string;
          scheduled_date: string;
          completed_date?: string | null;
          estimated_duration?: number;
          actual_duration?: number | null;
          priority?: "low" | "medium" | "high" | "critical";
          status?:
            | "scheduled"
            | "in-progress"
            | "completed"
            | "cancelled"
            | "partial";
          assigned_to?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          equipment_id?: string;
          category_id?: string;
          scheduled_date?: string;
          completed_date?: string | null;
          estimated_duration?: number;
          actual_duration?: number | null;
          priority?: "low" | "medium" | "high" | "critical";
          status?:
            | "scheduled"
            | "in-progress"
            | "completed"
            | "cancelled"
            | "partial";
          assigned_to?: string;
          notes?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role: "admin" | "manager" | "technician" | "user";
          department: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          role?: "admin" | "manager" | "technician" | "user";
          department?: string;
          phone?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          role?: "admin" | "manager" | "technician" | "user";
          department?: string;
          phone?: string;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          system_name: string;
          date_format: string;
          time_format: string;
          default_language: string;
          timezone: string;
          email_notifications: boolean;
          maintenance_due_reminders: boolean;
          equipment_status_changes: boolean;
          system_updates: boolean;
          daily_digest: boolean;
          reminder_days: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name?: string;
          system_name?: string;
          date_format?: string;
          time_format?: string;
          default_language?: string;
          timezone?: string;
          email_notifications?: boolean;
          maintenance_due_reminders?: boolean;
          equipment_status_changes?: boolean;
          system_updates?: boolean;
          daily_digest?: boolean;
          reminder_days?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          system_name?: string;
          date_format?: string;
          time_format?: string;
          default_language?: string;
          timezone?: string;
          email_notifications?: boolean;
          maintenance_due_reminders?: boolean;
          equipment_status_changes?: boolean;
          system_updates?: boolean;
          daily_digest?: boolean;
          reminder_days?: number;
          created_at?: string;
        };
      };
    };
  };
}
