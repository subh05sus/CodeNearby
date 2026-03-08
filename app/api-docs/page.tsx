"use client";

import { useState, useEffect } from "react";
import { API_TOKEN_COSTS } from "@/consts/pricing";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Book, Key, AlertCircle, ChevronRight, Loader2, Zap } from "lucide-react";
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
import { cn } from "@/lib/utils";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://codenearby.space"
    : "http://localhost:3001";

function tokenCostLabel(endpoint: string) {
  const cost = API_TOKEN_COSTS[endpoint as keyof typeof API_TOKEN_COSTS];
  if (cost) return `${cost.min}-${cost.max}`;
  if (endpoint === "/api/v1/pricing") return "0";
  return "VARIES";
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
        example:
          "Find React developers in San Francisco with 5+ years experience",
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
      request: {
        username: "octocat",
      },
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
            strengths:
              "Strong open source contributor with focus on developer tools",
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
      request: {
        query: "React component libraries for dashboards",
        language: "JavaScript",
        limit: 3,
      },
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
            {
              name: "Free",
              dailyTokens: 1000,
              maxApiKeys: 1,
            },
            {
              name: "Premium",
              dailyTokens: 2000,
              maxApiKeys: 10,
              price: "$9.99/month",
            },
          ],
          tokenPackages: [
            {
              id: "basic",
              name: "Basic",
              tokens: 5000,
              price: { usd: 5, inr: 400 },
            },
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
      return `curl -X ${endpoint.method} "${API_BASE_URL}${endpoint.endpoint
        }" \\
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
      return `const response = await fetch('${API_BASE_URL}${endpoint.endpoint
        }', {
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
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });`;
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
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });`;
    }
  },
};

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0]);
  const [apiKey, setApiKey] = useState("");
  const [playgroundParams, setPlaygroundParams] = useState<Record<string, any>>(
    selectedEndpoint.example.request
  );
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("curl");

  useEffect(() => {
    setPlaygroundParams(selectedEndpoint.example.request);
    setPlaygroundResponse(null);
  }, [selectedEndpoint]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("COPIED_TO_CLIPBOARD");
  };

  const handlePlaygroundTest = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}${selectedEndpoint.endpoint}`,
        {
          method: selectedEndpoint.method,
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body:
            selectedEndpoint.method !== "GET"
              ? JSON.stringify(playgroundParams)
              : undefined,
        }
      );

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
    const template =
      CODE_TEMPLATES[selectedLanguage as keyof typeof CODE_TEMPLATES];
    return template(
      selectedEndpoint,
      apiKey || "your-api-key-here",
      playgroundParams
    );
  };

  return (
    <TooltipProvider>
      <div className="w-full">
        {/* Header Section */}
        <SwissSection variant="white" className="border-b-8 border-swiss-black py-20">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-none">
                API_<span className="text-swiss-red">DOCS</span>
              </h1>
              <p className="text-xl font-bold uppercase tracking-tight opacity-40 italic">
                AI_POWERED_INTEGRATION_NETWORKS // NEURAL_RESOURCES
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <SwissButton variant="secondary" asChild className="h-16 px-8">
                <Link href="/api-dashboard">
                  <Key className="h-6 w-6 mr-3" />
                  DASHBOARD
                </Link>
              </SwissButton>
              <SwissButton variant="primary" asChild className="h-16 px-8">
                <Link href="/upgrade">
                  <Zap className="h-6 w-6 mr-3 text-swiss-white fill-swiss-white" />
                  GET_TOKENS
                </Link>
              </SwissButton>
            </div>
          </div>
        </SwissSection>

        {/* Quick Start Bar */}
        <div className="bg-swiss-black text-swiss-white py-6 overflow-hidden border-b-8 border-swiss-black">
          <div className="container mx-auto px-4 flex items-center gap-8 whitespace-nowrap">
            <span className="text-swiss-red font-black uppercase italic tracking-widest text-sm">QUICK_START:</span>
            <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] opacity-80 italic animate-marquee">
              <span>1. GENERATE_KEY</span>
              <span>2. DEFINE_X-API-KEY</span>
              <span>3. REQUEST_TO_{API_BASE_URL}/API/V1/*</span>
              <span>4. MONITOR_THROUGHPUT</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-swiss-black/40 border-l-4 border-swiss-red pl-4">ENDPOINTS_LIBRARY</h3>
                <div className="space-y-4">
                  {API_ENDPOINTS.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      onClick={() => setSelectedEndpoint(endpoint)}
                      className={cn(
                        "w-full text-left p-6 border-4 transition-all flex flex-col gap-2 group",
                        selectedEndpoint.id === endpoint.id
                          ? "bg-swiss-black text-swiss-white border-swiss-black shadow-[8px_8px_0_0_rgba(255,0,0,1)]"
                          : "bg-swiss-white text-swiss-black border-swiss-black hover:bg-swiss-muted"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[10px] font-black px-2 py-0.5 border-2",
                          selectedEndpoint.id === endpoint.id ? "border-swiss-white" : "border-swiss-black"
                        )}>
                          {endpoint.method}
                        </span>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-transform group-hover:translate-x-1",
                          selectedEndpoint.id === endpoint.id ? "text-swiss-red" : "opacity-20"
                        )} />
                      </div>
                      <span className="font-black uppercase tracking-tighter italic text-sm">{endpoint.name}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{endpoint.tokenCost}_TOKENS</span>
                    </button>
                  ))}
                </div>
              </div>

              <SwissCard className="p-6 border-4 border-swiss-black bg-swiss-muted/30 italic">
                <div className="flex items-center gap-2 mb-2">
                  < Book className="h-4 w-4 text-swiss-red" />
                  <span className="text-[10px] font-black uppercase tracking-widest">PROTOCOL_INFO</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed">
                  ALL_REQUESTS_MUST_INCLUDE_AUTHENTICATION_IDENTIFIERS_AND_CONTENT-TYPE_DEFINITIONS.
                </p>
              </SwissCard>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-12">
              <div className="space-y-8 pb-12 border-b-4 border-swiss-black border-dotted">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black uppercase px-4 py-1 bg-swiss-black text-swiss-white italic">{selectedEndpoint.method}</span>
                  <code className="text-xl font-black tracking-tighter italic bg-swiss-muted px-4 py-1 border-2 border-swiss-black">
                    {selectedEndpoint.endpoint}
                  </code>
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic underline decoration-swiss-red decoration-8 underline-offset-8">
                  {selectedEndpoint.name}
                </h2>
                <p className="text-xl font-bold uppercase tracking-tight opacity-40 italic">
                  {selectedEndpoint.description}
                </p>

                {/* Parameters Table */}
                {selectedEndpoint.parameters.length > 0 && (
                  <div className="space-y-4 pt-8">
                    <h4 className="text-xs font-black uppercase tracking-[0.4em]">PARAMETER_DEFINITIONS:</h4>
                    <div className="border-4 border-swiss-black divide-y-4 divide-swiss-black overflow-hidden">
                      {selectedEndpoint.parameters.map((param) => (
                        <div key={param.name} className="flex flex-col md:flex-row divide-y-4 md:divide-y-0 md:divide-x-4 divide-swiss-black bg-swiss-white">
                          <div className="p-6 md:w-1/4 bg-swiss-muted/30">
                            <div className="flex flex-col gap-2">
                              <code className="font-black text-lg italic">{param.name}</code>
                              <span className={cn(
                                "text-[8px] font-black uppercase px-2 py-0.5 border-2 w-fit",
                                param.required ? "bg-swiss-red text-swiss-white border-swiss-red" : "border-swiss-black opacity-40"
                              )}>
                                {param.required ? "REQUIRED" : "OPTIONAL"}
                              </span>
                            </div>
                          </div>
                          <div className="p-6 md:w-1/2 flex flex-col justify-center">
                            <p className="text-xs font-black uppercase tracking-widest leading-relaxed">{param.description}</p>
                          </div>
                          <div className="p-6 md:w-1/4 bg-swiss-muted/10 flex flex-col justify-center">
                            <span className="text-[8px] font-black uppercase opacity-20 mb-1">EXAMPLE</span>
                            <code className="text-[10px] font-black italic">{JSON.stringify(param.example)}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Code Examples & Playground */}
              {/* Interaction Center */}
              <Tabs defaultValue="playground" className="space-y-8">

                <TabsList className="flex bg-transparent p-0 gap-4 mb-8">
                  <TabsTrigger
                    value="playground"
                    className="flex-1 h-14 border-4 border-swiss-black font-black uppercase tracking-widest italic data-[state=active]:bg-swiss-red data-[state=active]:text-swiss-white transition-all rounded-none"
                  >
                    NEURAL_PLAYGROUND
                  </TabsTrigger>
                  <TabsTrigger
                    value="examples"
                    className="flex-1 h-14 border-4 border-swiss-black font-black uppercase tracking-widest italic data-[state=active]:bg-swiss-black data-[state=active]:text-swiss-white transition-all rounded-none"
                  >
                    CODE_FRAGMENTS
                  </TabsTrigger>
                </TabsList>

                {/* Playground */}
                <TabsContent value="playground" className="mt-0 ring-offset-swiss-white focus-visible:ring-0">
                  <SwissCard className="p-10 border-4 border-swiss-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] bg-swiss-white space-y-10">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-[0.3em]">AUTHENTICATION_IDENTIFIER</Label>
                      <Input
                        type="password"
                        placeholder="ENTER_API_KEY..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="h-16 px-6 text-xl font-black uppercase border-4 border-swiss-black bg-swiss-muted focus-visible:bg-swiss-white focus-visible:ring-0 transition-all rounded-none"
                      />
                    </div>

                    {selectedEndpoint.parameters.length > 0 && (
                      <div className="grid md:grid-cols-2 gap-8">
                        {selectedEndpoint.parameters.map((param) => (
                          <div key={param.name} className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-[0.3em] flex justify-between">
                              {param.name}
                              {param.required && <span className="text-swiss-red italic">REQUIRED</span>}
                            </Label>
                            <Input
                              placeholder={`SPECIFY_${param.name}...`}
                              value={playgroundParams[param.name] || ""}
                              onChange={(e) =>
                                setPlaygroundParams((prev) => ({
                                  ...prev,
                                  [param.name]: e.target.value,
                                }))
                              }
                              className="h-14 px-4 font-black uppercase border-2 border-swiss-black bg-swiss-white focus-visible:ring-0 rounded-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <SwissButton
                      onClick={handlePlaygroundTest}
                      disabled={isLoading}
                      className="w-full h-20 text-2xl"
                    >
                      {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-swiss-white" /> : "EXECUTE_NETWORK_TEST"}
                    </SwissButton>

                    {playgroundResponse && (
                      <div className="space-y-4 pt-10 border-t-4 border-swiss-black border-dotted">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em]">
                            OUTPUT_STREAM // STATUS_{playgroundResponse.status}
                          </h4>
                          <SwissButton size="sm" variant="secondary" onClick={() => copyToClipboard(JSON.stringify(playgroundResponse, null, 2))}>COPY</SwissButton>
                        </div>
                        <div className="p-6 bg-swiss-black border-4 border-swiss-black overflow-x-auto shadow-[8px_8px_0_0_rgba(255,0,0,1)]">
                          <SyntaxHighlighter
                            language="json"
                            style={vscDarkPlus}
                            customStyle={{ background: 'transparent', margin: 0, padding: 0 }}
                          >
                            {JSON.stringify(playgroundResponse, null, 2)}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    )}
                  </SwissCard>
                </TabsContent>

                {/* Code Examples */}
                <TabsContent value="examples" className="mt-0 border-0 ring-offset-swiss-white focus-visible:ring-0">
                  <SwissCard className="p-10 border-4 border-swiss-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] bg-swiss-black space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-2 flex-1">
                        <Label className="text-xs font-black uppercase tracking-[0.3em] text-swiss-white/40">LANGUAGE_SELECTOR</Label>
                        <Select
                          value={selectedLanguage}
                          onValueChange={setSelectedLanguage}
                        >
                          <SelectTrigger className="h-14 px-6 text-lg font-black uppercase border-2 border-swiss-white bg-transparent text-swiss-white rounded-none focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-swiss-black border-2 border-swiss-white text-swiss-white rounded-none">
                            <SelectItem value="curl" className="focus:bg-swiss-red">CURL</SelectItem>
                            <SelectItem value="javascript" className="focus:bg-swiss-red">JAVASCRIPT</SelectItem>
                            <SelectItem value="python" className="focus:bg-swiss-red">PYTHON</SelectItem>
                            <SelectItem value="node" className="focus:bg-swiss-red">NODE_JS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <SwissButton variant="secondary" onClick={() => copyToClipboard(generateCodeSnippet())}>COPY_FRAGMENT</SwissButton>
                    </div>

                    <div className="p-6 bg-swiss-black/50 border-2 border-swiss-white/10 overflow-x-auto">
                      <SyntaxHighlighter
                        language={selectedLanguage === "curl" ? "bash" : selectedLanguage}
                        style={vscDarkPlus}
                        customStyle={{ background: 'transparent', margin: 0, padding: 0 }}
                        className="min-h-[200px]"
                      >
                        {generateCodeSnippet()}
                      </SyntaxHighlighter>
                    </div>
                  </SwissCard>
                </TabsContent>
              </Tabs>

              {/* Authentication & Errors Cluster */}
              <div className="grid md:grid-cols-2 gap-8 pt-12">
                <SwissCard className="p-8 border-4 border-swiss-black bg-swiss-white">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-swiss-black text-swiss-white">
                      <Key className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">NEURAL_ACCESS</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-tight opacity-60">
                      REQUEST_HEADERS_REQUIRE_AUTHENTICATION_TOKENS:
                    </p>
                    <code className="block bg-swiss-muted p-4 border-2 border-swiss-black font-black text-xs italic">
                      X-API-KEY: YOUR_IDENTIFIER
                    </code>
                    <div className="flex items-start gap-3 mt-4 p-4 bg-swiss-red/10 border-l-4 border-swiss-red">
                      <AlertCircle className="h-5 w-5 text-swiss-red mt-0.5" />
                      <p className="text-[10px] font-black uppercase tracking-tight text-swiss-red italic">
                        SECURITY_WARNING: NEVER_EXPOSE_TOKENS_IN_CLIENT-SIDE_ENVIRONMENTS.
                      </p>
                    </div>
                  </div>
                </SwissCard>

                <SwissCard className="p-8 border-4 border-swiss-black bg-swiss-black text-swiss-white">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic mb-6">PROTOCOL_ERRORS</h3>
                  <div className="space-y-3">
                    {[
                      { code: "401", msg: "INVALID_IDENTIFIER" },
                      { code: "402", msg: "INSUFFICIENT_RESOURCE_ALLOCATION" },
                      { code: "429", msg: "THROUGHPUT_LIMIT_EXCEEDED" },
                      { code: "400", msg: "MALFORMED_INPUT_PARAMETERS" },
                    ].map((err) => (
                      <div key={err.code} className="flex items-center gap-4 border-b border-swiss-white/10 pb-2">
                        <span className="text-swiss-red font-black text-lg italic">{err.code}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{err.msg}</span>
                      </div>
                    ))}
                  </div>
                </SwissCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
