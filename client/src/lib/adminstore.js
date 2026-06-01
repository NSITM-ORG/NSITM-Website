// NSITM admin store — localStorage-backed CRUD + rich seed data (v2).

const KEYS = {
  admins: "nsitm.admins",
  programmes: "nsitm.programmes",
  cohorts: "nsitm.cohorts",
  students: "nsitm.students",
  emails: "nsitm.emails",
  session: "nsitm.session",
  lockouts: "nsitm.lockouts",
  seeded: "nsitm.seeded.v2",
};

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Deterministic-ish pseudo-random so seed is repeatable per browser
let seed = 1337;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const choose = (n, arr) => Array.from({ length: n }, () => pick(arr));

// ---------- Seed ----------
const TECH = [
  ["Fullstack Web Development", "6 months", 450000],
  ["Frontend Development", "4 months", 320000],
  ["Backend Development", "4 months", 340000],
  ["Mobile App Development", "5 months", 380000],
  ["Data Analytics", "4 months", 350000],
  ["Data Science", "6 months", 480000],
  ["UI/UX Design", "3 months", 280000],
  ["Product Design", "4 months", 320000],
  ["DevOps Engineering", "5 months", 420000],
  ["Cloud Computing", "5 months", 410000],
  ["Cybersecurity", "6 months", 460000],
  ["AI & Machine Learning", "6 months", 520000],
  ["Software Testing / QA", "3 months", 260000],
  ["Game Development", "5 months", 390000],
  ["Blockchain Development", "5 months", 440000],
];
const MGMT = [
  ["Project Management", "3 months", 240000],
  ["Product Management", "3 months", 260000],
  ["Business Analysis", "3 months", 230000],
  ["Digital Marketing", "3 months", 220000],
  ["Human Resource Management", "3 months", 200000],
  ["Operations Management", "3 months", 215000],
  ["Entrepreneurship", "2 months", 180000],
];
const SHORT = [
  ["MS Office Suite", "6 weeks", 65000],
  ["Graphics Design", "8 weeks", 95000],
  ["Video Editing", "6 weeks", 80000],
  ["Content Writing", "6 weeks", 70000],
];

const desc = (name) =>
  `${name} — hands-on curriculum with live capstone projects, weekly mentor sessions, and career placement support from the Nextserve network.`;

function buildProgrammes() {
  const mk = (rows, category, activeCount) =>
    rows.map(([name, duration, fee], i) => ({
      id: uid(),
      name,
      category,
      duration,
      fee,
      description: desc(name),
      status: i < activeCount ? "Active" : "Coming Soon",
    }));
  return [
    ...mk(TECH, "Tech", 10),
    ...mk(MGMT, "Management", 5),
    ...mk(SHORT, "Short Term", 4),
  ];
}

function buildCohorts(programmes) {
  const find = (n) => programmes.find((p) => p.name === n);
  const rows = [
    ["Jan 2026 Fullstack — Online", "Fullstack Web Development", "2026-01-15", "2026-07-15", "Online"],
    ["Feb 2026 Frontend — In-Person Lagos", "Frontend Development", "2026-02-05", "2026-06-05", "In-Person"],
    ["Mar 2026 UI/UX — Online", "UI/UX Design", "2026-03-01", "2026-06-01", "Online"],
    ["Apr 2026 Data Analytics — Online", "Data Analytics", "2026-04-10", "2026-08-10", "Online"],
    ["May 2026 Cybersecurity — In-Person Abuja", "Cybersecurity", "2026-05-06", "2026-11-06", "In-Person"],
    ["Jun 2026 Product Mgmt — Online", "Product Management", "2026-06-03", "2026-09-03", "Online"],
    ["Jul 2026 Digital Marketing — Online", "Digital Marketing", "2026-07-01", "2026-10-01", "Online"],
    ["Aug 2026 Mobile Dev — In-Person Lagos", "Mobile App Development", "2026-08-12", "2027-01-12", "In-Person"],
  ];
  return rows.map(([name, prog, start, end, delivery], i) => ({
    id: uid(),
    name,
    programmeId: find(prog)?.id,
    startDate: start,
    endDate: end,
    delivery,
    whatsappLink: `https://chat.whatsapp.com/nsitm-${prog.toLowerCase().replace(/[^a-z]+/g, "-")}-${i}`,
    status: "Active",
  }));
}

