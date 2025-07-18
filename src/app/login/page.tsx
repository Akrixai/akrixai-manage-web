"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const HARDCODED_USER = "admin";
const HARDCODED_PASS = "akrix@2024";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (username === HARDCODED_USER && password === HARDCODED_PASS) {
        localStorage.setItem("akrix_session", "1");
        router.push("/");
      } else {
        setError("Invalid username or password");
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] animate-fadein">
      <div className="bg-[var(--surface)] border-2 border-[var(--accent)] rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-8 w-full max-w-md animate-fadein">
        <span className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 shadow-xl border-4 border-[var(--accent)] -mt-20 mb-2">
          <Image src="/logo.jpeg" alt="Akrix AI Logo" width={72} height={72} className="rounded-xl" />
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-white text-center font-sans drop-shadow-lg" style={{letterSpacing: "-0.03em"}}>
          Akrix <span className="text-[var(--accent)]">AI</span> Management
        </h1>
        <p className="text-lg text-white/90 text-center mb-2">Sign in to your portal</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <label className="font-semibold text-white">Username</label>
          <input
            className="border-2 border-[var(--accent)] rounded-lg px-4 py-3 text-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-white/70"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            placeholder="Enter username"
            disabled={loading}
          />
          <label className="font-semibold text-white">Password</label>
          <div className="relative flex items-center">
            <input
              className="border-2 border-[var(--accent)] rounded-lg px-4 py-3 text-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-white/70 w-full"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
            />
            <button type="button" className="absolute right-3 text-[var(--accent)] font-bold text-lg" tabIndex={-1} onClick={() => setShowPassword(v => !v)}>{showPassword ? "🙈" : "👁️"}</button>
          </div>
          {error && <div className="text-[var(--danger)] text-base mt-2 text-center animate-shake font-semibold">{error}</div>}
          <button
            type="submit"
            className="mt-4 bg-[var(--accent)] text-white rounded-lg px-4 py-3 text-lg font-bold hover:bg-[var(--primary)] transition-colors shadow-md disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
      <footer className="mt-10 text-white/80 text-sm text-center animate-fadein">
        &copy; {new Date().getFullYear()} Akrix AI Management. All rights reserved.
      </footer>
      <style jsx global>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fadein { animation: fadein 0.8s cubic-bezier(.4,0,.2,1); }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
    </div>
  );
} 