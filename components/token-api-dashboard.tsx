"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  EyeOff,
  Key,
  Trash2,
  Plus,
  Book,
  Coins,
  Zap,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserRecord } from "@/lib/user-tiers";
import { Session } from "next-auth";

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
      const response = await fetch(`/api/v1/users/tier`);

      if (response.ok) {
        const userData = await response.json();
        setUserTierData(userData);

        // Check API key creation permission
        const keyPermission = await checkApiKeyPermission();
        setApiKeyLimitInfo(keyPermission);
        setCanCreateKey(keyPermission.canCreate);
      } else {
        console.error("Failed to fetch user tier data");
      }
    } catch (error) {
      console.error("Error fetching user tier data:", error);
    }
  }, []);

  const checkApiKeyPermission = async () => {
    try {
      const response = await fetch("/api/v1/users/api-key-permission");
      if (response.ok) {
        return await response.json();
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
    // if (!session) {
    //   router.push("/auth/signin");
    //   return;
    // }
    fetchApiKeys();
    fetchUserTierData();
  }, [session, router, fetchUserTierData]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/v1/auth/keys");
      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
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
      const response = await fetch("/api/v1/auth/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newKeyName,
          tier: userTierData?.tier || "free",
        }),
      });

      if (response.ok) {
        const newKey = await response.json();
        setNewlyCreatedKey(newKey.apiKey);
        setNewKeyName("");
        setShowNewKeyDialog(false);
        toast.success("API key created successfully!");
        fetchApiKeys();
        fetchUserTierData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create API key");
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("An error occurred while creating the API key");
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch("/api/v1/auth/keys", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyId }),
      });

      if (response.ok) {
        toast.success("API key deleted successfully");
        fetchApiKeys();
        fetchUserTierData();
      } else {
        toast.error("Failed to delete API key");
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
      case "verified":
        return "bg-blue-500";
      case "premium":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your API keys and monitor token usage
          </p>
        </div>
        <Button
          onClick={() => router.push("/upgrade")}
          className="flex items-center gap-2"
        >
          <Coins className="h-4 w-4" />
          Buy Tokens
        </Button>
      </div>

      <div className="grid gap-6 mb-8">
        {/* Token Balance Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Token Balance
              </CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userTierData?.tokenBalance?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {userTierData?.tokenBalance?.purchased || 0} purchased +{" "}
                {userTierData?.tokenBalance?.daily || 0} daily free
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Account Tier
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge
                  className={getTierBadgeColor(userTierData?.tier || "free")}
                >
                  {userTierData?.tier?.toUpperCase() || "FREE"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userTierData?.limits?.dailyFreeTokens || 0} free tokens daily
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userTierData?.usage?.daily?.tokensUsed || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {userTierData?.usage?.daily?.requests || 0} API requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Low Token Warning */}
        {userTierData?.tokenBalance?.total &&
          userTierData.tokenBalance.total < 100 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your token balance is low ({userTierData.tokenBalance.total}{" "}
                tokens remaining). Consider{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push("/upgrade")}
                >
                  purchasing more tokens
                </Button>{" "}
                to continue using the API.
              </AlertDescription>
            </Alert>
          )}
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Create and manage your API keys for authentication
                  </CardDescription>
                </div>
                <Dialog
                  open={showNewKeyDialog}
                  onOpenChange={setShowNewKeyDialog}
                >
                  <DialogTrigger asChild>
                    <Button disabled={!canCreateKey}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                      <DialogDescription>
                        Give your API key a descriptive name to help you
                        identify it later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="keyName">API Key Name</Label>
                        <Input
                          id="keyName"
                          placeholder="e.g., Production API, Development, Mobile App"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowNewKeyDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={createApiKey}>Create Key</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* New API Key Display */}
              {newlyCreatedKey && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-green-800 dark:text-green-200">
                      API Key Created!
                    </CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-300">
                      Make sure to copy your API key now. You won&apos;t be able
                      to see it again.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-white border rounded dark:bg-zinc-800">
                      <code className="flex-1 font-mono text-sm">
                        {showKey
                          ? newlyCreatedKey
                          : "••••••••••••••••••••••••••••••••"}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(newlyCreatedKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setNewlyCreatedKey(null)}
                    >
                      I&apos;ve saved my key
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!canCreateKey && apiKeyLimitInfo && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {apiKeyLimitInfo.reason} ({apiKeyLimitInfo.current}/
                    {apiKeyLimitInfo.max} used)
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading API keys...</div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    No API keys found. Create your first key to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{key.name}</h3>
                          <Badge
                            variant="secondary"
                            className={getTierBadgeColor(key.tier)}
                          >
                            {key.tier.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {key.keyPreview} • Created{" "}
                          {new Date(key.createdAt).toLocaleDateString()}
                          {key.lastUsed && (
                            <>
                              {" "}
                              • Last used{" "}
                              {new Date(key.lastUsed).toLocaleDateString()}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(key.keyPreview)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteApiKey(key.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Usage Statistics</CardTitle>
              <CardDescription>
                Monitor your token consumption and API usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Today&apos;s Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tokens used:</span>
                      <span>{userTierData?.usage?.daily?.tokensUsed || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>API requests:</span>
                      <span>{userTierData?.usage?.daily?.requests || 0}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">This Month</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tokens used:</span>
                      <span>
                        {userTierData?.usage?.monthly?.tokensUsed || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tokens purchased:</span>
                      <span>
                        {userTierData?.usage?.monthly?.tokensPurchased || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Lifetime Statistics</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">
                      {userTierData?.usage?.lifetime?.tokensUsed?.toLocaleString() ||
                        0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tokens Used
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">
                      {userTierData?.usage?.lifetime?.requests?.toLocaleString() ||
                        0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      API Requests
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">
                      {userTierData?.usage?.lifetime?.tokensPurchased?.toLocaleString() ||
                        0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tokens Purchased
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                API Documentation
              </CardTitle>
              <CardDescription>
                Learn how to integrate with the CodeNearby API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => window.open("/api-docs", "_blank")}
                >
                  <div className="text-left">
                    <div className="font-medium">Full API Documentation</div>
                    <div className="text-sm text-muted-foreground">
                      Complete reference with examples
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => window.open("/api-docs#quickstart", "_blank")}
                >
                  <div className="text-left">
                    <div className="font-medium">Quick Start Guide</div>
                    <div className="text-sm text-muted-foreground">
                      Get up and running in minutes
                    </div>
                  </div>
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Token Consumption</h4>
                <div className="space-y-1 text-sm">
                  <div>• Developer Search: ~100-800 tokens per request</div>
                  <div>• Repository Search: ~150-1200 tokens per request</div>
                  <div>• Profile Analysis: ~300-2000 tokens per request</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
