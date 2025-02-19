/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
export const runtime = "edge";

// Font will be loaded from a URL or you can use a base64 encoded string
const poppinsFont = fetch(
  new URL("../../fonts/poppins-regular.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codeText = searchParams.get("title1") || "code";
    const nearbyText = searchParams.get("title2") || "nearby";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: "url(https://codenearby.space/og.png)",
            backgroundSize: "cover",
            color: "#fff",
            textAlign: "center",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: "bold",
              lineHeight: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "80%",
            }}
          >
            {codeText} <span style={{ color: "#ff6600" }}>{nearbyText}</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Poppins",
            data: await poppinsFont,
            style: "normal",
            weight: 700,
          },
        ],
      }
    );
  } catch (e: any) {
    console.error(`${e.message}`);
    return new Response("Failed to generate the image", {
      status: 500,
    });
  }
}
