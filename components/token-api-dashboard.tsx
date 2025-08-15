"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Copy,
  Coins,
  Zap,
  AlertTriangle,
  Key,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Book,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { UserRecord } from "@/lib/user-tiers";
import type { Session } from "next-auth";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  tier: string;
  createdAt: string;
  lastUsed: string | null;
  isActive: boolean;
}

export default function TokenAPIPage() {
  const { data: session } = useSession() as { data: Session | null };
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Token-related state
  const [userTierData, setUserTierData] = useState<UserRecord | null>(null);
  const [canCreateKey, setCanCreateKey] = useState(true);
  const [apiKeyLimitInfo, setApiKeyLimitInfo] = useState<{
    canCreate: boolean;
    reason?: string;
    current: number;
    max: number | string;
  } | null>(null);

  const fetchUserTierData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/v1/user/tokens`);

      if (response.ok) {
        const userData = await response.json();
        setUserTierData(userData);

        // Check API key creation permission
        const keyPermission = await checkApiKeyPermission();
        setApiKeyLimitInfo(keyPermission);
        console.log(
          "User tier data fetched successfully:",
          keyPermission,
          userData
        );
        setCanCreateKey(keyPermission.canCreate);
      } else {
        console.error("Failed to fetch user tier data");
      }
    } catch (error) {
      console.error("Error fetching user tier data:", error);
    }
  }, [session?.user?.id]);

  const checkApiKeyPermission = async () => {
    try {
      const response = await fetch("/api/v1/auth/api-key");
      if (response.ok) {
        const data = await response.json();
        return {
          canCreate: data.canCreate,
          reason: data.reason,
          current: data.current,
          max: data.max,
        };
      }
    } catch (error) {
      console.error("Error checking API key permission:", error);
    }

    return {
      canCreate: false,
      reason: "Error checking permissions",
      current: 0,
      max: 0,
    };
  };

  useEffect(() => {
    fetchApiKeys();
    fetchUserTierData();
  }, [session, router, fetchUserTierData]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/v1/auth/api-key");
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      } else {
        console.error("Failed to fetch API keys");
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key");
      return;
    }

    // Check tier permissions before creating
    if (!apiKeyLimitInfo?.canCreate) {
      toast.error(apiKeyLimitInfo?.reason || "Cannot create API key");
      return;
    }

    try {
      const response = await fetch("/api/v1/auth/api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewlyCreatedKey(data.apiKey);
        setNewKeyName("");
        setShowNewKeyDialog(false);
        fetchApiKeys();
        fetchUserTierData();
        toast.success("API key created successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create API key");
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("An error occurred while creating the API key");
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch("/api/v1/auth/api-key", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyId }),
      });

      if (response.ok) {
        fetchApiKeys();
        fetchUserTierData();
        toast.success("API key deleted successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete API key");
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("An error occurred while deleting the API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-gray-500";
      case "premium":
        return "bg-purple-500";
      default:
        return "bg-blue-500";
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to access the API dashboard.
          </p>
          <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto w-full max-w-6xl px-4 md:px-6 py-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">API Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your API keys and monitor token usage
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" asChild>
                  <Link href="/api-docs">
                    <Book className="h-4 w-4 mr-2" />
                    <span>API Docs</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open API Docs</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild>
                  <Link href="/upgrade">
                    <Zap className="h-4 w-4 mr-2" />
                    <span>Upgrade</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upgrade your plan</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* User Tier Overview */}
        <div className="grid gap-6 mb-8">
          <Card className="shadow-sm border-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center rounded-lg border border-muted/40 p-4 bg-muted/30">
                      <div className="text-3xl font-bold tracking-tight">
                        {userTierData?.tokenBalance.total || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total Tokens
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Total available tokens across plan + purchases
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center rounded-lg border border-muted/40 p-4 bg-muted/30">
                      <div className="text-3xl font-bold tracking-tight">
                        {userTierData?.usage.today.tokens || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Used Today
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Tokens consumed in the last 24 hours
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center rounded-lg border border-muted/40 p-4 bg-muted/30">
                      <Badge
                        className={getTierBadgeColor(
                          userTierData?.tier || "free"
                        )}
                      >
                        {(userTierData?.tier || "free").toUpperCase()} TIER
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current Plan
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Your current subscription tier
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList>
            <TabsTrigger className="flex-shrink-0 min-w-[120px]" value="keys">
              API Keys
            </TabsTrigger>
            <TabsTrigger className="flex-shrink-0 min-w-[140px]" value="usage">
              Usage
            </TabsTrigger>
            <TabsTrigger
              className="flex-shrink-0 min-w-[100px]"
              value="billing"
            >
              Billing
            </TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Your API Keys</h2>
              <Dialog
                open={showNewKeyDialog}
                onOpenChange={setShowNewKeyDialog}
              >
                <DialogTrigger asChild>
                  <span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button disabled={!canCreateKey}>
                          <Plus className="h-4 w-4 mr-2" />
                          <span>Create API Key</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {canCreateKey
                          ? "Create a new API key"
                          : apiKeyLimitInfo?.reason || "Cannot create API key"}
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Give your API key a descriptive name to help you remember
                      what it&apos;s for.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., My App Production"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewKeyDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createApiKey}>Create API Key</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {!canCreateKey && apiKeyLimitInfo && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {apiKeyLimitInfo.reason} ({apiKeyLimitInfo.current}/
                  {apiKeyLimitInfo.max} keys used)
                </AlertDescription>
              </Alert>
            )}

            {/* Newly Created Key */}
            {newlyCreatedKey && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
                <Key className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium text-green-800 dark:text-green-300">
                      Your new API key has been created!
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="max-w-full overflow-x-auto rounded border border-green-100 dark:border-green-800 bg-white dark:bg-slate-900 px-2 py-1">
                          <code
                            className="block whitespace-nowrap font-mono text-sm text-green-700 dark:text-green-300 select-text"
                            aria-label={showKey ? "API key" : "Hidden API key"}
                          >
                            {showKey ? newlyCreatedKey : "•".repeat(32)}
                          </code>
                        </div>
                      </div>
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => copyToClipboard(newlyCreatedKey)}
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" /> Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" /> Reveal
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewlyCreatedKey(null)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Make sure to copy this key now. You won&apos;t be able to
                      see it again!
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {loading ? (
                <p>Loading API keys...</p>
              ) : apiKeys.length === 0 ? (
                <Card className="shadow-sm">
                  <CardContent className="text-center py-8 space-y-4">
                    <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No API keys yet
                    </h3>
                    <p className="text-muted-foreground">
                      Create your first API key to start using the CodeNearby
                      API.
                    </p>
                    <div>
                      <Button onClick={() => setShowNewKeyDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Create API Key
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                apiKeys.map((key) => (
                  <Card key={key.id} className="shadow-sm border-muted/40">
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-medium truncate">{key.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono truncate">
                            {key.keyPreview}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {key.tier}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Created{" "}
                              {new Date(key.createdAt).toLocaleDateString()}
                            </span>
                            {key.lastUsed && (
                              <span className="text-xs text-muted-foreground">
                                Last used{" "}
                                {new Date(key.lastUsed).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteApiKey(key.id)}
                              className="text-red-600 hover:text-red-700 self-start sm:self-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete API key</TooltipContent>
                        </Tooltip>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Usage Analytics Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card className="shadow-sm border-muted/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Today&apos;s Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tokens Used:</span>
                        <span className="font-medium">
                          {userTierData?.usage.today.tokens || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Requests:</span>
                        <span className="font-medium">
                          {userTierData?.usage.today.requests || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-4">Total Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Tokens:</span>
                        <span className="font-medium">
                          {userTierData?.usage.total.tokens || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Requests:</span>
                        <span className="font-medium">
                          {userTierData?.usage.total.requests || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="shadow-sm border-muted/40">
              <CardHeader>
                <CardTitle>Token Balance</CardTitle>
                <CardDescription>
                  Manage your token balance and purchase more tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {userTierData?.tokenBalance.daily || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Daily Tokens
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {userTierData?.tokenBalance.purchased || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Purchased Tokens
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {userTierData?.tokenBalance.total || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Available
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild>
                        <Link href="/upgrade">
                          <Coins className="h-4 w-4 mr-2" />
                          <span>Buy Tokens</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Purchase additional tokens</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" asChild>
                        <Link href="/upgrade">
                          <Zap className="h-4 w-4 mr-2" />
                          <span>Upgrade Tier</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upgrade subscription tier</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
