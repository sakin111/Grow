/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import z from "zod";
import { nomad } from "@/env.auto";
import { RegisterState } from "@/types/registration";


const registerValidationZodSchema = z
    .object({
        name: z.string().min(1, { message: "Name is required" }),
        email: z.email({ message: "Valid email is required" }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters" })
            .max(100, { message: "Password too long" }),
        confirmPassword: z.string().min(6, {
            message: "Confirm Password is required",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const registerUser = async (
    _currentState: RegisterState,
    formData: FormData
): Promise<RegisterState> => {
    try {
        const registerForm = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
        };

        const validated = registerValidationZodSchema.safeParse(registerForm);

        if (!validated.success) {
            return {
                success: false,
                errors: validated.error.issues.map((i) => ({
                    field: String(i.path[0]),
                    message: i.message,
                })),
            };
        }

        //todo: resolve the typescript error of return type of fetch result

        const res = await fetch(`${nomad.NEXT_PUBLIC_API_URL}/user/createUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerForm),
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
            return {
                success: false,
                message: result.message || "Registration failed",
            };
        }


        return {
            success: true as const,
            email: formData.get("email") as string,
            message: "Account created",
            redirectTo: "/verify-email",
        };

    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

        console.error("Registration error:", error);

        return {
            success: false as const,
            message: "Registration failed",
        };
    }
};