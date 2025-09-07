"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Bell } from "lucide-react";
import { toast } from "sonner";
import {
  requestNotificationPermission,
  storeFCMToken,
  areNotificationsEnabled,
} from "@/lib/push-notifications";

export function NotificationPrompt() {
  const { data: session } = useSession() as { data: Session | null };
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show prompt if user is signed in and notifications aren't enabled
    if (session?.user?.id && "Notification" in window) {
      const hasBeenPrompted = localStorage.getItem("notification-prompted");
      const notificationsEnabled = areNotificationsEnabled();
      
      if (!notificationsEnabled && !hasBeenPrompted) {
        // Show prompt after a short delay
        setTimeout(() => setVisible(true), 3000);
      }
    }
  }, [session]);

  const handleEnableNotifications = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        await storeFCMToken(token, session.user.id);
        toast.success("🔔 Notifications enabled! You'll now receive push notifications for messages and updates.");
        setVisible(false);
        localStorage.setItem("notification-prompted", "true");
      } else {
        toast.error("Failed to enable notifications. Please check your browser settings.");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("notification-prompted", "true");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Stay Connected!
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-auto p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Get instant notifications for new messages, friend requests, and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              size="sm"
              className="flex-1"
            >
              {isLoading ? "Enabling..." : "Enable Notifications"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              size="sm"
            >
              Maybe later
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You can change this later in your profile settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
