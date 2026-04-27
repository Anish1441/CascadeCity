"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌡️</div>
          <h1 className="text-3xl font-bold text-emerald-400">CascadeCity</h1>
          <p className="text-slate-400 mt-1">Maharashtra Heat &amp; Agricultural Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {step === "phone" ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Sign In</h2>
              <p className="text-slate-400 text-sm mb-6">
                Enter your mobile number to receive a one-time password
              </p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 placeholder:text-slate-500"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  {loading ? "Sending OTP…" : "Send OTP →"}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setStep("phone");
                  setError("");
                  setDevOtp("");
                  setOtp("");
                }}
                className="text-slate-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
              <h2 className="text-xl font-semibold text-white mb-1">Enter OTP</h2>
              <p className="text-slate-400 text-sm mb-1">
                OTP sent to{" "}
                <span className="text-slate-300 font-medium">{phone}</span>
              </p>

              {devOtp && process.env.NODE_ENV !== "production" && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-3">
                  <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-1">
                    ⚠️ Development Mode — OTP not delivered via SMS
                  </p>
                  <p className="text-amber-300 text-xs">
                    This OTP is only visible because Twilio is not configured.{" "}
                    <span className="text-red-400 font-medium">
                      This screen must never appear in production.
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="mt-2 font-bold text-2xl text-amber-400 font-mono tracking-[0.4em] hover:text-amber-300 transition-colors"
                    aria-label="Click to autofill OTP"
                  >
                    {devOtp}
                  </button>
                  <p className="text-amber-600 text-xs mt-0.5">(click to fill)</p>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1.5">
                    6-Digit OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="••••••"
                    maxLength={6}
                    required
                    className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 placeholder:tracking-normal placeholder:text-slate-500"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  {loading ? "Verifying…" : "Verify & Sign In ✓"}
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
                >
                  Resend OTP
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          CascadeCity · Maharashtra Government Platform
        </p>
      </div>
    </div>
  );
}
