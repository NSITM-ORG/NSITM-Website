// NSITM Admin & Super Admin dashboard — single-file React (JSX).
// Midnight Indigo dark theme, sidebar shell, polished cards/tables.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard, Users, Hourglass, PhoneCall, GraduationCap, BookOpen,
  ShieldCheck, BarChart3, Mail, LogOut, Search, X, Check, RefreshCcw,
  Download, Plus, ChevronDown, ChevronUp, AlertTriangle, MessageCircle,
  Phone, ArrowLeft, Sparkles, Menu, Receipt, KeyRound, Power, Trash2,
  Pencil, ExternalLink,
} from "lucide-react";
import { store, STATUS_META, formatNGN, formatDate } from "../../lib/adminStore";

const SESSION_TIMEOUT_MIN = 60;
const LOCKOUT_MAX_ATTEMPTS = 3;
const LOCKOUT_MIN = 15;

// ---------------- Auth ----------------
function useAuth() {
  const [session, setSession] = useState(() => {
    const s = store.getSession();
    if (!s) return null;
    if (Date.now() - s.lastActivity > SESSION_TIMEOUT_MIN * 60 * 1000) {
      store.clearSession();
      return null;
    }
    return s;
  });

  useEffect(() => {
    if (!session) return;
    const bump = () => {
      const fresh = { ...session, lastActivity: Date.now() };
      store.setSession(fresh);
      setSession(fresh);
    };
    const onAct = () => {
      if (Date.now() - session.lastActivity > 30000) bump();
    };
    window.addEventListener("click", onAct);
    window.addEventListener("keydown", onAct);
    const timer = setInterval(() => {
      const s = store.getSession();
      if (!s) return;
      if (Date.now() - s.lastActivity > SESSION_TIMEOUT_MIN * 60 * 1000) {
        store.clearSession();
        setSession(null);
      }
    }, 30000);
    return () => {
      window.removeEventListener("click", onAct);
      window.removeEventListener("keydown", onAct);
      clearInterval(timer);
    };
  }, [session]);

  const login = (email, password) => {
    const locks = store.getLockouts();
    const lock = locks[email];
    if (lock && lock.until > Date.now()) {
      const mins = Math.ceil((lock.until - Date.now()) / 60000);
      return { ok: false, error: `Account locked. Try again in ${mins} min.` };
    }
    const admin = store.listAdmins().find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!admin || admin.password !== password || !admin.active) {
      const attempts = (lock?.attempts || 0) + 1;
      if (attempts >= LOCKOUT_MAX_ATTEMPTS) {
        locks[email] = { attempts: 0, until: Date.now() + LOCKOUT_MIN * 60 * 1000 };
        store.setLockouts(locks);
        return { ok: false, error: `Too many attempts. Locked for ${LOCKOUT_MIN} min.` };
      }
      locks[email] = { attempts, until: 0 };
      store.setLockouts(locks);
      return {
        ok: false,
        error: `Invalid credentials. ${LOCKOUT_MAX_ATTEMPTS - attempts} attempt(s) left.`,
      };
    }
    delete locks[email];
    store.setLockouts(locks);
    const fresh = {
      adminId: admin.id, name: admin.name, email: admin.email,
      role: admin.role, lastActivity: Date.now(),
    };
    store.setSession(fresh);
    setSession(fresh);
    return { ok: true };
  };

  const logout = () => { store.clearSession(); setSession(null); };
  return { session, login, logout };
}

