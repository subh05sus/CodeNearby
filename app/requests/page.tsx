"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Requests() {
  const { data: session } = useSession()
  const [sentRequests, setSentRequests] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])

  useEffect(() => {
    if (session) {
      fetchRequests()
    }
  }, [session])

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/requests?userId=${session?.user.id}`)
      const data = await response.json()
      setSentRequests(data.sentRequests)
      setReceivedRequests(data.receivedRequests)
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Connection Requests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Sent Requests</CardTitle>
            <CardDescription>Developers you've requested to connect with</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sentRequests.map((request: any) => (
                <li key={request.id} className="p-2 bg-secondary rounded-md">
                  {request.login}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Received Requests</CardTitle>
            <CardDescription>Developers who want to connect with you</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {receivedRequests.map((request: any) => (
                <li key={request.id} className="p-2 bg-secondary rounded-md">
                  {request.login}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

