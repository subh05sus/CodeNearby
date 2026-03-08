/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { RefreshCw, UserPlus } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import Link from "next/link";
import { toast } from "sonner";
import SwissCard from "../swiss/SwissCard";
import SwissButton from "../swiss/SwissButton";
import Image from "next/image";

interface User {
  githubId: any;
  _id: string;
  name: string;
  image: string;
  githubUsername: string;
}

export function NewPeopleToConnect() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/random");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching random users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSendFriendRequest = async (developer: any) => {
    try {
      await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: developer.githubId,
          login: developer.githubUsername,
          avatar_url: developer.image,
          html_url: `https://github.com/${developer.githubUsername}`,
        }),
      });
      toast.success("Friend request sent!");
    } catch {
      toast.error("Failed to send request.");
    }
  };

  return (
    <SwissCard variant="white" pattern="dots" className="h-full">
      <div className="flex justify-between items-center mb-6 border-b-2 border-black dark:border-white pb-2">
        <h2 className="text-xl font-black uppercase tracking-widest text-black dark:text-white">
          Global Discovery
        </h2>
        <SwissButton variant="secondary" size="sm" onClick={fetchUsers} className="w-10 h-10 p-0">
          <RefreshCw className="h-4 w-4" />
        </SwissButton>
      </div>
      <div>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full bg-muted dark:bg-neutral-800 border-2 border-black dark:border-white animate-pulse" />
              ))}
            </div>
          ) : users.length > 0 ? (
            <ul className="space-y-4">
              {users.map((user) => {
                return (
                  <li
                    key={user._id}
                    className="flex items-center justify-between p-4 border-2 border-black dark:border-white bg-white dark:bg-black group hover:bg-muted dark:hover:bg-neutral-900 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative w-12 h-12 border-2 border-black dark:border-white overflow-hidden shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,1)]">
                        <Image
                          src={user.image || "/placeholder.svg"}
                          alt={user.name}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Link href={`/user/${user.githubId}`} className="text-sm font-black uppercase tracking-tight hover:text-swiss-red transition-colors text-black dark:text-white">
                          {user.name}
                        </Link>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:opacity-30 text-black dark:text-white">@{user.githubUsername}</span>
                      </div>
                    </div>
                    <SwissButton
                      variant="accent"
                      size="sm"
                      className="w-10 h-10 p-0"
                      onClick={() => {
                        handleSendFriendRequest(user);
                        const button = document.activeElement as HTMLButtonElement;
                        if (button) {
                          button.disabled = true;
                          button.classList.add('opacity-50', 'grayscale');
                        }
                      }}
                    >
                      <UserPlus className="h-5 w-5" />
                    </SwissButton>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm font-black uppercase tracking-widest opacity-30 dark:opacity-20 italic py-12 border-2 border-dashed border-black/20 dark:border-white/20 text-center text-black dark:text-white">
              NO TARGETS IDENTIFIED
            </p>
          )}
        </ScrollArea>
      </div>
    </SwissCard>
  );
}
