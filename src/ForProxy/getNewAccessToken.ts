/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { nomad } from "@/env.auto";
import { deleteCookie, getCookie, setCookie } from "./getCookie";
import { verifyAccessToken } from "./verifyAccessToken";
import { parse } from "cookie";


export async function getNewAccessToken() {
    try {
        const accessToken = await getCookie('accessToken');
        const refreshToken = await getCookie('refreshToken');
        if (!accessToken && !refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }
        if (accessToken) {
            const verifiedToken = await verifyAccessToken(accessToken);
            if (verifiedToken.success) {
                return {
                    tokenRefreshed: false,
                }
            }

        }

        if (!refreshToken) {
            return {
                tokenRefreshed: false
            }
        }

        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;


        const response = await fetch(`${nomad.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        const result = await response.json()

        const rawSetCookies: string[] = (() => {
            try {
                const h: any = response.headers;
                if (h && typeof h.getSetCookies === 'function') {
                    const arr = h.getSetCookies()
                    if (Array.isArray(arr)) return arr
                }
            } catch (error) { }
            const header = response.headers.get("set-cookie") || response.headers.get("Set-Cookie");
            if (!header) return [];
            return Array.isArray(header)
                ? header
                : header.split(/,(?=\s*[^\s=]+=)/).map((s) => s.trim());
        })()

        if (rawSetCookies.length > 0) {
            rawSetCookies.forEach((cookie: string) => {
                const parsedCookie = parse(cookie);

                if (parsedCookie["accessToken"]) {
                    accessTokenObject = parsedCookie;
                }
                if (parsedCookie["refreshToken"]) {
                    refreshTokenObject = parsedCookie;
                }
            });
        } else {
            throw new Error("No Set-Cookie header found");
        }

        if (!accessTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        if (!refreshTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        await deleteCookie("accessToken");
        await setCookie("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60 * 24,
            path: accessTokenObject.Path || "/",
            sameSite: accessTokenObject['SameSite'] || "none",
        });

        await deleteCookie("refreshToken");
        await setCookie("refreshToken", refreshTokenObject.refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
            path: refreshTokenObject.Path || "/",
            sameSite: refreshTokenObject['SameSite'] || "none",
        });

        if (!result.success) {
            throw new Error(result.message || "Token refresh failed");
        }


        return {
            tokenRefreshed: true,
            success: true,
            message: "Token refreshed successfully"
        };


    } catch (error: any) {
        return {
            tokenRefreshed: false,
            success: false,
            message: error?.message || "Something went wrong",
        };

    }
}