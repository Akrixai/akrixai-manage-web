import Image from "next/image";
import Link from "next/link";

const dashboardLinks = [
  { title: "Clients", icon: "👥", color: "from-cyan-500 to-blue-500", href: "/clients" },
  { title: "Projects", icon: "📁", color: "from-purple-500 to-indigo-500", href: "/projects" },
  { title: "Payments", icon: "💸", color: "from-green-500 to-emerald-500", href: "/payments" },
  { title: "Portals", icon: "🔗", color: "from-pink-500 to-rose-500", href: "/portals" },
  { title: "Forms", icon: "📝", color: "from-yellow-500 to-orange-500", href: "/forms" },
  { title: "Tracking", icon: "📊", color: "from-teal-500 to-lime-500", href: "/tracking" },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 min-h-[80vh] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] p-2 sm:p-8 fadein-global">
      <div className="flex flex-col items-center gap-4 mt-6 sm:mt-8 fadein-global w-full">
        <span className="inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white/10 shadow-xl border-4 border-[var(--accent)]">
          <Image src="/logo.jpeg" alt="Akrix AI Logo" width={80} height={80} className="rounded-xl" />
        </span>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg text-center font-sans" style={{letterSpacing: "-0.03em"}}>
          Welcome to <span className="text-[var(--accent)]">Akrix AI</span> Management Portal
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90 text-center max-w-2xl font-medium">
          Manage your <span className="text-[var(--accent)]">clients</span>, <span className="text-[var(--accent)]">projects</span>, <span className="text-[var(--accent)]">payments</span>, <span className="text-[var(--accent)]">portals</span>, <span className="text-[var(--accent)]">forms</span>, and <span className="text-[var(--accent)]">tracking</span>—all in one place. Use the navigation above to get started.
        </p>
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-8 mt-4 sm:mt-8 fadein-global">
        {dashboardLinks.map(link => (
          <Link
            key={link.title}
            href={link.href}
            className={`group focus:outline-none focus:ring-4 focus:ring-[var(--accent)] rounded-2xl transition-transform hover:scale-105 hover:shadow-2xl border-2 border-white/10 fadein-global bg-gradient-to-br ${link.color}`}
            tabIndex={0}
            role="link"
            aria-label={link.title}
          >
            <DashboardCard title={link.title} icon={link.icon} />
          </Link>
        ))}
      </div>
    </div>
  );
}

function DashboardCard({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-8 min-h-[120px] sm:min-h-[160px] cursor-pointer w-full">
      <span className="text-3xl sm:text-4xl md:text-5xl drop-shadow-lg group-hover:scale-110 group-focus:scale-110 transition-transform">{icon}</span>
      <span className="text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-[var(--accent)] group-focus:text-[var(--accent)] transition-colors text-center w-full">{title}</span>
    </div>
  );
}
