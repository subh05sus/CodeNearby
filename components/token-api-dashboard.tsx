"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { toast } from "sonner";
import { UserRecord } from "@/lib/user-tiers";
import type { Session } from "next-auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";

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


  const [activeTab, setActiveTab] = useState("keys");

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white dark:bg-black">
        <div className="text-center p-12 border-8 border-black dark:border-white bg-white dark:bg-black shadow-[16px_16px_0_0_rgba(255,0,0,1)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          <div className="relative z-10 space-y-8">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">
              LOGIN_REQUIRED
            </h1>
            <p className="text-xl font-bold uppercase tracking-tight opacity-60 max-w-md mx-auto text-black dark:text-white">
              ESTABLISH A SECURE UPLINK TO ACCESS THE API CONTROL INTERFACE. TERMINAL ACCESS RESTRICTED.
            </p>
            <SwissButton variant="primary" size="lg" className="h-20 px-12 text-xl" onClick={() => router.push("/auth/signin")}>
              INITIALIZE_UPLINK
            </SwissButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen pb-20 transition-colors duration-300">
      {/* Header */}
      <SwissSection title="API_CONTROL_PROTOCOL" number="01" variant="white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b-8 border-black dark:border-white pb-12 relative">
          <div className="absolute -top-4 -left-4 w-16 h-16 bg-swiss-red -z-10" />
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">
              DASHBOARD_V4.0
            </h1>
            <p className="text-2xl font-bold uppercase tracking-tight opacity-40 italic text-black dark:text-white">
              MANAGE_AUTHENTICATION_KEYS // MONITOR_TELEMETRY
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            <SwissButton variant="secondary" size="lg" className="h-16 px-8 border-4" asChild>
              <Link href="/api-docs">
                <Book className="h-6 w-6 mr-3" />
                TERMINAL_DOCS
              </Link>
            </SwissButton>
            <SwissButton variant="primary" size="lg" className="h-16 px-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]" asChild>
              <Link href="/upgrade">
                <Zap className="h-6 w-6 mr-3" />
                UPGRADE_UPLINK
              </Link>
            </SwissButton>
          </div>
        </div>
      </SwissSection>

      {/* Account Overview Tiles */}
      <SwissSection title="TELEMETRY_STATUS" number="02" variant="white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "TOKEN_BALANCE", value: userTierData?.tokenBalance.total || 0, sub: "AVAILABLE_RESOURCES", color: "swiss-black" },
            { label: "DAILY_LOAD", value: userTierData?.usage.today.tokens || 0, sub: "TELEMETRY_CONSUMED", color: "swiss-black" },
            { label: "PROTOCOL_TIER", value: (userTierData?.tier || "free").toUpperCase(), sub: "SYSTEM_LEVEL", color: "swiss-red" }
          ].map((tile) => (
            <div key={tile.label} className={cn(
              "p-8 border-4 border-black dark:border-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] flex flex-col justify-between aspect-video relative group overflow-hidden bg-white dark:bg-black",
              tile.color === "swiss-red" ? "hover:bg-swiss-red text-black dark:text-white hover:text-white dark:hover:text-black" : "hover:invert"
            )}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <div className="w-12 h-1 bg-current mb-1" />
                <div className="w-8 h-1 bg-current" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.4em] opacity-40 text-black dark:text-white">{tile.label}</span>
              <div>
                <div className="text-6xl font-black uppercase tracking-tighter italic leading-none truncate text-black dark:text-white">
                  {tile.value}
                </div>
                <div className="mt-2 text-[10px] font-black uppercase  italic opacity-60 text-black dark:text-white">{tile.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </SwissSection>

      {/* Main Tabs Interaction */}
      <SwissSection title="SYSTEM_BRANCHES" number="03" variant="white">
        <div className="flex gap-4 mb-12 border-b-4 border-swiss-black/10 overflow-x-auto pb-4 scrollbar-hide">
          {["keys", "usage", "billing"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-3 text-xl font-black uppercase tracking-tighter italic transition-all",
                activeTab === tab
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-[6px_6px_0_0_rgba(255,0,0,1)]"
                  : "bg-white dark:bg-black text-black dark:text-white border-2 border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white"
              )}
            >
              {tab === "keys" ? "AUTH_KEYS" : tab === "usage" ? "LOAD_METRICS" : "RESOURCE_MGMT"}
            </button>
          ))}
        </div>

        {activeTab === "keys" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none underline decoration-8 decoration-swiss-red text-black dark:text-white">
                ACTIVE_CREDENTIALS
              </h2>
              <SwissButton
                variant="primary"
                size="lg"
                className="h-16 px-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                onClick={() => {
                  if (canCreateKey) setShowNewKeyDialog(true);
                  else toast.error(apiKeyLimitInfo?.reason || "LOAD_LIMIT_EXCEEDED");
                }}
                disabled={!canCreateKey}
              >
                <Plus className="h-6 w-6 mr-3" />
                GENERATE_KEY
              </SwissButton>
            </div>

            {!canCreateKey && apiKeyLimitInfo && (
              <div className="bg-swiss-red text-white p-6 border-4 border-black dark:border-white flex items-center gap-6">
                <AlertTriangle className="h-10 w-10 shrink-0" />
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tighter italic">LOAD_LIMIT_EXCEEDED</h4>
                  <p className="font-bold uppercase tracking-tight opacity-80">{apiKeyLimitInfo.reason} {"//"} {apiKeyLimitInfo.current}/{apiKeyLimitInfo.max} ACTIVE</p>
                </div>
              </div>
            )}

            {/* Newly Created Key Display */}
            {newlyCreatedKey && (
              <div className="p-10 border-8 border-black dark:border-white bg-black dark:bg-neutral-900 text-white shadow-[16px_16px_0_0_rgba(255,0,0,1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-swiss-red -rotate-45 translate-x-16 -translate-y-16" />
                <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-swiss-red">
                      <Key className="h-8 w-8" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">CREDENTIAL_SYNTHESIZED</h3>
                  </div>

                  <div className="bg-swiss-white/10 border-4 border-swiss-white/20 p-8 flex flex-col md:flex-row items-center gap-6">
                    <code className="text-2xl font-black  break-all flex-grow">
                      {showKey ? newlyCreatedKey : "•".repeat(32)}
                    </code>
                    <div className="flex gap-4 shrink-0">
                      <SwissButton variant="secondary" size="md" className="bg-white dark:bg-black text-black dark:text-white border-0" onClick={() => copyToClipboard(newlyCreatedKey)}>
                        <Copy className="h-5 w-5 mr-2" /> COPY
                      </SwissButton>
                      <SwissButton variant="secondary" size="md" className="bg-white/20 dark:bg-white/10 border-0" onClick={() => setShowKey(!showKey)}>
                        {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </SwissButton>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-6">
                    <p className="text-sm font-black uppercase  text-swiss-red italic">
                      WARNING: KEY WILL NOT BE SHOWN AGAIN. MINIMIZE EXPOSURE.
                    </p>
                    <button className="text-swiss-white uppercase font-black  italic hover:underline" onClick={() => setNewlyCreatedKey(null)}>
                      DISMISS_LOGS
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Keys List */}
            <div className="grid grid-cols-1 gap-6">
              {loading ? (
                <div className="h-40 flex items-center justify-center border-4 border-dashed border-black/20 dark:border-white/20">
                  <span className="text-xl font-black uppercase tracking-[1em] opacity-20 text-black dark:text-white">PENDING_SYNC...</span>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-24 border-8 border-black dark:border-white border-dashed bg-muted/5 dark:bg-white/5">
                  <Key className="h-20 w-20 mx-auto text-black/10 dark:text-white/10 mb-8" />
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic opacity-20 leading-none text-black dark:text-white">NO_ACTIVE_CREDENTIALS</h3>
                </div>
              ) : (
                apiKeys.map((key) => (
                  <SwissCard key={key.id} className="p-8 border-4 border-black dark:border-white shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] hover:shadow-[8px_8px_0_0_rgba(255,0,0,1)] transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                      <div className="space-y-4 flex-grow">
                        <div className="flex items-center gap-4">
                          <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">{key.name}</h3>
                          <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-[10px] font-black uppercase ">
                            {key.tier}
                          </span>
                        </div>
                        <code className="block text-xl font-bold opacity-40 font-mono tracking-tighter truncate max-w-xl text-black dark:text-white">
                          {key.keyPreview}
                        </code>
                        <div className="flex flex-wrap gap-8 text-[10px] font-black uppercase  opacity-60 italic text-black dark:text-white">
                          <span>CREATED: {new Date(key.createdAt).toLocaleDateString()}</span>
                          {key.lastUsed && <span>LAST_ACCESS: {new Date(key.lastUsed).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <SwissButton
                        variant="secondary"
                        size="md"
                        className="bg-transparent hover:bg-swiss-red border-4 border-black dark:border-white text-black dark:text-white hover:text-white dark:hover:text-black py-4 h-16 w-16"
                        onClick={() => deleteApiKey(key.id)}
                      >
                        <Trash2 className="h-6 w-6" />
                      </SwissButton>
                    </div>
                  </SwissCard>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "usage" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none underline decoration-8 decoration-swiss-red mb-12 text-black dark:text-white">
              TELEMETRY_LOGS
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="p-10 border-8 border-black dark:border-white bg-black dark:bg-neutral-900 text-white space-y-8">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic text-swiss-red border-b-4 border-swiss-red/20 pb-4">REAL_TIME_LOAD</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b-2 border-white/10 pb-4">
                    <span className="text-xs font-black uppercase  opacity-60">TOKENS_CONSUMED</span>
                    <span className="text-4xl font-black italic">{userTierData?.usage.today.tokens || 0}</span>
                  </div>
                  <div className="flex justify-between items-end border-b-2 border-white/10 pb-4">
                    <span className="text-xs font-black uppercase  opacity-60">PROTOCOL_REQUESTS</span>
                    <span className="text-4xl font-black italic">{userTierData?.usage.today.requests || 0}</span>
                  </div>
                </div>
              </div>
              <div className="p-10 border-8 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white space-y-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)] dark:shadow-[16px_16px_0_0_rgba(255,255,255,1)]">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic border-b-4 border-black/10 dark:border-white/10 pb-4">ACCUMULATED_DATA</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b-2 border-black/10 dark:border-white/10 pb-4">
                    <span className="text-xs font-black uppercase  opacity-60">LIFETIME_TOKENS</span>
                    <span className="text-4xl font-black italic">{userTierData?.usage.total.tokens || 0}</span>
                  </div>
                  <div className="flex justify-between items-end border-b-2 border-black/10 dark:border-white/10 pb-4">
                    <span className="text-xs font-black uppercase  opacity-60">LIFETIME_REQUESTS</span>
                    <span className="text-4xl font-black italic">{userTierData?.usage.total.requests || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none underline decoration-8 decoration-swiss-red mb-12 text-black dark:text-white">
              RESOURCES_POOL
            </h2>
            <SwissCard className="p-12 border-8 border-black dark:border-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-swiss-muted/5 -rotate-12 translate-x-20 -translate-y-10 pointer-events-none" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                {[
                  { l: "PLAN_QUOTA", v: userTierData?.tokenBalance.daily || 0 },
                  { l: "PURCHASED_BUFF", v: userTierData?.tokenBalance.purchased || 0 },
                  { l: "TOTAL_ALLOCATION", v: userTierData?.tokenBalance.total || 0, c: "swiss-red" }
                ].map(stat => (
                  <div key={stat.l} className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-black dark:text-white">{stat.l}</p>
                    <p className={cn("text-6xl font-black italic", stat.c === "swiss-red" ? "text-swiss-red" : "text-black dark:text-white")}>{stat.v}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-8 pt-12 border-t-8 border-swiss-black/5">
                <SwissButton variant="primary" size="lg" className="h-20 px-12 text-xl" asChild>
                  <Link href="/upgrade">
                    <Coins className="h-6 w-6 mr-3" /> PURCHASE_TOKENS
                  </Link>
                </SwissButton>
                <SwissButton variant="secondary" size="lg" className="h-20 px-12 text-xl" asChild>
                  <Link href="/upgrade">
                    <Zap className="h-6 w-5 mr-3" /> UPGRADE_SYSTEM_TIER
                  </Link>
                </SwissButton>
              </div>
            </SwissCard>
          </div>
        )}
      </SwissSection>

      {/* New Key Dialog Redesign (Styled Modal) */}
      <AnimatePresence>
        {showNewKeyDialog && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-swiss-black/80">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black border-8 border-black dark:border-white shadow-[24px_24px_0_0_rgba(255,0,0,1)] w-full max-w-2xl p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Book className="h-32 w-32 -rotate-12" />
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">NEW_CREDENTIAL</h3>
                  <p className="text-xl font-bold uppercase tracking-tight opacity-60 text-black dark:text-white">DEFINE IDENTIFIER FOR NEURAL UPLINK.</p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase  text-swiss-red italic">IDENTIFIER_LABEL</label>
                  <input
                    placeholder="E.G. PRODUCTION_NODE_V1"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full h-20 bg-white dark:bg-black border-4 border-black dark:border-white px-8 text-2xl font-black uppercase tracking-tighter italic placeholder:opacity-10 focus:outline-none text-black dark:text-white"
                    autoFocus
                  />
                </div>

                <div className="flex gap-6 pt-4">
                  <SwissButton variant="secondary" size="lg" className="h-20 flex-1 text-xl" onClick={() => setShowNewKeyDialog(false)}>
                    CANCEL_PROTOCOL
                  </SwissButton>
                  <SwissButton variant="primary" size="lg" className="h-20 flex-1 text-xl shadow-[8px_8px_0_0_rgba(0,0,0,1)]" onClick={createApiKey}>
                    GENERATE_UPLINK
                  </SwissButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
