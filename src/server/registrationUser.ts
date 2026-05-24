/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import z from "zod";
import { loginUser } from "./loginUser";




const registerValidationZodSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email({ message: "Valid email is required" }),
    password: z.string().min(6, {
        error: "Password is required and must be at least 6 characters long",
    }).max(100, {
        error: "Password must be at most 100 characters long",
    }),
    confirmPassword: z.string().min(6, {
        error: "Confirm Password is required and must be at least 6 characters long",
    }),
}).refine((data: any) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
});


export const registerUser = async (_currentState: any, formData: any) : Promise<any> => {
  try {
    const registerForm = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get('confirmPassword') as string
        }  
    

        const validatedField = registerValidationZodSchema.safeParse(registerForm)
            if (!validatedField.success) {
            return {
                success: false,
                errors: validatedField.error.issues.map(issue => {
                    return {
                        field: issue.path[0],
                        message: issue.message,
                    }
                })
            }
        }

         const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;


    const res = await fetch(`${baseUrl}/user/createUser`,{
        method: "POST",
        body: JSON.stringify(registerForm),
        headers: {
            "Content-Type": "application/json",
        },
    })

    const result = await res.json()

       if (result.success) {
         await loginUser(_currentState, formData)
            return {
                success: true,
                message: "Account created! Check your email to verify your account.",
                email: registerForm.email,
            };
        }

    return result
  } catch (error: any) {
    if(error?.digest?.startsWith("NEXT_REDIRECT")){
        throw error
    }
    if (process.env.NODE_ENV === 'development') {
      console.error("Registration error:", error);
    }
    return {error: "Registration failed"}
  }
}