import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";

// ── Icons ──────────────────────────────────────────────────────────────────

const HomeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LeadsIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ProfileIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronLeftIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const BellIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const LogoutIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SearchIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ── Nav config ─────────────────────────────────────────────────────────────

const navItems = [
  { path: "/",         label: "Home",     icon: HomeIcon,     end: true },
  { path: "/leads",    label: "Leads",    icon: LeadsIcon },
  { path: "/calendar", label: "Calendar", icon: CalendarIcon },
  { path: "/profile",  label: "Profile",  icon: ProfileIcon },
];

// ── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ size = 32 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #7c6fcd, #5ab99c)",
      }}
    >
      A
    </div>
  );
}

// ── Sidebar NavLink ────────────────────────────────────────────────────────

function SidebarNavItem({ path, label, icon: Icon, end, collapsed }) {
  return (
    <NavLink
      to={path}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-[10px] cursor-pointer transition-all duration-150",
          "text-[#8a8784] font-medium text-sm no-underline whitespace-nowrap w-full",
          collapsed ? "justify-center p-[10px]" : "px-3.5 py-2.5",
          isActive
            ? "bg-[#1a1917] text-white [&_svg]:stroke-white"
            : "hover:bg-[#f0ede8] hover:text-[#1a1917]",
        ].join(" ")
      }
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

// ── Bottom NavLink ─────────────────────────────────────────────────────────

function BottomNavItem({ path, label, icon: Icon, end }) {
  return (
    <NavLink
      to={path}
      end={end}
      className={({ isActive }) =>
        [
          "flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1",
          "no-underline text-[10px] font-semibold tracking-wide transition-colors duration-150",
          "font-sans",
          isActive
            ? "text-[#7c6fcd] [&_svg]:stroke-[#7c6fcd]"
            : "text-[#9a9896]",
        ].join(" ")
      }
    >
      <Icon size={22} />
      {label}
    </NavLink>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f5f4f1]">

      {/* ══ DESKTOP SIDEBAR ══ */}
      {!isMobile && (
        <aside
          className="h-screen bg-[#faf9f7] border-r border-[#ece9e4] flex flex-col shrink-0 overflow-hidden transition-[width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: collapsed ? "64px" : "220px" }}
        >
          {/* Logo + toggle */}
          <div
            className={[
              "flex items-center gap-2 pb-4 border-b border-[#ece9e4] mb-2 px-1 pt-1",
              collapsed ? "justify-center" : "justify-between",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-[8px] shrink-0"
                style={{ background: "linear-gradient(135deg, #7c6fcd, #5ab99c)" }}
              />
              {!collapsed && (
                <span className="text-[15px] font-bold text-[#1a1917] font-serif tracking-[-0.01em]">
                  Venue Management
                </span>
              )}
            </div>
            <button
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex items-center justify-center w-7 h-7 rounded-[8px] border border-[#e8e6e2] bg-white text-[#6b6966] shrink-0 cursor-pointer transition-colors duration-150 hover:bg-[#f0ede8]"
              style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "background 0.15s, transform 0.25s" }}
            >
              <ChevronLeftIcon />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col gap-0.5 px-1">
            {navItems.map(({ path, label, icon, end }) => (
              <SidebarNavItem
                key={path}
                path={path}
                label={label}
                icon={icon}
                end={end}
                collapsed={collapsed}
              />
            ))}
          </nav>

          {/* User card */}
          <div className="px-1 pt-1 mb-3">
            {!collapsed ? (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f0ede8]">
                <Avatar />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#1a1917] truncate">Alex Johnson</div>
                  <div className="text-[11px] text-[#9a9896] truncate">Sales Manager</div>
                </div>
                <button
                  title="Logout"
                  className="flex items-center justify-center w-7 h-7 rounded-[8px] border-none bg-[#fde8e6] text-[#d94f3d] cursor-pointer shrink-0 transition-colors duration-150 hover:bg-[#fbd0cc]"
                >
                  <LogoutIcon size={14} />
                </button>
              </div>
            ) : (
              <div className="flex justify-center pt-1">
                <Avatar />
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="h-[60px] bg-[#faf9f7] border-b border-[#ece9e4] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 bg-[#f0ede8] rounded-[10px] py-2 px-3.5 w-[220px]">
            <SearchIcon />
            <span className="text-[13px] text-[#9a9896] font-normal">Search…</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative bg-[#f0ede8] border-none rounded-[10px] p-2 cursor-pointer flex items-center justify-center text-[#6b6966] hover:bg-[#e8e5e0] transition-colors duration-150">
              <BellIcon size={16} />
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-[#e8875a] rounded-full border-[1.5px] border-[#faf9f7]" />
            </button>
            {isMobile && <Avatar />}
          </div>
        </header>

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto p-7 [scrollbar-width:thin] [scrollbar-color:#d8d5d0_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d8d5d0] [&::-webkit-scrollbar-thumb]:rounded"
          style={{ paddingBottom: isMobile ? "90px" : "28px" }}
        >
          <Outlet />
        </main>
      </div>

      {/* ══ MOBILE BOTTOM NAV ══ */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 h-16 bg-[rgba(250,249,247,0.95)] backdrop-blur-[12px] border-t border-[#ece9e4] flex items-center z-[100]"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {navItems.map(({ path, label, icon, end }) => (
            <BottomNavItem key={path} path={path} label={label} icon={icon} end={end} />
          ))}
        </nav>
      )}

    </div>
  );
}