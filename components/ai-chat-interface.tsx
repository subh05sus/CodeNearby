/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import ReactMarkdown from "react-markdown";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Send,
  User,
  Bot,
  ExternalLink,
  Github,
  Info,
  MessageCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getLocationByIp } from "@/lib/location";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  developers?: any[];
  repositories?: any[];
  suggestions?: string[];
};

type RepoType = {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
};

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I can help you find developers based on location, skills, or interests. I can also search for GitHub repositories. Just ask me anything!",
      timestamp: new Date(),
      suggestions: [
        "Find React developers in New York",
        "Who are the top Python developers?",
        "Search for repositories about machine learning",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const [lastFoundDevelopers, setLastFoundDevelopers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateSuggestions = (
    content: string,
    developers?: any[]
  ): string[] => {
    const suggestions: string[] = [];

    if (developers && developers.length > 0) {
      suggestions.push(`Tell me more about the 1st developer`);
      if (developers.length > 1) {
        suggestions.push(`What about the 2nd developer?`);
      }
      const skills = [
        "React",
        "JavaScript",
        "Python",
        "Android",
        "iOS",
        "Machine Learning",
      ];
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];
      suggestions.push(`Find ${randomSkill} developers`);
    } else if (
      content.includes("more information about") ||
      content.includes("details about")
    ) {
      suggestions.push("What are their top projects?");
      suggestions.push("Find similar developers");
      suggestions.push("Go back to search results");
    } else {
      suggestions.push("Find developers in my location");
      suggestions.push("Who are the top React developers?");
      suggestions.push("Find developers with machine learning skills");
    }

    return suggestions.slice(0, 3);
  };

  const isDeveloperSearchRequest = (message: string): boolean => {
    const developerSearchTerms = [
      "find developers",
      "search developers",
      "search for developers",
      "locate developers",
      "find programmers",
      "search programmers",
      "find coders",
      "search coders",
      "find engineers",
      "search engineers",
      "look for developers",
      "discover developers"
    ];

    const skillTerms = [
      "who knows",
      "who can",
      "expert in",
      "skilled in",
      "specializes in",
    ];

    message = message.toLowerCase();

    // First check if it's explicitly a developer search
    if (developerSearchTerms.some(term => message.includes(term.toLowerCase()))) {
      return true;
    }

    // Check if it could be a repository search first
    if (isRepositorySearchRequest(message)) {
      return false;
    }

    // If it's not specifically a repository search, check for skill terms
    if (skillTerms.some(term => message.includes(term.toLowerCase()))) {
      return true;
    }

    // Generic "find" or "search" without specifying repositories is ambiguous
    // Let's check if there are technology terms that indicate developer search
    const genericSearchTerms = ["find", "search", "locate", "look for", "discover"];
    
    if (genericSearchTerms.some(term => message.includes(term.toLowerCase()))) {
      // If it's a generic search term like "find React developers" or "search React",
      // let's check the context - if it includes words like "developers", "programmers", etc.
      const developerContextTerms = ["developers", "programmers", "coders", "engineers", "people", "users"];
      if (developerContextTerms.some(term => message.includes(term.toLowerCase()))) {
        return true;
      }
    }

    return false;
  };

  const isLocationBasedSearch = (message: string): boolean => {
    const locationTerms = [
      "in my location",
      "near me",
      "close to me",
      "in my area",
      "around me",
      "nearby",
      "in my city",
      "in my region",
      "around my location",
    ];

    message = message.toLowerCase();

    return locationTerms.some((term) => message.includes(term));
  };

  const isPersonSearchRequest = (message: string): string | null => {
    // Check for direct @username mentions first
    const atMentionMatch = message.match(/@([a-zA-Z0-9_-]+)/);
    if (atMentionMatch && atMentionMatch[1]) {
      return atMentionMatch[1].trim();
    }

    // Check for various natural language patterns
    const patterns = [
      /do you know ([\w\s]+)(?:\?|$)/i,
      /who is ([\w\s]+)(?:\?|$)/i,
      /tell me about ([\w\s]+)(?:\?|$)/i,
      /find ([\w\s]+) on github/i,
      /search for ([\w\s]+)(?:\s|$)/i,
      /looking for ([\w\s]+)(?:\s|$)/i,
      /can you find ([\w\s]+)(?:\s|$)/i,
      /info(?:rmation)? (?:about|on) ([\w\s]+)(?:\s|$)/i,
      /profile of ([\w\s]+)(?:\s|$)/i,
      /show me ([\w\s]+)(?:'s)? profile/i,
      /what do you know about ([\w\s]+)(?:\?|$)/i,
      /is ([\w\s]+) on github/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  };

  const isReferenceToFoundDeveloper = (
    message: string
  ): { isReference: boolean; index: number; username: string | null } => {
    const indexPatterns = [
      /(?:the|show|about|more about)\s+(\d+)(?:st|nd|rd|th)\s+(?:one|profile|developer|person)/i,
      /(?:more about|details of|info on)\s+(?:profile|developer|person)?\s*#?\s*(\d+)/i,
      /(?:profile|developer|person)\s+(?:number)?\s*#?\s*(\d+)/i,
      /(\d+)(?:st|nd|rd|th)\s+(?:profile|developer|person)/i,
    ];

    const usernamePatterns = [
      /(?:tell me more about|more about|details of|info on)\s+@?([a-zA-Z0-9_-]+)/i,
      /(?:show|get|fetch)\s+(?:profile|details|info)?\s+(?:for|about)?\s+@?([a-zA-Z0-9_-]+)/i,
    ];

    for (const pattern of indexPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const index = parseInt(match[1], 10);
        return { isReference: true, index: index, username: null };
      }
    }

    for (const pattern of usernamePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return { isReference: true, index: -1, username: null };
      }
    }

    return { isReference: false, index: -1, username: null };
  };

  const isRepositorySearchRequest = (message: string): boolean => {
    const searchTerms = [
      "search for repositories",
      "search repositories",
      "find repositories",
      "search repos",
      "find repos",
      "search projects",
      "find projects",
      "look for repositories",
      "search library",
      "search package",
      "search for repo",
      "search framework"
    ];

    message = message.toLowerCase();

    return searchTerms.some((term) => message.includes(term.toLowerCase()));
  };

  const isSimilarRepositoriesRequest = (message: string): string | null => {
    const patterns = [
      /similar (?:to|as) ([\w\s\-\/]+)(?:\s|$)/i,
      /repositories like ([\w\s\-\/]+)(?:\s|$)/i,
      /repos similar to ([\w\s\-\/]+)(?:\s|$)/i,
      /projects like ([\w\s\-\/]+)(?:\s|$)/i,
      /find (?:repos|repositories) like ([\w\s\-\/]+)(?:\s|$)/i,
      /similar repositories to ([\w\s\-\/]+)(?:\s|$)/i,
      /similar projects to ([\w\s\-\/]+)(?:\s|$)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  };

  const isReferenceToFoundRepository = (
    message: string
  ): { isReference: boolean; index: number; repoName: string | null } => {
    const indexPatterns = [
      /(?:the|show|about|more about)\s+(\d+)(?:st|nd|rd|th)\s+(?:one|repository|repo)/i,
      /(?:more about|details of|info on)\s+(?:repository|repo)?\s*#?\s*(\d+)/i,
      /(?:repository|repo)\s+(?:number)?\s*#?\s*(\d+)/i,
      /(\d+)(?:st|nd|rd|th)\s+(?:repository|repo)/i,
    ];

    const namePatterns = [
      /(?:tell me more about|more about|details of|info on)\s+(?:repository|repo)?\s+([a-zA-Z0-9_\-\/]+)/i,
      /(?:show|get|fetch)\s+(?:repository|repo|details|info)?\s+(?:for|about)?\s+([a-zA-Z0-9_\-\/]+)/i,
    ];

    for (const pattern of indexPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const index = parseInt(match[1], 10);
        return { isReference: true, index: index, repoName: null };
      }
    }

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return { isReference: true, index: -1, repoName: match[1] };
      }
    }

    return { isReference: false, index: -1, repoName: null };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSendMessage(null, suggestion);
  };

  const handleGetDetailedProfile = async (
    username: string,
    index: number,
    sendExtraMessage: boolean = true
  ) => {
    setIsLoading(true);

    if (sendExtraMessage) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: `Tell me more about @${username}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
    }

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Tell me more about @${username}`,
          history: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          fetchDetailedProfile: username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get detailed profile");
      }

      const data = await response.json();
      const detailedDeveloper = data.developers?.[0];

      if (detailedDeveloper) {
        const updatedDevs = [...lastFoundDevelopers];
        updatedDevs[index] = detailedDeveloper;
        setLastFoundDevelopers(updatedDevs);
      }

      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: data.text,
        timestamp: new Date(),
        developers: detailedDeveloper ? [detailedDeveloper] : [],
        suggestions: generateSuggestions(
          data.text,
          detailedDeveloper ? [detailedDeveloper] : []
        ),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching detailed profile:", error);

      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        role: "assistant",
        content: `Sorry, I couldn't fetch detailed information for @${username}. This might be due to GitHub API rate limits. Please try again later.`,
        timestamp: new Date(),
        suggestions: [
          "Try again later",
          "Search for another developer",
          "Help me troubleshoot",
        ],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (
    e: React.FormEvent | null,
    suggestionText?: string
  ) => {
    if (e) e.preventDefault();

    const messageText = suggestionText || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Set the appropriate loading message based on the query type
      if (isRepositorySearchRequest(messageText)) {
        setLoadingMessage("Searching for repositories");
      } else if (isSimilarRepositoriesRequest(messageText)) {
        const repoName = isSimilarRepositoriesRequest(messageText);
        setLoadingMessage(`Finding repositories similar to ${repoName}`);
      } else if (messageText.includes("@")) {
        const usernameMatch = messageText.match(/@([a-zA-Z0-9_-]+)/);
        if (usernameMatch && usernameMatch[1]) {
          setLoadingMessage(`Searching for @${usernameMatch[1]}`);
        } else {
          setLoadingMessage("Searching for user");
        }
      } else if (isPersonSearchRequest(messageText)) {
        const personName = isPersonSearchRequest(messageText);
        setLoadingMessage(`Looking for ${personName}`);
      } else if (isLocationBasedSearch(messageText)) {
        setLoadingMessage("Finding your location");
      } else if (isDeveloperSearchRequest(messageText)) {
        if (messageText.toLowerCase().includes("in ")) {
          const locationMatch = messageText.match(
            /in\s+([A-Za-z\s,]+)(?:\s|$)/i
          );
          if (locationMatch && locationMatch[1]) {
            setLoadingMessage(`Searching in ${locationMatch[1].trim()}`);
          } else {
            setLoadingMessage("Searching for developers");
          }
        } else {
          setLoadingMessage("Searching for developers");
        }
      } else {
        setLoadingMessage("Processing...");
      }

      // Check if this is a reference to a repository from previous results
      const { isReference: isRepoReference, index: repoIndex, repoName } = isReferenceToFoundRepository(messageText);

      if (isRepoReference) {
        const lastMessage = messages[messages.length - 2]; // Get the last assistant message with repos
        const lastRepos = lastMessage?.repositories || [];

        if (repoIndex > 0 && lastRepos.length > 0) {
          const repoIdx = repoIndex - 1;
          if (repoIdx >= 0 && repoIdx < lastRepos.length) {
            const selectedRepo = lastRepos[repoIdx];
            
            // Get detailed info for this repository
            const response = await fetch("/api/ai-chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: `Tell me more about ${selectedRepo.full_name}`,
                history: messages.map((msg) => ({
                  role: msg.role,
                  content: msg.content,
                })),
                getRepoDetails: selectedRepo.full_name,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to get repository details");
            }

            const data = await response.json();
            
            const aiMessage: Message = {
              id: Date.now().toString() + "-ai",
              role: "assistant",
              content: data.text,
              timestamp: new Date(),
              repositories: data.repositories || [],
              suggestions: [
                "Find similar repositories",
                "Search for another repository",
                "Find developers who contribute to this"
              ],
            };

            setMessages((prev) => [...prev, aiMessage]);
            setIsLoading(false);
            return;
          }
        } else if (repoName) {
          // Handle repository name reference
          const response = await fetch("/api/ai-chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: `Tell me more about ${repoName}`,
              history: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              getRepoDetails: repoName,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to get repository details");
          }

          const data = await response.json();
          
          const aiMessage: Message = {
            id: Date.now().toString() + "-ai",
            role: "assistant",
            content: data.text,
            timestamp: new Date(),
            repositories: data.repositories || [],
            suggestions: [
              "Find similar repositories",
              "Search for another repository",
              "Find developers who contribute to this"
            ],
          };

          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);
          return;
        }
      }

      // Check for similar repositories request
      const similarRepos = isSimilarRepositoriesRequest(messageText);
      if (similarRepos) {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageText,
            history: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            searchSimilarRepos: similarRepos,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to find similar repositories");
        }

        const data = await response.json();
        
        const aiMessage: Message = {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: data.text,
          timestamp: new Date(),
          repositories: data.repositories || [],
          suggestions: [
            "Tell me more about the 1st repository",
            "Search for another repository",
            "Find a specific repository"
          ],
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      // Check for repository search request
      if (isRepositorySearchRequest(messageText)) {
        // Extract the repository search query
        const searchTerms = [
          "search for repositories",
          "search repositories",
          "find repositories",
          "search repos",
          "find repos",
          "search projects",
          "find projects",
          "look for repositories",
          "search library",
          "search package",
          "search for repo",
          "search framework"
        ];
        
        let searchQuery = messageText.toLowerCase();
        for (const term of searchTerms) {
          if (searchQuery.includes(term.toLowerCase())) {
            searchQuery = searchQuery.replace(term.toLowerCase(), "").trim();
            break;
          }
        }

        // If the query contains "about" or "related to", clean it up
        searchQuery = searchQuery.replace(/about|related to|for|on|with/gi, "").trim();
        
        if (!searchQuery) {
          // Fallback to using the whole message if we couldn't extract a clean query
          searchQuery = messageText;
        }
        
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageText,
            history: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            searchRepositories: searchQuery,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to search repositories");
        }

        const data = await response.json();
        
        const aiMessage: Message = {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: data.text,
          timestamp: new Date(),
          repositories: data.repositories || [],
          suggestions: [
            "Tell me more about the 1st repository",
            "Find similar repositories",
            "Search for another repository"
          ],
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      // Check if this is a reference to a found developer
      const { isReference, index, username } =
        isReferenceToFoundDeveloper(messageText);

      if (isReference) {
        if (index > 0 && lastFoundDevelopers.length > 0) {
          const developerIndex = index - 1;

          if (
            developerIndex >= 0 &&
            developerIndex < lastFoundDevelopers.length
          ) {
            const referencedDeveloper = lastFoundDevelopers[developerIndex];

            if (referencedDeveloper.isBasicInfo) {
              await handleGetDetailedProfile(
                referencedDeveloper.login,
                developerIndex,
                false
              );
              return;
            }

            const aiMessage: Message = {
              id: Date.now().toString() + "-ai",
              role: "assistant",
              content: `Here's more information about ${
                referencedDeveloper.name || referencedDeveloper.login
              }:
              
${referencedDeveloper.bio ? `Bio: ${referencedDeveloper.bio}\n` : ""}
${
  referencedDeveloper.location
    ? `Location: ${referencedDeveloper.location}\n`
    : ""
}
${
  referencedDeveloper.company ? `Company: ${referencedDeveloper.company}\n` : ""
}
${referencedDeveloper.email ? `Email: ${referencedDeveloper.email}\n` : ""}
${referencedDeveloper.blog ? `Blog/Website: ${referencedDeveloper.blog}\n` : ""}
${
  referencedDeveloper.twitter_username
    ? `Twitter: @${referencedDeveloper.twitter_username}\n`
    : ""
}
GitHub: @${referencedDeveloper.login}
Public repositories: ${referencedDeveloper.public_repos}
Followers: ${referencedDeveloper.followers}

${
  referencedDeveloper.topRepositories &&
  referencedDeveloper.topRepositories.length > 0
    ? `Top repositories:
${referencedDeveloper.topRepositories
  .map(
    (repo: RepoType, i: number) =>
      `${i + 1}. ${repo.name}${
        repo.description ? ` - ${repo.description}` : ""
      }${repo.language ? ` (${repo.language})` : ""} - ⭐ ${repo.stars}`
  )
  .join("\n")}`
    : ""
}

You can view their full profile by clicking the "View Profile" button.`,
              timestamp: new Date(),
              developers: [referencedDeveloper],
              suggestions: generateSuggestions(
                `Here's more information about ${
                  referencedDeveloper.name || referencedDeveloper.login
                }`,
                [referencedDeveloper]
              ),
            };

            setMessages((prev) => [...prev, aiMessage]);
            setIsLoading(false);
            return;
          }
        } else if (username) {
          const existingDevIndex = lastFoundDevelopers.findIndex(
            (dev) => dev.login.toLowerCase() === username.toLowerCase()
          );

          if (existingDevIndex >= 0) {
            const existingDev = lastFoundDevelopers[existingDevIndex];
            if (existingDev.isBasicInfo) {
              await handleGetDetailedProfile(
                existingDev.login,
                existingDevIndex
              );
            } else {
              const aiMessage: Message = {
                id: Date.now().toString() + "-ai",
                role: "assistant",
                content: `Here's the information about ${
                  existingDev.name || existingDev.login
                }:
                
${existingDev.bio ? `Bio: ${existingDev.bio}\n` : ""}
${existingDev.location ? `Location: ${existingDev.location}\n` : ""}
${existingDev.company ? `Company: ${existingDev.company}\n` : ""}
GitHub: @${existingDev.login}
${
  existingDev.public_repos
    ? `Public repositories: ${existingDev.public_repos}\n`
    : ""
}
${existingDev.followers ? `Followers: ${existingDev.followers}` : ""}`,
                timestamp: new Date(),
                developers: [existingDev],
                suggestions: generateSuggestions(
                  `Here's the information about ${
                    existingDev.name || existingDev.login
                  }`,
                  [existingDev]
                ),
              };

              setMessages((prev) => [...prev, aiMessage]);
            }
            setIsLoading(false);
            return;
          } else {
            await handleGetDetailedProfile(username, -1);
            return;
          }
        }
      }

      const personName = isPersonSearchRequest(messageText);

      if (personName) {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageText,
            history: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            searchPerson: personName,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();
        const foundDevelopers = data.developers || [];

        if (foundDevelopers.length > 0) {
          setLastFoundDevelopers(foundDevelopers);
        }

        const suggestions = generateSuggestions(data.text, foundDevelopers);

        const aiMessage: Message = {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: data.text,
          timestamp: new Date(),
          developers: foundDevelopers,
          suggestions: suggestions,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      const isLocationSearch = isLocationBasedSearch(messageText);
      const shouldSearchDevelopers = isDeveloperSearchRequest(messageText);

      if (isLocationSearch && shouldSearchDevelopers) {
        try {
          const locationLoadingMessage: Message = {
            id: Date.now().toString() + "-location-loading",
            role: "assistant",
            content: "Detecting your location to find developers nearby...",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, locationLoadingMessage]);

          const locationData = await getLocationByIp();

          const userLocation = locationData.city
            ? `${locationData.city}${
                locationData.country ? ", " + locationData.country : ""
              }`
            : locationData.country || "";

          if (!userLocation) {
            throw new Error("Could not determine your location");
          }

          const response = await fetch("/api/ai-chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: `Find developers in ${userLocation}`,
              history: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              searchDevelopers: true,
              userLocation: userLocation,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to get response");
          }

          const data = await response.json();
          const foundDevelopers = data.developers || [];

          if (foundDevelopers.length > 0) {
            setLastFoundDevelopers(foundDevelopers);
          }

          const suggestions = generateSuggestions(data.text, foundDevelopers);

          setMessages((prev) =>
            prev.filter((msg) => msg.id !== locationLoadingMessage.id)
          );

          const aiMessage: Message = {
            id: Date.now().toString() + "-ai",
            role: "assistant",
            content: `Based on your location (${userLocation}), ${data.text}`,
            timestamp: new Date(),
            developers: foundDevelopers,
            suggestions: suggestions,
          };

          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Error detecting location:", error);

          setMessages((prev) =>
            prev.filter((msg) => !msg.id.includes("-location-loading"))
          );

          const errorMessage: Message = {
            id: Date.now().toString() + "-location-error",
            role: "assistant",
            content:
              "I couldn't detect your location. Please try specifying a location, like 'Find developers in New York'.",
            timestamp: new Date(),
            suggestions: [
              "Find developers in New York",
              "Find JavaScript developers",
              "Search for programmers in London",
            ],
          };

          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
      }

      if (shouldSearchDevelopers) {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageText,
            history: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            searchDevelopers: shouldSearchDevelopers,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();
        const foundDevelopers = data.developers || [];

        if (foundDevelopers.length > 0) {
          setLastFoundDevelopers(foundDevelopers);
        }

        const suggestions = generateSuggestions(data.text, foundDevelopers);

        const aiMessage: Message = {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: data.text,
          timestamp: new Date(),
          developers: foundDevelopers,
          suggestions: suggestions,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          history: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          searchDevelopers: false,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const rateLimitInfo = await response.json().catch(() => ({}));
          throw new Error(
            `Rate limit exceeded. Please try again in a few minutes. ${
              rateLimitInfo.error ||
              "You can make more requests in about 10 minutes."
            }`
          );
        }
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const suggestions = generateSuggestions(data.text, []);

      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: data.text,
        timestamp: new Date(),
        developers: [],
        suggestions: suggestions,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing AI response:", error);

      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
        suggestions: [
          "Try a different search",
          "Find developers near me",
          "Help me troubleshoot",
        ],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] sm:h-[calc(100vh-18rem)] md:h-[calc(100vh-20rem)]">
      <Card className="flex-1 overflow-hidden flex flex-col rounded-xl shadow-lg border-opacity-50">
        <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 md:space-y-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/20 flex-shrink-0">
                  {message.role === "user" ? (
                    session?.user?.image ? (
                      <AvatarImage
                        src={session.user.image || "/placeholder.svg"}
                        alt="User"
                      />
                    ) : (
                      <AvatarFallback>
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      </AvatarFallback>
                    )
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div
                    className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm sm:text-[15px]">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>

                    {message.developers && message.developers.length > 0 && (
                      <div className="mt-3 sm:mt-4 md:mt-5 space-y-3 sm:space-y-4">
                        <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                          <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                          Developers Found:
                        </h4>
                        {message.developers.map((dev, index) => (
                          <div
                            key={dev.id}
                            className="p-2 sm:p-3 md:p-4 bg-background rounded-xl flex flex-col items-start gap-2 sm:gap-3 md:gap-4 shadow-sm hover:shadow-md transition-shadow border border-primary/10"
                          >
                            <div className="w-full flex items-start gap-2 sm:gap-3">
                              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl border-2 border-primary/20 flex-shrink-0">
                                <AvatarImage
                                  src={dev.avatar_url || "/placeholder.svg"}
                                  alt={dev.login}
                                  className="rounded-xl"
                                />
                                <AvatarFallback className="rounded-xl text-base sm:text-lg">
                                  {dev.login.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row justify-between items-start gap-1 sm:gap-3">
                                  <div className="w-full sm:w-auto">
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                      <p className="font-semibold text-base sm:text-lg truncate">
                                        {index + 1}. {dev.name || dev.login}
                                      </p>
                                      {dev.company && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-none"
                                        >
                                          {dev.company}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 truncate">
                                      @{dev.login}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-1 sm:gap-2">
                                    <Link
                                      href={dev.html_url}
                                      target="_blank"
                                      className="text-[10px] sm:text-xs bg-muted hover:bg-muted/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-1"
                                    >
                                      <Github className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                      GitHub
                                    </Link>
                                    <Link
                                      href={`/user/${dev.id}`}
                                      className="text-[10px] sm:text-xs bg-primary/10 hover:bg-primary/20 text-primary font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-md flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                      View Profile
                                    </Link>
                                    {dev.isBasicInfo && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-[10px] sm:text-xs h-5 sm:h-6 px-2 sm:px-3 py-0 sm:py-1 rounded-md flex items-center gap-1"
                                        onClick={() =>
                                          handleGetDetailedProfile(
                                            dev.login,
                                            index
                                          )
                                        }
                                        disabled={isLoading}
                                      >
                                        <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                        Get Details
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {dev.bio && (
                                  <p className="text-xs sm:text-sm my-1 sm:my-2 line-clamp-2 sm:line-clamp-none">
                                    {dev.bio}
                                  </p>
                                )}

                                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                                  {dev.public_repos > 0 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] sm:text-xs"
                                    >
                                      {dev.public_repos} Repositories
                                    </Badge>
                                  )}
                                  {dev.followers > 0 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] sm:text-xs"
                                    >
                                      {dev.followers} Followers
                                    </Badge>
                                  )}
                                  {dev.location && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-none"
                                    >
                                      📍 {dev.location}
                                    </Badge>
                                  )}
                                  {dev.topRepositories
                                    ?.slice(0, 2)
                                    .map((repo: RepoType) => (
                                      <Badge
                                        key={repo.name}
                                        variant="outline"
                                        className="text-[10px] sm:text-xs hidden sm:inline-flex"
                                      >
                                        {repo.language || "Code"}
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            </div>

                            {dev.topRepositories &&
                              dev.topRepositories.length > 0 && (
                                <div className="w-full mt-1 sm:mt-2 md:mt-3">
                                  <p className="text-[10px] sm:text-xs font-medium mb-1">
                                    Top repositories:
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                                    {dev.topRepositories
                                      .slice(0, 2)
                                      .map((repo: RepoType) => (
                                        <Link
                                          href={repo.url}
                                          target="_blank"
                                          key={repo.name}
                                          className="text-[10px] sm:text-xs bg-background p-1.5 sm:p-2 rounded-md border border-primary/5 hover:border-primary/20 transition-colors"
                                        >
                                          <div className="font-medium truncate">
                                            {repo.name}
                                          </div>
                                          {repo.description && (
                                            <div className="text-muted-foreground line-clamp-1 text-[8px] sm:text-[10px] mt-0.5 sm:mt-1">
                                              {repo.description}
                                            </div>
                                          )}
                                          <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                                            {repo.language && (
                                              <span className="bg-muted text-[8px] sm:text-[10px] px-1 rounded">
                                                {repo.language}
                                              </span>
                                            )}
                                            <span className="text-[8px] sm:text-[10px] flex items-center">
                                              ⭐ {repo.stars}
                                            </span>
                                          </div>
                                        </Link>
                                      ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}

                    {message.repositories && message.repositories.length > 0 && (
                      <div className="mt-3 sm:mt-4 md:mt-5 space-y-3 sm:space-y-4">
                        <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                          <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                          Repositories Found:
                        </h4>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                          {message.repositories.map((repo, index) => (
                            <div
                              key={repo.id}
                              className="p-3 sm:p-4 bg-background rounded-xl flex flex-col items-start gap-2 sm:gap-3 border border-primary/10 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                            >
                              {/* Background gradient effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              
                              {/* Repository number badge */}
                              <div className="absolute top-2 right-2 bg-primary/10 text-primary rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-[10px] sm:text-xs font-medium">
                                {index + 1}
                              </div>
                              
                              <div className="w-full flex flex-col sm:flex-row items-start gap-2 sm:gap-3 z-10">
                                {/* Owner avatar */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg border-2 border-primary/20 flex-shrink-0">
                                    <AvatarImage
                                      src={repo.owner?.avatar_url || "/placeholder.svg"}
                                      alt={repo.owner?.login || "Owner"}
                                      className="rounded-lg"
                                    />
                                    <AvatarFallback className="rounded-lg text-xs sm:text-sm">
                                      {repo.owner?.login?.substring(0, 2).toUpperCase() || "GH"}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                
                                {/* Repository main info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                                      <p className="font-semibold text-base sm:text-lg truncate">
                                        {repo.name}
                                      </p>
                                      {repo.language && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] sm:text-xs bg-primary/5"
                                        >
                                          {repo.language}
                                        </Badge>
                                      )}
                                      {repo.license && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] sm:text-xs"
                                        >
                                          {repo.license}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                      {repo.full_name}
                                    </p>
                                    
                                    {repo.description && (
                                      <p className="text-xs sm:text-sm my-1 sm:my-2 line-clamp-2">
                                        {repo.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Repository stats */}
                              <div className="flex flex-wrap gap-2 sm:gap-3 z-10 w-full">
                                <div className="flex items-center text-xs text-muted-foreground gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                                  </svg>
                                  <span>{repo.stargazers_count || 0}</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                                    <path d="M8.75 1.75a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" />
                                    <path d="M8 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-1.5A1.5 1.5 0 1 1 8 2.5 1.5 1.5 0 0 1 8 5.5Z" />
                                    <path d="M7.75 8.766a.997.997 0 0 1 .496-.124.997.997 0 0 1 .496.124c.177.09.348.196.505.32a8.004 8.004 0 0 1 4.308 2.71c.538.684.93 1.485 1.153 2.347a.75.75 0 0 1-.722.943H2.014a.75.75 0 0 1-.722-.943 8.001 8.001 0 0 1 5.46-5.057 3 3 0 0 0 .505-.32.997.997 0 0 1 .496-.124H7.75Z" />
                                  </svg>
                                  <span>{repo.watchers_count || 0}</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                                    <path d="M3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25-9.5a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5Zm-8.25 6a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM3 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 6Zm9 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
                                  </svg>
                                  <span>{repo.forks_count || 0}</span>
                                </div>
                                {repo.created_at && (
                                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                                      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z" />
                                    </svg>
                                    <span>{new Date(repo.created_at).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Topics */}
                              {repo.topics && repo.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1 sm:gap-2 z-10 mt-1">
                                  {repo.topics.slice(0, 5).map((topic: string) => (
                                    <Badge 
                                      key={topic} 
                                      variant="secondary"
                                      className="text-[9px] sm:text-[10px] bg-secondary/50 hover:bg-secondary/60 transition-colors"
                                    >
                                      {topic}
                                    </Badge>
                                  ))}
                                  {repo.topics.length > 5 && (
                                    <Badge variant="outline" className="text-[9px] sm:text-[10px]">
                                      +{repo.topics.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                              
                              {/* Language percentages */}
                              {repo.language_percentages && repo.language_percentages.length > 0 && (
                                <div className="w-full z-10 mt-1">
                                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                                    {repo.language_percentages.map((lang: any, i: number) => {
                                      // Generate a color based on language name
                                      const colors = ["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400", "bg-pink-400", "bg-indigo-400"];
                                      const colorIndex = lang.language.charCodeAt(0) % colors.length;
                                      return (
                                        <div 
                                          key={`${lang.language}-${i}`}
                                          className={`h-full ${colors[colorIndex]}`}
                                          style={{ width: `${lang.percentage}%` }}
                                          title={`${lang.language}: ${lang.percentage}%`}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Links and actions */}
                              <div className="flex flex-wrap gap-1 sm:gap-2 z-10 mt-1 sm:mt-2">
                                <Link
                                  href={repo.html_url}
                                  target="_blank"
                                  className="text-[10px] sm:text-xs bg-primary/5 hover:bg-primary/10 px-2 sm:px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                                >
                                  <Github className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  View Repository
                                </Link>
                                <Link
                                  href={`${repo.html_url}/issues`}
                                  target="_blank"
                                  className="text-[10px] sm:text-xs bg-muted hover:bg-muted/80 px-2 sm:px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 sm:w-3.5 sm:h-3.5">
                                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm5.75-2.75a.75.75 0 0 1 1.5 0v2.708l1.72 1.72a.75.75 0 0 1-1.06 1.062l-2-1.999a.75.75 0 0 1-.22-.53V5.25Z" />
                                  </svg>
                                  Issues
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-[10px] sm:text-xs h-6 sm:h-7 px-2 sm:px-3 py-0 sm:py-1 rounded-md flex items-center gap-1"
                                  onClick={() => handleSuggestionClick(`Find repositories similar to ${repo.name}`)}
                                  disabled={isLoading}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 sm:w-3.5 sm:h-3.5">
                                    <path d="M3.75 1.5a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-4a.75.75 0 0 1 1.5 0v4A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25V1.75C2 .784 2.784 0 3.75 0h8.5C13.216 0 14 .784 14 1.75v.5a.75.75 0 0 1-1.5 0v-.5a.25.25 0 0 0-.25-.25h-8.5Z" />
                                    <path d="m9.018 3.5 1.359-1.359a.75.75 0 0 1 1.06 1.061L10.079 4.56l1.359 1.359a.75.75 0 0 1-1.06 1.06l-1.36-1.358-1.358 1.359a.75.75 0 0 1-1.061-1.06l1.359-1.36-1.359-1.359a.75.75 0 0 1 1.06-1.06L9.018 3.5Z" />
                                  </svg>
                                  Find Similar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-[10px] sm:text-xs h-6 sm:h-7 px-2 sm:px-3 py-0 sm:py-1 rounded-md flex items-center gap-1"
                                  onClick={() => handleSuggestionClick(`Tell me more about ${repo.full_name}`)}
                                  disabled={isLoading}
                                >
                                  <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  More Details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {message.role === "assistant" &&
                    message.suggestions &&
                    message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.suggestions.map((suggestion, idx) => (
                          <Button
                            key={`${message.id}-suggestion-${idx}`}
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs bg-background hover:bg-background/80 border border-primary/20 py-1 px-3 h-auto flex items-center gap-1.5 transition-colors"
                            onClick={() => handleSuggestionClick(suggestion)}
                            disabled={isLoading}
                          >
                            <MessageCircle className="h-3 w-3 text-primary/60" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 sm:gap-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-3 bg-muted flex items-center">
                  <span className="inline-flex mr-2 sm:mr-3 md:mr-4">
                    <div className="flex items-center space-x-1">
                      <span className="inline-block bg-primary/50 rounded-full h-2 w-2 animate-[bounce_1s_infinite]"></span>
                      <span className="inline-block bg-primary/50 rounded-full h-2 w-2 animate-[bounce_1s_infinite] [animation-delay:0.3s]"></span>
                      <span className="inline-block bg-primary/50 rounded-full h-2 w-2 animate-[bounce_1s_infinite] [animation-delay:0.6s]"></span>
                    </div>
                  </span>
                  <span className="ml-2 text-xs sm:text-sm">
                    {loadingMessage}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      <form
        onSubmit={(e) => handleSendMessage(e)}
        className="mt-2 sm:mt-3 md:mt-4 flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to find developers for you..."
          disabled={isLoading}
          className="flex-1 rounded-xl py-4 sm:py-5 md:py-6 px-3 sm:px-4 shadow-sm focus-visible:ring-2 text-sm sm:text-base"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-xl px-3 sm:px-4 md:px-5 h-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
          ) : (
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}