// ---------------- Toast ----------------
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, kind = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  const node = (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-lg shadow-elegant text-sm font-medium backdrop-blur border ${
            t.kind === "error"
              ? "bg-destructive/90 text-destructive-foreground border-destructive/50"
              : t.kind === "success"
              ? "bg-success/90 text-success-foreground border-success/50"
              : "bg-card/90 text-card-foreground border-border"
          }`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { push, node };
}

// ---------------- Login Page ----------------
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("superadmin@nextserve.test");
  const [password, setPassword] = useState("Super123!");
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    setErr("");
    const r = onLogin(email.trim(), password);
    if (!r.ok) setErr(r.error);
  };
  const fill = (e, p) => { setEmail(e); setPassword(p); setErr(""); };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-surface" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary-glow/20 blur-3xl" />

      <form onSubmit={submit} className="relative z-10 w-full max-w-md bg-card/70 backdrop-blur-xl border border-border rounded-2xl shadow-glow p-8">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="mt-4 text-2xl font-display font-bold text-foreground">NSITM Admin Console</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage enrollments</p>
        </div>

        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Email</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full px-3.5 py-2.5 bg-background/60 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Password</label>
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full px-3.5 py-2.5 bg-background/60 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {err && (
          <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 px-3 py-2 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{err}</span>
          </div>
        )}
        <button type="submit" className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-elegant">
          Sign in
        </button>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Demo accounts</div>
          <div className="grid grid-cols-1 gap-1.5">
            <button type="button" onClick={() => fill("superadmin@nextserve.test", "Super123!")}
              className="text-left text-xs px-3 py-2 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition">
              <span className="text-foreground font-medium">Super Admin</span>
              <span className="text-muted-foreground"> · superadmin@nextserve.test</span>
            </button>
            <button type="button" onClick={() => fill("admin@nextserve.test", "Admin123!")}
              className="text-left text-xs px-3 py-2 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition">
              <span className="text-foreground font-medium">Admin</span>
              <span className="text-muted-foreground"> · admin@nextserve.test</span>
            </button>
            <button type="button" onClick={() => fill("finance@nextserve.test", "Finance123!")}
              className="text-left text-xs px-3 py-2 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition">
              <span className="text-foreground font-medium">Finance</span>
              <span className="text-muted-foreground"> · finance@nextserve.test</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ---------------- Modal ----------------
function Modal({ open, title, onClose, children, footer, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-card border border-border rounded-2xl shadow-glow w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[90vh] overflow-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 text-foreground">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-border flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ---------------- Badge ----------------
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.NotPaid;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}

// ---------------- Sidebar ----------------
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "pending", label: "Pending Reviews", icon: Hourglass },
  { id: "notpaid", label: "Not Paid", icon: PhoneCall },
  { id: "cohorts", label: "Cohorts", icon: GraduationCap },
  { id: "programmes", label: "Programmes", icon: BookOpen, super: true },
  { id: "admins", label: "Admin Accounts", icon: ShieldCheck, super: true },
  { id: "analytics", label: "Analytics", icon: BarChart3, super: true },
  { id: "emails", label: "Email Log", icon: Mail },
];

function Sidebar({ view, setView, session, onLogout, mobileOpen, setMobileOpen }) {
  const items = NAV.filter((n) => !n.super || session.role === "SuperAdmin");
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`fixed lg:static z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r border-sidebar-border transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-base text-foreground">NSITM</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Admin Console</div>
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">Workspace</div>
          {items.map((n) => {
            const Icon = n.icon;
            const active = view.name === n.id || (n.id === "students" && view.name === "studentDetail");
            return (
              <button
                key={n.id}
                onClick={() => { setView({ name: n.id }); setMobileOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm mb-1 flex items-center gap-3 transition ${
                  active
                    ? "bg-sidebar-primary/15 text-foreground border border-sidebar-primary/30 shadow-elegant"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{n.label}</span>
                {n.super && (
                  <span className="ml-auto text-[9px] uppercase tracking-wide text-primary/70 font-semibold">Super</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent">
            <div className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-display font-bold text-sm">
              {session.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{session.name}</div>
              <div className="text-[11px] text-muted-foreground">{session.role}</div>
            </div>
            <button onClick={onLogout} title="Sign out" className="p-2 rounded-md hover:bg-background/40 text-muted-foreground hover:text-destructive transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ---------------- Dashboard ----------------
function DashboardPage({ students, cohorts, setView }) {
  const counts = useMemo(() => {
    const c = { total: students.length, NotPaid: 0, Pending: 0, Confirmed: 0, Rejected: 0 };
    students.forEach((s) => (c[s.status] = (c[s.status] || 0) + 1));
    return c;
  }, [students]);

  const revenue = useMemo(
    () => students.filter((s) => s.status === "Confirmed").reduce((a, s) => a + (s.depositAmount || 0), 0),
    [students],
  );

  const cards = [
    { label: "Total Enrollments", v: counts.total, accent: "from-primary/30 to-primary/5", icon: Users, view: "students" },
    { label: "Pending Reviews", v: counts.Pending, accent: "from-warning/30 to-warning/5", icon: Hourglass, view: "pending" },
    { label: "Confirmed", v: counts.Confirmed, accent: "from-success/30 to-success/5", icon: Check, view: "students" },
    { label: "Confirmed Revenue", v: formatNGN(revenue), accent: "from-info/30 to-info/5", icon: BarChart3, view: "analytics", small: true },
  ];

  return (
    <div>
      <PageHeader title="Overview" subtitle="Snapshot of all active cohorts and applicants." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => setView({ name: c.view })}
              className={`text-left p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-elegant transition relative overflow-hidden group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.accent} opacity-50 group-hover:opacity-80 transition`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-background/60 border border-border flex items-center justify-center text-foreground">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className={`font-display font-bold text-foreground ${c.small ? "text-xl" : "text-3xl"}`}>{c.v}</div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{c.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentList title="Latest enrollments" students={[...students].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)} setView={setView} />
        <RecentList
          title="Oldest pending reviews"
          students={[...students].filter((s) => s.status === "Pending").sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(0, 6)}
          setView={setView}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-3">Enrollments — last 30 days</h3>
          <LineChart students={students} days={30} />
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-3">Status mix</h3>
          <DonutChart counts={counts} />
        </div>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function RecentList({ title, students, setView }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-display font-semibold text-foreground mb-3">{title}</h3>
      {students.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center">Nothing here yet.</div>
      ) : (
        <ul className="divide-y divide-border">
          {students.map((s) => (
            <li
              key={s.id}
              className="py-2.5 flex items-center justify-between gap-3 text-sm cursor-pointer hover:bg-muted/40 px-2 -mx-2 rounded-lg transition"
              onClick={() => setView({ name: "studentDetail", id: s.id })}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={s.fullName} />
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{s.fullName}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</div>
                </div>
              </div>
              <StatusBadge status={s.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Avatar({ name }) {
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("");
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-display font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ---------------- Students ----------------
function StudentsPage({ students, programmes, cohorts, setView, initialStatus }) {
  const [filters, setFilters] = useState({
    status: initialStatus || "", programmeId: "", cohortId: "", q: "",
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const list = useMemo(() => {
    let l = [...students];
    if (filters.status) l = l.filter((s) => s.status === filters.status);
    if (filters.programmeId) l = l.filter((s) => s.programmeId === filters.programmeId);
    if (filters.cohortId) l = l.filter((s) => s.cohortId === filters.cohortId);
    if (filters.q.trim()) {
      const q = filters.q.toLowerCase();
      l = l.filter((s) => s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q));
    }
    l.sort((a, b) => {
      const av = a[sortBy] || ""; const bv = b[sortBy] || "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
    return l;
  }, [students, filters, sortBy, sortDir]);

  useEffect(() => { setPage(1); }, [filters, sortBy, sortDir]);
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const pageList = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pmap = Object.fromEntries(programmes.map((p) => [p.id, p]));
  const cmap = Object.fromEntries(cohorts.map((c) => [c.id, c]));

  const toggleSort = (k) => {
    if (sortBy === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(k); setSortDir("asc"); }
  };
  const Arrow = ({ k }) => sortBy === k ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />) : null;

  return (
    <div>
      <PageHeader title="Students" subtitle={`${list.length} record${list.length === 1 ? "" : "s"}`} />

      <div className="bg-card border border-border rounded-2xl p-3 mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search name, email or phone…"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-background/60 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <FilterSelect value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })}
          options={[{ value: "", label: "All statuses" }, ...Object.keys(STATUS_META).map((k) => ({ value: k, label: STATUS_META[k].label }))]} />
        <FilterSelect value={filters.programmeId} onChange={(v) => setFilters({ ...filters, programmeId: v })}
          options={[{ value: "", label: "All programmes" }, ...programmes.map((p) => ({ value: p.id, label: p.name }))]} />
        <FilterSelect value={filters.cohortId} onChange={(v) => setFilters({ ...filters, cohortId: v })}
          options={[{ value: "", label: "All cohorts" }, ...cohorts.map((c) => ({ value: c.id, label: c.name }))]} />
        <button
          onClick={() => setFilters({ status: "", programmeId: "", cohortId: "", q: "" })}
          className="px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          Clear
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                {[
                  ["fullName", "Name"], ["email", "Email"], ["programmeId", "Programme"],
                  ["cohortId", "Cohort"], ["paymentType", "Payment"], ["status", "Status"],
                  ["createdAt", "Created"],
                ].map(([k, l]) => (
                  <th key={k} onClick={() => toggleSort(k)}
                    className="text-left px-4 py-3 cursor-pointer hover:text-foreground font-semibold whitespace-nowrap">
                    {l} <Arrow k={k} />
                  </th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pageList.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.fullName} />
                      <span className="font-medium text-foreground">{s.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3 text-foreground">{pmap[s.programmeId]?.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{cmap[s.cohortId]?.name || "—"}</td>
                  <td className="px-4 py-3 text-foreground">{s.paymentType || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setView({ name: "studentDetail", id: s.id })}
                      className="text-primary hover:text-primary-glow text-xs font-medium">
                      Open →
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-12 text-center text-muted-foreground">No records match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {list.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
            <span>Page {page} of {totalPages} · {list.length} records</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 bg-background/60 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ---------------- Student Detail ----------------
function StudentDetailPage({ studentId, students, programmes, cohorts, session, refresh, toast, setView }) {
  const student = students.find((s) => s.id === studentId);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [showReverse, setShowReverse] = useState(false);
  const [reverseReason, setReverseReason] = useState("");

  if (!student) {
    return (
      <div>
        <BackLink onClick={() => setView({ name: "students" })} />
        <div className="mt-4 p-6 bg-card border border-border rounded-2xl text-foreground">Student not found.</div>
      </div>
    );
  }

  const programme = programmes.find((p) => p.id === student.programmeId);
  const cohort = cohorts.find((c) => c.id === student.cohortId);

  const updateStudent = (changes) => {
    const all = store.listStudents();
    const idx = all.findIndex((x) => x.id === student.id);
    if (idx < 0) return;
    all[idx] = { ...all[idx], ...changes, updatedAt: store.now() };
    store.saveStudents(all);
    refresh();
  };

  const confirmPayment = () => {
    updateStudent({ status: "Confirmed", emailFailed: false });
    store.logEmail({
      to: student.email, kind: "Confirmed",
      subject: "Your Nextserve enrollment is confirmed",
      body: `Hi ${student.fullName}, your payment for ${programme?.name} (${cohort?.name}) has been confirmed. Join your cohort WhatsApp group: ${cohort?.whatsappLink}`,
    });
    toast.push("Payment confirmed. Email sent.", "success");
  };
  const rejectPayment = () => {
    if (!reason.trim()) return toast.push("Reason is required.", "error");
    updateStudent({ status: "Rejected", rejectionReason: reason.trim() });
    store.logEmail({
      to: student.email, kind: "Rejected",
      subject: "Your Nextserve payment could not be verified",
      body: `Hi ${student.fullName}, we couldn't verify your payment. Reason: ${reason.trim()}. Please contact us on WhatsApp.`,
    });
    setShowReject(false); setReason("");
    toast.push("Payment rejected. Email sent.", "success");
  };
  const reverseConfirmed = () => {
    if (!reverseReason.trim()) return toast.push("Reason is required.", "error");
    updateStudent({ status: "Pending", rejectionReason: "" });
    store.logEmail({
      to: student.email, kind: "Reversed",
      subject: "Your payment status was reset to Pending",
      body: `Hi ${student.fullName}, an admin reset your payment status. Reason: ${reverseReason.trim()}`,
    });
    setShowReverse(false); setReverseReason("");
    toast.push("Status reverted to Pending.", "success");
  };

  const canConfirmReject = student.status === "Pending";
  const canReverse = session.role === "SuperAdmin" && student.status === "Confirmed";

  return (
    <div>
      <BackLink onClick={() => setView({ name: "students" })} />

      <div className="mt-4 flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg shadow-glow">
            {student.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{student.fullName}</h1>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={student.status} />
              <span>· Created {formatDate(student.createdAt)}</span>
              {student.emailFailed && (
                <span className="text-destructive text-xs inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> last email failed
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canConfirmReject && (
            <>
              <ActionBtn onClick={confirmPayment} kind="success" icon={Check}>Confirm Payment</ActionBtn>
              <ActionBtn onClick={() => setShowReject(true)} kind="destructive" icon={X}>Reject Payment</ActionBtn>
            </>
          )}
          {canReverse && (
            <ActionBtn onClick={() => setShowReverse(true)} kind="warning" icon={RefreshCcw}>Reverse to Pending</ActionBtn>
          )}
          <a href={`https://wa.me/${student.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-success/20 text-success border border-success/30 text-sm font-medium hover:bg-success/30 transition">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <a href={`mailto:${student.email}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-foreground border border-border text-sm font-medium hover:bg-accent transition">
            <Mail className="w-4 h-4" /> Email
          </a>
          <a href={`tel:${student.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
            <Phone className="w-4 h-4" /> Call
          </a>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-4 text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Personal details
          </h3>
          <Field label="Full name" v={student.fullName} />
          <Field label="Email" v={student.email} />
          <Field label="Phone" v={student.phone} />
          <Field label="WhatsApp" v={student.whatsapp} />
          <Field label="Referral code" v={student.referralCode || "—"} />
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-4 text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" /> Enrollment
          </h3>
          <Field label="Programme" v={programme?.name || "—"} />
          <Field label="Cohort" v={cohort?.name || "—"} />
          <Field label="Delivery" v={student.delivery || "—"} />
          <Field label="Payment type" v={student.paymentType || "—"} />
          <Field label="Deposit" v={student.depositAmount ? formatNGN(student.depositAmount) : "—"} />
          {student.status === "Rejected" && (<Field label="Rejection reason" v={student.rejectionReason || "—"} />)}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4 text-foreground flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" /> Payment receipt
          </h3>
          {student.receipt ? (
            <div className="flex flex-col items-start gap-3">
              <div className="rounded-xl border border-border overflow-hidden bg-background/40">
                <img src={student.receipt.dataUrl} alt="receipt" className="max-h-[520px]" />
              </div>
              <a href={student.receipt.dataUrl} download={student.receipt.name}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-glow font-medium">
                <Download className="w-4 h-4" /> Download {student.receipt.name}
              </a>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
              No receipt uploaded — this is a Not Paid (partial) record.
            </div>
          )}
        </div>
      </div>

      <Modal open={showReject} onClose={() => setShowReject(false)} title="Reject payment"
        footer={<>
          <BtnGhost onClick={() => setShowReject(false)}>Cancel</BtnGhost>
          <BtnPrimary onClick={rejectPayment} kind="destructive">Reject and notify</BtnPrimary>
        </>}>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Reason</label>
        <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
          className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g. The receipt amount does not match the expected deposit." />
      </Modal>

      <Modal open={showReverse} onClose={() => setShowReverse(false)} title="Reverse confirmed payment"
        footer={<>
          <BtnGhost onClick={() => setShowReverse(false)}>Cancel</BtnGhost>
          <BtnPrimary onClick={reverseConfirmed} kind="warning">Reverse</BtnPrimary>
        </>}>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Reason (required)</label>
        <textarea rows={3} value={reverseReason} onChange={(e) => setReverseReason(e.target.value)}
          className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
      </Modal>
    </div>
  );
}

function BackLink({ onClick }) {
  return (
    <button onClick={onClick} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
      <ArrowLeft className="w-4 h-4" /> Back
    </button>
  );
}

function ActionBtn({ onClick, kind = "primary", icon: Icon, children }) {
  const cls = {
    success: "bg-success text-success-foreground hover:opacity-90",
    destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
    warning: "bg-warning text-warning-foreground hover:opacity-90",
    primary: "bg-gradient-primary text-primary-foreground hover:opacity-90",
  }[kind];
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold shadow-elegant ${cls}`}>
      {Icon && <Icon className="w-4 h-4" />} {children}
    </button>
  );
}
function BtnPrimary({ onClick, children, kind = "primary" }) {
  const cls = {
    primary: "bg-gradient-primary text-primary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    warning: "bg-warning text-warning-foreground",
  }[kind];
  return <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 ${cls}`}>{children}</button>;
}
function BtnGhost({ onClick, children }) {
  return <button onClick={onClick} className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted">{children}</button>;
}

function Field({ label, v }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right break-all">{v}</span>
    </div>
  );
}

// ---------------- Not Paid / Pending ----------------
function NotPaidPage({ students, programmes, setView }) {
  const list = useMemo(
    () => [...students].filter((s) => s.status === "NotPaid").sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [students],
  );
  const pmap = Object.fromEntries(programmes.map((p) => [p.id, p]));
  return (
    <div>
      <PageHeader title="Not Paid — follow-up" subtitle="Partial enrollment records, oldest first." />
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Programme</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Captured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-muted/30 transition">
                <td className="px-4 py-3 font-medium text-foreground cursor-pointer" onClick={() => setView({ name: "studentDetail", id: s.id })}>
                  <div className="flex items-center gap-3"><Avatar name={s.fullName} /> {s.fullName}</div>
                </td>
                <td className="px-4 py-3 text-foreground">{pmap[s.programmeId]?.name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5 justify-end">
                    <a href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success border border-success/30 rounded-md text-xs">
                      <MessageCircle className="w-3 h-3" />
                    </a>
                    <a href={`tel:${s.phone}`} className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md text-xs text-foreground"><Phone className="w-3 h-3" /></a>
                    <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md text-xs text-foreground"><Mail className="w-3 h-3" /></a>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Nothing here — every started enrollment was completed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PendingPage({ students, programmes, setView }) {
  const list = useMemo(
    () => [...students].filter((s) => s.status === "Pending").sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [students],
  );
  const pmap = Object.fromEntries(programmes.map((p) => [p.id, p]));
  return (
    <div>
      <PageHeader title="Pending review queue" subtitle="Sorted oldest first — work top-down." />
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Programme</th>
              <th className="text-left px-4 py-3">Deposit</th>
              <th className="text-left px-4 py-3">Submitted</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-muted/30 transition">
                <td className="px-4 py-3 font-medium text-foreground">
                  <div className="flex items-center gap-3"><Avatar name={s.fullName} /> {s.fullName}</div>
                </td>
                <td className="px-4 py-3 text-foreground">{pmap[s.programmeId]?.name || "—"}</td>
                <td className="px-4 py-3 text-foreground">{formatNGN(s.depositAmount)}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setView({ name: "studentDetail", id: s.id })}
                    className="px-3 py-1.5 bg-gradient-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 shadow-elegant">
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Queue clear 🎉</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------- Cohorts ----------------
function CohortsPage({ cohorts, programmes, students, session, refresh, toast }) {
  const pmap = Object.fromEntries(programmes.map((p) => [p.id, p]));
  const [editing, setEditing] = useState(null);

  const blank = {
    id: null, name: "", programmeId: programmes[0]?.id || "",
    startDate: "", endDate: "", delivery: "Online", whatsappLink: "", status: "Active",
  };

  const save = () => {
    if (!editing.name.trim() || !editing.programmeId) return toast.push("Name and programme are required.", "error");
    const all = store.listCohorts();
    if (editing.id) {
      const idx = all.findIndex((x) => x.id === editing.id);
      all[idx] = { ...all[idx], ...editing };
    } else { all.push({ ...editing, id: store.uid() }); }
    store.saveCohorts(all);
    setEditing(null); refresh();
    toast.push("Cohort saved.", "success");
  };

  const remove = (id) => {
    if (!confirm("Delete this cohort? Student records will keep their cohort ID.")) return;
    store.saveCohorts(store.listCohorts().filter((c) => c.id !== id));
    refresh();
    toast.push("Cohort deleted.", "success");
  };

  return (
    <div>
      <PageHeader title="Cohorts" subtitle={`${cohorts.length} scheduled cohorts`}
        right={session.role === "SuperAdmin" && (
          <button onClick={() => setEditing(blank)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-elegant hover:opacity-90">
            <Plus className="w-4 h-4" /> New cohort
          </button>
        )} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cohorts.map((c) => {
          const count = students.filter((s) => s.cohortId === c.id).length;
          const confirmed = students.filter((s) => s.cohortId === c.id && s.status === "Confirmed").length;
          return (
            <div key={c.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-display font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{pmap[c.programmeId]?.name || "—"} · {c.delivery}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide bg-success/15 text-success border border-success/30 px-2 py-0.5 rounded-full font-semibold">{c.status}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-3">{c.startDate} → {c.endDate}</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-muted/40 rounded-lg p-2 border border-border">
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wide">Students</div>
                    <div className="font-display font-bold text-lg text-foreground">{count}</div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2 border border-border">
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wide">Confirmed</div>
                    <div className="font-display font-bold text-lg text-success">{confirmed}</div>
                  </div>
                </div>
                {c.whatsappLink && (
                  <a href={c.whatsappLink} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-success font-medium hover:underline">
                    <MessageCircle className="w-3 h-3" /> WhatsApp group <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {session.role === "SuperAdmin" && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setEditing({ ...c })} className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md text-xs text-foreground hover:bg-muted">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => remove(c.id)} className="inline-flex items-center gap-1 px-2 py-1 border border-destructive/40 text-destructive rounded-md text-xs hover:bg-destructive/10">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit cohort" : "New cohort"}
        footer={<><BtnGhost onClick={() => setEditing(null)}>Cancel</BtnGhost><BtnPrimary onClick={save}>Save</BtnPrimary></>}>
        {editing && (
          <div className="space-y-3">
            <Input label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Select label="Programme" value={editing.programmeId} onChange={(v) => setEditing({ ...editing, programmeId: v })}
              options={programmes.map((p) => ({ value: p.id, label: p.name }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Start date" type="date" value={editing.startDate} onChange={(v) => setEditing({ ...editing, startDate: v })} />
              <Input label="End date" type="date" value={editing.endDate} onChange={(v) => setEditing({ ...editing, endDate: v })} />
            </div>
            <Select label="Delivery" value={editing.delivery} onChange={(v) => setEditing({ ...editing, delivery: v })}
              options={[{ value: "Online", label: "Online" }, { value: "In-Person", label: "In-Person" }]} />
            <Input label="WhatsApp group link" value={editing.whatsappLink} onChange={(v) => setEditing({ ...editing, whatsappLink: v })} />
            <Select label="Status" value={editing.status} onChange={(v) => setEditing({ ...editing, status: v })}
              options={[{ value: "Active", label: "Active" }, { value: "Closed", label: "Closed" }]} />
          </div>
        )}
      </Modal>
    </div>
  );
}

// ---------------- Programmes ----------------
function ProgrammesPage({ programmes, refresh, toast }) {
  const [editing, setEditing] = useState(null);
  const [pendingConfirm, setPendingConfirm] = useState(null);

  const blank = { id: null, name: "", category: "Tech", duration: "", fee: 0, description: "", status: "Coming Soon" };

  const askSave = () => {
    if (!editing.name.trim()) return toast.push("Name is required.", "error");
    setPendingConfirm(editing);
  };
  const doSave = () => {
    const all = store.listProgrammes();
    if (pendingConfirm.id) {
      const idx = all.findIndex((x) => x.id === pendingConfirm.id);
      all[idx] = { ...all[idx], ...pendingConfirm };
    } else { all.push({ ...pendingConfirm, id: store.uid() }); }
    store.saveProgrammes(all);
    setPendingConfirm(null); setEditing(null); refresh();
    toast.push("Programme saved — public site updated.", "success");
  };
  const toggleStatus = (p) => {
    const all = store.listProgrammes();
    const idx = all.findIndex((x) => x.id === p.id);
    all[idx].status = all[idx].status === "Active" ? "Coming Soon" : "Active";
    store.saveProgrammes(all); refresh();
    toast.push(`${all[idx].name} → ${all[idx].status}`, "success");
  };
  const remove = (p) => {
    if (!confirm(`Delete "${p.name}" from the public site?`)) return;
    store.saveProgrammes(store.listProgrammes().filter((x) => x.id !== p.id));
    refresh();
    toast.push("Programme deleted.", "success");
  };

  const grouped = { Tech: [], Management: [], "Short Term": [] };
  programmes.forEach((p) => grouped[p.category]?.push(p));

  return (
    <div>
      <PageHeader title="Programmes" subtitle={`${programmes.length} programmes`}
        right={
          <button onClick={() => setEditing(blank)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-elegant hover:opacity-90">
            <Plus className="w-4 h-4" /> New programme
          </button>
        } />

      {Object.keys(grouped).map((cat) => (
        <div key={cat} className="mb-6">
          <h2 className="font-display font-semibold text-muted-foreground mb-2 text-sm uppercase tracking-wide">{cat} ({grouped[cat].length})</h2>
          <div className="bg-card border border-border rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Duration</th>
                  <th className="text-left px-4 py-3">Fee</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {grouped[cat].map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition">
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.duration}</td>
                    <td className="px-4 py-3 text-foreground">{formatNGN(p.fee)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-semibold ${
                        p.status === "Active" ? "bg-success/15 text-success border border-success/30" : "bg-muted text-muted-foreground border border-border"
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => toggleStatus(p)} className="px-2 py-1 border border-border rounded-md text-xs text-foreground hover:bg-muted">Toggle</button>
                        <button onClick={() => setEditing({ ...p })} className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md text-xs text-foreground hover:bg-muted"><Pencil className="w-3 h-3" /> Edit</button>
                        <button onClick={() => remove(p)} className="inline-flex items-center gap-1 px-2 py-1 border border-destructive/40 text-destructive rounded-md text-xs hover:bg-destructive/10"><Trash2 className="w-3 h-3" /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit programme" : "New programme"}
        footer={<><BtnGhost onClick={() => setEditing(null)}>Cancel</BtnGhost><BtnPrimary onClick={askSave}>Save</BtnPrimary></>}>
        {editing && (
          <div className="space-y-3">
            <Input label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Select label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })}
              options={["Tech", "Management", "Short Term"].map((x) => ({ value: x, label: x }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Duration" value={editing.duration} onChange={(v) => setEditing({ ...editing, duration: v })} />
              <Input label="Fee (NGN)" type="number" value={editing.fee} onChange={(v) => setEditing({ ...editing, fee: Number(v) })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Description</label>
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3}
                className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <Select label="Status" value={editing.status} onChange={(v) => setEditing({ ...editing, status: v })}
              options={[{ value: "Active", label: "Active" }, { value: "Coming Soon", label: "Coming Soon" }]} />
          </div>
        )}
      </Modal>

      <Modal open={!!pendingConfirm} onClose={() => setPendingConfirm(null)} title="Confirm public change"
        footer={<><BtnGhost onClick={() => setPendingConfirm(null)}>Cancel</BtnGhost><BtnPrimary onClick={doSave}>Yes, publish</BtnPrimary></>}>
        <p className="text-sm text-muted-foreground">Saving this programme will update the public-facing website immediately. Continue?</p>
      </Modal>
    </div>
  );
}

// ---------------- Admins ----------------
function AdminsPage({ session, refresh, toast }) {
  const admins = store.listAdmins();
  const [editing, setEditing] = useState(null);
  const blank = { id: null, name: "", email: "", password: "", role: "Admin", active: true };

  const save = () => {
    if (!editing.name.trim() || !editing.email.trim() || !editing.password.trim())
      return toast.push("Name, email and password are required.", "error");
    const all = store.listAdmins();
    if (editing.id) {
      const idx = all.findIndex((x) => x.id === editing.id);
      all[idx] = { ...all[idx], ...editing };
    } else {
      if (all.some((a) => a.email.toLowerCase() === editing.email.toLowerCase()))
        return toast.push("Email already in use.", "error");
      all.push({ ...editing, id: store.uid(), createdAt: store.now() });
      store.logEmail({ to: editing.email, kind: "AdminCreated", subject: "Your Nextserve admin account",
        body: `Login at the admin portal with your email and the temporary password: ${editing.password}` });
    }
    store.saveAdmins(all); setEditing(null); refresh();
    toast.push("Admin saved.", "success");
  };
  const toggleActive = (a) => {
    const all = store.listAdmins();
    const idx = all.findIndex((x) => x.id === a.id);
    all[idx].active = !all[idx].active;
    store.saveAdmins(all);
    if (!all[idx].active) {
      const sess = store.getSession();
      if (sess && sess.adminId === a.id) store.clearSession();
    }
    refresh();
    toast.push(`${a.email} ${all[idx].active ? "activated" : "deactivated"}.`, "success");
  };
  const remove = (a) => {
    if (a.id === session.adminId) return toast.push("You cannot delete your own account.", "error");
    if (!confirm(`Delete admin ${a.email}?`)) return;
    store.saveAdmins(store.listAdmins().filter((x) => x.id !== a.id));
    refresh();
    toast.push("Admin deleted.", "success");
  };
  const resetPassword = (a) => {
    const pw = "Temp" + Math.random().toString(36).slice(2, 8) + "!";
    const all = store.listAdmins();
    const idx = all.findIndex((x) => x.id === a.id);
    all[idx].password = pw;
    store.saveAdmins(all);
    store.logEmail({ to: a.email, kind: "PasswordReset", subject: "Your Nextserve password was reset", body: `Your new temporary password is: ${pw}` });
    toast.push(`Password reset. Temp: ${pw}`, "success");
    refresh();
  };

  return (
    <div>
      <PageHeader title="Admin Accounts" subtitle={`${admins.length} accounts`}
        right={
          <button onClick={() => setEditing(blank)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-elegant hover:opacity-90">
            <Plus className="w-4 h-4" /> New admin
          </button>
        } />
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/30 transition">
                <td className="px-4 py-3 font-medium text-foreground">
                  <div className="flex items-center gap-3"><Avatar name={a.name} /> {a.name}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-semibold ${
                    a.role === "SuperAdmin" ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted text-muted-foreground border border-border"
                  }`}>{a.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-semibold ${
                    a.active ? "bg-success/15 text-success border border-success/30" : "bg-muted text-muted-foreground border border-border"
                  }`}>{a.active ? "Active" : "Deactivated"}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setEditing({ ...a })} className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md text-xs text-foreground hover:bg-muted"><Pencil className="w-3 h-3" /> Edit</button>
                    <button onClick={() => toggleActive(a)} className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md text-xs text-foreground hover:bg-muted"><Power className="w-3 h-3" /> {a.active ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => resetPassword(a)} className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md text-xs text-foreground hover:bg-muted"><KeyRound className="w-3 h-3" /> Reset</button>
                    <button onClick={() => remove(a)} disabled={a.id === session.adminId}
                      className="inline-flex items-center gap-1 px-2 py-1 border border-destructive/40 text-destructive rounded-md text-xs disabled:opacity-40 hover:bg-destructive/10"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit admin" : "New admin"}
        footer={<><BtnGhost onClick={() => setEditing(null)}>Cancel</BtnGhost><BtnPrimary onClick={save}>Save</BtnPrimary></>}>
        {editing && (
          <div className="space-y-3">
            <Input label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Input label="Email" value={editing.email} onChange={(v) => setEditing({ ...editing, email: v })} />
            <Input label={editing.id ? "Password (leave to keep)" : "Temporary password"} value={editing.password} onChange={(v) => setEditing({ ...editing, password: v })} />
            <Select label="Role" value={editing.role} onChange={(v) => setEditing({ ...editing, role: v })}
              options={[{ value: "Admin", label: "Admin" }, { value: "SuperAdmin", label: "Super Admin" }]} />
          </div>
        )}
      </Modal>
    </div>
  );
}

// ---------------- Analytics ----------------
function AnalyticsPage({ students, cohorts, programmes, toast }) {
  const cmap = Object.fromEntries(cohorts.map((c) => [c.id, c]));
  const pmap = Object.fromEntries(programmes.map((p) => [p.id, p]));

  const byStatus = students.reduce((a, s) => ((a[s.status] = (a[s.status] || 0) + 1), a), {});
  const revenueConfirmed = students.filter((s) => s.status === "Confirmed").reduce((a, s) => a + (s.depositAmount || 0), 0);
  const pendingValue = students.filter((s) => s.status === "Pending").reduce((a, s) => a + (s.depositAmount || 0), 0);

  const perCohort = cohorts.map((c) => {
    const ss = students.filter((s) => s.cohortId === c.id);
    return {
      name: c.name, total: ss.length,
      confirmed: ss.filter((s) => s.status === "Confirmed").length,
      revenue: ss.filter((s) => s.status === "Confirmed").reduce((a, s) => a + (s.depositAmount || 0), 0),
    };
  });

  const notPaidByProg = programmes
    .map((p) => ({ name: p.name, n: students.filter((s) => s.programmeId === p.id && s.status === "NotPaid").length }))
    .filter((x) => x.n > 0).sort((a, b) => b.n - a.n);

  const exportCSV = () => {
    const headers = ["id", "fullName", "email", "phone", "whatsapp", "programme", "cohort", "delivery", "paymentType", "depositAmount", "status", "referralCode", "rejectionReason", "createdAt", "updatedAt"];
    const rows = students.map((s) => [
      s.id, s.fullName, s.email, s.phone, s.whatsapp,
      pmap[s.programmeId]?.name || "", cmap[s.cohortId]?.name || "",
      s.delivery, s.paymentType, s.depositAmount, s.status,
      s.referralCode, s.rejectionReason, s.createdAt, s.updatedAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((cell) => {
      const v = cell == null ? "" : String(cell);
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `nsitm-students-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.push("CSV exported.", "success");
  };

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Snapshot of operations."
        right={
          <button onClick={exportCSV} className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-elegant hover:opacity-90">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        } />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPI label="Confirmed revenue" v={formatNGN(revenueConfirmed)} accent="from-success/30 to-success/5" />
        <KPI label="Pending value" v={formatNGN(pendingValue)} accent="from-warning/30 to-warning/5" />
        <KPI label="Confirmed" v={byStatus.Confirmed || 0} accent="from-primary/30 to-primary/5" />
        <KPI label="Not Paid" v={byStatus.NotPaid || 0} accent="from-muted to-muted/0" />
      </div>

      <BarChart title="Enrollments per cohort" data={perCohort.map((c) => ({ label: c.name, value: c.total }))} />
      <BarChart title="Confirmed revenue per cohort (NGN)" data={perCohort.map((c) => ({ label: c.name, value: c.revenue }))} />
      <BarChart title="Not-Paid records by programme" data={notPaidByProg.map((p) => ({ label: p.name, value: p.n }))} />
    </div>
  );
}

function KPI({ label, v, accent = "from-primary/20 to-primary/0" }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-4 relative overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60`} />
      <div className="relative">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{label}</div>
        <div className="text-xl font-display font-bold text-foreground mt-1">{v}</div>
      </div>
    </div>
  );
}

// ---------------- Canvas charts ----------------
function readVar(name) {
  if (typeof window === "undefined") return "#fff";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#fff";
}

function BarChart({ title, data }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = 240;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const muted = readVar("--muted-foreground") || "#94a3b8";
    if (!data.length) {
      ctx.fillStyle = muted; ctx.font = "14px DM Sans"; ctx.fillText("No data", 10, 30); return;
    }
    const max = Math.max(...data.map((d) => d.value), 1);
    const pad = 30;
    const bw = (w - pad * 2) / data.length;
    data.forEach((d, i) => {
      const bh = ((h - 50) * d.value) / max;
      const x = pad + i * bw + 4;
      const y = h - 30 - bh;
      const grad = ctx.createLinearGradient(0, y, 0, y + bh);
      grad.addColorStop(0, "oklch(0.78 0.18 285)");
      grad.addColorStop(1, "oklch(0.55 0.22 277)");
      ctx.fillStyle = grad;
      const r = 4;
      const bwReal = bw - 8;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + bwReal - r, y);
      ctx.quadraticCurveTo(x + bwReal, y, x + bwReal, y + r);
      ctx.lineTo(x + bwReal, y + bh);
      ctx.lineTo(x, y + bh);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = muted;
      ctx.font = "10px DM Sans";
      ctx.fillText(String(d.value), x, y - 6);
      const label = d.label.length > 14 ? d.label.slice(0, 13) + "…" : d.label;
      ctx.fillText(label, x, h - 12);
    });
  }, [data]);
  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4">
      <h3 className="font-display font-semibold mb-3 text-foreground">{title}</h3>
      <canvas ref={canvasRef} style={{ width: "100%", height: 240 }} />
    </div>
  );
}

function LineChart({ students, days = 30 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = 220;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const buckets = Array(days).fill(0);
    const dayMs = 86400000;
    const start = Date.now() - days * dayMs;
    students.forEach((s) => {
      const t = new Date(s.createdAt).getTime();
      if (t >= start) {
        const idx = Math.min(days - 1, Math.floor((t - start) / dayMs));
        buckets[idx]++;
      }
    });
    const max = Math.max(...buckets, 1);
    const pad = 30;
    const innerW = w - pad * 2;
    const innerH = h - 40;
    const muted = readVar("--muted-foreground") || "#94a3b8";

    // grid
    ctx.strokeStyle = "oklch(1 0 0 / 0.06)"; ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const y = 10 + (innerH * i) / 4;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + innerW, y); ctx.stroke();
    }
    // area
    const points = buckets.map((v, i) => {
      const x = pad + (innerW * i) / (days - 1);
      const y = 10 + innerH - (innerH * v) / max;
      return [x, y];
    });
    const fill = ctx.createLinearGradient(0, 0, 0, h);
    fill.addColorStop(0, "oklch(0.65 0.2 280 / 0.4)");
    fill.addColorStop(1, "oklch(0.65 0.2 280 / 0)");
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(points[0][0], 10 + innerH);
    points.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(points[points.length - 1][0], 10 + innerH);
    ctx.closePath(); ctx.fill();
    // line
    ctx.strokeStyle = "oklch(0.7 0.2 285)"; ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
    // axis labels
    ctx.fillStyle = muted; ctx.font = "10px DM Sans";
    ctx.fillText(`${days}d ago`, pad, h - 8);
    ctx.fillText("Today", w - pad - 30, h - 8);
    ctx.fillText(`peak ${max}`, w - pad - 50, 18);
  }, [students, days]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 220 }} />;
}

function DonutChart({ counts }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = 220;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const segs = [
      { v: counts.Confirmed || 0, color: "oklch(0.72 0.18 155)", label: "Confirmed" },
      { v: counts.Pending || 0, color: "oklch(0.82 0.17 80)", label: "Pending" },
      { v: counts.Rejected || 0, color: "oklch(0.65 0.22 25)", label: "Rejected" },
      { v: counts.NotPaid || 0, color: "oklch(0.55 0.04 270)", label: "Not Paid" },
    ];
    const total = segs.reduce((a, s) => a + s.v, 0) || 1;
    const cx = w / 2 - 30, cy = h / 2, r = 80, rin = 50;
    let start = -Math.PI / 2;
    segs.forEach((s) => {
      const angle = (s.v / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.arc(cx, cy, rin, start + angle, start, true);
      ctx.closePath();
      ctx.fillStyle = s.color; ctx.fill();
      start += angle;
    });
    ctx.fillStyle = readVar("--foreground") || "#fff";
    ctx.font = "bold 22px Space Grotesk"; ctx.textAlign = "center";
    ctx.fillText(String(counts.total), cx, cy + 2);
    ctx.fillStyle = readVar("--muted-foreground") || "#94a3b8";
    ctx.font = "10px DM Sans";
    ctx.fillText("TOTAL", cx, cy + 18);

    // legend
    ctx.textAlign = "left";
    ctx.font = "11px DM Sans";
    segs.forEach((s, i) => {
      const ly = 30 + i * 22;
      ctx.fillStyle = s.color; ctx.fillRect(w - 110, ly - 8, 10, 10);
      ctx.fillStyle = readVar("--foreground") || "#fff";
      ctx.fillText(`${s.label} (${s.v})`, w - 95, ly);
    });
  }, [counts]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 220 }} />;
}

// ---------------- Emails ----------------
function EmailsPage() {
  const emails = store.listEmails();
  const kindCls = {
    Confirmed: "bg-success/15 text-success border-success/30",
    Rejected: "bg-destructive/15 text-destructive border-destructive/30",
    Reversed: "bg-warning/15 text-warning border-warning/30",
    Received: "bg-info/15 text-info border-info/30",
    AdminCreated: "bg-primary/15 text-primary border-primary/30",
    PasswordReset: "bg-primary/15 text-primary border-primary/30",
  };
  return (
    <div>
      <PageHeader title="Email Log" subtitle="Simulated outbox — every status change and admin invitation lands here." />
      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {emails.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">No emails sent yet.</div>
        )}
        {emails.map((e) => (
          <div key={e.id} className="p-4 hover:bg-muted/30 transition">
            <div className="flex justify-between items-start gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-semibold border ${kindCls[e.kind] || "bg-muted text-muted-foreground border-border"}`}>{e.kind}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(e.at)}</span>
                </div>
                <div className="font-display font-semibold text-foreground">{e.subject}</div>
                <div className="text-xs text-muted-foreground">To: {e.to}</div>
              </div>
            </div>
            <div className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">{e.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Form helpers ----------
function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{label}</label>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ---------------- Root App ----------------
export default function AdminApp() {
  const { session, login, logout } = useAuth();
  const toast = useToast();
  const [view, setView] = useState({ name: "dashboard" });
  const [tick, setTick] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const refresh = () => setTick((t) => t + 1);

  useEffect(() => { store.init(); setTick((t) => t + 1); }, []);

  const programmes = useMemo(() => store.listProgrammes(), [tick]);
  const cohorts = useMemo(() => store.listCohorts(), [tick]);
  const students = useMemo(() => store.listStudents(), [tick]);

  if (!session) {
    return (
      <div className="dark">
        {toast.node}
        <LoginPage onLogin={login} />
      </div>
    );
  }

  let page;
  switch (view.name) {
    case "dashboard":
      page = <DashboardPage students={students} cohorts={cohorts} setView={setView} />; break;
    case "students":
      page = <StudentsPage students={students} programmes={programmes} cohorts={cohorts} setView={setView} />; break;
    case "studentDetail":
      page = <StudentDetailPage studentId={view.id} students={students} programmes={programmes} cohorts={cohorts} session={session} refresh={refresh} toast={toast} setView={setView} />; break;
    case "pending":
      page = <PendingPage students={students} programmes={programmes} setView={setView} />; break;
    case "notpaid":
      page = <NotPaidPage students={students} programmes={programmes} setView={setView} />; break;
    case "cohorts":
      page = <CohortsPage cohorts={cohorts} programmes={programmes} students={students} session={session} refresh={refresh} toast={toast} />; break;
    case "programmes":
      page = session.role === "SuperAdmin" ? <ProgrammesPage programmes={programmes} refresh={refresh} toast={toast} /> : <Forbidden />; break;
    case "admins":
      page = session.role === "SuperAdmin" ? <AdminsPage session={session} refresh={refresh} toast={toast} /> : <Forbidden />; break;
    case "analytics":
      page = session.role === "SuperAdmin" ? <AnalyticsPage students={students} cohorts={cohorts} programmes={programmes} toast={toast} /> : <Forbidden />; break;
    case "emails":
      page = <EmailsPage />; break;
    default:
      page = <DashboardPage students={students} cohorts={cohorts} setView={setView} />;
  }

  const pageTitle = NAV.find((n) => n.id === view.name)?.label || (view.name === "studentDetail" ? "Student" : "Dashboard");

  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground flex w-full">
        {toast.node}
        <Sidebar view={view} setView={setView} session={session} onLogout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border bg-card/40 backdrop-blur-md flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-20">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-medium text-foreground">{pageTitle}</div>
            <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
              Signed in as <span className="text-foreground font-medium">{session.email}</span>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-x-auto">{page}</main>
        </div>
      </div>
    </div>
  );
}

function Forbidden() {
  return (
    <div className="p-12 bg-card border border-border rounded-2xl text-center">
      <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <h2 className="text-xl font-display font-semibold text-foreground">403 — Forbidden</h2>
      <p className="text-sm text-muted-foreground mt-1">This area is restricted to Super Admin accounts.</p>
    </div>
  );
}