const FIRST_NAMES = [
  "Chinedu", "Aisha", "Tomiwa", "Ifeoma", "Bola", "Ngozi", "Yusuf", "Adaeze", "Kemi",
  "Emeka", "Funke", "Sade", "Tunde", "Halima", "Obinna", "Zainab", "Olumide", "Chiamaka",
  "Femi", "Ada", "Segun", "Ruth", "Ibrahim", "Grace", "Tobi", "Mariam", "Chukwudi",
  "Blessing", "Hassan", "Tochukwu", "Amaka", "Damilola", "Fatima", "Kelechi", "Uche",
  "Babatunde", "Joy", "Suleiman", "Peace", "Anthony", "Onyeka", "Mercy", "Aliyu",
  "Sandra", "Daniel", "Esther", "Musa", "Chioma", "Olamide", "Hauwa",
];
const LAST_NAMES = [
  "Okafor", "Bello", "Adeyemi", "Eze", "Aminu", "Balogun", "Ojo", "Nwankwo", "Olawale",
  "Yakubu", "Abubakar", "Okeke", "Ogundipe", "Lawal", "Onyeka", "Ibrahim", "Adekunle",
  "Mohammed", "Okonkwo", "Adesina", "Garba", "Chukwu", "Akinola", "Salami", "Bamidele",
];

const REJECTION_REASONS = [
  "Receipt amount does not match the expected deposit.",
  "Receipt is unreadable — please re-upload a clearer image.",
  "Account name on the receipt does not match your enrollment record.",
  "Payment was reversed by the bank. Please re-initiate the transfer.",
  "Transfer was made to an old account number. Use the updated details.",
];

function phone(i) {
  const prefixes = ["803", "806", "813", "814", "816", "703", "706", "813", "905", "908"];
  const p = prefixes[i % prefixes.length];
  const tail = String(1000000 + ((i * 73 + 4319) % 8999999)).slice(0, 7);
  return `+234${p}${tail}`;
}

