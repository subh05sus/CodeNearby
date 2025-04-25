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
        "Hello! I can help you find developers based on location, skills, or interests. Just ask me anything!",
      timestamp: new Date(),
      suggestions: [
        "Find React developers in New York",
        "Who are the top Python developers?",
        "Do you know Subhadip Saha?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Searching...");
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
    const searchTerms = [
      "find",
      "search",
      "locate",
      "look for",
      "discover",
      "developers",
      "programmers",
      "coders",
      "engineers",
      "who knows",
      "who can",
      "expert in",
      "skilled in",
      "specializes in",
    ];

    message = message.toLowerCase();

    return searchTerms.some((term) => message.includes(term.toLowerCase()));
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
        return { isReference: true, index: -1, username: match[1] };
      }
    }

    return { isReference: false, index: -1, username: null };
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
      if (messageText.includes("@")) {
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
        setLoadingMessage("Searching...");
      }

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
                    <span className="animate-bounce inline-block">.</span>
                    <span className="animate-bounce inline-block delay-150">
                      .
                    </span>
                    <span className="animate-bounce inline-block delay-300">
                      .
                    </span>
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
          className="rounded-xl px-3 sm:px-4 md:px-5"
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
