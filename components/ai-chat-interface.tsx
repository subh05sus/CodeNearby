/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import ReactMarkdown from "react-markdown";

import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Send,
  User,
  Bot,
  Github,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import SwissButton from "@/components/swiss/SwissButton";
import SwissCard from "@/components/swiss/SwissCard";
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
              content: `Here's more information about ${referencedDeveloper.name || referencedDeveloper.login
                }:
              
${referencedDeveloper.bio ? `Bio: ${referencedDeveloper.bio}\n` : ""}
${referencedDeveloper.location
                  ? `Location: ${referencedDeveloper.location}\n`
                  : ""
                }
${referencedDeveloper.company ? `Company: ${referencedDeveloper.company}\n` : ""
                }
${referencedDeveloper.email ? `Email: ${referencedDeveloper.email}\n` : ""}
${referencedDeveloper.blog ? `Blog/Website: ${referencedDeveloper.blog}\n` : ""}
${referencedDeveloper.twitter_username
                  ? `Twitter: @${referencedDeveloper.twitter_username}\n`
                  : ""
                }
GitHub: @${referencedDeveloper.login}
Public repositories: ${referencedDeveloper.public_repos}
Followers: ${referencedDeveloper.followers}

${referencedDeveloper.topRepositories &&
                  referencedDeveloper.topRepositories.length > 0
                  ? `Top repositories:
${referencedDeveloper.topRepositories
                    .map(
                      (repo: RepoType, i: number) =>
                        `${i + 1}. ${repo.name}${repo.description ? ` - ${repo.description}` : ""
                        }${repo.language ? ` (${repo.language})` : ""} - ⭐ ${repo.stars}`
                    )
                    .join("\n")}`
                  : ""
                }

You can view their full profile by clicking the "View Profile" button.`,
              timestamp: new Date(),
              developers: [referencedDeveloper],
              suggestions: generateSuggestions(
                `Here's more information about ${referencedDeveloper.name || referencedDeveloper.login
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
                content: `Here's the information about ${existingDev.name || existingDev.login
                  }:
                
${existingDev.bio ? `Bio: ${existingDev.bio}\n` : ""}
${existingDev.location ? `Location: ${existingDev.location}\n` : ""}
${existingDev.company ? `Company: ${existingDev.company}\n` : ""}
GitHub: @${existingDev.login}
${existingDev.public_repos
                    ? `Public repositories: ${existingDev.public_repos}\n`
                    : ""
                  }
