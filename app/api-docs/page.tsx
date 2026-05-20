"use client";

import { useState, useEffect } from "react";
import { API_TOKEN_COSTS } from "@/consts/pricing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Play, Code, Book, Zap, Key, AlertCircle, ChevronRight, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://codenearby.space"
    : "http://localhost:3069";

function tokenCostLabel(endpoint: string) {
  const cost = API_TOKEN_COSTS[endpoint as keyof typeof API_TOKEN_COSTS];
  if (cost) return `${cost.min}-${cost.max}`;
  if (endpoint === "/api/v1/pricing") return "0";
  return "varies";
}

const API_ENDPOINTS = [
  {
    id: "developers",
    name: "AI-Powered Developer Search",
    method: "POST",
    endpoint: "/api/v1/developers",
    description: "Find developers using natural language queries powered by AI",
    tokenCost: tokenCostLabel("/api/v1/developers"),
    parameters: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Natural language query to search for developers",
        example: "Find React developers in San Francisco with 5+ years experience",
      },
      {
        name: "location",
        type: "string",
        required: false,
        description: "Location filter (city, country, etc.)",
        example: "San Francisco, CA",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Maximum number of results (default: 10, max: 50)",
        example: 10,
      },
    ],
    example: {
      request: {
        query: "Find Python developers interested in machine learning",
        location: "Remote",
        limit: 5,
      },
      response: {
        success: true,
        tokensUsed: 847,
        data: {
          developers: [
            {
              id: "dev_123",
              githubUsername: "john_doe",
              name: "John Doe",
              bio: "ML Engineer passionate about AI",
              location: "San Francisco, CA",
              skills: ["Python", "TensorFlow", "Machine Learning"],
              repositories: 42,
              followers: 1200,
              profileUrl: "https://github.com/john_doe",
            },
          ],
          total: 5,
          query: "Find Python developers interested in machine learning",
        },
      },
    },
  },
  {
    id: "profile-analyze",
    name: "GitHub Profile Analysis",
    method: "POST",
    endpoint: "/api/v1/profile/analyze",
    description: "Get AI-powered analysis of GitHub developer profiles",
    tokenCost: tokenCostLabel("/api/v1/profile/analyze"),
    parameters: [
      {
        name: "username",
        type: "string",
        required: true,
        description: "GitHub username to analyze",
        example: "octocat",
      },
    ],
    example: {
      request: { username: "octocat" },
      response: {
        success: true,
        tokensUsed: 456,
        data: {
          profile: {
            username: "octocat",
            name: "The Octocat",
            bio: "GitHub's mascot",
            location: "San Francisco",
            company: "GitHub",
            publicRepos: 8,
            followers: 9000,
            following: 9,
          },
          analysis: {
            expertise: ["JavaScript", "Ruby", "Git"],
            strengths: "Strong open source contributor with focus on developer tools",
            experience: "5+ years",
            collaboration: "Excellent",
          },
        },
      },
    },
  },
  {
    id: "repositories",
    name: "Repository Search",
    method: "POST",
    endpoint: "/api/v1/repositories",
    description: "Find GitHub repositories using natural language queries",
    tokenCost: tokenCostLabel("/api/v1/repositories"),
    parameters: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Natural language query to search for repositories",
        example: "React component libraries for building dashboards",
      },
      {
        name: "language",
        type: "string",
        required: false,
        description: "Programming language filter",
        example: "JavaScript",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Maximum number of results (default: 10, max: 50)",
        example: 10,
      },
    ],
    example: {
      request: { query: "React component libraries for dashboards", language: "JavaScript", limit: 3 },
      response: {
        success: true,
        tokensUsed: 312,
        data: {
          repositories: [
            {
              id: "repo_123",
              name: "react-dashboard-kit",
              fullName: "user/react-dashboard-kit",
              description: "Modern React dashboard components",
              language: "JavaScript",
              stars: 1200,
              forks: 89,
              url: "https://github.com/user/react-dashboard-kit",
            },
          ],
          total: 3,
          query: "React component libraries for dashboards",
        },
      },
    },
  },
  {
    id: "pricing",
    name: "Pricing Information",
    method: "GET",
    endpoint: "/api/v1/pricing",
    description: "Get current pricing tiers and token costs",
    tokenCost: tokenCostLabel("/api/v1/pricing"),
    parameters: [],
    example: {
      request: {},
      response: {
        success: true,
        data: {
          tiers: [
            { name: "Free", dailyTokens: 1000, maxApiKeys: 1 },
            { name: "Premium", dailyTokens: 2000, maxApiKeys: 10, price: "$9.99/month" },
          ],
          tokenPackages: [
            { id: "basic", name: "Basic", tokens: 5000, price: { usd: 5, inr: 400 } },
          ],
        },
      },
    },
  },
];

