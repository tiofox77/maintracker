import { useState, useEffect } from "react";
import {
  getOrCreateSettings,
  saveGeneralSettings,
  saveNotificationSettings,
  Settings,
} from "../api/settings";
import { getCurrentUser, updateUser, User } from "../api/users";
import { toast } from "../utils/toast";
import { supabase } from "../supabase";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      setUserProfile(user);
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
      setLoading(true);
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
    } finally {
      setLoading(false);
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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userUpdate: {
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
    department?: string;
    phone?: string;
  }) => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update user profile in the database
      const updatedUser = await updateUser(user.id, userUpdate);
      setUserProfile(updatedUser);
      toast.success("User profile updated successfully");
      return updatedUser;
    } catch (err) {
      toast.error("Failed to update user profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      setLoading(true);

      // First verify the current password is correct
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userProfile?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("Password updated successfully");
      return true;
    } catch (err) {
      console.error("Error updating password:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update password",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTwoFactorAuth = async (enabled: boolean) => {
    try {
      setLoading(true);
      // In a real app, this would interact with Supabase Auth to enable/disable 2FA
      // For this demo, we'll just simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        `Two-factor authentication ${enabled ? "enabled" : "disabled"} successfully`,
      );
      return true;
    } catch (err) {
      toast.error("Failed to update two-factor authentication settings");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutAllOtherSessions = async () => {
    try {
      setLoading(true);
      // In a real app, this would call Supabase Auth to sign out other sessions
      // For this demo, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("All other sessions have been signed out");
      return true;
    } catch (err) {
      toast.error("Failed to sign out other sessions");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    userProfile,
    loading,
    error,
    fetchSettings,
    updateGeneralSettings,
    updateNotificationSettings,
    updateUserProfile,
    updatePassword,
    updateTwoFactorAuth,
    signOutAllOtherSessions,
  };
}
