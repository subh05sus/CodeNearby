export interface Developer {
    id: string
    login: string
    avatar_url: string
    html_url: string
    name?: string
    bio?: string
    location?: string
  }
  
  export interface FriendRequest {
    _id?: string
    senderId: string
    receiverId: string
    status: "pending" | "accepted" | "rejected"
    createdAt: Date
  }
  
  export interface UserProfile extends Developer {
    friends: string[]
    sentRequests: string[]
    receivedRequests: string[]
  }
  
  