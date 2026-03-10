import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../reducers/user";
import { useAuth } from "../hooks/useAuth";

// ── Icons ──────────────────────────────────────────────────────

const VenueIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <rect x="9" y="14" width="6" height="7" rx="1" />
  </svg>
);

const SpacesIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const PricingIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v2m0 8v2M8.5 9.5a3.5 1.5 0 0 1 7 0c0 2-7 2.5-7 4.5a3.5 1.5 0 0 0 7 0" />
  </svg>
);

const GalleryIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const TemplatesIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
);

const MicrositeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const AIIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
  </svg>
);

const ChevronRight = ({ color = "#c5c2be" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="18"
    height="18"
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

function Avatar({ size = 32 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 from-[#7c6fcd] to-[#5ab99c]"
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
// ── Menu Item ──────────────────────────────────────────────────

function MenuItem({
  icon: Icon,
  label,
  description,
  disabled = false,
  onClick,
}) {
  const [pressed, setPressed] = useState(false);

  const iconBg = disabled ? "bg-[#f5f4f1]" : "bg-[#fdf6e8]";
  const iconColor = disabled ? "text-[#c5c2be]" : "text-[#c9a84c]";
  const labelColor = disabled ? "text-[#c5c2be]" : "text-[#1a1917]";
  const descColor = disabled ? "text-[#d0cec9]" : "text-[#9a9896]";

  return (
    <button
      type="button"
      onClick={!disabled ? onClick : undefined}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      disabled={disabled}
      className={`
        flex items-center gap-3.5 w-full py-4 px-4 rounded-2xl text-left
        transition-all duration-150 select-none touch-manipulation
        border border-[#f1f0ee] bg-[#faf9f7] shadow-sm
        hover:border-[#e8e6e2] hover:bg-[#f5f4f1] hover:shadow
        active:scale-[0.99] active:bg-[#f0ede8]
        ${pressed ? "scale-[0.99] bg-[#f0ede8]" : ""}
        ${disabled ? "cursor-default" : "cursor-pointer"}
      `}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Icon badge */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150 ${iconBg} ${iconColor}`}
      >
        <Icon />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`m-0 text-[15px] font-semibold font-sans tracking-tight ${labelColor}`}
        >
          {label}
        </p>
        <p
          className={`mt-1 m-0 text-[13px] font-normal font-sans ${descColor}`}
        >
          {description}
        </p>
      </div>

      {/* Chevron */}
      <ChevronRight color={disabled ? "#dedad6" : "#c5c2be"} />
    </button>
  );
}

// ── Profile Avatar Section ─────────────────────────────────────

function ProfileHeader({ user }) {
  const displayName = user?.name || "User";
  const role = user?.role || "User";
  const venueName = user?.venue?.name || "Venue";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4 py-5 px-5 rounded-2xl bg-[#faf9f7] border border-[#f1f0ee] shadow-sm">
      <div
        className="rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{
          width: 52,
          height: 52,
          background: "linear-gradient(135deg, #7c6fcd, #5ab99c)",
        }}
      >
        {initial}
      </div>
      <div className="min-w-0">
        <p className="m-0 text-lg font-bold text-[#1a1917] font-serif tracking-tight">
          {displayName}
        </p>
        <p className="mt-0.5 m-0 text-sm text-[#6b6966] font-sans">
          {role.charAt(0).toUpperCase() + role.slice(1)} · {venueName}
        </p>
      </div>
    </div>
  );
}

// ── Section Label ──────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="mb-3 mt-6 text-[11px] font-bold text-[#9a9896] uppercase tracking-widest font-sans">
      {children}
    </p>
  );
}

// ── Profile Page ───────────────────────────────────────────────

const VENUE_ITEMS = [
  {
    icon: VenueIcon,
    label: "Venue Profile",
    description: "Basic info, address, contact",
  },
  { icon: SpacesIcon, label: "Spaces", description: "Manage venue spaces" },
  { icon: PricingIcon, label: "Pricing", description: "Rack rates, add-ons" },
  { icon: GalleryIcon, label: "Gallery", description: "Photos and albums" },
  { icon: TemplatesIcon, label: "Templates", description: "Message templates" },
  { icon: MicrositeIcon, label: "Microsite", description: "Public venue page" },
];

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useAuth();
  const [activeItem, setActiveItem] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col max-w-[600px] w-full font-sans">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-[600px] w-full font-sans">
      {/* Page title */}
      <header className="mb-2">
        <p className="m-0 text-sm text-[#9a9896] font-medium">Account</p>
        <h1 className="mt-1 m-0 text-2xl sm:text-[28px] font-bold text-[#1a1917] font-serif tracking-tight leading-tight">
          Profile
        </h1>
      </header>

      {/* User info card */}
      <ProfileHeader user={user} />

      {/* Venue settings */}
      <SectionLabel>Venue Settings</SectionLabel>
      <div className="flex flex-col gap-3 mb-8">
        {VENUE_ITEMS.map(({ icon, label, description }) => (
          <MenuItem
            key={label}
            icon={icon}
            label={label}
            description={description}
            onClick={() =>
              label === "Venue Profile"
                ? navigate("/profile/venue")
                : label === "Spaces"
                  ? navigate("/profile/spaces")
                  : label === "Pricing"
                    ? navigate("/profile/pricing")
                    : label === "Gallery"
                      ? navigate("/profile/gallery")
                      : setActiveItem(label)
            }
          />
        ))}
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2.5 bg-[#fef2f1] hover:bg-[#fde8e6] border border-[#fde8e6] hover:border-[#fbd0cc] cursor-pointer py-2.5 px-4 rounded-xl w-fit text-[#d94f3d] font-sans text-[15px] font-bold transition-colors duration-150"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <LogoutIcon />
        Logout
      </button>

      {/* Toast / feedback when item tapped */}
      {activeItem && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveItem(null)}
          onKeyDown={(e) => e.key === "Enter" && setActiveItem(null)}
          className="fixed bottom-[90px] left-1/2 -translate-x-1/2 bg-[#1a1917] text-white text-sm font-medium font-sans py-2.5 px-5 rounded-full shadow-xl whitespace-nowrap z-[200] cursor-pointer animate-fade-up"
        >
          Opening {activeItem}…
        </div>
      )}
    </div>
  );
}
