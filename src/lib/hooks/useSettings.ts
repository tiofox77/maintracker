import { useState, useEffect } from "react";
import {
  getOrCreateSettings,
  saveGeneralSettings,
  saveNotificationSettings,
  Settings,
} from "../api/settings";
import { getCurrentUser } from "../api/users";
import { toast } from "../utils/toast";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      const data = await getOrCreateSettings(user.id);
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateGeneralSettings = async (generalSettings: {
    company_name: string;
    system_name: string;
    date_format: string;
    time_format: string;
    default_language: string;
    timezone: string;
  }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      const updatedSettings = await saveGeneralSettings(
        user.id,
        generalSettings,
      );
      setSettings(updatedSettings);
      toast.success("General settings saved successfully");
      return updatedSettings;
    } catch (err) {
      toast.error("Failed to save general settings");
      throw err;
    }
  };

  const updateNotificationSettings = async (notificationSettings: {
    email_notifications: boolean;
    maintenance_due_reminders: boolean;
    equipment_status_changes: boolean;
    system_updates: boolean;
    daily_digest: boolean;
    reminder_days: number;
  }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      const updatedSettings = await saveNotificationSettings(
        user.id,
        notificationSettings,
      );
      setSettings(updatedSettings);
      toast.success("Notification settings saved successfully");
      return updatedSettings;
    } catch (err) {
      toast.error("Failed to save notification settings");
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateGeneralSettings,
    updateNotificationSettings,
  };
}
