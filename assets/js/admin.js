/* Zameel founders console.
   Static page; data lives in Supabase behind founder-only row security (see supabase/admin-schema.sql).
   Without a configured database it runs as a preview on the made-up rows in admin-demo.js. */
(() => {
  "use strict";

  /* ---------- settings ---------- */
  const CFG = window.ZAMEEL_ADMIN || {};
  const LIVE = Boolean(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);
  const FOUNDERS = ["Jude", "Marcus", "Gabbie", "Anthony", "Kayne"];
  const PLANS = ["Messaging and email", "Voice", "Back office"];
  const PRICE = { "Messaging and email": 1600, Voice: 2000, "Back office": 2200 };
  const AGENT_COST = 642;          // hired agent all-in, USD a month (JOD 455)
  const SETUP_FEE = 2000;
  const TARGETS = { chat_2min_pct: 90, email_4h_pct: 90, quality_pct: 90, attendance_pct: 95 };
  const ROADMAP = [
    { stage: "First clients", window: "Now to month 6", clients: 3, agents: 9, revenue: 14000 },
    { stage: "Prove and grow", window: "Months 6 to 18", clients: 9, agents: 35, revenue: 70000 },
    { stage: "Bigger accounts", window: "Months 18 to 36", clients: 14, agents: 120, revenue: 255000 },
    { stage: "The target", window: "Months 36 to 54", clients: 20, agents: 300, revenue: 600000 },
  ];
  const STAGES = ["Not contacted", "Contacted", "Call booked", "Support review", "NDA signed", "Proposal sent", "Won", "Lost"];
  const COUNTRIES = ["UAE", "Qatar", "Kuwait", "Bahrain", "Saudi Arabia", "Oman", "Jordan", "USA", "Other"];

  /* ---------- small helpers ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) el.append(k instanceof Node ? k : String(k));
    return el;
  }
  const svgEl = (tag, attrs) => { const el = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v); return el; };
  const usd = (v) => (v == null || v === "" || isNaN(v) ? "—" : "$" + Math.round(Number(v)).toLocaleString("en-US"));
  const usdShort = (v) => (Math.abs(v) >= 1000 ? "$" + (v / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "k" : "$" + Math.round(v));
  const pct = (v) => (v == null || v === "" ? "—" : Math.round(Number(v)) + "%");
  const todayStr = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  const addDays = (s, n) => { const d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const daysBetween = (a, b) => Math.round((new Date(b + "T00:00:00Z") - new Date(a + "T00:00:00Z")) / 864e5);
  const fmtDate = (s) => (s ? new Date(String(s).slice(0, 10) + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—");
  const fmtMonth = (s) => (s ? new Date(s + "-01T00:00:00Z").toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }) : "—");
  const monthName = (s) => new Date(s + "-01T00:00:00Z").toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  const sum = (arr, f) => arr.reduce((s, r) => s + (Number(f(r)) || 0), 0);
  const chip = (text, tone) => h("span", { class: "chip " + (tone || "") , text });
  const TONES = { Live: "ok", Paid: "ok", Signed: "ok", Done: "ok", Won: "ok", Onboarding: "info", Training: "info", Sent: "info", "In progress": "warn", Due: "warn", Draft: "", Overdue: "bad", Lost: "", Ended: "", Paused: "warn", Proposal: "info", Applicant: "info", Bench: "", Left: "", "To do": "", "Not sent": "", Void: "" };
  const statusChip = (s) => chip(s || "—", TONES[s] ?? "");

  let toastTimer;
  function toast(msg, isError) {
    const t = $("#toast"); t.textContent = msg; t.className = "toast" + (isError ? " error" : ""); t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, isError ? 6000 : 2400);
  }

  /* ---------- data ---------- */
  const TABLES = ["clients", "contracts", "invoices", "agents", "sla_months", "leads", "expenses", "recurring", "setup_tasks"];
  const data = Object.fromEntries(TABLES.map((t) => [t, []]));
  const db = LIVE ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey) : null;
  let user = null;

  async function loadAll() {
    if (!LIVE) {
      const demo = window.ZAMEEL_ADMIN_DEMO || {};
      TABLES.forEach((t) => { data[t] = (demo[t] || []).map((r) => ({ ...r })); });
      return;
    }
    const res = await Promise.all(TABLES.map((t) => db.from(t).select("*").limit(5000)));
    res.forEach((r, i) => {
      if (r.error) throw r.error;
      data[TABLES[i]] = r.data;
    });
  }
  async function saveRow(table, row) {
    const clean = { ...row };
    delete clean.created_at;
    if (!LIVE) {
      if (clean.id) { const i = data[table].findIndex((r) => r.id === clean.id); data[table][i] = clean; }
      else { clean.id = "demo-" + Math.random().toString(36).slice(2); data[table].push(clean); }
      return clean;
    }
    clean.updated_by = user?.email || null;
    clean.updated_at = new Date().toISOString();
    const q = clean.id ? db.from(table).update(clean).eq("id", clean.id).select().single() : db.from(table).insert(clean).select().single();
    const { data: saved, error } = await q;
    if (error) throw error;
    const i = data[table].findIndex((r) => r.id === saved.id);
    if (i >= 0) data[table][i] = saved; else data[table].push(saved);
    return saved;
  }
  async function deleteRow(table, id) {
    if (LIVE) { const { error } = await db.from(table).delete().eq("id", id); if (error) throw error; }
    data[table] = data[table].filter((r) => r.id !== id);
  }

  /* ---------- derived values ---------- */
  const clientName = (id) => data.clients.find((c) => c.id === id)?.name || "—";
  const clientFee = (c) => (Number(c.seats) || 0) * (Number(c.price_per_seat) || 0);
  const SOLD = ["Signed", "Onboarding", "Live"];
  function invoiceState(inv) {
    if (inv.status === "Paid" || inv.status === "Void" || inv.status === "Draft") return inv.status;
    return inv.due && inv.due < todayStr() ? "Overdue" : "Due";
  }
  function slaRow(r) {
    const missed = Object.keys(TARGETS).filter((k) => r[k] != null && r[k] !== "" && Number(r[k]) < TARGETS[k]);
    const misses = r.ramp_up ? 0 : missed.length;
    const client = data.clients.find((c) => c.id === r.client_id);
    return { missed, misses, credit: client ? Math.round(clientFee(client) * Math.min(0.1, misses * 0.03)) : 0 };
  }
  function latestSla() {
    const by = {};
    data.sla_months.forEach((r) => { if (!by[r.client_id] || r.month > by[r.client_id].month) by[r.client_id] = r; });
    return Object.values(by);
  }
  const perMonth = (r) => (r.billing === "Yearly" ? Number(r.price_usd) / 12 : r.billing === "One-off" ? 0 : Number(r.price_usd));

  function kpis() {
    const live = data.clients.filter((c) => c.status === "Live");
    const sold = data.clients.filter((c) => SOLD.includes(c.status));
    const open = data.invoices.filter((i) => ["Due", "Overdue"].includes(invoiceState(i)));
    const mrr = sum(live, clientFee);
    const liveAgents = data.agents.filter((a) => a.status === "Live").length;
    const margin = mrr - liveAgents * AGENT_COST;
    const thisMonth = todayStr().slice(0, 7);
    return {
      mrr, mrrSold: sum(sold, clientFee), clientsLive: live.length, clientsSold: sold.length,
      seatsLive: sum(live, (c) => c.seats), seatsSold: sum(sold, (c) => c.seats),
      owed: sum(open, (i) => i.amount_usd), overdue: sum(open.filter((i) => invoiceState(i) === "Overdue"), (i) => i.amount_usd),
      overdueCount: open.filter((i) => invoiceState(i) === "Overdue").length,
      liveAgents, bench: data.agents.filter((a) => a.status === "Bench").length,
      margin, marginPct: mrr ? margin / mrr : null,
      activeLeads: data.leads.filter((l) => !["Not contacted", "Won", "Lost"].includes(l.stage)).length,
      aOpen: data.leads.filter((l) => l.tier === "A" && l.stage === "Not contacted").length,
      monthlyCosts: sum(data.recurring, perMonth),
      spentThisMonth: sum(data.expenses.filter((e) => (e.date || "").startsWith(thisMonth)), (e) => e.amount_usd),
      spentTotal: sum(data.expenses, (e) => e.amount_usd),
    };
  }

  function attention() {
    const t = todayStr(), out = [];
    data.invoices.forEach((i) => {
      const s = invoiceState(i);
      if (s === "Overdue") out.push({ level: "bad", area: "Invoices", go: "invoices", text: `${clientName(i.client_id)}: invoice ${i.number || ""} for ${usd(i.amount_usd)} is ${daysBetween(i.due, t)} day${daysBetween(i.due, t) === 1 ? "" : "s"} overdue` });
      else if (s === "Due" && i.due && daysBetween(t, i.due) <= 3) out.push({ level: "warn", area: "Invoices", go: "invoices", text: `${clientName(i.client_id)}: ${usd(i.amount_usd)} due ${fmtDate(i.due)}` });
    });
    latestSla().forEach((r) => {
      const s = slaRow(r);
      if (s.misses) out.push({ level: "bad", area: "Quality", go: "quality", text: `${clientName(r.client_id)}: missed ${s.misses} service level${s.misses > 1 ? "s" : ""} in ${monthName(r.month)}, ${usd(s.credit)} credit on the next invoice` });
    });
    data.contracts.forEach((c) => {
      if (!c.min_term_end) return; const d = daysBetween(t, c.min_term_end);
      if (d >= 0 && d <= 45) out.push({ level: "warn", area: "Contracts", go: "contracts", text: `${clientName(c.client_id)}: minimum term ends in ${d} days. Ask for the case study and more seats` });
    });
    data.clients.forEach((c) => {
      if (c.status === "Onboarding" && c.go_live && daysBetween(t, c.go_live) <= 7) out.push({ level: "warn", area: "Clients", go: "clients", text: `${c.name}: goes live ${fmtDate(c.go_live)}` });
    });
    data.leads.forEach((l) => {
      if (l.next_date && l.next_date <= t && !["Won", "Lost"].includes(l.stage)) out.push({ level: "warn", area: "Pipeline", go: "pipeline", text: `${l.company}: ${l.next_step || "follow up"} (${l.owner || "no owner"})` });
    });
    data.recurring.forEach((r) => {
      if (r.next_charge && daysBetween(t, r.next_charge) >= 0 && daysBetween(t, r.next_charge) <= 7) out.push({ level: "info", area: "Costs", go: "costs", text: `${r.service}: ${usd(r.price_usd)} charge on ${fmtDate(r.next_charge)}` });
    });
    const late = data.setup_tasks.filter((s) => s.status !== "Done" && s.due && s.due < t);
    late.forEach((s) => out.push({ level: "warn", area: "Setup", go: "setup", text: `${s.item} was due ${fmtDate(s.due)}${s.owner ? " (" + s.owner + ")" : ""}` }));
    const todo = data.setup_tasks.filter((s) => s.status === "To do" && !s.owner);
    if (todo.length) out.push({ level: "info", area: "Setup", go: "setup", text: `${todo.length} setup steps have no owner yet` });
    const rank = { bad: 0, warn: 1, info: 2 };
    return out.sort((a, b) => rank[a.level] - rank[b.level]);
  }

  /* ---------- table definitions ---------- */
  const clientOpts = () => data.clients.slice().sort((a, b) => a.name.localeCompare(b.name)).map((c) => [c.id, c.name]);
  const DEFS = {
    clients: {
      one: "client",
      fields: [
        { k: "name", l: "Client", req: true, full: true },
        { k: "country", l: "Country", type: "select", opts: COUNTRIES },
        { k: "sector", l: "Sector" },
        { k: "plan", l: "Plan", type: "select", opts: PLANS, req: true, def: PLANS[0] },
        { k: "status", l: "Status", type: "select", opts: ["Proposal", "Signed", "Onboarding", "Live", "Paused", "Ended"], def: "Signed" },
        { k: "seats", l: "Seats", type: "int", req: true, def: 3 },
        { k: "price_per_seat", l: "Price per seat (USD)", type: "money", def: 1600, hint: "Rate card: messaging 1,600 · voice 2,000 · back office 2,200" },
        { k: "go_live", l: "Go-live date", type: "date" },
        { k: "account_manager", l: "Account manager", type: "select", opts: FOUNDERS },
        { k: "channels", l: "Channels", hint: "For example WhatsApp, chat, email" },
        { k: "hours", l: "Service hours" },
        { k: "contact_name", l: "Client contact" },
        { k: "contact_email", l: "Contact email", type: "email" },
        { k: "notes", l: "Notes", type: "textarea", full: true },
      ],
      cols: [
        { l: "Client", get: (r) => r.name, cls: "strong" },
        { l: "Country", get: (r) => r.country, cls: "opt" },
        { l: "Plan", get: (r) => r.plan },
        { l: "Seats", get: (r) => r.seats, cls: "r" },
        { l: "Monthly", get: clientFee, show: (r) => usd(clientFee(r)), cls: "r" },
        { l: "Status", get: (r) => r.status, show: (r) => statusChip(r.status) },
        { l: "Go-live", get: (r) => r.go_live, show: (r) => fmtDate(r.go_live), cls: "opt" },
        { l: "Account manager", get: (r) => r.account_manager, cls: "opt" },
      ],
      search: (r) => [r.name, r.sector, r.country, r.plan].join(" "),
      sort: (a, b) => SOLD.indexOf(b.status) - SOLD.indexOf(a.status) || clientFee(b) - clientFee(a),
      filters: { k: "status", opts: ["Live", "Onboarding", "Signed", "Proposal", "Ended"] },
    },
    contracts: {
      one: "contract",
      fields: [
        { k: "client_id", l: "Client", type: "ref", opts: clientOpts, req: true, full: true },
        { k: "order_form", l: "Order form no.", hint: "For example OF-001" },
        { k: "signed", l: "Signed on", type: "date" },
        { k: "nda", l: "NDA", type: "select", opts: ["Not sent", "Sent", "Signed"], def: "Not sent" },
        { k: "msa", l: "MSA and order form", type: "select", opts: ["Not sent", "Sent", "Signed"], def: "Not sent" },
        { k: "dpa", l: "Data processing agreement", type: "select", opts: ["Not sent", "Sent", "Signed"], def: "Not sent" },
        { k: "min_term_end", l: "Minimum term ends", type: "date", hint: "3 months after go-live" },
        { k: "term", l: "Term", type: "select", opts: ["3-month minimum", "2-month minimum", "Rolling monthly"], def: "3-month minimum" },
        { k: "setup_fee", l: "Setup fee", type: "select", opts: ["Credited for case study", "Paid", "Waived"], def: "Credited for case study" },
        { k: "case_study", l: "Case study", hint: "Where it stands" },
        { k: "file_link", l: "Signed copy link", type: "url", full: true, hint: "Link to the PDF in the shared Drive" },
        { k: "notes", l: "Notes", type: "textarea", full: true },
      ],
      cols: [
        { l: "Client", get: (r) => clientName(r.client_id), cls: "strong" },
        { l: "Order form", get: (r) => r.order_form, cls: "opt" },
        { l: "NDA", get: (r) => r.nda, show: (r) => statusChip(r.nda), cls: "opt" },
        { l: "MSA", get: (r) => r.msa, show: (r) => statusChip(r.msa) },
        { l: "DPA", get: (r) => r.dpa, show: (r) => statusChip(r.dpa), cls: "opt" },
        { l: "Minimum term ends", get: (r) => r.min_term_end, show: (r) => fmtDate(r.min_term_end) },
        { l: "Days left", get: (r) => (r.min_term_end ? daysBetween(todayStr(), r.min_term_end) : null), show: (r) => { if (!r.min_term_end) return "—"; const d = daysBetween(todayStr(), r.min_term_end); return d < 0 ? chip("Rolling", "info") : chip(String(d), d <= 45 ? "warn" : ""); }, cls: "r" },
        { l: "Setup fee", get: (r) => r.setup_fee, cls: "opt muted" },
        { l: "Signed copy", get: (r) => r.file_link, show: (r) => (r.file_link ? h("a", { href: r.file_link, target: "_blank", rel: "noopener", text: "Open", onclick: (e) => e.stopPropagation() }) : "—"), cls: "opt" },
      ],
      search: (r) => [clientName(r.client_id), r.order_form, r.case_study].join(" "),
    },
    invoices: {
      one: "invoice",
      fields: [
        { k: "number", l: "Invoice no.", req: true, def: () => nextInvoiceNo() },
        { k: "client_id", l: "Client", type: "ref", opts: clientOpts, req: true },
        { k: "kind", l: "What", type: "select", opts: ["Mobilisation", "Monthly seats", "Setup fee", "Credit note"], def: "Monthly seats" },
        { k: "service_month", l: "Service month", type: "month" },
        { k: "amount_usd", l: "Amount (USD)", type: "money", req: true },
        { k: "status", l: "Status", type: "select", opts: ["Draft", "Sent", "Paid", "Void"], def: "Sent" },
        { k: "issued", l: "Issued", type: "date", def: () => todayStr() },
        { k: "due", l: "Due", type: "date", def: () => addDays(todayStr(), 7), hint: "7 days after issue" },
        { k: "paid_on", l: "Paid on", type: "date" },
        { k: "notes", l: "Notes", type: "textarea", full: true },
      ],
      cols: [
        { l: "Invoice", get: (r) => r.number, cls: "muted nowrap" },
        { l: "Client", get: (r) => clientName(r.client_id), cls: "strong" },
        { l: "What", get: (r) => r.kind, cls: "opt muted" },
        { l: "Month", get: (r) => r.service_month, show: (r) => fmtMonth(r.service_month) },
        { l: "Amount", get: (r) => Number(r.amount_usd), show: (r) => usd(r.amount_usd), cls: "r" },
        { l: "Due", get: (r) => r.due, show: (r) => fmtDate(r.due), cls: "opt" },
        { l: "Status", get: invoiceState, show: (r) => statusChip(invoiceState(r)) },
      ],
      search: (r) => [r.number, clientName(r.client_id), r.kind].join(" "),
      sort: (a, b) => String(b.issued || "").localeCompare(String(a.issued || "")),
      filters: { get: invoiceState, opts: ["Overdue", "Due", "Paid", "Draft"] },
    },
    agents: {
      one: "agent",
      fields: [
        { k: "name", l: "Name", req: true },
        { k: "status", l: "Status", type: "select", opts: ["Applicant", "Training", "Live", "Bench", "Left"], def: "Applicant" },
        { k: "client_id", l: "Client seat", type: "ref", opts: clientOpts },
        { k: "skill", l: "Skill", type: "select", opts: PLANS, def: PLANS[0] },
        { k: "shift", l: "Shift", type: "select", opts: ["Morning", "Evening", "Night", "Split", "Cover"] },
        { k: "start_date", l: "Start date", type: "date" },
        { k: "qa_score", l: "QA score last month (%)", type: "pct" },
        { k: "attendance", l: "Attendance last month (%)", type: "pct" },
        { k: "phone", l: "Phone" },
        { k: "email", l: "Email", type: "email" },
        { k: "notes", l: "Notes", type: "textarea", full: true },
      ],
      cols: [
        { l: "Name", get: (r) => r.name, cls: "strong" },
        { l: "Client", get: (r) => (r.client_id ? clientName(r.client_id) : "—") },
        { l: "Skill", get: (r) => r.skill, cls: "opt muted" },
        { l: "Shift", get: (r) => r.shift, cls: "opt" },
        { l: "Status", get: (r) => r.status, show: (r) => statusChip(r.status) },
        { l: "QA", get: (r) => r.qa_score, show: (r) => (r.qa_score == null ? "—" : chip(pct(r.qa_score), r.qa_score >= 90 ? "ok" : "bad")), cls: "r" },
        { l: "Attendance", get: (r) => r.attendance, show: (r) => pct(r.attendance), cls: "r" },
      ],
      search: (r) => [r.name, clientName(r.client_id), r.skill].join(" "),
      filters: { k: "status", opts: ["Live", "Training", "Bench", "Applicant", "Left"] },
    },
    sla_months: {
      one: "month of results",
      fields: [
        { k: "client_id", l: "Client", type: "ref", opts: clientOpts, req: true },
        { k: "month", l: "Month", type: "month", req: true },
        { k: "chat_2min_pct", l: "Chats answered in 2 min (%)", type: "pct", hint: "Target 90%" },
        { k: "email_4h_pct", l: "Email answered in 4 service hours (%)", type: "pct", hint: "Target 90%" },
        { k: "quality_pct", l: "Quality score (%)", type: "pct", hint: "Target 90%" },
        { k: "attendance_pct", l: "Seat attendance (%)", type: "pct", hint: "Target 95%" },
        { k: "escalation_15min_pct", l: "Escalated within 15 min (%)", type: "pct" },
        { k: "csat_pct", l: "CSAT (%)", type: "pct", hint: "Reported only" },
        { k: "ramp_up", l: "Ramp-up month (no credits)", type: "bool" },
        { k: "notes", l: "Notes", type: "textarea", full: true },
      ],
      cols: [
        { l: "Client", get: (r) => clientName(r.client_id), cls: "strong" },
        { l: "Month", get: (r) => r.month, show: (r) => fmtMonth(r.month) + (r.ramp_up ? " · ramp-up" : "") },
        ...[["chat_2min_pct", "Chat 2 min"], ["email_4h_pct", "Email 4 h"], ["quality_pct", "Quality"], ["attendance_pct", "Attendance"]].map(([k, l]) => ({
          l, cls: "r", get: (r) => r[k], show: (r) => (r[k] == null || r[k] === "" ? "—" : chip(pct(r[k]), Number(r[k]) >= TARGETS[k] ? "ok" : r.ramp_up ? "warn" : "bad")),
        })),
        { l: "Missed", get: (r) => slaRow(r).misses, cls: "r" },
        { l: "Credit", get: (r) => slaRow(r).credit, show: (r) => usd(slaRow(r).credit), cls: "r opt" },
      ],
      search: (r) => clientName(r.client_id),
      sort: (a, b) => String(b.month).localeCompare(String(a.month)),
    },
    leads: {
      one: "lead",
      fields: [
        { k: "company", l: "Company", req: true, full: true },
        { k: "stage", l: "Stage", type: "select", opts: STAGES, def: "Not contacted" },
        { k: "owner", l: "Owner", type: "select", opts: FOUNDERS },
        { k: "tier", l: "Tier", type: "select", opts: ["A", "B", "C", "KSA"], def: "B" },
        { k: "country", l: "Country", type: "select", opts: COUNTRIES },
        { k: "sector", l: "Sector" },
        { k: "website", l: "Website", type: "url" },
        { k: "contact_name", l: "Contact" },
        { k: "contact_role", l: "Their role" },
        { k: "next_step", l: "Next step", full: true },
        { k: "next_date", l: "Next step date", type: "date" },
        { k: "seats_estimate", l: "Possible seats", type: "int" },
        { k: "pain_signal", l: "Why they need us", type: "textarea", full: true },
        { k: "notes", l: "Notes", type: "textarea", full: true },
      ],
      cols: [
        { l: "Company", get: (r) => r.company, cls: "strong" },
        { l: "Tier", get: (r) => r.tier, show: (r) => chip(r.tier || "—", r.tier === "A" ? "hot" : "") },
        { l: "Country", get: (r) => r.country, cls: "opt" },
        { l: "Sector", get: (r) => r.sector, cls: "opt muted wrap" },
        { l: "Stage", get: (r) => STAGES.indexOf(r.stage), show: (r) => statusChip(r.stage) },
        { l: "Owner", get: (r) => r.owner },
        { l: "Next step", get: (r) => r.next_date, show: (r) => (r.next_date ? `${fmtDate(r.next_date)} · ${r.next_step || ""}` : "—"), cls: "opt" },
      ],
      search: (r) => [r.company, r.sector, r.country, r.owner, r.contact_name].join(" "),
      sort: (a, b) => STAGES.indexOf(b.stage) - STAGES.indexOf(a.stage) || ["A", "B", "C", "KSA"].indexOf(a.tier) - ["A", "B", "C", "KSA"].indexOf(b.tier),
      filters: { k: "tier", opts: ["A", "B", "C", "KSA"], label: (o) => (o === "KSA" ? "Saudi back office" : "Tier " + o) },
    },
    expenses: {
      one: "payment",
      fields: [
        { k: "date", l: "Date", type: "date", req: true, def: () => todayStr() },
        { k: "amount_usd", l: "Amount (USD)", type: "money", req: true, hint: "JOD × 1.41" },
        { k: "item", l: "What for", req: true, full: true },
        { k: "vendor", l: "Paid to" },
        { k: "category", l: "Category", type: "select", opts: ["Office", "Legal & registration", "Email & software", "Domains", "Marketing", "Salaries", "Travel", "Bank fees", "Other"] },
        { k: "billing", l: "Billing", type: "select", opts: ["One-off", "Monthly", "Yearly"], def: "One-off" },
        { k: "paid_by", l: "Paid by" },
        { k: "notes", l: "Notes", type: "textarea", full: true },
      ],
      cols: [
        { l: "Date", get: (r) => r.date, show: (r) => fmtDate(r.date) },
        { l: "What for", get: (r) => r.item, cls: "strong wrap" },
        { l: "Category", get: (r) => r.category, cls: "opt muted" },
        { l: "Paid by", get: (r) => r.paid_by, cls: "opt muted wrap" },
        { l: "Amount", get: (r) => Number(r.amount_usd), show: (r) => usd(r.amount_usd), cls: "r" },
      ],
      search: (r) => [r.item, r.vendor, r.category].join(" "),
      sort: (a, b) => String(b.date).localeCompare(String(a.date)),
    },
    recurring: {
      one: "recurring cost",
      fields: [
        { k: "service", l: "Service", req: true, full: true },
        { k: "vendor", l: "Vendor" },
        { k: "billing", l: "Billing", type: "select", opts: ["Monthly", "Yearly"], def: "Monthly" },
        { k: "price_usd", l: "Price per bill (USD)", type: "money", req: true },
        { k: "next_charge", l: "Next charge", type: "date" },
        { k: "notes", l: "Notes", type: "textarea", full: true },
      ],
      cols: [
        { l: "Service", get: (r) => r.service, cls: "strong wrap" },
        { l: "Billing", get: (r) => r.billing, cls: "muted" },
        { l: "Next charge", get: (r) => r.next_charge, show: (r) => fmtDate(r.next_charge) },
        { l: "Per month", get: perMonth, show: (r) => usd(perMonth(r)), cls: "r" },
      ],
      search: (r) => [r.service, r.vendor].join(" "),
    },
    setup_tasks: {
      one: "step",
      fields: [
        { k: "item", l: "Step", req: true, full: true },
        { k: "area", l: "Needed to", type: "select", opts: ["Ready to sign", "Ready to deliver", "Grow"], def: "Ready to sign" },
        { k: "status", l: "Status", type: "select", opts: ["To do", "In progress", "Done"], def: "To do" },
        { k: "owner", l: "Owner", type: "select", opts: FOUNDERS },
        { k: "due", l: "Due", type: "date" },
        { k: "notes", l: "Notes", type: "textarea", full: true },
      ],
      cols: [
        { l: "Step", get: (r) => r.item, cls: "strong wrap" },
        { l: "Needed to", get: (r) => r.area, cls: "opt muted" },
        { l: "Owner", get: (r) => r.owner },
        { l: "Due", get: (r) => r.due, show: (r) => fmtDate(r.due), cls: "opt" },
        { l: "Status", get: (r) => ["In progress", "To do", "Done"].indexOf(r.status), show: (r) => statusChip(r.status) },
      ],
      search: (r) => [r.item, r.owner, r.area].join(" "),
      sort: (a, b) => ["In progress", "To do", "Done"].indexOf(a.status) - ["In progress", "To do", "Done"].indexOf(b.status),
      filters: { k: "status", opts: ["To do", "In progress", "Done"] },
    },
  };
  function nextInvoiceNo() {
    const y = todayStr().slice(0, 4);
    const n = data.invoices.map((i) => (String(i.number || "").match(new RegExp(`ZM-${y}-(\\d+)`)) || [])[1]).filter(Boolean).map(Number);
    return `ZM-${y}-${String((n.length ? Math.max(...n) : 0) + 1).padStart(3, "0")}`;
  }

  /* ---------- drawer form ---------- */
  let drawerState = null;
  function openDrawer(table, row, preset) {
    const def = DEFS[table], isNew = !row;
    const rec = row ? { ...row } : {};
    if (isNew) def.fields.forEach((f) => { if (f.def != null) rec[f.k] = typeof f.def === "function" ? f.def() : f.def; });
    Object.assign(rec, preset || {});
    drawerState = { table, rec, isNew };
    $("#drawer-title").textContent = isNew ? `New ${def.one}` : (rec.name || rec.company || rec.item || rec.service || rec.number || (rec.client_id ? clientName(rec.client_id) : "Edit " + def.one));
    const body = $("#drawer-body"); body.replaceChildren();
    def.fields.forEach((f) => {
      const id = "f-" + f.k, v = rec[f.k];
      let input;
      if (f.type === "select" || f.type === "ref") {
        const opts = typeof f.opts === "function" ? f.opts() : f.opts.map((o) => [o, o]);
        input = h("select", { id, name: f.k }, h("option", { value: "", text: "—" }), opts.map(([val, lbl]) => h("option", { value: val, text: lbl, selected: String(v ?? "") === String(val) })));
      } else if (f.type === "textarea") input = h("textarea", { id, name: f.k }, v ?? "");
      else if (f.type === "bool") input = h("select", { id, name: f.k }, h("option", { value: "false", text: "No", selected: !v }), h("option", { value: "true", text: "Yes", selected: !!v }));
      else {
        const type = { int: "number", money: "number", pct: "number", date: "date", month: "month", email: "email", url: "url" }[f.type] || "text";
        input = h("input", { id, name: f.k, type, value: v ?? "", step: f.type === "money" ? "0.01" : f.type ? "1" : null, min: ["int", "money", "pct"].includes(f.type) ? "0" : null, max: f.type === "pct" ? "100" : null, inputmode: ["int", "money", "pct"].includes(f.type) ? "decimal" : null });
      }
      body.append(h("div", { class: "field" + (f.full || f.type === "textarea" ? " full" : "") }, h("label", { for: id, text: f.l + (f.req ? " *" : "") }), input, f.hint ? h("span", { class: "hint", text: f.hint }) : null));
    });
    if (table === "clients") {
      const plan = $("#f-plan"), price = $("#f-price_per_seat");
      plan.addEventListener("change", () => { if (PRICE[plan.value]) price.value = PRICE[plan.value]; });
    }
    if (table === "invoices") {
      const issued = $("#f-issued"), due = $("#f-due");
      issued.addEventListener("change", () => { if (issued.value) due.value = addDays(issued.value, 7); });
    }
    $("#drawer-delete").hidden = isNew; $("#drawer-confirm").hidden = true;
    $("#scrim").hidden = false; $("#drawer").hidden = false;
    setTimeout(() => body.querySelector("input, select, textarea")?.focus(), 30);
  }
  function closeDrawer() { $("#scrim").hidden = true; $("#drawer").hidden = true; drawerState = null; }
  $("#drawer-close").addEventListener("click", closeDrawer);
  $("#drawer-cancel").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawerState) closeDrawer(); });
  $("#drawer-delete").addEventListener("click", () => { $("#drawer-confirm").hidden = false; $("#drawer-delete").hidden = true; });
  $("#drawer-delete-yes").addEventListener("click", async () => {
    const { table, rec } = drawerState;
    try { await deleteRow(table, rec.id); closeDrawer(); toast("Deleted"); render(); }
    catch (err) { toast("Couldn't delete: " + (err.message || err), true); }
  });
  $("#drawer-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { table, rec } = drawerState, def = DEFS[table];
    let ok = true;
    def.fields.forEach((f) => {
      const el = $("#f-" + f.k); let v = el.value.trim();
      el.closest(".field").classList.remove("invalid");
      if (f.type === "bool") v = v === "true";
      else if (["int", "money", "pct"].includes(f.type)) v = v === "" ? null : Number(v);
      else if (v === "") v = null;
      if (f.req && (v == null || v === "")) { ok = false; el.closest(".field").classList.add("invalid"); }
      rec[f.k] = v;
    });
    if (!ok) { toast("Fill in the fields marked with *", true); return; }
    const btn = $("#drawer-save"); btn.disabled = true; btn.textContent = "Saving…";
    try { await saveRow(table, rec); closeDrawer(); toast(LIVE ? "Saved" : "Saved in this preview only"); render(); }
    catch (err) { toast("Couldn't save: " + (err.message || err), true); }
    finally { btn.disabled = false; btn.textContent = "Save"; }
  });

  /* ---------- list view ---------- */
  const viewState = {};
  function listView(table, { title, note, limitHeight } = {}) {
    const def = DEFS[table];
    const st = viewState[table] || (viewState[table] = { q: "", filter: "", sortCol: null, dir: 1 });
    const wrap = h("section", { class: "panel" });
    const tbody = h("tbody");
    const countEl = h("span", { class: "count" });
    const head = h("tr", null, def.cols.map((c, i) => {
      const th = h("th", { class: c.cls || "", "aria-sort": st.sortCol === i ? (st.dir > 0 ? "ascending" : "descending") : null },
        h("button", { type: "button", text: c.l, onclick: () => { st.dir = st.sortCol === i ? -st.dir : 1; st.sortCol = i; draw(); head.querySelectorAll("th").forEach((t, j) => (j === i ? t.setAttribute("aria-sort", st.dir > 0 ? "ascending" : "descending") : t.removeAttribute("aria-sort"))); } }));
      return th;
    }));
    const search = h("input", { type: "search", placeholder: "Search", "aria-label": "Search " + (title || def.one), value: st.q, oninput: (e) => { st.q = e.target.value.toLowerCase(); draw(); } });
    const tools = h("div", { class: "toolbar" }, search);
    if (def.filters) {
      const seg = h("div", { class: "seg", role: "group", "aria-label": "Filter" });
      const mk = (val, label) => h("button", { type: "button", "aria-pressed": String(st.filter === val), text: label, onclick: (e) => { st.filter = val; seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget))); draw(); } });
      seg.append(mk("", "All"), ...def.filters.opts.map((o) => mk(o, def.filters.label ? def.filters.label(o) : o)));
      tools.append(seg);
    }
    tools.append(countEl);
    const tableWrap = h("div", { class: "table-wrap" }, h("table", { class: "data" }, h("thead", null, head), tbody));
    if (limitHeight) tableWrap.style.maxHeight = limitHeight;
    const titleRow = title ? h("div", { class: "panel-head" }, h("h2", { text: title }), h("button", { class: "link-btn", type: "button", text: "+ Add " + def.one, onclick: () => openDrawer(table) })) : null;
    wrap.append(...[titleRow, note ? h("p", { class: "panel-note", text: note }) : null, tools, tableWrap].filter(Boolean));

    function draw() {
      let rows = data[table].slice();
      if (def.sort) rows.sort(def.sort);
      if (st.filter) rows = rows.filter((r) => String(def.filters.get ? def.filters.get(r) : r[def.filters.k]) === st.filter);
      if (st.q) rows = rows.filter((r) => def.search(r).toLowerCase().includes(st.q));
      if (st.sortCol != null) {
        const g = def.cols[st.sortCol].get;
        rows.sort((a, b) => { const x = g(a), y = g(b); if (x == null || x === "") return 1; if (y == null || y === "") return -1; return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * st.dir; });
      }
      countEl.textContent = rows.length === data[table].length ? `${rows.length}` : `${rows.length} of ${data[table].length}`;
      if (!data[table].length) {
        tbody.replaceChildren(h("tr", null, h("td", { colspan: def.cols.length }, h("div", { class: "empty" }, h("b", { text: `No ${def.one}s yet` }), h("span", { text: "Add the first one and it shows up here and on the overview." }), h("button", { class: "btn btn-primary", type: "button", text: "Add " + def.one, onclick: () => openDrawer(table) })))));
        return;
      }
      if (!rows.length) { tbody.replaceChildren(h("tr", null, h("td", { colspan: def.cols.length }, h("div", { class: "empty", text: "Nothing matches." })))); return; }
      tbody.replaceChildren(...rows.map((r) => h("tr", { tabindex: "0", onclick: () => openDrawer(table, r), onkeydown: (e) => { if (e.key === "Enter") openDrawer(table, r); } },
        def.cols.map((c) => h("td", { class: c.cls || "" }, c.show ? c.show(r) : (c.get(r) ?? "—"))))));
    }
    draw();
    return wrap;
  }

  /* ---------- charts ---------- */
  function tipFor(box) { let t = box.querySelector(".tip"); if (!t) { t = h("div", { class: "tip", hidden: true }); box.append(t); } return t; }
  function showTip(box, ev, lines) {
    const t = tipFor(box); t.replaceChildren(...lines.map((l, i) => h("div", { class: i ? "" : "k", text: l }))); t.hidden = false;
    const r = box.getBoundingClientRect(); const x = ev.clientX - r.left, y = ev.clientY - r.top;
    t.style.left = Math.max(0, Math.min(r.width - t.offsetWidth, x + 12)) + "px"; t.style.top = Math.max(0, y - t.offsetHeight - 10) + "px";
  }
  function textWidth(svg, strings) {
    const g = svgEl("g", { opacity: 0 }); svg.append(g);
    const w = Math.max(0, ...strings.map((s) => { const t = svgEl("text"); t.textContent = s; g.append(t); return t.getComputedTextLength(); }));
    g.remove(); return w;
  }
  function revenueChart(box) {
    const t = todayStr().slice(0, 7);
    const months = []; for (let i = 5; i >= 0; i--) { const d = new Date(t + "-01T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() - i); months.push(d.toISOString().slice(0, 7)); }
    const rows = months.map((m) => { const inv = data.invoices.filter((i) => i.service_month === m && i.status !== "Void" && i.status !== "Draft"); return { m, paid: sum(inv.filter((i) => i.status === "Paid"), (i) => i.amount_usd), open: sum(inv.filter((i) => i.status !== "Paid"), (i) => i.amount_usd) }; });
    const W = Math.max(280, box.clientWidth || 480), H = 210, svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Billed per service month, last six months" });
    box.replaceChildren(svg);
    const max = Math.max(1000, ...rows.map((r) => r.paid + r.open));
    const step = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000].find((s) => max / s <= 4) || 500000; const top = Math.ceil(max / step) * step;
    const ticks = []; for (let v = 0; v <= top; v += step) ticks.push(v);
    const lm = textWidth(svg, ticks.map(usdShort)) + 10, base = H - 24, y = (v) => base - (v / top) * (base - 8);
    ticks.forEach((v) => { svg.append(svgEl("line", { x1: lm, x2: W, y1: y(v), y2: y(v), class: "grid-line" })); const tx = svgEl("text", { x: lm - 8, y: y(v) + 4, "text-anchor": "end" }); tx.textContent = usdShort(v); svg.append(tx); });
    const band = (W - lm) / rows.length, bw = Math.min(34, band * 0.6);
    rows.forEach((r, i) => {
      const cx = lm + band * i + band / 2;
      if (r.paid) svg.append(svgEl("rect", { x: cx - bw / 2, width: bw, y: y(r.paid), height: Math.max(0, base - y(r.paid)), rx: 4, style: "fill:var(--series)" }));
      if (r.open) svg.append(svgEl("rect", { x: cx - bw / 2, width: bw, y: y(r.paid + r.open), height: Math.max(0, y(r.paid) - y(r.paid + r.open) - (r.paid ? 2 : 0)), rx: 4, style: "fill:var(--series-2)" }));
      const lx = svgEl("text", { x: cx, y: H - 6, "text-anchor": "middle" }); lx.textContent = new Date(r.m + "-01T00:00:00Z").toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }); svg.append(lx);
      const hit = svgEl("rect", { x: cx - band / 2, width: band, y: 0, height: base, fill: "transparent" });
      hit.addEventListener("mousemove", (ev) => showTip(box, ev, [fmtMonth(r.m), "Paid " + usd(r.paid), "Not paid " + usd(r.open)]));
      hit.addEventListener("mouseleave", () => { tipFor(box).hidden = true; });
      svg.append(hit);
    });
    svg.append(svgEl("line", { x1: lm, x2: W, y1: base, y2: base, class: "axis" }));
  }
  function hbarChart(box, rows, { label, value, end, color, onPick }) {
    const W = Math.max(280, box.clientWidth || 480), rowH = 30, H = rows.length * rowH + 4;
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" }); box.replaceChildren(svg);
    const lm = textWidth(svg, rows.map(label)) + 12, rm = textWidth(svg, rows.map(end)) + 12;
    const max = Math.max(1, ...rows.map(value)), x = (v) => (v / max) * Math.max(10, W - lm - rm);
    rows.forEach((r, i) => {
      const cy = 2 + i * rowH + rowH / 2, w = x(value(r));
      const lt = svgEl("text", { x: lm - 10, y: cy + 4, "text-anchor": "end", class: "lbl" }); lt.textContent = label(r); svg.append(lt);
      if (value(r)) svg.append(svgEl("rect", { x: lm, y: cy - 9, width: Math.max(3, w), height: 18, rx: 4, style: "fill:" + (color ? color(r) : "var(--series)") }));
      const et = svgEl("text", { x: lm + w + 8, y: cy + 4 }); et.textContent = end(r); svg.append(et);
      if (onPick) { const hit = svgEl("rect", { x: 0, y: cy - rowH / 2, width: W, height: rowH, fill: "transparent", style: "cursor:pointer" }); hit.addEventListener("click", () => onPick(r)); svg.append(hit); }
    });
  }

  /* ---------- pages ---------- */
  const kpi = (label, value, sub, alert) => h("div", { class: "kpi" + (alert ? " alert" : "") }, h("span", { class: "kpi-label", text: label }), h("span", { class: "kpi-value", text: value }), sub ? h("span", { class: "kpi-sub", text: sub }) : null);
  const addBtn = (table, label) => h("button", { class: "btn btn-primary", type: "button", text: label || "Add " + DEFS[table].one, onclick: () => openDrawer(table) });
  const afterLayout = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  const PAGES = {
    overview: {
      title: "Overview", group: null,
      desc: () => { const k = kpis(); return k.clientsLive ? `${k.clientsLive} client${k.clientsLive > 1 ? "s" : ""} live on ${k.seatsLive} seats, billing ${usd(k.mrr)} a month.` : "No live clients yet. Everything we need to land the first one is below."; },
      render(c) {
        const k = kpis(), items = attention();
        c.append(h("div", { class: "kpis" },
          kpi("Monthly revenue", usd(k.mrr), k.mrrSold > k.mrr ? `${usd(k.mrrSold)} once signed clients go live` : `${k.clientsLive} live clients`),
          kpi("Seats live", String(k.seatsLive), `of ${k.seatsSold} sold · ${k.bench} on the bench`),
          kpi("Owed to us", usd(k.owed), k.overdue ? `${usd(k.overdue)} overdue` : "nothing overdue", k.overdue > 0),
          kpi("Margin after agent pay", k.marginPct == null ? "—" : Math.round(k.marginPct * 100) + "%", k.mrr ? `${usd(k.margin)} a month before overhead` : "shows once a client is live"),
          kpi("Leads in play", String(k.activeLeads), `${k.aOpen} A-tier not contacted yet`),
          kpi("Running costs", usd(k.monthlyCosts), `a month · ${usd(k.spentThisMonth)} spent this month`),
        ));
        const rev = h("div", { class: "chart" });
        const pipe = h("div", { class: "chart" });
        c.append(h("div", { class: "grid grid-3-2" },
          h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", { text: "Needs a founder" }), h("span", { class: "panel-note", text: items.length ? `${items.length} open` : "" })),
            items.length ? h("ul", { class: "attn" }, items.slice(0, 12).map((a) => h("li", null, h("span", { class: "dot " + a.level }), h("span", { class: "what", text: a.text }), h("button", { class: "link-btn area", type: "button", text: a.area, onclick: () => go(a.go) })))) : h("p", { class: "attn-clear", text: "All clear. Nothing overdue or due this week." })),
          h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", { text: "Billed per service month" }), h("button", { class: "link-btn", type: "button", text: "Invoices", onclick: () => go("invoices") })),
            h("div", { class: "legend" }, h("span", null, h("i", { style: "background:var(--series)" }), "Paid"), h("span", null, h("i", { style: "background:var(--series-2)" }), "Not paid yet")), rev),
        ));
        const road = h("div", { class: "road" }, ROADMAP.map((s, i) => h("div", { class: "stage" + (i === 0 ? " now" : "") },
          h("span", { class: "stage-name", text: (i === 0 ? "Now: " : "") + s.stage }), h("span", { class: "stage-win", text: s.window }),
          ...[["Clients", k.clientsLive, s.clients, String], ["Agents", k.liveAgents, s.agents, String], ["A month", k.mrr, s.revenue, usdShort]].flatMap(([l, now, goal, f]) => [
            h("div", { class: "stage-row" }, h("span", { text: l }), h("span", { text: i === 0 ? `${f(now)} of ~${f(goal)}` : "~" + f(goal) })),
            i === 0 ? h("div", { class: "meter" }, h("i", { style: `width:${Math.min(100, (now / goal) * 100)}%` })) : null,
          ]))));
        c.append(h("div", { class: "grid" },
          h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", { text: "Pipeline by stage" }), h("button", { class: "link-btn", type: "button", text: "Pipeline", onclick: () => go("pipeline") })), h("p", { class: "panel-note", text: "Every lead, by where it stands now. Click a stage to open it." }), pipe),
          h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", { text: "Where we are on the road" })), h("p", { class: "panel-note", text: "Stage targets from the October roadmap. They are planning estimates, not forecasts." }), road),
        ));
        afterLayout(() => {
          revenueChart(rev);
          const rows = STAGES.map((s) => ({ s, n: data.leads.filter((l) => l.stage === s).length }));
          hbarChart(pipe, rows, { label: (r) => r.s, value: (r) => r.n, end: (r) => String(r.n), color: (r) => (r.s === "Won" ? "var(--ok)" : r.s === "Lost" ? "var(--series-3)" : "var(--series)"), onPick: (r) => { viewState.pipelineStage = r.s; go("pipeline"); } });
        });
      },
    },
    clients: {
      title: "Clients", group: "Business",
      desc: () => "Who we work for, what they bought and who looks after them.",
      actions: () => [addBtn("clients")],
      render(c) {
        const k = kpis();
        c.append(h("div", { class: "kpis" }, kpi("Live clients", String(k.clientsLive), `${k.clientsSold} signed in total`), kpi("Seats live", String(k.seatsLive), `of ${k.seatsSold} sold`), kpi("Monthly revenue", usd(k.mrr), "live clients"), kpi("Average seats per client", k.clientsSold ? (k.seatsSold / k.clientsSold).toFixed(1) : "—", "aim for clients who can grow to 10+")));
        c.append(listView("clients"));
        c.append(h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", { text: "Rate card" })), h("p", { class: "panel-note", text: "One USD rate everywhere, billed monthly in advance. Minimum 3 seats for 3 months. Setup fee $2,000, credited to early clients for a case study." }),
          h("div", { class: "table-wrap" }, h("table", { class: "data" }, h("thead", null, h("tr", null, h("th", { text: "Plan" }), h("th", { class: "r", text: "Per seat a month" }), h("th", { class: "r", text: "Agent cost" }), h("th", { class: "r", text: "Left per seat" }))),
            h("tbody", null, PLANS.map((p) => h("tr", { style: "cursor:default" }, h("td", { class: "strong", text: p }), h("td", { class: "r", text: usd(PRICE[p]) }), h("td", { class: "r", text: usd(AGENT_COST) }), h("td", { class: "r", text: `${usd(PRICE[p] * 0.98 - AGENT_COST)} (${Math.round(((PRICE[p] * 0.98 - AGENT_COST) / PRICE[p]) * 100)}%)` }))))))));
      },
    },
    contracts: {
      title: "Contracts", group: "Business",
      desc: () => "What each client signed and when the minimum term ends. Signing order: NDA, proposal, MSA with order form and DPA, then the mobilisation invoice.",
      actions: () => [addBtn("contracts")],
      render(c) { c.append(listView("contracts")); },
    },
    invoices: {
      title: "Invoices", group: "Business", count: () => data.invoices.filter((i) => invoiceState(i) === "Overdue").length || null,
      desc: () => "Monthly in advance, due in 7 days, USD by SWIFT with charges paid by the client.",
      actions: () => [addBtn("invoices")],
      render(c) {
        const k = kpis(), m = todayStr().slice(0, 7);
        const thisMonth = data.invoices.filter((i) => i.service_month === m && !["Void", "Draft"].includes(i.status));
        c.append(h("div", { class: "kpis" }, kpi("Owed to us", usd(k.owed), `${data.invoices.filter((i) => ["Due", "Overdue"].includes(invoiceState(i))).length} open invoices`), kpi("Overdue", usd(k.overdue), `${k.overdueCount} invoice${k.overdueCount === 1 ? "" : "s"}`, k.overdue > 0), kpi("Billed for " + monthName(m), usd(sum(thisMonth, (i) => i.amount_usd)), `${usd(sum(thisMonth.filter((i) => i.status === "Paid"), (i) => i.amount_usd))} paid`), kpi("Paid all time", usd(sum(data.invoices.filter((i) => i.status === "Paid"), (i) => i.amount_usd)))));
        c.append(listView("invoices"));
      },
    },
    agents: {
      title: "Agents and hiring", group: "Delivery",
      desc: () => "Everyone in a seat, on the bench or in the hiring line. Hired agents cost about $642 a month all-in.",
      actions: () => [addBtn("agents", "Add person")],
      render(c) {
        const a = data.agents, live = a.filter((x) => x.status === "Live"), scored = live.filter((x) => x.qa_score != null);
        c.append(h("div", { class: "kpis" }, kpi("In seats", String(live.length), `${a.filter((x) => x.status === "Training").length} in training`), kpi("On the bench", String(a.filter((x) => x.status === "Bench").length), "the plan is 5 to 10 vetted agents"), kpi("Applicants", String(a.filter((x) => x.status === "Applicant").length)), kpi("Average QA", scored.length ? pct(sum(scored, (x) => x.qa_score) / scored.length) : "—", "target 90%+"), kpi("Agent pay a month", usd(live.length * AGENT_COST), "live agents × $642")));
        c.append(listView("agents"));
      },
    },
    quality: {
      title: "Quality and service levels", group: "Delivery",
      desc: () => "Our written standard per client, from Schedule 1 of the MSA. Each missed target after the 30-day ramp-up costs a 3% credit, capped at 10%.",
      actions: () => [addBtn("sla_months", "Add month")],
      render(c) {
        const latest = latestSla(), misses = sum(latest, (r) => slaRow(r).misses), credits = sum(latest, (r) => slaRow(r).credit);
        c.append(h("div", { class: "kpis" }, kpi("Clients on target", `${latest.filter((r) => !slaRow(r).misses).length} of ${latest.length}`, "latest month for each"), kpi("Targets missed", String(misses), "latest month", misses > 0), kpi("Credits owed", usd(credits), "applied to next invoices", credits > 0), kpi("Targets", "90 · 90 · 90 · 95", "chat 2 min · email 4 h · quality · attendance")));
        c.append(listView("sla_months"));
      },
    },
    pipeline: {
      title: "Pipeline", group: "Growth", count: () => data.leads.filter((l) => l.next_date && l.next_date <= todayStr() && !["Won", "Lost"].includes(l.stage)).length || null,
      desc: () => "Every lead from the workbook. Move a lead along by opening it and changing its stage, owner and next step.",
      actions: () => [addBtn("leads")],
      render(c) {
        const k = kpis(), st = viewState.pipeline || (viewState.pipeline = { mode: "board", tier: "A", q: "" });
        if (viewState.pipelineStage) { st.mode = "board"; st.tier = ""; st.q = ""; viewState.pipelineStage = null; }
        c.append(h("div", { class: "kpis" }, kpi("Leads", String(data.leads.length), `${data.leads.filter((l) => l.tier === "A").length} A-tier`), kpi("In conversation", String(k.activeLeads), "contacted to proposal"), kpi("Won", String(data.leads.filter((l) => l.stage === "Won").length)), kpi("Follow-ups due", String(data.leads.filter((l) => l.next_date && l.next_date <= todayStr() && !["Won", "Lost"].includes(l.stage)).length), "today or earlier")));
        const seg = h("div", { class: "seg", role: "group", "aria-label": "View" },
          ["board", "list"].map((m) => h("button", { type: "button", "aria-pressed": String(st.mode === m), text: m === "board" ? "Board" : "List", onclick: () => { st.mode = m; viewState.pipelineStage = null; render(); } })));
        c.append(h("div", { class: "toolbar" }, seg));
        if (st.mode === "list") { c.append(listView("leads")); return; }
        const tierSeg = h("div", { class: "seg", role: "group", "aria-label": "Tier" }, ["A", "B", "C", "KSA", ""].map((t) => h("button", { type: "button", "aria-pressed": String(st.tier === t), text: t ? (t === "KSA" ? "Saudi" : "Tier " + t) : "All", onclick: () => { st.tier = t; render(); } })));
        const search = h("input", { type: "search", placeholder: "Search companies", "aria-label": "Search companies", value: st.q, oninput: (e) => { st.q = e.target.value.toLowerCase(); drawBoard(); } });
        const board = h("div", { class: "board" });
        c.append(h("div", { class: "toolbar" }, search, tierSeg), board);
        function drawBoard() {
          const leads = data.leads.filter((l) => (!st.tier || l.tier === st.tier) && (!st.q || DEFS.leads.search(l).toLowerCase().includes(st.q)));
          board.replaceChildren(...STAGES.map((s) => {
            const inLane = leads.filter((l) => (l.stage || "Not contacted") === s).sort(DEFS.leads.sort), shown = inLane.slice(0, 40);
            return h("div", { class: "lane" }, h("div", { class: "lane-head" }, s, h("span", { text: String(inLane.length) })),
              shown.map((l) => h("button", { class: "card", type: "button", onclick: () => openDrawer("leads", l) }, h("span", { class: "card-name", text: l.company }),
                h("span", { class: "card-meta" }, chip(l.tier || "—", l.tier === "A" ? "hot" : ""), l.country || "", l.owner ? "· " + l.owner : ""),
                l.next_date ? h("span", { class: "card-meta", text: `Next: ${fmtDate(l.next_date)}${l.next_step ? " · " + l.next_step : ""}` }) : null)),
              inLane.length > shown.length ? h("span", { class: "lane-more", text: `+ ${inLane.length - shown.length} more. Search or switch to List.` }) : null);
          }));
        }
        drawBoard();
      },
    },
    costs: {
      title: "Costs", group: "Company",
      desc: () => "Every payment and every subscription. Paid in JOD, logged in USD at 1 JD = $1.41.",
      actions: () => [addBtn("expenses", "Log a payment")],
      render(c) {
        const k = kpis();
        c.append(h("div", { class: "kpis" }, kpi("Spent to date", usd(k.spentTotal), `${data.expenses.length} payments`), kpi("Spent this month", usd(k.spentThisMonth)), kpi("Recurring a month", usd(k.monthlyCosts), `${data.recurring.length} subscriptions and rent`), kpi("Monthly profit after costs", usd(k.margin - k.monthlyCosts), "margin after agents, less recurring costs", k.margin - k.monthlyCosts < 0)));
        c.append(h("div", { class: "grid grid-3-2" }, listView("expenses", { title: "Payments" }), listView("recurring", { title: "Recurring" })));
      },
    },
    setup: {
      title: "Company setup", group: "Company",
      desc: () => "What still stands between us and signing a client, from the roadmap's \"You are here\" stage.",
      actions: () => [addBtn("setup_tasks", "Add step")],
      render(c) {
        const s = data.setup_tasks, done = s.filter((x) => x.status === "Done").length;
        c.append(h("div", { class: "kpis" }, kpi("Done", `${done} of ${s.length}`, s.length ? Math.round((done / s.length) * 100) + "% of the way" : ""), kpi("In progress", String(s.filter((x) => x.status === "In progress").length)), kpi("Not started", String(s.filter((x) => x.status === "To do").length), `${s.filter((x) => x.status === "To do" && !x.owner).length} without an owner`)));
        c.append(listView("setup_tasks"));
      },
    },
  };

  /* ---------- shell ---------- */
  let current = "overview";
  function buildNav() {
    const nav = $("#nav"); nav.replaceChildren(); let group = null;
    Object.entries(PAGES).forEach(([id, p]) => {
      if (p.group && p.group !== group) { group = p.group; nav.append(h("span", { class: "side-group", text: group })); }
      const n = p.count ? p.count() : null;
      nav.append(h("a", { href: "#" + id, "aria-current": id === current ? "page" : null }, p.title.replace(" and service levels", "").replace(" and hiring", ""), n ? h("span", { class: "count", text: String(n) }) : null));
    });
  }
  function render() {
    const p = PAGES[current];
    $("#page-title").textContent = p.title; $("#page-desc").textContent = p.desc ? p.desc() : "";
    $("#top-actions").replaceChildren(...(p.actions ? p.actions() : []));
    const c = $("#content"); c.replaceChildren(); p.render(c);
    buildNav();
    document.title = p.title + " · Zameel founders";
  }
  function go(id) { if (location.hash === "#" + id) route(); else location.hash = id; }
  function route() {
    const id = location.hash.slice(1);
    current = PAGES[id] ? id : "overview";
    $("#app").classList.remove("menu-open"); $("#menu-btn").setAttribute("aria-expanded", "false");
    render(); window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  $("#menu-btn").addEventListener("click", () => { const o = $("#app").classList.toggle("menu-open"); $("#menu-btn").setAttribute("aria-expanded", String(o)); });
  let rT; window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { if (current === "overview") render(); }, 200); });

  async function startApp() {
    $("#login").hidden = true; $("#app").hidden = false;
    $("#demo-banner").hidden = LIVE;
    $("#side-user").textContent = LIVE ? user.email : "Preview";
    $("#sign-out").hidden = !LIVE;
    $("#content").replaceChildren(h("p", { class: "panel-note", text: "Loading…" }));
    try { await loadAll(); route(); }
    catch (err) { $("#content").replaceChildren(h("div", { class: "panel" }, h("h2", { text: "Couldn't load the data" }), h("p", { class: "panel-note", text: (err.message || String(err)) + ". Check your connection and reload. If it keeps happening, your account may not be on the founders list." }))); }
  }
  function showLogin(msg) {
    $("#app").hidden = true; $("#login").hidden = false;
    const e = $("#login-error"); e.hidden = !msg; e.textContent = msg || "";
    setTimeout(() => $("#login-email").focus(), 30);
  }
  async function checkFounder() {
    const { data: ok, error } = await db.rpc("is_founder");
    return !error && ok === true;
  }
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("#login-email").value.trim(), password = $("#login-password").value;
    if (!email || !password) return showLogin("Enter your email and password.");
    const btn = $("#login-submit"); btn.disabled = true; btn.textContent = "Signing in…";
    const { data: res, error } = await db.auth.signInWithPassword({ email, password });
    btn.disabled = false; btn.textContent = "Sign in";
    if (error) return showLogin(error.message === "Invalid login credentials" ? "That email and password don't match. Try again." : error.message);
    user = res.user;
    if (!(await checkFounder())) { await db.auth.signOut(); return showLogin("This account isn't on the founders list."); }
    $("#login-password").value = ""; startApp();
  });
  $("#sign-out").addEventListener("click", async () => { await db.auth.signOut(); user = null; showLogin(); });

  (async () => {
    if (!LIVE) { startApp(); return; }
    const { data: s } = await db.auth.getSession();
    if (s.session && (await checkFounder())) { user = s.session.user; startApp(); } else showLogin();
  })();
})();
