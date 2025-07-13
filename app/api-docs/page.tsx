"use client";

import { useState, useEffect } from "react";
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
import {
  Copy,
  Play,
  Code,
  Book,
  Zap,
  Key,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { API_ENDPOINT_DEV } from "@/consts/BASIC";

const API_ENDPOINTS = [
  {
    id: "ai-connect-developers",
    name: "AI-Connect Developer Search",
    method: "POST",
    endpoint: "/api/v1/ai-connect/developers",
    description: "Find developers using natural language queries powered by AI",
    tokenCost: 3,
    parameters: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "Natural language query describing developers you're looking for",
      },
      {
        name: "options",
        type: "object",
        required: false,
        description: "Additional search options",
      },
      {
        name: "options.limit",
        type: "number",
        required: false,
        description:
          "Maximum number of results (free: 10, developer: 50, business: 100)",
      },
    ],
    example: {
      request: {
        url: "/api/v1/ai-connect/developers",
        method: "POST",
        headers: {
          "x-api-key": "YOUR_API_KEY",
          "Content-Type": "application/json",
        },
        body: {
          query: "Find React Native developers in New York",
          options: { limit: 10 },
        },
      },
      response: {
        message:
          "Found 5 React Native developers in New York. Consider checking their GitHub profiles for more details.",
        developers: [
          {
            login: "johndoe",
            name: "John Doe",
            bio: "React Native developer with 5+ years experience",
            location: "New York, NY",
            public_repos: 42,
            followers: 150,
            following: 80,
            avatar_url: "https://github.com/johndoe.png",
            html_url: "https://github.com/johndoe",
          },
        ],
        query_analysis: {
          skills: ["React Native"],
          location: "New York",
          experience_level: null,
          other_requirements: [],
          search_intent: "Find React Native developers in New York",
        },
        metadata: {
          total_results: 5,
          search_query: "Find React Native developers in New York",
          timestamp: "2024-01-15T10:30:00Z",
        },
      },
    },
  },
  {
    id: "ai-connect-profile",
    name: "AI-Connect Profile Analysis",
    method: "POST",
    endpoint: "/api/v1/ai-connect/profile",
    description: "Get AI-powered analysis of GitHub developer profiles",
    tokenCost: 2,
    parameters: [
      {
        name: "username",
        type: "string",
        required: true,
        description: "GitHub username to analyze (with or without @ symbol)",
      },
    ],
    example: {
      request: {
        url: "/api/v1/ai-connect/profile",
        method: "POST",
        headers: {
          "x-api-key": "YOUR_API_KEY",
          "Content-Type": "application/json",
        },
        body: {
          username: "octocat",
        },
      },
      response: {
        analysis:
          "This developer shows strong expertise in open source contribution with a focus on Git and version control systems. The account demonstrates consistent activity and community engagement through high follower count and repository maintenance.",
        profile_data: {
          profile: {
            login: "octocat",
            name: "The Octocat",
            bio: "GitHub's mascot",
            company: "@github",
            location: "San Francisco",
            public_repos: 8,
            followers: 9000,
            following: 9,
            created_at: "2011-01-25T18:44:36Z",
            avatar_url: "https://github.com/octocat.png",
          },
          repositories: [],
          recent_activity: [],
        },
        insights: {
          primary_languages: [
            { language: "JavaScript", repositories: 3 },
            { language: "Python", repositories: 2 },
          ],
          total_stars: 150,
          most_starred_repo: {
            name: "Hello-World",
            stars: 80,
            description: "My first repository",
            language: "JavaScript",
          },
          activity_level: "Active",
          account_age_years: 13,
        },
      },
    },
  },
  {
    id: "ai-connect-repositories",
    name: "AI-Connect Repository Search",
    method: "POST",
    endpoint: "/api/v1/ai-connect/repositories",
    description:
      "Find GitHub repositories using natural language queries powered by AI",
    tokenCost: 2,
    parameters: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "Natural language description of repositories you're looking for",
      },
      {
        name: "options",
        type: "object",
        required: false,
        description: "Additional search options",
      },
      {
        name: "options.limit",
        type: "number",
        required: false,
        description:
          "Maximum results to return (default: 20, max varies by tier)",
      },
      {
        name: "options.language",
        type: "string",
        required: false,
        description: "Filter by programming language",
      },
      {
        name: "options.sort",
        type: "string",
        required: false,
        description: "Sort by 'stars', 'forks', 'updated' (default: 'stars')",
      },
    ],
    example: {
      request: {
        url: "/api/v1/ai-connect/repositories",
        method: "POST",
        headers: {
          "x-api-key": "YOUR_API_KEY",
          "Content-Type": "application/json",
        },
        body: {
          query: "Find React UI component libraries",
          options: { limit: 10, language: "JavaScript", sort: "stars" },
        },
      },
      response: {
        message:
          "Found 15 React UI component libraries including popular ones like Material-UI and Ant Design.",
        repositories: [
          {
            id: 123456,
            name: "material-ui",
            full_name: "mui/material-ui",
            description:
              "React components for faster and easier web development",
            html_url: "https://github.com/mui/material-ui",
            stargazers_count: 85000,
            forks_count: 28000,
            language: "JavaScript",
            topics: ["react", "ui", "components", "material-design"],
            owner: {
              login: "mui",
              avatar_url: "https://github.com/mui.png",
              html_url: "https://github.com/mui",
            },
            license: {
              name: "MIT License",
              spdx_id: "MIT",
            },
          },
        ],
        query_analysis: {
          technologies: ["React", "JavaScript"],
          project_type: "library",
          features: ["UI", "components"],
          popularity: "high",
          search_intent: "Find React UI component libraries",
        },
        metadata: {
          total_results: 15,
          search_query: "Find React UI component libraries",
          language_filter: "JavaScript",
          sort_by: "stars",
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
    tokenCost: 0,
    parameters: [],
    example: {
      request: {
        url: "/api/v1/pricing",
        headers: {
          "Content-Type": "application/json",
        },
      },
      response: {
        currency: {
          code: "USD",
          symbol: "$",
          locale: "en-US",
        },
        tiers: [
          {
            id: "free",
            name: "Free",
            description: "Start with free daily tokens",
            maxApiKeys: 1,
            dailyFreeTokens: 1000,
            features: [
              "1,000 free tokens daily",
              "Developer search",
              "Community support",
            ],
          },
        ],
        overagePricing: {
          free: { request: 0.01, token: 0.001 },
        },
      },
    },
  },
];

const CODE_TEMPLATES = {
  curl: (endpoint: any, apiKey: string, params: any) => {
    if (endpoint.method === "GET") {
      const queryParams = new URLSearchParams(params).toString();
      return `curl -X GET "${API_ENDPOINT_DEV}${endpoint.endpoint}${
        queryParams ? "?" + queryParams : ""
      }" \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json"`;
    } else {
      return `curl -X ${endpoint.method} "${API_ENDPOINT_DEV}${
        endpoint.endpoint
      }" \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(params, null, 2)}'`;
    }
  },
  javascript: (endpoint: any, apiKey: string, params: any) => {
    if (endpoint.method === "GET") {
      const queryParams = new URLSearchParams(params).toString();
      return `const response = await fetch('${API_ENDPOINT_DEV}${
        endpoint.endpoint
      }${queryParams ? "?" + queryParams : ""}', {
  method: 'GET',
  headers: {
    'x-api-key': '${apiKey}',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;
    } else {
      return `const response = await fetch('${API_ENDPOINT_DEV}${
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

url = "${API_ENDPOINT_DEV}${endpoint.endpoint}"
headers = {
    "x-api-key": "${apiKey}",
    "Content-Type": "application/json"
}
params = ${JSON.stringify(params, null, 2)}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(data)`;
    } else {
      return `import requests
import json

url = "${API_ENDPOINT_DEV}${endpoint.endpoint}"
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
  php: (endpoint: any, apiKey: string, params: any) => {
    if (endpoint.method === "GET") {
      return `<?php
$url = "${API_ENDPOINT_DEV}${
        endpoint.endpoint
      }?" . http_build_query(${JSON.stringify(params)});
$headers = [
    "x-api-key: ${apiKey}",
    "Content-Type: application/json"
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);

print_r($data);
?>`;
    } else {
      return `<?php
$url = "${API_ENDPOINT_DEV}${endpoint.endpoint}";
$data = ${JSON.stringify(params, null, 2)};
$headers = [
    "x-api-key: ${apiKey}",
    "Content-Type: application/json"
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$result = json_decode($response, true);
curl_close($ch);

print_r($result);
?>`;
    }
  },
  node: (endpoint: any, apiKey: string, params: any) => {
    if (endpoint.method === "GET") {
      return `const axios = require('axios');

const config = {
  method: 'get',
  url: '${API_ENDPOINT_DEV}${endpoint.endpoint}',
  headers: {
    'x-api-key': '${apiKey}',
    'Content-Type': 'application/json'
  },
  params: ${JSON.stringify(params, null, 2)}
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
  url: '${API_ENDPOINT_DEV}${endpoint.endpoint}',
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
    {}
  );
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("curl");

  useEffect(() => {
    // Reset params when endpoint changes
    const initialParams: Record<string, any> = {};
    selectedEndpoint.parameters.forEach((param) => {
      if (param.required) {
        initialParams[param.name] = "";
      }
    });
    setPlaygroundParams(initialParams);
    setPlaygroundResponse(null);
  }, [selectedEndpoint]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handlePlaygroundTest = async () => {
    if (!apiKey) {
      toast.error("Please enter your API key");
      return;
    }

    setIsLoading(true);
    try {
      const url = new URL(
        `${API_ENDPOINT_DEV}${selectedEndpoint.endpoint}`
      );

      let response;
      if (selectedEndpoint.method === "GET") {
        // Add params as query parameters
        Object.entries(playgroundParams).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value.toString());
        });

        response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        });
      } else {
        response = await fetch(url.toString(), {
          method: selectedEndpoint.method,
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(playgroundParams),
        });
      }

      const data = await response.json();
      setPlaygroundResponse({
        status: response.status,
        statusText: response.statusText,
        data: data,
      });
    } catch (error) {
      setPlaygroundResponse({
        error: error instanceof Error ? error.message : "Request failed",
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
      apiKey || "YOUR_API_KEY",
      playgroundParams
    );
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            API Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive documentation for the CodeNearby API with interactive
            playground and code examples
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="playground" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Playground
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Examples
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    All API requests require authentication using an API key.
                    Include your API key in the x-api-key header:
                  </p>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">x-api-key: YOUR_API_KEY</code>
                  </div>
                  <Button asChild size="sm">
                    <a
                      href="/api-dashboard"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Get API Key
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Token Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Our API uses a token-based pricing model. Each endpoint
                    consumes a specific number of tokens:
                  </p>
                  <div className="space-y-2">
                    {API_ENDPOINTS.map((endpoint) => (
                      <div
                        key={endpoint.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>{endpoint.name}</span>
                        <Badge variant="outline">
                          {endpoint.tokenCost} tokens
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href="/api-dashboard"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Buy Tokens
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-sm">https://codenearby.space</code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Rate limits are based on your account tier and token balance:
                </p>
                <ul className="text-sm space-y-1">
                  <li>
                    • <strong>Free:</strong> 1,000 tokens per day + 10 requests
                    per minute
                  </li>
                  <li>
                    • <strong>Verified:</strong> 1000 tokens per day + 20
                    requests per minute
                  </li>
                  <li>
                    • <strong>Premium:</strong> 2000 tokens per day + 50
                    requests per minute
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            {API_ENDPOINTS.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Badge
                        variant={
                          endpoint.method === "GET" ? "secondary" : "default"
                        }
                      >
                        {endpoint.method}
                      </Badge>
                      {endpoint.name}
                    </CardTitle>
                    <Badge variant="outline">{endpoint.tokenCost} tokens</Badge>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">{endpoint.endpoint}</code>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Parameters</h4>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param) => (
                        <div key={param.name} className="border rounded-md p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono">
                              {param.name}
                            </code>
                            <Badge
                              variant={param.required ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {param.required ? "required" : "optional"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {param.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Example Response</h4>
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                      className="rounded-md"
                      customStyle={{ fontSize: "12px" }}
                    >
                      {JSON.stringify(endpoint.example.response, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Playground Tab */}
          <TabsContent value="playground" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>API Playground</CardTitle>
                  <CardDescription>
                    Test API endpoints with real requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Endpoint</Label>
                    <Select
                      value={selectedEndpoint.id}
                      onValueChange={(value) => {
                        const endpoint = API_ENDPOINTS.find(
                          (e) => e.id === value
                        );
                        if (endpoint) setSelectedEndpoint(endpoint);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {API_ENDPOINTS.map((endpoint) => (
                          <SelectItem key={endpoint.id} value={endpoint.id}>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  endpoint.method === "GET"
                                    ? "secondary"
                                    : "default"
                                }
                                className="text-xs"
                              >
                                {endpoint.method}
                              </Badge>
                              {endpoint.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Parameters</Label>
                    {selectedEndpoint.parameters.map((param) => (
                      <div key={param.name}>
                        <Label htmlFor={param.name} className="text-sm">
                          {param.name}
                          {param.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          id={param.name}
                          placeholder={param.description}
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

                  <Button
                    onClick={handlePlaygroundTest}
                    disabled={isLoading || !apiKey}
                    className="w-full"
                  >
                    {isLoading ? "Sending Request..." : "Send Request"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                </CardHeader>
                <CardContent>
                  {playgroundResponse ? (
                    <div className="space-y-2">
                      {playgroundResponse.status && (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              playgroundResponse.status < 400
                                ? "default"
                                : "destructive"
                            }
                          >
                            {playgroundResponse.status}{" "}
                            {playgroundResponse.statusText}
                          </Badge>
                        </div>
                      )}
                      <SyntaxHighlighter
                        language="json"
                        style={vscDarkPlus}
                        className="rounded-md"
                        customStyle={{ fontSize: "12px", maxHeight: "400px" }}
                      >
                        {JSON.stringify(
                          playgroundResponse.data || playgroundResponse,
                          null,
                          2
                        )}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Send a request to see the response</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>
                  Ready-to-use code snippets in multiple programming languages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="curl">cURL</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="node">Node.js</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedEndpoint.id}
                    onValueChange={(value) => {
                      const endpoint = API_ENDPOINTS.find(
                        (e) => e.id === value
                      );
                      if (endpoint) setSelectedEndpoint(endpoint);
                    }}
                  >
                    <SelectTrigger className="w-60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {API_ENDPOINTS.map((endpoint) => (
                        <SelectItem key={endpoint.id} value={endpoint.id}>
                          {endpoint.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateCodeSnippet())}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <SyntaxHighlighter
                  language={
                    selectedLanguage === "curl"
                      ? "bash"
                      : selectedLanguage === "node"
                      ? "javascript"
                      : selectedLanguage
                  }
                  style={vscDarkPlus}
                  className="rounded-md"
                  customStyle={{ fontSize: "14px" }}
                >
                  {generateCodeSnippet()}
                </SyntaxHighlighter>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
