"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const loggedIn = !!localStorage.getItem("akrix_session");
    setIsLoggedIn(loggedIn);
    if (pathname !== "/login" && !loggedIn) {
      window.location.href = "/login";
    }
  }, [pathname]);
  function handleLogout() {
    localStorage.removeItem("akrix_session");
    router.push("/login");
  }
  if (!isLoggedIn && pathname !== "/login") return null;
  return (
    <>
      {pathname !== "/login" && (
        <header className="w-full flex items-center justify-between px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] shadow-lg border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-md border-2 border-[var(--primary-light)]">
              <Image src="/logo.jpeg" alt="Akrix AI Logo" width={44} height={44} className="rounded-full" />
            </span>
            <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg font-sans" style={{letterSpacing: "-0.03em"}}>
              Akrix <span className="text-[var(--accent)]">AI</span> Management
            </span>
          </div>
          <nav className="flex gap-6 text-white font-semibold text-lg">
            <Link href="/" className={pathname === "/" ? "underline underline-offset-8 decoration-[var(--accent)]" : "opacity-80 hover:opacity-100 transition"}>Dashboard</Link>
            <Link href="/clients" className={pathname.startsWith("/clients") ? "underline underline-offset-8 decoration-[var(--accent)]" : "opacity-80 hover:opacity-100 transition"}>Clients</Link>
            <Link href="/projects" className={pathname.startsWith("/projects") ? "underline underline-offset-8 decoration-[var(--accent)]" : "opacity-80 hover:opacity-100 transition"}>Projects</Link>
            <Link href="/payments" className={pathname.startsWith("/payments") ? "underline underline-offset-8 decoration-[var(--accent)]" : "opacity-80 hover:opacity-100 transition"}>Payments</Link>
            <Link href="/portals" className={pathname.startsWith("/portals") ? "underline underline-offset-8 decoration-[var(--accent)]" : "opacity-80 hover:opacity-100 transition"}>Portals</Link>
            <Link href="/forms" className={pathname.startsWith("/forms") ? "underline underline-offset-8 decoration-[var(--accent)]" : "opacity-80 hover:opacity-100 transition"}>Forms</Link>
            <Link href="/tracking" className={pathname.startsWith("/tracking") ? "underline underline-offset-8 decoration-[var(--accent)]" : "opacity-80 hover:opacity-100 transition"}>Tracking</Link>
          </nav>
          <button onClick={handleLogout} className="ml-8 px-5 py-2 rounded-lg bg-[var(--danger)] text-white font-bold shadow hover:bg-red-700 transition-colors text-lg">Logout</button>
        </header>
      )}
      {((isLoggedIn && pathname !== "/login") || pathname === "/login") && (
        <main className="max-w-7xl mx-auto w-full p-6 min-h-[80vh]">{children}</main>
      )}
    </>
  );
} 