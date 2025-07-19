"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  function toggleMobileMenu() {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  if (!isLoggedIn && pathname !== "/login") return null;

  const navigationItems = [
    { href: "/", label: "Dashboard" },
    { href: "/clients", label: "Clients" },
    { href: "/projects", label: "Projects" },
    { href: "/payments", label: "Payments" },
    { href: "/portals", label: "Portals" },
    { href: "/forms", label: "Forms" },
    { href: "/tracking", label: "Tracking" },
  ];

  return (
    <>
      {pathname !== "/login" && (
        <header className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] shadow-lg border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Brand */}
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white shadow-md border-2 border-[var(--primary-light)]">
                  <Image src="/logo.jpeg" alt="Akrix AI Logo" width={44} height={44} className="rounded-full w-8 h-8 sm:w-11 sm:h-11" />
                </span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-lg font-sans" style={{letterSpacing: "-0.03em"}}>
                  Akrix <span className="text-[var(--accent)]">AI</span> Management
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex gap-6 text-white font-semibold text-lg">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                        ? "underline underline-offset-8 decoration-[var(--accent)]"
                        : "opacity-80 hover:opacity-100 transition"
                    }
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Desktop Logout Button */}
              <button 
                onClick={handleLogout} 
                className="hidden lg:block ml-8 px-5 py-2 rounded-lg bg-[var(--danger)] text-white font-bold shadow hover:bg-red-700 transition-colors text-lg"
              >
                Logout
              </button>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center gap-4">
                <button
                  onClick={toggleMobileMenu}
                  className="text-white p-2 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 bg-[var(--primary)] border-t border-[var(--primary-light)]">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium text-white transition-colors ${
                        pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                          ? "bg-[var(--accent)] text-white"
                          : "hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-[var(--danger)] hover:bg-red-700 transition-colors mt-4"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
      )}
      {((isLoggedIn && pathname !== "/login") || pathname === "/login") && (
        <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 min-h-[80vh]">{children}</main>
      )}
    </>
  );
} 