function placeholderReceipt(i, amount) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='620'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stop-color='#1e1b4b'/>
        <stop offset='1' stop-color='#0f172a'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <rect x='24' y='24' width='432' height='572' rx='14' fill='#0b1020' stroke='#3730a3'/>
    <text x='44' y='72' font-family='Space Grotesk, sans-serif' font-size='22' fill='#a5b4fc' font-weight='700'>NEXTSERVE BANK</text>
    <text x='44' y='100' font-family='DM Sans, sans-serif' font-size='13' fill='#94a3b8'>Transfer Receipt</text>
    <line x1='44' y1='118' x2='436' y2='118' stroke='#1e293b'/>
    <text x='44' y='160' font-family='DM Sans' font-size='13' fill='#94a3b8'>Reference</text>
    <text x='44' y='180' font-family='Space Grotesk' font-size='15' fill='#e2e8f0' font-weight='600'>TRX-${100000 + i * 137}</text>
    <text x='44' y='220' font-family='DM Sans' font-size='13' fill='#94a3b8'>Amount</text>
    <text x='44' y='244' font-family='Space Grotesk' font-size='22' fill='#34d399' font-weight='700'>NGN ${amount.toLocaleString()}</text>
    <text x='44' y='290' font-family='DM Sans' font-size='13' fill='#94a3b8'>Beneficiary</text>
    <text x='44' y='310' font-family='Space Grotesk' font-size='14' fill='#e2e8f0' font-weight='600'>NSITM / Nextserve School</text>
    <text x='44' y='350' font-family='DM Sans' font-size='13' fill='#94a3b8'>Date</text>
    <text x='44' y='370' font-family='Space Grotesk' font-size='14' fill='#e2e8f0'>2026-${String(((i % 12) + 1)).padStart(2,'0')}-${String(((i % 27) + 1)).padStart(2,'0')} 09:${String((i * 7) % 60).padStart(2,'0')}</text>
    <text x='44' y='410' font-family='DM Sans' font-size='13' fill='#94a3b8'>Channel</text>
    <text x='44' y='430' font-family='Space Grotesk' font-size='14' fill='#e2e8f0'>Mobile Transfer</text>
    <rect x='44' y='460' width='130' height='32' rx='6' fill='#065f46'/>
    <text x='65' y='481' font-family='Space Grotesk' font-size='13' fill='#a7f3d0' font-weight='600'>SUCCESSFUL</text>
    <text x='44' y='560' font-family='monospace' font-size='10' fill='#475569'>--- end of receipt --- · auto-generated demo</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildStudents(programmes, cohorts) {
  const activeProgs = programmes.filter((p) => p.status === "Active");
  const N = 120;
  const out = [];
  // status distribution: 20 NotPaid, 30 Pending, 54 Confirmed, 16 Rejected
  const statusBag = [
    ...Array(20).fill("NotPaid"),
    ...Array(30).fill("Pending"),
    ...Array(54).fill("Confirmed"),
    ...Array(16).fill("Rejected"),
  ];
  // shuffle
  for (let i = statusBag.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [statusBag[i], statusBag[j]] = [statusBag[j], statusBag[i]];
  }

  for (let i = 0; i < N; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3 + 7) % LAST_NAMES.length];
    const status = statusBag[i];
    // pick a cohort+programme combo
    const cohort = cohorts[i % cohorts.length];
    const programme = programmes.find((p) => p.id === cohort.programmeId) || activeProgs[i % activeProgs.length];
    const paymentType = i % 3 === 0 ? "Instalment" : "Full";
    const depositAmount = paymentType === "Instalment" ? Math.round(programme.fee / 2) : programme.fee;
    const hasReceipt = status !== "NotPaid";
    const daysAgo = Math.floor(rand() * 90);
    const created = new Date(Date.now() - daysAgo * 86400000 - Math.floor(rand() * 86400000)).toISOString();
    const ph = phone(i);

    out.push({
      id: uid(),
      fullName: `${fn} ${ln}`,
      phone: ph,
      whatsapp: ph,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      programmeId: programme.id,
      cohortId: cohort.id,
      delivery: cohort.delivery,
      paymentType,
      depositAmount,
      referralCode: rand() < 0.3 ? `REF-${String(100 + i).padStart(4, "0")}` : "",
      receipt: hasReceipt
        ? { name: `receipt-${i + 1}.svg`, type: "image/svg+xml", dataUrl: placeholderReceipt(i, depositAmount) }
        : null,
      status,
      rejectionReason: status === "Rejected" ? REJECTION_REASONS[i % REJECTION_REASONS.length] : "",
      emailFailed: status === "Confirmed" && i % 37 === 0,
      createdAt: created,
      updatedAt: created,
    });
  }
  return out;
}

function buildAdmins() {
  return [
    {
      id: uid(),
      name: "Ekene Dominic",
      email: "superadmin@nextserve.test",
      password: "Super123!",
      role: "SuperAdmin",
      active: true,
      createdAt: now(),
    },
    {
      id: uid(),
      name: "Operations Admin",
      email: "admin@nextserve.test",
      password: "Admin123!",
      role: "Admin",
      active: true,
      createdAt: now(),
    },
    {
      id: uid(),
      name: "Finance Desk",
      email: "finance@nextserve.test",
      password: "Finance123!",
      role: "Admin",
      active: true,
      createdAt: now(),
    },
    {
      id: uid(),
      name: "Former Intern",
      email: "intern@nextserve.test",
      password: "Intern123!",
      role: "Admin",
      active: false,
      createdAt: now(),
    },
  ];
}