${existingDev.followers ? `Followers: ${existingDev.followers}` : ""}`,
                timestamp: new Date(),
                developers: [existingDev],
                suggestions: generateSuggestions(
                  `Here's the information about ${existingDev.name || existingDev.login
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
            ? `${locationData.city}${locationData.country ? ", " + locationData.country : ""
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
            `Rate limit exceeded. Please try again in a few minutes. ${rateLimitInfo.error ||
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
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] bg-swiss-white border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 z-10 scrollbar-hide">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={cn(
                "flex flex-col group",
                isUser ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[90%] sm:max-w-[80%] p-6 border-4 border-swiss-black relative transition-all duration-200",
                  isUser
                    ? "bg-swiss-red text-swiss-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                    : "bg-swiss-white text-swiss-black shadow-[8px_8px_0_0_rgba(255,0,0,1)]"
                )}
              >
                {/* Header info in bubble */}
                <div className="flex items-center gap-2 mb-3 border-b-2 border-current/20 pb-2">
                  {isUser ? <User className="h-3 w-3 italic" /> : <Bot className="h-3 w-3 italic" />}
                  <span className="text-[10px] font-black uppercase  italic opacity-60">
                    {isUser ? "CLIENT_INPUT" : "SYSTEM_RESPONSE"}
                  </span>
                </div>

                <div className="text-base sm:text-lg font-bold uppercase tracking-tight leading-tight whitespace-pre-wrap">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>

                {/* Developers Search Results */}
                {message.developers && message.developers.length > 0 && (
                  <div className="mt-8 space-y-6">
                    <h4 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 underline decoration-4 decoration-swiss-red">
                      <Github className="h-6 w-6" /> ENTITIES_DETECTED
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      {message.developers.map((dev, index) => (
                        <div
                          key={dev.id}
                          className="p-6 bg-swiss-black text-swiss-white border-4 border-swiss-white relative group/card"
                        >
                          <div className="flex flex-col sm:flex-row gap-6">
                            <div className="relative shrink-0">
                              <div className="absolute inset-0 bg-swiss-red translate-x-2 translate-y-2 -z-10" />
                              <img
                                src={dev.avatar_url || "/placeholder.svg"}
                                alt={dev.login}
                                className="w-24 h-24 border-4 border-swiss-white grayscale group-hover/card:grayscale-0 transition-all duration-500 object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">
                                    {index + 1}. {dev.name || dev.login}
                                  </h3>
                                  <p className="text-swiss-red font-black uppercase  text-xs">
                                    @{dev.login}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Link href={`/user/${dev.id}`} className="shrink-0">
                                    <SwissButton variant="primary" size="sm" className="bg-swiss-white text-swiss-black hover:bg-swiss-red hover:text-swiss-white border-0 py-1 h-8">
                                      VIEW_PROFILE
                                    </SwissButton>
                                  </Link>
                                  {dev.isBasicInfo && (
                                    <button
                                      className="bg-swiss-red text-swiss-white px-3 py-1 font-black uppercase  text-[10px] hover:invert transition-all"
                                      onClick={() => handleGetDetailedProfile(dev.login, index)}
                                      disabled={isLoading}
                                    >
                                      FETCH_INTEL
                                    </button>
                                  )}
                                </div>
                              </div>

                              {dev.bio && (
                                <p className="text-sm font-bold uppercase tracking-tight opacity-80 border-l-4 border-swiss-red pl-4">
                                  {dev.bio}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-4 pt-2">
                                {dev.location && (
                                  <span className="text-[10px] font-black uppercase  text-swiss-red">
                                    LOC: {dev.location}
                                  </span>
                                )}
                                <span className="text-[10px] font-black uppercase  opacity-60">
                                  REPOS: {dev.public_repos}
                                </span>
                                <span className="text-[10px] font-black uppercase  opacity-60">
                                  NETWORK: {dev.followers}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repositories Search Results */}
                {message.repositories && message.repositories.length > 0 && (
                  <div className="mt-8 space-y-6">
                    <h4 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 underline decoration-4 decoration-swiss-red">
                      <Zap className="h-6 w-6" /> DATA_REPOSITORIES
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      {message.repositories.map((repo) => (
                        <SwissCard
                          key={repo.id}
                          variant="white"
                          className="p-8 border-4 border-swiss-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                          <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-2">
                                <span className="bg-swiss-red text-swiss-white px-2 py-0.5 text-[10px] font-black uppercase ">
                                  {repo.language || "CODE_MODULE"}
                                </span>
                                <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                                  {repo.name}
                                </h3>
                                <p className="text-xs font-bold uppercase  opacity-40">
                                  SOURCE: {repo.full_name}
                                </p>
                              </div>
                              <div className="flex gap-4 font-black italic">
                                <div className="text-center">
                                  <p className="text-2xl leading-none">★</p>
                                  <p className="text-[10px] uppercase ">{repo.stargazers_count}</p>
                                </div>
                              </div>
                            </div>

                            {repo.description && (
                              <p className="text-sm font-bold uppercase tracking-tight leading-snug border-l-8 border-swiss-black pl-6">
                                {repo.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 pt-4 border-t-4 border-swiss-black/10">
                              <Link href={repo.html_url} target="_blank">
                                <SwissButton variant="primary" size="sm" className="h-10 px-6">
                                  EXPLORE_CODE
                                </SwissButton>
                              </Link>
                              <button
                                className="px-6 h-10 border-4 border-swiss-black font-black uppercase  text-[10px] hover:bg-swiss-black hover:text-swiss-white transition-all"
                                onClick={() => handleSuggestionClick(`Find repositories similar to ${repo.name}`)}
                                disabled={isLoading}
                              >
                                CLONE_SIMILAR
                              </button>
                            </div>
                          </div>
                        </SwissCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-8">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={`${message.id}-suggestion-${idx}`}
                        className="bg-swiss-black text-swiss-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-swiss-red transition-all shadow-[4px_4px_0_0_rgba(255,0,0,0.3)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div className={cn(
                  "mt-6 text-[10px] font-black uppercase  opacity-30 italic",
                  isUser ? "text-right" : "text-left"
                )}>
                  {format(message.timestamp, "HH:mm:ss")}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-swiss-muted/20 border-4 border-swiss-black p-6 flex flex-col gap-4 max-w-sm">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-swiss-red" />
                <span className="text-xl font-black uppercase tracking-tighter italic">EXECUTING_QUERY...</span>
              </div>
              <p className="text-[10px] font-bold uppercase  opacity-40">
                {loadingMessage}
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <form
        onSubmit={(e) => handleSendMessage(e)}
        className="p-6 sm:p-10 border-t-8 border-swiss-black bg-swiss-white z-20"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-6">
          <div className="flex-grow relative group">
            <div className="absolute inset-0 bg-swiss-red translate-x-3 translate-y-3 -z-10 group-focus-within:translate-x-1 group-focus-within:translate-y-1 transition-transform" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER_PROMPT_INITIALIZE_SEARCH..."
              disabled={isLoading}
              className="w-full h-20 bg-swiss-white border-8 border-swiss-black px-8 text-2xl font-black uppercase tracking-tighter italic placeholder:text-swiss-black/10 focus:outline-none focus:ring-0"
            />
          </div>
          <SwissButton
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-20 w-full sm:w-48 shadow-[12px_12px_0_0_rgba(0,0,0,1)] text-2xl"
          >
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Send className="h-8 w-8 italic" />
            )}
          </SwissButton>
        </div>
        <div className="max-w-6xl mx-auto mt-6 flex justify-between items-center px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20">
            NEURAL_ENGINE_ACTIVE_V4.0
          </p>
          <div className="flex gap-2">
            <div className="w-12 h-1 bg-swiss-black" />
            <div className="w-12 h-1 bg-swiss-red" />
          </div>
        </div>
      </form>
    </div>
  );
}
