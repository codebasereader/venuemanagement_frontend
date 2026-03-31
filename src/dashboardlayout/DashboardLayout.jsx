import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, logout } from "../reducers/user";
import { ROLES } from "../../config";

// ── Icons ──────────────────────────────────────────────────────────────────

const HomeIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LeadsIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const VendorsIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 9h.01" />
    <path d="M12 9h.01" />
    <path d="M15 9h.01" />
  </svg>
);

const ProfileIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronLeftIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const LogoutIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const UsersIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const VenuesIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const DaybookIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="14" x2="9" y2="19" />
    <line x1="15" y1="14" x2="15" y2="19" />
  </svg>
);

const TargetIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// ── Nav configs (role-based) ───────────────────────────────────────────────

const inchargeNavItems = [
  { path: "/", label: "Home", icon: HomeIcon, end: true },
  { path: "/leads", label: "Leads", icon: LeadsIcon },
  { path: "/vendors", label: "Vendor's List", icon: VendorsIcon },
  { path: "/calendar", label: "Calendar", icon: CalendarIcon },
  { path: "/profile", label: "Profile", icon: ProfileIcon },
];

const adminNavItems = [
  { path: "/venues", label: "View Venues", icon: VenuesIcon, end: false },
  { path: "/users", label: "View Users", icon: UsersIcon, end: false },
  { path: "/calendar", label: "Calendar", icon: CalendarIcon, end: false },
];

const ownerNavItems = [
  { path: "/", label: "Home", icon: HomeIcon, end: true },
  { path: "/leads", label: "Leads", icon: LeadsIcon },
  { path: "/vendors", label: "Vendor's List", icon: VendorsIcon },
  { path: "/calendar", label: "Calendar", icon: CalendarIcon },
  { path: "/daybook", label: "Daybook", icon: DaybookIcon },
  { path: "/target", label: "Target", icon: TargetIcon },
  { path: "/profile", label: "Profile", icon: ProfileIcon },
];

// ── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ name, size = 32 }) {
  const initial = name ? String(name).trim().charAt(0).toUpperCase() : "A";
  return (
    <div
      className="rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #7c6fcd, #5ab99c)",
      }}
    >
      {initial}
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
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { name, role, access_token } = useSelector((state) => state.user.value);

  const navItems =
    role === ROLES.ADMIN
      ? adminNavItems
      : role === ROLES.OWNER
        ? ownerNavItems
        : inchargeNavItems;
  const roleLabel =
    role === ROLES.ADMIN
      ? "Admin"
      : role === ROLES.OWNER
        ? "Owner"
        : "Venue Incharge";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!access_token) return;
    dispatch(fetchCurrentUser(access_token));
  }, [access_token, dispatch]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f5f4f1]">
      {/* ══ DESKTOP SIDEBAR ══ */}
      {!isMobile && (
        <aside
          className="h-screen bg-[#faf9f7] border-r border-[#ece9e4] flex flex-col shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
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
                style={{
                  background: "linear-gradient(135deg, #7c6fcd, #5ab99c)",
                }}
              />
              {!collapsed && (
                <span className="text-[15px] font-bold text-[#1a1917] font-serif tracking-[-0.01em]">
                  Venue Management
                </span>
              )}
            </div>
            <button
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex items-center justify-center w-7 h-7 rounded-[8px] border border-[#e8e6e2] bg-white text-[#6b6966] shrink-0 cursor-pointer transition-colors duration-150 hover:bg-[#f0ede8]"
              style={{
                transform: collapsed ? "rotate(180deg)" : "none",
                transition: "background 0.15s, transform 0.25s",
              }}
            >
              <ChevronLeftIcon />
            </button>
          </div>

          {/* Nav links (role-based) */}
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
                <Avatar name={name} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#1a1917] truncate">
                    {name || "User"}
                  </div>
                  <div className="text-[11px] text-[#9a9896] truncate">
                    {roleLabel}
                  </div>
                </div>
                <button
                  type="button"
                  title="Logout"
                  onClick={handleLogout}
                  className="flex items-center justify-center w-7 h-7 rounded-[8px] border-none bg-[#fde8e6] text-[#d94f3d] cursor-pointer shrink-0 transition-colors duration-150 hover:bg-[#fbd0cc]"
                >
                  <LogoutIcon size={14} />
                </button>
              </div>
            ) : (
              <div className="flex justify-center pt-1">
                <Avatar name={name} />
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-[60px] bg-[#faf9f7] border-b border-[#ece9e4] flex items-center justify-between px-6 shrink-0">
          {isMobile ? (
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-[#1a1917] font-serif tracking-[-0.01em]">
                Venue Management
              </span>
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <Avatar name={name} />
            {isMobile && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border-none bg-[#fde8e6] text-[#d94f3d] text-[12px] font-semibold cursor-pointer hover:bg-[#fbd0cc] transition-colors duration-150"
              >
                <LogoutIcon size={14} />
                <span className="hidden xs:inline">Logout</span>
              </button>
            )}
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
          className="fixed bottom-0 left-0 right-0 h-16 bg-[rgba(250,249,247,0.95)] backdrop-blur-md border-t border-[#ece9e4] flex items-center z-40"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {navItems.map(({ path, label, icon, end }) => (
            <BottomNavItem
              key={path}
              path={path}
              label={label}
              icon={icon}
              end={end}
            />
          ))}
        </nav>
      )}
    </div>
  );
}
