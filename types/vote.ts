export interface Vote {
    userId: string
    postId: string
    type: "up" | "down"
    count: number
  }
  
  