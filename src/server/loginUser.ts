/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"


import { parse } from "cookie";
import jwt, { JwtPayload } from 'jsonwebtoken';

import { redirect } from "next/navigation";

import z from "zod";


import { setCookie } from "@/ForProxy/getCookie";
import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/auth-utils";
import { nomad } from "@/env.auto";

const loginValidationZodSchema = z.object({
    email: z.email({
        message: "Email is required",
    }),
    password: z.string("Password is required").min(6, {
        error: "Password is required and must be at least 6 characters long",
    }).max(100, {
        error: "Password must be at most 100 characters long",
    }),
});

export const loginUser = async (_currentState: any, formData: any): Promise<any> => {
    try {
        const redirectTo = formData.get('redirect') || null;
        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
        }

        const validatedFields = loginValidationZodSchema.safeParse(loginData);

        if (!validatedFields.success) {
            return {
                success: false,
                errors: validatedFields.error.issues.map(issue => {
                    return {
                        field: issue.path[0],
                        message: issue.message,
                    }
                })
            }
        }

        const baseUrl = nomad.NEXT_PUBLIC_API_URL;

        const res = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData)
        });

        const result = await res.json()


        const rawSetCookie: string[] = (() => {
            try {

                const h: any = res.headers;
                if (h && typeof h.getSetCookie === "function") {
                    const arr = h.getSetCookie();
                    if (Array.isArray(arr)) return arr;
                }
            } catch (e) { }

            const header = res.headers.get("set-cookie") || res.headers.get("Set-Cookie");
            if (!header) return [];

            return Array.isArray(header)
                ? header
                : header.split(/,(?=\s*[^\s=]+=)/).map((s) => s.trim());
        })();

        if (rawSetCookie.length > 0) {
            rawSetCookie.forEach((cookie: string) => {
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


        await setCookie("accessToken", accessTokenObject.accessToken, {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || 60 * 60 * 24,
            path: accessTokenObject.Path || "/",
            sameSite: "lax",
        });

        await setCookie("refreshToken", refreshTokenObject.refreshToken, {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject['Max-Age']) || 60 * 60 * 24 * 90,
            path: refreshTokenObject.Path || "/",
            sameSite: "lax",
        });
        const verifiedToken: JwtPayload | string = jwt.verify(accessTokenObject.accessToken, nomad.JWT_ACCESS_SECRET as string);

        if (typeof verifiedToken === "string") {
            throw new Error("Invalid token");

        }

        const userRole: UserRole = verifiedToken.role;

        if (!result.success) {
            throw new Error(result.message || "login failed")
        }


        if (redirectTo) {
            const requestedPath = redirectTo.toString();
            if (isValidRedirectForRole(requestedPath, userRole)) {
                redirect(`${requestedPath}?loggedIn=true`);
            } else {
                redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);
            }
        } else {
            redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);
        }

    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        if (process.env.NODE_ENV === 'development') {
            console.error("Login error:", error);
        }
        return { success: false, message: `${process.env.NODE_ENV === 'development' ? error.message : "Registration Failed. Please try again."}` };
    }
}