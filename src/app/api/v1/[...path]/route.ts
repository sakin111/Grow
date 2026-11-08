import { NextRequest } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const API_BASE_URL = `${BACKEND_URL.replace(/\/+$/, "").replace(/\/api\/v1$/i, "")}/api/v1`

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {

  const { path } = await params

  const queryString = req.nextUrl.search

  const url = `${API_BASE_URL}/${path.join("/")}${queryString}`

  const requestHeaders = new Headers()
  const contentType = req.headers.get("content-type")
  if (contentType) {
    requestHeaders.set("Content-Type", contentType)
  }
  const cookie = req.headers.get("cookie")
  if (cookie) {
    requestHeaders.set("cookie", cookie)
  }

  const requestInit: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers: requestHeaders,
  }

  if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
    requestInit.body = req.body
    requestInit.duplex = "half"
  }

  // Direct browser-to-API calls need SameSite=None; Secure cookies and credentialed CORS.
  const response = await fetch(url, requestInit)


  const data = await response.text()

  const responseHeaders = new Headers({
    "Content-Type": response.headers.get("content-type") || "application/json",
  })
  for (const cookie of response.headers.getSetCookie()) {
    responseHeaders.append("Set-Cookie", cookie)
  }

  return new Response(data, {
    status: response.status,
    headers: responseHeaders,
  })
}





export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
}