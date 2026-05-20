"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Loader2,
  CheckCircle2,
  BarChart3,
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
import { motion, AnimatePresence } from "framer-motion";

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  tier: string;
  createdAt: string;
  lastUsed: string | null;
  isActive: boolean;
}

type TabId = "keys" | "usage" | "billing";

export default function TokenAPIPage() {
  const { data: session } = useSession() as { data: Session | null };
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("keys");
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium":
        return "hsl(270 70% 60%)";
      case "free":
      default:
        return "hsl(24 95% 53%)";
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-250px)] gap-6 px-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "hsl(24 95% 53% / 0.10)", border: "1px solid hsl(24 95% 53% / 0.25)" }}
        >
          <Key className="w-7 h-7 text-primary" />
        </div>
        <div className="text-center max-w-xs">
          <h2 className="font-heading text-xl mb-2">API Dashboard</h2>
          <p className="text-sm text-muted-foreground">Sign in to manage your API keys and token usage.</p>
        </div>
        <Button onClick={() => router.push("/auth/signin")} style={{ background: "hsl(24 95% 53%)" }} className="text-white rounded-full px-6">
          Sign In
        </Button>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "keys", label: "API Keys", icon: <Key className="h-3.5 w-3.5" /> },
    { id: "usage", label: "Usage", icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: "billing", label: "Billing", icon: <Coins className="h-3.5 w-3.5" /> },
  ];

  return (
    <TooltipProvider>
      <div className="container mx-auto w-full max-w-5xl px-4 md:px-6 py-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "hsl(24 95% 53% / 0.12)" }}
              >
                <Key className="w-4 h-4 text-primary" />
              </div>
              <h1 className="font-heading text-2xl md:text-3xl">API Dashboard</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-10">Manage your API keys and monitor token usage</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/api-docs">
                <Book className="h-4 w-4 mr-1.5" />
                API Docs
              </Link>
            </Button>
            <Button size="sm" className="rounded-full text-white" style={{ background: "hsl(24 95% 53%)" }} asChild>
              <Link href="/upgrade">
                <Zap className="h-4 w-4 mr-1.5" />
                Upgrade
              </Link>
            </Button>
          </div>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            {
              label: "Total Tokens",
              value: userTierData?.tokenBalance.total || 0,
              icon: <Coins className="h-4 w-4" />,
              tooltip: "Total available tokens across plan + purchases",
            },
            {
              label: "Used Today",
              value: userTierData?.usage.today.tokens || 0,
              icon: <TrendingUp className="h-4 w-4" />,
              tooltip: "Tokens consumed in the last 24 hours",
            },
            {
              label: "Current Plan",
              value: (userTierData?.tier || "free").toUpperCase(),
              icon: <Zap className="h-4 w-4" />,
              tooltip: "Your current subscription tier",
              isText: true,
            },
          ].map((stat, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4 cursor-default">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(24 95% 53% / 0.10)" }}
                  >
                    <span className="text-primary">{stat.icon}</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold font-mono leading-none mb-0.5">
                      {stat.isText ? (
                        <span
                          className="text-sm font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ background: getTierColor(userTierData?.tier || "free") }}
                        >
                          {stat.value}
                        </span>
                      ) : (
                        stat.value.toLocaleString()
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{stat.tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-muted/50 border border-border mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "keys" && (
            <motion.div
              key="keys"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-semibold">Your API Keys</h2>
                <Dialog
                  open={showNewKeyDialog}
                  onOpenChange={(open) => {
                    if (open) {
                      if (canCreateKey) {
                        setShowNewKeyDialog(true);
                      } else {
                        toast.error(apiKeyLimitInfo?.reason || "Cannot create API key");
                      }
                    } else {
                      setShowNewKeyDialog(false);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            disabled={!canCreateKey}
                            className="rounded-full text-white"
                            style={{ background: canCreateKey ? "hsl(24 95% 53%)" : undefined }}
                            onClick={(e) => {
                              if (!canCreateKey) {
                                e.preventDefault();
                                e.stopPropagation();
                                toast.error(apiKeyLimitInfo?.reason || "Cannot create API key");
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Create API Key
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {canCreateKey ? "Create a new API key" : apiKeyLimitInfo?.reason || "Cannot create API key"}
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                      <DialogDescription>
                        Give your API key a descriptive name to help you remember what it&apos;s for.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div>
                        <Label htmlFor="keyName">Key Name</Label>
                        <Input
                          id="keyName"
                          placeholder="e.g., My App Production"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          className="mt-1.5 rounded-xl"
                          onKeyDown={(e) => e.key === "Enter" && createApiKey()}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="rounded-xl" onClick={() => setShowNewKeyDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="rounded-xl text-white"
                        style={{ background: "hsl(24 95% 53%)" }}
                        onClick={createApiKey}
                      >
                        Create API Key
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {!canCreateKey && apiKeyLimitInfo && (
                <Alert className="rounded-2xl border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    {apiKeyLimitInfo.reason} ({apiKeyLimitInfo.current}/{apiKeyLimitInfo.max} keys used)
                  </AlertDescription>
                </Alert>
              )}

              {newlyCreatedKey && (
                <div className="rounded-2xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <p className="font-medium text-green-800 dark:text-green-300 text-sm">
                      API key created! Copy it now — you won&apos;t see it again.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1 min-w-0 overflow-x-auto rounded-xl border border-green-100 dark:border-green-800 bg-white dark:bg-slate-900 px-3 py-2">
                      <code
                        className="block whitespace-nowrap font-mono text-sm text-green-700 dark:text-green-300 select-text"
                        aria-label={showKey ? "API key" : "Hidden API key"}
                      >
                        {showKey ? newlyCreatedKey : "•".repeat(32)}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="rounded-xl text-white"
                        style={{ background: "hsl(24 95% 53%)" }}
                        onClick={() => copyToClipboard(newlyCreatedKey)}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowKey(!showKey)}>
                        {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setNewlyCreatedKey(null)}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "hsl(24 95% 53% / 0.10)" }}
                    >
                      <Key className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">No API keys yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first API key to start using the CodeNearby API.
                    </p>
                    <Button
                      size="sm"
                      className="rounded-full text-white"
                      style={{ background: "hsl(24 95% 53%)" }}
                      onClick={() => {
                        if (canCreateKey) {
                          setShowNewKeyDialog(true);
                        } else {
                          toast.error(apiKeyLimitInfo?.reason || "Cannot create API key");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Create API Key
                    </Button>
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <h3 className="font-medium truncate">{key.name}</h3>
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                              style={{ background: getTierColor(key.tier) }}
                            >
                              {key.tier.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono truncate pl-4">
                            {key.keyPreview}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pl-4 text-xs text-muted-foreground">
                            <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                            {key.lastUsed && (
                              <span>· Last used {new Date(key.lastUsed).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteApiKey(key.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl self-start sm:self-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete API key</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "usage" && (
            <motion.div
              key="usage"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-4"
            >
              <h2 className="font-semibold">Usage Statistics</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Today&apos;s Usage",
                    rows: [
                      { label: "Tokens Used", value: userTierData?.usage.today.tokens || 0 },
                      { label: "API Requests", value: userTierData?.usage.today.requests || 0 },
                    ],
                  },
                  {
                    title: "Total Usage",
                    rows: [
                      { label: "Total Tokens", value: userTierData?.usage.total.tokens || 0 },
                      { label: "Total Requests", value: userTierData?.usage.total.requests || 0 },
                    ],
                  },
                ].map((section, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="font-medium text-sm mb-4 text-muted-foreground uppercase tracking-wide text-xs font-mono">
                      {section.title.replace("&apos;", "'")}
                    </h3>
                    <div className="space-y-3">
                      {section.rows.map((row, j) => (
                        <div key={j} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{row.label}</span>
                          <span className="font-bold font-mono text-lg">{row.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "billing" && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-4"
            >
              <h2 className="font-semibold">Token Balance</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Daily Tokens", value: userTierData?.tokenBalance.daily || 0 },
                  { label: "Purchased", value: userTierData?.tokenBalance.purchased || 0 },
                  { label: "Total Available", value: userTierData?.tokenBalance.total || 0 },
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-4 text-center">
                    <div className="text-2xl font-bold font-mono mb-1">{item.value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground mb-4">
                  Upgrade your plan or purchase additional tokens to increase your API usage limits.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="rounded-full text-white"
                    style={{ background: "hsl(24 95% 53%)" }}
                    asChild
                  >
                    <Link href="/upgrade">
                      <Coins className="h-4 w-4 mr-1.5" />
                      Buy Tokens
                    </Link>
                  </Button>
                  <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/upgrade">
                      <Zap className="h-4 w-4 mr-1.5" />
                      Upgrade Tier
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
