import { useState, FormEvent, InputHTMLAttributes, ButtonHTMLAttributes, ReactNode, SyntheticEvent } from "react";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { apiService } from "@/lib/apiService";

// --- Minimal shadcn/ui-style primitives (Tailwind core utilities only) ---

type ButtonVariant = "default" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children?: ReactNode;
}

function Button({ className = "", variant = "default", disabled, children, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 w-full";
  const variants: Record<ButtonVariant, string> = {
    default: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

function Input({ className = "", error, ...props }: InputProps) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border ${
        error ? "border-red-400 focus-visible:ring-red-400" : "border-slate-200 focus-visible:ring-slate-400"
      } bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
}

function Label({ className = "", children, ...props }: LabelProps) {
  return (
    <label className={`text-sm font-medium leading-none text-slate-700 ${className}`} {...props}>
      {children}
    </label>
  );
}

interface CardProps {
  className?: string;
  children?: ReactNode;
}

function Card({ className = "", children }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
  );
}


const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

type Status = "idle" | "loading" | "sent";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState<string>("");
  const [touched, setTouched] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const emailIsValid = isValidEmail(email);
  const showError = touched && !emailIsValid;

  async function handleSubmit(e:SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    if (!emailIsValid) return;
 
    setStatus("loading");
    setError("");

    await apiService.auth.forgotPassword({ email });

    setStatus("sent");
  }

  function handleResend() {
    setStatus("loading");
    setTimeout(() => setStatus("sent"), 700);
  }

  return (
    <div className="min-h-[520px] w-full flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm">
        <Card className="p-8">
          {status !== "sent" ? (
            <>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900">
                  <KeyRound className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-900">Forgot your password?</h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Enter the email linked to your account and we will send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={email}
                      error={showError}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      autoComplete="email"
                      disabled={status === "loading"}
                    />
                  </div>
                  {showError && (
                    <p className="text-xs text-red-500">Enter a valid email address.</p>
                  )}
                  {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                <Button type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Sending link..." : "Send reset link"}
                </Button>
              </form>

              <a
                href="#"
                className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </a>
            </>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <h1 className="text-lg font-semibold text-slate-900">Check your inbox</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                We sent a reset link to <span className="font-medium text-slate-700">{email}</span>.
                It will expire in 15 minutes.
              </p>

              <Button
                variant="ghost"
                className="mt-6"
                onClick={handleResend}
              >
                Did not get it? Resend
              </Button>

              <a
                href="#"
                className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}