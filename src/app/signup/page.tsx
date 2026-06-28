"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [step, setStep] = useState<"account" | "demo">("account");
  const [demoChoice, setDemoChoice] = useState<"book" | "explore">("book");
  const [demoDate, setDemoDate] = useState("");
  const [demoTime, setDemoTime] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    password: "",
    type: "Fintech Lender",
  });

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  const availableTimes = ["10:00", "11:30", "14:00", "15:30"];
  const today = new Date();
  const monthName = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(year, today.getMonth(), 1).getDay();
  const calendarCells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  function pickCalendarDay(day: number) {
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const selectedDay = String(day).padStart(2, "0");
    setDemoDate(`${year}-${month}-${selectedDay}`);
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setStep("demo");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      if (demoChoice === "explore") {
        localStorage.setItem("trbo_demo_lender", "lender_koho");
        window.location.href = "/portal.html";
      } else {
        setDone(true);
      }
    }, 500);
  }

  if (step === "demo")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: 480 }}>
          <Link
            href="/"
            style={{
              display: "block",
              textAlign: "center",
              marginBottom: 32,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Serif Display',serif",
                fontSize: 40,
                color: "#455c62",
              }}
            >
              trbo.
            </div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                color: "#94a3b8",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Financial
            </div>
          </Link>
          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 8,
              }}
            >
              Schedule your AI underwriting demo
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#64748b",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              Pick a time to see how trbo turns bank statements, payslips, remittances, and identity documents into an AI-powered underwriting memo and Passport Score™.
            </p>
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  fontSize: 13,
                  padding: "10px 14px",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}
            <form onSubmit={handleSignup}>
              <label
                style={{
                  display: "block",
                  padding: 14,
                  border:
                    demoChoice === "book"
                      ? "2px solid #455c62"
                      : "1px solid #e2e8f0",
                  borderRadius: 12,
                  marginBottom: 12,
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  checked={demoChoice === "book"}
                  onChange={() => setDemoChoice("book")}
                  style={{ marginRight: 10 }}
                />
                <strong>Book a live demo</strong>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginTop: 4,
                    marginLeft: 24,
                  }}
                >
                  See the AI document extraction, Passport Score™, decision API, and lender workflow.
                </div>
              </label>
              <label
                style={{
                  display: "block",
                  padding: 14,
                  border:
                    demoChoice === "explore"
                      ? "2px solid #455c62"
                      : "1px solid #e2e8f0",
                  borderRadius: 12,
                  marginBottom: 18,
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  checked={demoChoice === "explore"}
                  onChange={() => setDemoChoice("explore")}
                  style={{ marginRight: 10 }}
                />
                <strong>Explore the demo platform</strong>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginTop: 4,
                    marginLeft: 24,
                  }}
                >
                  Open the sample AI underwriting workspace.
                </div>
              </label>
              {demoChoice === "book" && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: 16,
                    background: "#f8fafc",
                    marginBottom: 14,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#455c62", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI underwriting demo</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{monthName} {year}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", textAlign: "right" }}>30 min · Virtual</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8 }}>
                      {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                        <div key={d} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: "center" }}>{d}</div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                      {calendarCells.map((day, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={!day || day < today.getDate()}
                          onClick={() => day && pickCalendarDay(day)}
                          style={{
                            height: 36,
                            border: day && demoDate.endsWith(`-${String(day).padStart(2, "0")}`) ? "2px solid #455c62" : "1px solid #e2e8f0",
                            background: !day ? "transparent" : day < today.getDate() ? "#f1f5f9" : demoDate.endsWith(`-${String(day).padStart(2, "0")}`) ? "#455c62" : "white",
                            color: day && demoDate.endsWith(`-${String(day).padStart(2, "0")}`) ? "white" : day && day >= today.getDate() ? "#0f172a" : "#cbd5e1",
                            borderRadius: 10,
                            fontWeight: 700,
                            cursor: !day || day < today.getDate() ? "not-allowed" : "pointer",
                          }}
                        >
                          {day || ""}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setDemoTime(time)}
                        style={{
                          padding: "10px 8px",
                          border: demoTime === time ? "2px solid #455c62" : "1px solid #e2e8f0",
                          background: demoTime === time ? "#455c62" : "white",
                          color: demoTime === time ? "white" : "#0f172a",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#455c62",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: loading ? 0.6 : 1,
                  fontFamily: "inherit",
                }}
              >
                {loading
                  ? "Finishing..."
                  : demoChoice === "book"
                    ? "Confirm demo request →"
                    : "Open demo workspace →"}
              </button>
              <button
                type="button"
                onClick={() => setStep("account")}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: 10,
                  background: "transparent",
                  color: "#64748b",
                  border: "none",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            </form>
          </div>
        </div>
      </div>
    );

  if (done)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div
            style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: 40,
              color: "#455c62",
              marginBottom: 8,
            }}
          >
            trbo.
          </div>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#f0fdf4",
              border: "2px solid #bbf7d0",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 28,
            }}
          >
            ✓
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Demo request received
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: 14,
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            We sent a confirmation link to <strong>{form.email}</strong>. Click
            it to activate your account.
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              background: "#455c62",
              color: "white",
              padding: "12px 32px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Go to Sign In →
          </Link>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <Link
          href="/"
          style={{
            display: "block",
            textAlign: "center",
            marginBottom: 32,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: 40,
              color: "#455c62",
            }}
          >
            trbo.
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            Financial
          </div>
        </Link>
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: 24,
            }}
          >
            Create your account
          </h1>
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: 13,
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}
          <form onSubmit={handleNext}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 6,
                  }}
                >
                  First Name
                </label>
                <input
                  value={form.firstName}
                  onChange={set("firstName")}
                  placeholder="Sarah"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                    background: "#f8fafc",
                    color: "#0f172a",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 6,
                  }}
                >
                  Last Name
                </label>
                <input
                  value={form.lastName}
                  onChange={set("lastName")}
                  placeholder="Chen"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                    background: "#f8fafc",
                    color: "#0f172a",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                Company Name
              </label>
              <input
                value={form.company}
                onChange={set("company")}
                placeholder="XYZ Financial"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 14,
                  outline: "none",
                  background: "#f8fafc",
                  color: "#0f172a",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                Company Type
              </label>
              <select
                value={form.type}
                onChange={set("type")}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 14,
                  outline: "none",
                  background: "#f8fafc",
                  color: "#0f172a",
                }}
              >
                {[
                  "Fintech Lender",
                  "Bank",
                  "Credit Union",
                  "Mortgage Broker",
                  "Neo-Bank",
                  "Other",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                Work Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@company.com"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 14,
                  outline: "none",
                  background: "#f8fafc",
                  color: "#0f172a",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 8 characters"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 14,
                  outline: "none",
                  background: "#f8fafc",
                  color: "#0f172a",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: "#455c62",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                opacity: loading ? 0.6 : 1,
                fontFamily: "inherit",
              }}
            >
              Next →
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#64748b",
                marginTop: 16,
              }}
            >
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#455c62", fontWeight: 500 }}>
                Sign in →
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
