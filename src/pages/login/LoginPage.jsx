import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ROLES } from "../../../config";
import { login } from "../../reducers/user";
import { loginUser } from "../../api/auth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await loginUser({ email, password });
      const { _id, name, email: userEmail, role, venueId } = user;

      dispatch(
        login({
          id: _id,
          name,
          role,
          email_id: userEmail,
          access_token: token,
          venueId: venueId ?? null,
          is_logged_in: true,
        }),
      );

      if (role === ROLES.INCHARGE) {
        navigate("/");
      } else if (role === ROLES.ADMIN) {
        navigate("/users");
      } else if (role === ROLES.OWNER) {
        navigate("/");
      } else {
        setError("You do not have access to this app.");
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 403) {
        setError("Your account has been blocked. Contact an administrator.");
      } else {
        setError(
          err.response?.data?.error?.message ||
            "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/assets/image.jpg)" }}
    >
      {/* Overlay — warmer tint to complement the garden background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm mx-4">
        <div
          className="rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          style={{
            background: "rgba(15, 12, 10, 0.55)",
            backdropFilter: "blur(24px) saturate(1.4)",
          }}
        >
          {/* Top accent line with moving beam */}
          <div
            className="relative h-px w-full overflow-hidden"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
            }}
          >
            <div
              className="animate-beam absolute top-0 h-full w-1/4"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(201,168,76,1), transparent)",
              }}
            />
          </div>

          <div className="px-8 pt-8 pb-9">
            {/* Heading */}
            <div className="text-center mb-8">
              <h1
                className="text-[28px] font-bold tracking-tight font-serif"
                style={{ color: "#f5f0e8" }}
              >
                Welcome back
              </h1>
              <p
                className="text-sm mt-1 font-sans"
                style={{ color: "rgba(245,240,232,0.55)" }}
              >
                Sign in to Venue Management
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-widest font-sans"
                  style={{ color: "rgba(245,240,232,0.5)" }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm font-sans transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#f5f0e8",
                    caretColor: "#c9a84c",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(201,168,76,0.6)";
                    e.target.style.background = "rgba(255,255,255,0.10)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.12)";
                    e.target.style.background = "rgba(255,255,255,0.07)";
                  }}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-widest font-sans"
                    style={{ color: "rgba(245,240,232,0.5)" }}
                  >
                    Password
                  </label>
                  {/* <button type="button" className="text-xs font-sans transition-colors duration-150"
                    style={{ color: 'rgba(201,168,76,0.75)' }}
                    onMouseEnter={e => e.target.style.color = '#c9a84c'}
                    onMouseLeave={e => e.target.style.color = 'rgba(201,168,76,0.75)'}
                  >
                    Forgot password?
                  </button> */}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm font-sans transition-all duration-200 outline-none pr-11"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#f5f0e8",
                      caretColor: "#c9a84c",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid rgba(201,168,76,0.6)";
                      e.target.style.background = "rgba(255,255,255,0.10)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border =
                        "1px solid rgba(255,255,255,0.12)";
                      e.target.style.background = "rgba(255,255,255,0.07)";
                    }}
                  />
                  {/* Show/hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 transition-opacity duration-150"
                    style={{ color: "rgba(245,240,232,0.4)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgba(245,240,232,0.8)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(245,240,232,0.4)")
                    }
                  >
                    {showPassword ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm" style={{ color: "#ff6b6b" }}>
                  {error}
                </p>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full py-3.5 px-4 rounded-xl font-semibold text-sm font-sans transition-all duration-200 shadow-lg active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #c9a84c, #b8922e)",
                    color: "#1a1510",
                    letterSpacing: "0.02em",
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading)
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #d4b45a, #c9a84c)";
                  }}
                  onMouseLeave={(e) => {
                    if (!loading)
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #c9a84c, #b8922e)";
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom accent line */}
          <div
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
