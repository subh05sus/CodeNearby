"use client";

import { useState, useEffect } from "react";
import { API_TOKEN_COSTS } from "@/consts/pricing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Copy, Play, Code, Book, Zap, Key, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";

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
      return `curl -X ${endpoint.method} "${API_BASE_URL}${
        endpoint.endpoint
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
      return `const response = await fetch('${API_BASE_URL}${
        endpoint.endpoint
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
    toast.success("Copied to clipboard!");
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
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
            <p className="text-xl text-muted-foreground">
              AI-powered developer search and GitHub integration API
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/api-dashboard">
                <Key className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link href="/upgrade">
                <Zap className="h-4 w-4 mr-2" />
                Get API Keys
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <Link
                    href="/api-dashboard"
                    className="text-blue-600 hover:underline"
                  >
                    Create an API key
                  </Link>{" "}
                  in your dashboard
                </li>
                <li>
                  Include your API key in the{" "}
                  <code className="bg-muted px-1 rounded">x-api-key</code>{" "}
                  header
                </li>
                <li>
                  Make requests to{" "}
                  <code className="bg-muted px-1 rounded">
                    {API_BASE_URL}/api/v1/*
                  </code>
                </li>
                <li>Monitor your token usage in the dashboard</li>
              </ol>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Base URL:</h4>
                <code className="text-sm">{API_BASE_URL}/api/v1</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar - Endpoint List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {API_ENDPOINTS.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                      selectedEndpoint.id === endpoint.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          endpoint.method === "GET" ? "secondary" : "default"
                        }
                      >
                        {endpoint.method}
                      </Badge>
                      <span className="font-medium text-sm">
                        {endpoint.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {endpoint.tokenCost} tokens
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Endpoint Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    selectedEndpoint.method === "GET" ? "secondary" : "default"
                  }
                >
                  {selectedEndpoint.method}
                </Badge>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {selectedEndpoint.endpoint}
                </code>
              </div>
              <CardTitle>{selectedEndpoint.name}</CardTitle>
              <CardDescription>{selectedEndpoint.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Token Cost:</span>
                    <Badge variant="outline">
                      {selectedEndpoint.tokenCost}
                    </Badge>
                  </div>
                </div>

                {/* Parameters */}
                {selectedEndpoint.parameters.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Parameters</h4>
                    <div className="space-y-3">
                      {selectedEndpoint.parameters.map((param) => (
                        <div key={param.name} className="border rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="font-mono text-sm">
                              {param.name}
                            </code>
                            <Badge
                              variant={
                                param.required ? "destructive" : "secondary"
                              }
                            >
                              {param.required ? "Required" : "Optional"}
                            </Badge>
                            <Badge variant="outline">{param.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {param.description}
                          </p>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            Example: {JSON.stringify(param.example)}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Code Examples & Playground */}
          <Tabs defaultValue="playground" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="playground">API Playground</TabsTrigger>
              <TabsTrigger value="examples">Code Examples</TabsTrigger>
            </TabsList>

            {/* Playground */}
            <TabsContent value="playground">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Try it out
                  </CardTitle>
                  <CardDescription>
                    Test the API endpoint with your own parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* API Key Input */}
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>

                  {/* Parameters */}
                  {selectedEndpoint.parameters.length > 0 && (
                    <div>
                      <Label>Parameters</Label>
                      <div className="space-y-2 mt-2">
                        {selectedEndpoint.parameters.map((param) => (
                          <div key={param.name}>
                            <Label htmlFor={param.name} className="text-sm">
                              {param.name}{" "}
                              {param.required && (
                                <span className="text-red-500">*</span>
                              )}
                            </Label>
                            <Input
                              id={param.name}
                              placeholder={`Enter ${param.name}`}
                              value={playgroundParams[param.name] || ""}
                              onChange={(e) =>
                                setPlaygroundParams((prev) => ({
                                  ...prev,
                                  [param.name]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handlePlaygroundTest}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Testing..." : "Send Request"}
                  </Button>

                  {/* Response */}
                  {playgroundResponse && (
                    <div>
                      <Label>Response</Label>
                      <div className="mt-2 relative">
                        <SyntaxHighlighter
                          language="json"
                          style={vscDarkPlus}
                          className="rounded-md"
                        >
                          {JSON.stringify(playgroundResponse, null, 2)}
                        </SyntaxHighlighter>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(playgroundResponse, null, 2)
                            )
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Code Examples */}
            <TabsContent value="examples">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Code Examples
                  </CardTitle>
                  <CardDescription>
                    Copy and paste these examples into your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Language</Label>
                      <Select
                        value={selectedLanguage}
                        onValueChange={setSelectedLanguage}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="curl">cURL</SelectItem>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="node">Node.js</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative">
                      <SyntaxHighlighter
                        language={
                          selectedLanguage === "curl"
                            ? "bash"
                            : selectedLanguage
                        }
                        style={vscDarkPlus}
                        className="rounded-md"
                      >
                        {generateCodeSnippet()}
                      </SyntaxHighlighter>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generateCodeSnippet())}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Example Response */}
                    <div>
                      <Label>Example Response</Label>
                      <div className="mt-2 relative">
                        <SyntaxHighlighter
                          language="json"
                          style={vscDarkPlus}
                          className="rounded-md"
                        >
                          {JSON.stringify(
                            selectedEndpoint.example.response,
                            null,
                            2
                          )}
                        </SyntaxHighlighter>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(
                                selectedEndpoint.example.response,
                                null,
                                2
                              )
                            )
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Authentication & Errors */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Include your API key in the request header:
                </p>
                <code className="block bg-muted p-2 rounded text-sm">
                  x-api-key: your-api-key-here
                </code>
                <div className="flex items-start gap-2 mt-4">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Keep your API key secure and never expose it in client-side
                    code.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Error Codes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-3">
                  <div>
                    <Badge variant="destructive">401</Badge>
                    <span className="ml-2 text-sm">
                      Invalid or missing API key
                    </span>
                  </div>
                  <div>
                    <Badge variant="destructive">402</Badge>
                    <span className="ml-2 text-sm">Insufficient tokens</span>
                  </div>
                  <div>
                    <Badge variant="destructive">429</Badge>
                    <span className="ml-2 text-sm">Rate limit exceeded</span>
                  </div>
                  <div>
                    <Badge variant="destructive">400</Badge>
                    <span className="ml-2 text-sm">
                      Invalid request parameters
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
