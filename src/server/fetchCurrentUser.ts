/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { getCookie } from "@/ForProxy/getCookie"
import { nomad } from "@/env.auto"


export async function fetchCurrentUser(): Promise<{
  success: boolean
  data?: any
  message?: string
}> {
  try {
    const accessToken = await getCookie("accessToken")

    if (!accessToken) {
      return { success: false, message: "No access token" }
    }

    const response = await fetch(`${nomad.NEXT_PUBLIC_API_URL}/user/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {

      if (response.status === 401) {
        const { getNewAccessToken } = await import("@/ForProxy/getNewAccessToken")
        const refreshResult = await getNewAccessToken()

        if (refreshResult?.tokenRefreshed) {
          const newAccessToken = await getCookie("accessToken")
          if (newAccessToken) {
            const retryResponse = await fetch(`${nomad.NEXT_PUBLIC_API_URL}/user/me`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${newAccessToken}`,
              },
              cache: "no-store",
            })

            if (retryResponse.ok) {
              const retryResult = await retryResponse.json()
              return { success: true, data: retryResult.data }
            }
          }
        }

        return { success: false, message: "Unauthorized" }
      }

      return { success: false, message: `API returned ${response.status}` }
    }

    const result = await response.json()
    return { success: true, data: result.data }
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("fetchCurrentUser error:", error)
    }
    return { success: false, message: error?.message || "Failed to fetch user" }
  }
}