function buildEmails(students, programmes, cohorts) {
  const pmap = Object.fromEntries(programmes.map((p) => [p.id, p]));
  const cmap = Object.fromEntries(cohorts.map((c) => [c.id, c]));
  const log = [];
  const sample = students.filter((s) => s.status !== "NotPaid").slice(0, 40);
  sample.forEach((s, i) => {
    const at = new Date(Date.now() - i * 3600 * 1000 * 6).toISOString();
    if (s.status === "Confirmed") {
      log.push({
        id: uid(), at,
        to: s.email, kind: "Confirmed",
        subject: "Your Nextserve enrollment is confirmed",
        body: `Hi ${s.fullName}, your payment for ${pmap[s.programmeId]?.name} (${cmap[s.cohortId]?.name}) has been confirmed. Join your cohort WhatsApp group: ${cmap[s.cohortId]?.whatsappLink}`,
      });
    } else if (s.status === "Rejected") {
      log.push({
        id: uid(), at,
        to: s.email, kind: "Rejected",
        subject: "Your Nextserve payment could not be verified",
        body: `Hi ${s.fullName}, we couldn't verify your payment. Reason: ${s.rejectionReason} Please contact us on WhatsApp.`,
      });
    } else {
      log.push({
        id: uid(), at,
        to: s.email, kind: "Received",
        subject: "We've received your enrollment",
        body: `Hi ${s.fullName}, thanks for enrolling in ${pmap[s.programmeId]?.name}. We'll review your payment within 24 hours.`,
      });
    }
  });
  log.push({
    id: uid(), at: new Date(Date.now() - 86400000).toISOString(),
    to: "finance@nextserve.test", kind: "AdminCreated",
    subject: "Your Nextserve admin account",
    body: "Login at the admin portal with your email and the temporary password: Finance123!",
  });
  log.push({
    id: uid(), at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    to: "intern@nextserve.test", kind: "PasswordReset",
    subject: "Your Nextserve password was reset",
    body: "Your new temporary password is: TempXyz12!",
  });
  return log;
}

function seedIfEmpty() {
  if (localStorage.getItem(KEYS.seeded)) return;
  // clear older versions
  ["nsitm.seeded.v1"].forEach((k) => localStorage.removeItem(k));

  const programmes = buildProgrammes();
  const cohorts = buildCohorts(programmes);
  const admins = buildAdmins();
  const students = buildStudents(programmes, cohorts);
  const emails = buildEmails(students, programmes, cohorts);

  write(KEYS.programmes, programmes);
  write(KEYS.cohorts, cohorts);
  write(KEYS.admins, admins);
  write(KEYS.students, students);
  write(KEYS.emails, emails);
  localStorage.setItem(KEYS.seeded, "1");
}

// ---------- Public API ----------
export const store = {
  init() { seedIfEmpty(); },
  reset() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    seed = 1337;
    seedIfEmpty();
  },

  getSession: () => read(KEYS.session, null),
  setSession: (s) => write(KEYS.session, s),
  clearSession: () => localStorage.removeItem(KEYS.session),
  getLockouts: () => read(KEYS.lockouts, {}),
  setLockouts: (l) => write(KEYS.lockouts, l),

  listAdmins: () => read(KEYS.admins, []),
  saveAdmins: (a) => write(KEYS.admins, a),

  listProgrammes: () => read(KEYS.programmes, []),
  saveProgrammes: (p) => write(KEYS.programmes, p),

  listCohorts: () => read(KEYS.cohorts, []),
  saveCohorts: (c) => write(KEYS.cohorts, c),

  listStudents: () => read(KEYS.students, []),
  saveStudents: (s) => write(KEYS.students, s),

  listEmails: () => read(KEYS.emails, []),
  logEmail(entry) {
    const e = read(KEYS.emails, []);
    e.unshift({ id: uid(), at: now(), ...entry });
    write(KEYS.emails, e);
  },

  uid,
  now,
};

export const STATUS_META = {
  NotPaid: { label: "Not Paid", cls: "bg-muted text-muted-foreground border border-border" },
  Pending: { label: "Pending", cls: "bg-warning/15 text-warning border border-warning/30" },
  Confirmed: { label: "Confirmed", cls: "bg-success/15 text-success border border-success/30" },
  Rejected: { label: "Rejected", cls: "bg-destructive/15 text-destructive border border-destructive/30" },
};

export const formatNGN = (n) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};