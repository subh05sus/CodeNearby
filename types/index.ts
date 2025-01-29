/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Developer {
  public_repos: any
  followers: any
  id: string
  login: string
  avatar_url: string
  html_url: string
  name?: string
  bio?: string
  location?: string
  email?: string
  githubId?: number
}

export interface FriendRequest {
  _id?: string;
  senderId: string;
  senderGithubId: number;
  senderGithubUsername: string;
  receiverGithubId: number;
  receiverGithubUsername: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  receiver?: {
    id: number;
    login: string;
    avatar_url?: string;
    image?: string;
    html_url: string;
  };
  otherUser?: {
    _id?: string;
    name?: string;
    email?: string;
    image?: string;
    avatar_url?: string;
    emailVerified?: Date | null;
    githubBio?: string | null;
    githubId?: number;
    githubLocation?: string | null;
    githubProfileUrl?: string;
    githubUsername?: string;
  };
  receiverInCodeNearby: boolean;
  otherUserInCodeNearby: boolean;
}


export interface UserProfile extends Developer {
  image: string
  githubId: number
  githubUsername: string
  friends:any[]
  sentRequests: string[]
  receivedRequests: string[]
}


export interface Post {
  _id: string
  userId: string
  content: string
  imageUrl?: string
  createdAt: string
  votes: { up: number; down: number }
  userVotes?: Record<string, number>
  comments: Comment[]
}

export type Comment = {}