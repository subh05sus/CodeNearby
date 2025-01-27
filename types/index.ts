export interface Developer {
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
    avatar_url: string;
    html_url: string;
  };
  otherUser?: {
    _id?: string;
    name?: string;
    email?: string;
    image?: string;
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
  githubId: number
  friends: string[]
  sentRequests: string[]
  receivedRequests: string[]
}

