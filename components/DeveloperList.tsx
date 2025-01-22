import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

interface Developer {
  login: string
  html_url: string
  avatar_url: string
}

interface DeveloperListProps {
  developers: Developer[]
  isLoading: boolean
}

export default function DeveloperList({ developers, isLoading }: DeveloperListProps) {
  if (isLoading) {
    return <div className="text-center mt-4">Loading developers...</div>
  }

  if (developers.length === 0) {
    return <div className="text-center mt-4">No developers found for this location.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {developers.map((developer) => (
        <Card key={developer.login}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image
              width={32}
              height={32}
                src={developer.avatar_url || "/placeholder.svg"}
                alt={developer.login}
                className="w-8 h-8 rounded-full"
              />
              {developer.login}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={developer.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-500 hover:underline"
            >
              Visit Profile <ExternalLink size={16} />
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