const CODE_TEMPLATES = {
  curl: (endpoint: any, apiKey: string, params: any) => {
    if (endpoint.method === "GET") {
      return `curl -X GET "${API_BASE_URL}${endpoint.endpoint}" \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json"`;
    } else {
      return `curl -X ${endpoint.method} "${API_BASE_URL}${endpoint.endpoint}" \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(params, null, 2)}'`;
    }
  },
  javascript: (endpoint: any, apiKey: string, params: any) => {
    if (endpoint.method === "GET") {
      return `const response = await fetch('${API_BASE_URL}${endpoint.endpoint}', {
  method: 'GET',
  headers: {
    'x-api-key': '${apiKey}',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;
    } else {
      return `const response = await fetch('${API_BASE_URL}${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'x-api-key': '${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${JSON.stringify(params, null, 2)})
});

const data = await response.json();
console.log(data);`;
    }
  },
  python: (endpoint: any, apiKey: string, params: any) => {
    if (endpoint.method === "GET") {
      return `import requests

url = "${API_BASE_URL}${endpoint.endpoint}"
headers = {
    "x-api-key": "${apiKey}",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
data = response.json()
print(data)`;
    } else {
      return `import requests
import json

url = "${API_BASE_URL}${endpoint.endpoint}"
headers = {
    "x-api-key": "${apiKey}",
    "Content-Type": "application/json"
}
data = ${JSON.stringify(params, null, 2)}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers, json=data)
result = response.json()
print(result)`;
    }
  },
  node: (endpoint: any, apiKey: string, params: any) => {
    if (endpoint.method === "GET") {
      return `const axios = require('axios');

const config = {
  method: 'get',
  url: '${API_BASE_URL}${endpoint.endpoint}',
  headers: {
    'x-api-key': '${apiKey}',
    'Content-Type': 'application/json'
  }
};

axios(config)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;
    } else {
      return `const axios = require('axios');

const config = {
  method: '${endpoint.method.toLowerCase()}',
  url: '${API_BASE_URL}${endpoint.endpoint}',
  headers: {
    'x-api-key': '${apiKey}',
    'Content-Type': 'application/json'
  },
  data: ${JSON.stringify(params, null, 2)}
};

axios(config)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;
    }
  },
};

type DocsTab = "playground" | "examples";

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0]);
  const [apiKey, setApiKey] = useState("");
  const [playgroundParams, setPlaygroundParams] = useState<Record<string, any>>(
    selectedEndpoint.example.request
  );
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("curl");
  const [activeTab, setActiveTab] = useState<DocsTab>("playground");

  useEffect(() => {
    setPlaygroundParams(selectedEndpoint.example.request);
    setPlaygroundResponse(null);
  }, [selectedEndpoint]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handlePlaygroundTest = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${selectedEndpoint.endpoint}`, {
        method: selectedEndpoint.method,
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: selectedEndpoint.method !== "GET" ? JSON.stringify(playgroundParams) : undefined,
      });

      const data = await response.json();
      setPlaygroundResponse({ status: response.status, data });
    } catch {
      setPlaygroundResponse({
        status: 500,
        data: { error: "Network error or invalid response" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCodeSnippet = () => {
    const template = CODE_TEMPLATES[selectedLanguage as keyof typeof CODE_TEMPLATES];
    return template(selectedEndpoint, apiKey || "your-api-key-here", playgroundParams);
  };

  const methodColor = (method: string) =>
    method === "GET"
      ? "hsl(142 70% 45%)"
      : "hsl(24 95% 53%)";

  const errorCodes = [
    { code: "401", desc: "Invalid or missing API key" },
    { code: "402", desc: "Insufficient tokens" },
    { code: "429", desc: "Rate limit exceeded" },
    { code: "400", desc: "Invalid request parameters" },
  ];

  return (
    <TooltipProvider>
      <div className="container mx-auto w-full max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "hsl(24 95% 53% / 0.12)" }}
              >
                <Book className="w-4 h-4 text-primary" />
              </div>
              <h1 className="font-heading text-2xl md:text-3xl">API Documentation</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              AI-powered developer search and GitHub integration API
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/api-dashboard">
                <Key className="h-4 w-4 mr-1.5" />
                Dashboard
              </Link>
            </Button>
            <Button size="sm" className="rounded-full text-white" style={{ background: "hsl(24 95% 53%)" }} asChild>
              <Link href="/upgrade">
                <Zap className="h-4 w-4 mr-1.5" />
                Get API Tokens
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Start */}
        <div className="rounded-2xl border border-border bg-card p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Quick Start</h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>
              <Link href="/api-dashboard" className="text-primary hover:underline font-medium">
                Create an API key
              </Link>{" "}
              in your dashboard
            </li>
            <li>
              Include your API key in the{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded-lg text-xs font-mono">x-api-key</code>{" "}
              header
            </li>
            <li>
              Make requests to{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded-lg text-xs font-mono">
                {API_BASE_URL}/api/v1/*
              </code>
            </li>
            <li>Monitor your token usage in the dashboard</li>
          </ol>
          <div className="inline-flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <span className="text-xs text-muted-foreground">Base URL:</span>
            <code className="text-xs font-mono">{API_BASE_URL}/api/v1</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-lg"
              onClick={() => copyToClipboard(`${API_BASE_URL}/api/v1`)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-sm">API Endpoints</h2>
              </div>
              <div className="divide-y divide-border/50">
                {API_ENDPOINTS.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center justify-between gap-2 ${
                      selectedEndpoint.id === endpoint.id ? "bg-muted/70" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono text-white flex-shrink-0"
                          style={{ background: methodColor(endpoint.method) }}
                        >
                          {endpoint.method}
                        </span>
                        <span className="font-medium text-xs truncate">{endpoint.name}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {endpoint.tokenCost} tokens
                      </p>
                    </div>
                    {selectedEndpoint.id === endpoint.id && (
                      <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Endpoint detail */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded font-mono text-white"
                  style={{ background: methodColor(selectedEndpoint.method) }}
                >
                  {selectedEndpoint.method}
                </span>
                <code className="text-sm bg-muted px-2 py-1 rounded-lg font-mono">
                  {selectedEndpoint.endpoint}
                </code>
              </div>
              <h2 className="font-heading text-xl mb-1">{selectedEndpoint.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{selectedEndpoint.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Token Cost:</span>
                <span
                  className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "hsl(24 95% 53% / 0.12)", color: "hsl(24 95% 53%)" }}
                >
                  {selectedEndpoint.tokenCost}
                </span>
              </div>

              {selectedEndpoint.parameters.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Parameters</h3>
                  <div className="space-y-2">
                    {selectedEndpoint.parameters.map((param) => (
                      <div key={param.name} className="rounded-xl border border-border p-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <code className="font-mono text-sm font-semibold">{param.name}</code>
                          <Badge
                            variant={param.required ? "destructive" : "secondary"}
                            className="text-[10px] h-4"
                          >
                            {param.required ? "Required" : "Optional"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] h-4 font-mono">
                            {param.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{param.description}</p>
                        <code className="text-[11px] bg-muted px-2 py-0.5 rounded-lg font-mono">
                          Example: {JSON.stringify(param.example)}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl bg-muted/50 border border-border w-fit">
              {(["playground", "examples"] as DocsTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "playground" ? "API Playground" : "Code Examples"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "playground" && (
                <motion.div
                  key="playground"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-2xl border border-border bg-card p-5 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Try it out</h3>
                  </div>

                  <div>
                    <Label htmlFor="apiKey" className="text-xs mb-1.5">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="rounded-xl font-mono text-sm"
                    />
                  </div>

                  {selectedEndpoint.parameters.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs">Parameters</Label>
                      {selectedEndpoint.parameters.map((param) => (
                        <div key={param.name}>
                          <Label htmlFor={param.name} className="text-xs text-muted-foreground">
                            {param.name}{param.required && <span className="text-red-500 ml-0.5">*</span>}
                          </Label>
                          <Input
                            id={param.name}
                            placeholder={`Enter ${param.name}`}
                            value={playgroundParams[param.name] || ""}
                            onChange={(e) =>
                              setPlaygroundParams((prev) => ({ ...prev, [param.name]: e.target.value }))
                            }
                            className="mt-1 rounded-xl text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handlePlaygroundTest}
                    disabled={isLoading}
                    className="w-full rounded-xl text-white"
                    style={{ background: "hsl(24 95% 53%)" }}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Play className="h-3.5 w-3.5" />
                        Send Request
                      </span>
                    )}
                  </Button>

                  {playgroundResponse && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Response</Label>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            playgroundResponse.status >= 200 && playgroundResponse.status < 300
                              ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                          }`}
                        >
                          {playgroundResponse.status}
                        </span>
                      </div>
                      <div className="relative overflow-x-auto rounded-xl border border-border">
                        <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: "0.75rem" }}>
                          {JSON.stringify(playgroundResponse, null, 2)}
                        </SyntaxHighlighter>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-7 rounded-lg bg-black/30 text-white hover:bg-black/50"
                          onClick={() => copyToClipboard(JSON.stringify(playgroundResponse, null, 2))}
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "examples" && (
                <motion.div
                  key="examples"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-2xl border border-border bg-card p-5 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Code Examples</h3>
                  </div>

                  <div>
                    <Label className="text-xs mb-1.5">Language</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-44 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="curl">cURL</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="node">Node.js</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative overflow-x-auto rounded-xl border border-border lg:w-auto w-[calc(100vw-4rem)]">
                    <SyntaxHighlighter
                      language={selectedLanguage === "curl" ? "bash" : selectedLanguage}
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, borderRadius: "0.75rem" }}
                    >
                      {generateCodeSnippet()}
                    </SyntaxHighlighter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-7 rounded-lg bg-black/30 text-white hover:bg-black/50"
                      onClick={() => copyToClipboard(generateCodeSnippet())}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs mb-2">Example Response</Label>
                    <div className="relative overflow-x-auto rounded-xl border border-border lg:w-auto w-[calc(100vw-4rem)]">
                      <SyntaxHighlighter
                        language="json"
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, borderRadius: "0.75rem" }}
                      >
                        {JSON.stringify(selectedEndpoint.example.response, null, 2)}
                      </SyntaxHighlighter>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-7 rounded-lg bg-black/30 text-white hover:bg-black/50"
                        onClick={() => copyToClipboard(JSON.stringify(selectedEndpoint.example.response, null, 2))}
                      >
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth & Error codes */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Authentication</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Include your API key in the request header:
                </p>
                <div className="flex items-center justify-between bg-muted rounded-xl px-3 py-2 mb-3">
                  <code className="text-xs font-mono">x-api-key: your-api-key</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-lg ml-2"
                    onClick={() => copyToClipboard("x-api-key: your-api-key")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Keep your API key secure. Never expose it in client-side code.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold mb-3">Common Error Codes</h3>
                <div className="space-y-2.5">
                  {errorCodes.map(({ code, desc }) => (
                    <div key={code} className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 w-10 text-center">
                        {code}
                      </span>
                      <span className="text-xs text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
