"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, BellOff, Smartphone, MessageSquare, Users, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  requestNotificationPermission,
  storeFCMToken,
  areNotificationsEnabled,
  getNotificationSettings,
  saveNotificationSettings,
} from "@/lib/push-notifications";

interface NotificationSettings {
  messages: boolean;
  friendRequests: boolean;
  gatheringMessages: boolean;
  posts: boolean;
  events: boolean;
  pushEnabled: boolean;
}

export function NotificationSettings() {
  const { data: session } = useSession() as { data: Session | null };
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    messages: true,
    friendRequests: true,
    gatheringMessages: true,
    posts: true,
    events: true,
    pushEnabled: false,
  });
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    setPushSupported("Notification" in window && "serviceWorker" in navigator);
    
    // Load settings from localStorage and server
    loadSettings();
  }, [session]);

  const loadSettings = async () => {
    try {
      // Load from localStorage first
      const localSettings = getNotificationSettings();
      if (localSettings) {
        setSettings(prev => ({ ...prev, ...localSettings }));
      }

      // Load from server if authenticated
      if (session) {
        const response = await fetch("/api/notifications/settings");
        if (response.ok) {
          const { settings: serverSettings } = await response.json();
          setSettings(prev => ({ ...prev, ...serverSettings }));
        }
      }

      // Check if push notifications are currently enabled
      const pushEnabled = areNotificationsEnabled();
      setSettings(prev => ({ ...prev, pushEnabled }));
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const handleEnablePushNotifications = async () => {
    if (!pushSupported) {
      toast.error("Push notifications are not supported in this browser");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Please sign in to enable push notifications");
      return;
    }

    setIsLoading(true);
    
    try {
      // Request permission and get token
      const token = await requestNotificationPermission();
      
      if (token) {
        // Store token on server
        await storeFCMToken(token, session.user.id);
        
        // Update settings
        const newSettings = { ...settings, pushEnabled: true };
        setSettings(newSettings);
        saveNotificationSettings(newSettings);
        
        // Save to server
        await fetch("/api/notifications/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSettings),
        });
        
        toast.success("Push notifications enabled successfully!");
      } else {
        toast.error("Failed to enable push notifications. Please check your browser settings.");
      }
    } catch (error) {
      console.error("Error enabling push notifications:", error);
      toast.error("Failed to enable push notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisablePushNotifications = async () => {
    setIsLoading(true);
    
    try {
      // Remove token from server
      await fetch("/api/notifications/token", { method: "DELETE" });
      
      // Update settings
      const newSettings = { ...settings, pushEnabled: false };
      setSettings(newSettings);
      saveNotificationSettings(newSettings);
      
      // Save to server
      if (session) {
        await fetch("/api/notifications/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSettings),
        });
      }
      
      toast.success("Push notifications disabled");
    } catch (error) {
      console.error("Error disabling push notifications:", error);
      toast.error("Failed to disable push notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    
    // Save to server if authenticated
    if (session) {
      try {
        await fetch("/api/notifications/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSettings),
        });
      } catch (error) {
        console.error("Error saving settings to server:", error);
      }
    }
  };

  const settingsItems = [
    {
      key: "messages" as const,
      label: "Direct Messages",
      description: "Get notified when someone sends you a message",
      icon: MessageSquare,
    },
    {
      key: "friendRequests" as const,
      label: "Friend Requests",
      description: "Get notified when someone sends you a friend request",
      icon: Users,
    },
    {
      key: "gatheringMessages" as const,
      label: "Gathering Messages",
      description: "Get notified about new messages in gatherings you've joined",
      icon: MessageSquare,
    },
    {
      key: "posts" as const,
      label: "New Posts",
      description: "Get notified when friends share new posts",
      icon: FileText,
    },
    {
      key: "events" as const,
      label: "Events & Reminders",
      description: "Get notified about upcoming events and reminders",
      icon: Calendar,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications from CodeNearby
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <Label className="text-base font-medium">Push Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive notifications even when CodeNearby is closed
              </p>
            </div>
            {settings.pushEnabled ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisablePushNotifications}
                disabled={isLoading}
              >
                <BellOff className="h-4 w-4 mr-2" />
                Disable
              </Button>
            ) : (
              <Button
                onClick={handleEnablePushNotifications}
                disabled={isLoading || !pushSupported}
                size="sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable
              </Button>
            )}
          </div>
          
          {!pushSupported && (
            <p className="text-xs text-muted-foreground">
              Push notifications are not supported in this browser
            </p>
          )}
          
          {!session && (
            <p className="text-xs text-muted-foreground">
              Sign in to enable push notifications
            </p>
          )}
        </div>

        <Separator />

        {/* Individual Notification Types */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notification Types</h4>
          <div className="space-y-4">
            {settingsItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <Label htmlFor={item.key} className="text-sm font-medium">
                      {item.label}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch
                  id={item.key}
                  checked={settings[item.key]}
                  onCheckedChange={(checked) => handleSettingChange(item.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {settings.pushEnabled && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> You can customize browser notification settings 
              in your browser's settings or by clicking the lock icon in the address bar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
