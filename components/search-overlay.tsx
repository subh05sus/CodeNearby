import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SearchOverlayProps {
  onClose: () => void
  onSearch: (query: string) => void
}

export function SearchOverlay({ onClose, onSearch }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search for developers or posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-10 text-lg py-6"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

