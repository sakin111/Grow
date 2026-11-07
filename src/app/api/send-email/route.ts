import { timingSafeEqual } from "node:crypto"
import nodemailer from "nodemailer"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.EMAIL_PORT!),
  secure: true,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASSWORD!,
  },
})

const emailSchema = z.object({
  to: z.email(),
  subject: z.string().min(1).max(200),
  html: z
    .string()
    .min(1)
    .refine((value) => Buffer.byteLength(value, "utf8") <= 200 * 1024),
})

export async function POST(request: Request) {
  const mailSecret = process.env.MAIL_API_SECRET
  if (!mailSecret) {
    return Response.json({ message: "Email service is not configured" }, { status: 500 })
  }

  const providedSecret = request.headers.get("x-mail-secret")
  if (!providedSecret) {
    return Response.json({ message: "Unauthorized" }, { status: 401 })
  }

  const expectedBuffer = Buffer.from(mailSecret, "utf8")
  const providedBuffer = Buffer.from(providedSecret, "utf8")
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ message: "Invalid request" }, { status: 400 })
  }

  const parsedPayload = emailSchema.safeParse(payload)
  if (!parsedPayload.success) {
    return Response.json({ message: "Invalid request" }, { status: 400 })
  }

  const { to, subject, html } = parsedPayload.data

  try {
    await transporter.sendMail({
      from: `Grow <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Email send failed:", error)
    return Response.json({ message: "Failed to send" }, { status: 500 })
  }
}
