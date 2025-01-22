/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import io from "socket.io-client"

export default function MessagingUser() {
  const { data: session } = useSession()
  const params = useParams()
  interface Message {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
  }
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [socket, setSocket] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session && params.userId) {
      const newSocket = io("http://localhost:5000", {
        query: { userId: session?.user?.id },
      })
      setSocket(newSocket)

      newSocket.on("message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message])
      })

      fetchMessages()

      return () => {
        newSocket.close()
      }
    }
  }, [session, params.userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/messages?userId=${session.user.id}&friendId=${params.userId}`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = (e:any) => {
    e.preventDefault()
    if (!session?.user?.id) return;
    if (inputMessage.trim() && socket) {
      const message = {
        senderId: session.user.id,
        receiverId: Array.isArray(params.userId) ? params.userId[0] : params.userId,
        content: inputMessage,
        timestamp: new Date(),
      }
      socket.emit("sendMessage", message)
      setMessages((prevMessages) => [...prevMessages, message])
      setInputMessage("")
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (!session) {
    return <p>Please sign in to view messages.</p>
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Conversation</h1>
      <div className="flex-grow overflow-y-auto mb-4 bg-gray-100 rounded-lg p-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.senderId === session?.user?.id ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block p-2 rounded-lg ${message.senderId === session?.user?.id ? "bg-blue-500 text-white" : "bg-white"}`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">{new Date(message.timestamp).toLocaleString()}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow mr-2 p-2 border rounded-lg"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Send
        </button>
      </form>
    </div>
  )
}

