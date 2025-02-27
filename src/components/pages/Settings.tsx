import React, { useState } from "react";
import DashboardHeader from "../dashboard/DashboardHeader";
import Sidebar from "../layout/Sidebar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AlertTriangle,
  Bell,
  Clock,
  Database,
  Key,
  Lock,
  PlusCircle,
  Save,
  Shield,
  User,
  Users,
} from "lucide-react";
import { Badge } from "../ui/badge";

const Settings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Mock settings state
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Acme Manufacturing",
    systemName: "Maintenance Management System",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    defaultLanguage: "en",
    timezone: "UTC-5",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    maintenanceDueReminders: true,
    equipmentStatusChanges: true,
    systemUpdates: false,
    dailyDigest: true,
    reminderDays: "3",
  });

  const [userSettings, setUserSettings] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@acme.com",
    role: "admin",
    department: "Maintenance",
    phone: "(555) 123-4567",
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSaveSettings = (settingType: string) => {
    // In a real application, you would save the settings to a database or API
    console.log(`Saving ${settingType} settings`);

    // Show success message
    alert(
      `${settingType.charAt(0).toUpperCase() + settingType.slice(1)} settings saved successfully!`,
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader title="Settings" onMenuToggle={handleToggleSidebar} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6 max-w-4xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">System Settings</h2>
              <p className="text-gray-500 mt-1">
                Configure your maintenance management system preferences
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  <span>General</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>User Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>

              {/* General Settings Tab */}
              <TabsContent value="general" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Configure system-wide settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company-name">Company Name</Label>
                          <Input
                            id="company-name"
                            value={generalSettings.companyName}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                companyName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="system-name">System Name</Label>
                          <Input
                            id="system-name"
                            value={generalSettings.systemName}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                systemName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-format">Date Format</Label>
                          <Select
                            value={generalSettings.dateFormat}
                            onValueChange={(value) =>
                              setGeneralSettings({
                                ...generalSettings,
                                dateFormat: value,
                              })
                            }
                          >
                            <SelectTrigger id="date-format">
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">
                                MM/DD/YYYY
                              </SelectItem>
                              <SelectItem value="DD/MM/YYYY">
                                DD/MM/YYYY
                              </SelectItem>
                              <SelectItem value="YYYY-MM-DD">
                                YYYY-MM-DD
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-format">Time Format</Label>
                          <Select
                            value={generalSettings.timeFormat}
                            onValueChange={(value) =>
                              setGeneralSettings({
                                ...generalSettings,
                                timeFormat: value,
                              })
                            }
                          >
                            <SelectTrigger id="time-format">
                              <SelectValue placeholder="Select time format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12h">
                                12-hour (AM/PM)
                              </SelectItem>
                              <SelectItem value="24h">24-hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="default-language">
                            Default Language
                          </Label>
                          <Select
                            value={generalSettings.defaultLanguage}
                            onValueChange={(value) =>
                              setGeneralSettings({
                                ...generalSettings,
                                defaultLanguage: value,
                              })
                            }
                          >
                            <SelectTrigger id="default-language">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="pt">Portuguese</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select
                            value={generalSettings.timezone}
                            onValueChange={(value) =>
                              setGeneralSettings({
                                ...generalSettings,
                                timezone: value,
                              })
                            }
                          >
                            <SelectTrigger id="timezone">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC-8">
                                Pacific Time (UTC-8)
                              </SelectItem>
                              <SelectItem value="UTC-7">
                                Mountain Time (UTC-7)
                              </SelectItem>
                              <SelectItem value="UTC-6">
                                Central Time (UTC-6)
                              </SelectItem>
                              <SelectItem value="UTC-5">
                                Eastern Time (UTC-5)
                              </SelectItem>
                              <SelectItem value="UTC+0">UTC</SelectItem>
                              <SelectItem value="UTC+1">
                                Central European Time (UTC+1)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => handleSaveSettings("general")}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Settings Tab */}
              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Configure how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-notifications">
                              Email Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailNotifications: checked,
                              })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="maintenance-reminders">
                              Maintenance Due Reminders
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified when maintenance tasks are due
                            </p>
                          </div>
                          <Switch
                            id="maintenance-reminders"
                            checked={
                              notificationSettings.maintenanceDueReminders
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                maintenanceDueReminders: checked,
                              })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="equipment-status">
                              Equipment Status Changes
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified when equipment status changes
                            </p>
                          </div>
                          <Switch
                            id="equipment-status"
                            checked={
                              notificationSettings.equipmentStatusChanges
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                equipmentStatusChanges: checked,
                              })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="system-updates">
                              System Updates
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified about system updates and new features
                            </p>
                          </div>
                          <Switch
                            id="system-updates"
                            checked={notificationSettings.systemUpdates}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                systemUpdates: checked,
                              })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="daily-digest">Daily Digest</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive a daily summary of maintenance activities
                            </p>
                          </div>
                          <Switch
                            id="daily-digest"
                            checked={notificationSettings.dailyDigest}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                dailyDigest: checked,
                              })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label htmlFor="reminder-days">
                            Reminder Days in Advance
                          </Label>
                          <Select
                            value={notificationSettings.reminderDays}
                            onValueChange={(value) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                reminderDays: value,
                              })
                            }
                          >
                            <SelectTrigger id="reminder-days">
                              <SelectValue placeholder="Select days" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 day</SelectItem>
                              <SelectItem value="3">3 days</SelectItem>
                              <SelectItem value="5">5 days</SelectItem>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="14">14 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => handleSaveSettings("notifications")}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Profile Tab */}
              <TabsContent value="users" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center relative">
                          <User className="h-12 w-12 text-gray-500" />
                          <div className="absolute bottom-0 right-0">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full bg-white"
                            >
                              <span className="sr-only">Change avatar</span>
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{`${userSettings.firstName} ${userSettings.lastName}`}</h3>
                          <p className="text-gray-500">{userSettings.email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {userSettings.role} • {userSettings.department}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            value={userSettings.firstName}
                            onChange={(e) =>
                              setUserSettings({
                                ...userSettings,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            value={userSettings.lastName}
                            onChange={(e) =>
                              setUserSettings({
                                ...userSettings,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userSettings.email}
                            onChange={(e) =>
                              setUserSettings({
                                ...userSettings,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={userSettings.phone}
                            onChange={(e) =>
                              setUserSettings({
                                ...userSettings,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={userSettings.role}
                            onValueChange={(value) =>
                              setUserSettings({
                                ...userSettings,
                                role: value,
                              })
                            }
                          >
                            <SelectTrigger id="role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                Administrator
                              </SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="technician">
                                Technician
                              </SelectItem>
                              <SelectItem value="user">Regular User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select
                            value={userSettings.department}
                            onValueChange={(value) =>
                              setUserSettings({
                                ...userSettings,
                                department: value,
                              })
                            }
                          >
                            <SelectTrigger id="department">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Maintenance">
                                Maintenance
                              </SelectItem>
                              <SelectItem value="Manufacturing">
                                Manufacturing
                              </SelectItem>
                              <SelectItem value="Logistics">
                                Logistics
                              </SelectItem>
                              <SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="Administration">
                                Administration
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => handleSaveSettings("user")}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings Tab */}
              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and access settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Change Password</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">
                              Current Password
                            </Label>
                            <Input id="current-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">
                              Confirm New Password
                            </Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                        </div>
                        <Button
                          className="mt-2"
                          onClick={() => {
                            console.log("Password update requested");
                            alert("Password updated successfully!");
                          }}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Update Password
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account by
                          enabling two-factor authentication.
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="two-factor">
                              Enable Two-Factor Authentication
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Require a verification code when logging in
                            </p>
                          </div>
                          <Switch
                            id="two-factor"
                            onCheckedChange={(checked) => {
                              console.log(
                                `Two-factor authentication ${checked ? "enabled" : "disabled"}`,
                              );
                              alert(
                                `Two-factor authentication ${checked ? "enabled" : "disabled"} successfully!`,
                              );
                            }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            console.log(
                              "Two-factor authentication setup requested",
                            );
                            alert(
                              "Two-factor authentication setup initiated. Check your email for verification code.",
                            );
                          }}
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Set Up Two-Factor Authentication
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Session Management
                        </h3>
                        <p className="text-sm text-gray-500">
                          Manage your active sessions and sign out from other
                          devices.
                        </p>
                        <div className="rounded-md border p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">Current Session</h4>
                              <p className="text-sm text-gray-500">
                                Windows • Chrome • Last active now
                              </p>
                            </div>
                            <Badge>Current</Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            console.log(
                              "Sign out all other sessions requested",
                            );
                            alert(
                              "All other sessions have been signed out successfully!",
                            );
                          }}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Sign Out All Other Sessions
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">API Access</h3>
                        <p className="text-sm text-gray-500">
                          Manage API keys for integrating with other systems.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            console.log("Manage API keys requested");
                            alert(
                              "API key management interface will be available in the next update.",
                            );
                          }}
                        >
                          <Database className="mr-2 h-4 w-4" />
                          Manage API Keys
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
