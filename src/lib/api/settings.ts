import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type SettingsInsert = Database["public"]["Tables"]["settings"]["Insert"];
export type SettingsUpdate = Database["public"]["Tables"]["settings"]["Update"];

export async function getSettings(userId: string) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No settings found for this user
      return null;
    }
    console.error(`Error fetching settings for user ${userId}:`, error);
    throw error;
  }

  return data as Settings;
}

export async function createSettings(settings: SettingsInsert) {
  const { data, error } = await supabase
    .from("settings")
    .insert(settings)
    .select()
    .single();

  if (error) {
    console.error("Error creating settings:", error);
    throw error;
  }

  return data as Settings;
}

export async function updateSettings(id: string, settings: SettingsUpdate) {
  const { data, error } = await supabase
    .from("settings")
    .update(settings)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating settings with id ${id}:`, error);
    throw error;
  }

  return data as Settings;
}

export async function getOrCreateSettings(userId: string) {
  // Try to get existing settings
  const existingSettings = await getSettings(userId);

  if (existingSettings) {
    return existingSettings;
  }

  // Create default settings if none exist
  const defaultSettings: SettingsInsert = {
    user_id: userId,
    company_name: "Acme Manufacturing",
    system_name: "Maintenance Management System",
    date_format: "MM/DD/YYYY",
    time_format: "12h",
    default_language: "en",
    timezone: "UTC-5",
    email_notifications: true,
    maintenance_due_reminders: true,
    equipment_status_changes: true,
    system_updates: false,
    daily_digest: true,
    reminder_days: 3,
  };

  return await createSettings(defaultSettings);
}

export async function saveGeneralSettings(
  userId: string,
  generalSettings: {
    company_name: string;
    system_name: string;
    date_format: string;
    time_format: string;
    default_language: string;
    timezone: string;
  },
) {
  const settings = await getOrCreateSettings(userId);

  return await updateSettings(settings.id, generalSettings);
}

export async function saveNotificationSettings(
  userId: string,
  notificationSettings: {
    email_notifications: boolean;
    maintenance_due_reminders: boolean;
    equipment_status_changes: boolean;
    system_updates: boolean;
    daily_digest: boolean;
    reminder_days: number;
  },
) {
  const settings = await getOrCreateSettings(userId);

  return await updateSettings(settings.id, notificationSettings);
}
