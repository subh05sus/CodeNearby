/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")

  if (!location) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.github.com/search/users?q=location:${encodeURIComponent(location)}&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      },
    )

    const data = await response.json()
    const developers = await Promise.all(
      data.items.map(async (user: any) => {
        const userResponse = await fetch(user.url, {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        })
        return await userResponse.json()
      }),
    )

    return NextResponse.json(developers)
  } catch (error) {
    console.error("Error fetching developers:", error)
    return NextResponse.json({ error: "Error fetching developers" }, { status: 500 })
  }
}

