import { NextRequest } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {

  const { path } = await params

  const queryString = req.nextUrl.search

  const url = `${BACKEND_URL}/api/v1/${path.join("/")}${queryString}`

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.text()
      : undefined


  const response = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      cookie: req.headers.get("cookie") || "",
    },
    body,
  })


  const data = await response.text()

  const headers = new Headers({
    "Content-Type": response.headers.get("content-type") || "application/json",
  })
  for (const cookie of response.headers.getSetCookie()) {
    headers.append("Set-Cookie", cookie)
  }

  return new Response(data, {
    status: response.status,
    headers,
  })
}





export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
}