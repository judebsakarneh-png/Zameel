// Vercel serverless function: POST /api/contact
// Sends the website contact form to the Zameel inbox through Resend (https://resend.com).
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY  required, from resend.com > API Keys
//   CONTACT_TO      optional, inbox that receives leads (default hello@zameel.cx)
//   CONTACT_FROM    optional, verified sender (default "Zameel website <website@zameel.cx>")

function clean(v, max) {
  return String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
}
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: "not_configured" });

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }

  // Honeypot: real visitors never see or fill this field.
  if (clean(body.website, 200)) return res.status(200).json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const company = clean(body.company, 160);
  const whatsapp = clean(body.whatsapp, 40);
  const need = clean(body.need, 80) || "Not stated";
  const lang = body.lang === "ar" ? "Arabic" : "English";

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ ok: false, error: "invalid" });
  }

  const rows = [["Name", name], ["Company", company || "-"], ["Email", email], ["WhatsApp", whatsapp || "-"],
    ["Needs help with", need], ["Page language", lang]];
  const text = rows.map(([k, v]) => k + ": " + v).join("\n");
  const html = '<table style="font:15px/1.5 Arial,sans-serif;border-collapse:collapse">' +
    rows.map(([k, v]) => '<tr><td style="padding:6px 16px 6px 0;color:#6E7391">' + k + '</td><td style="padding:6px 0;color:#1A1F3D"><b>' + esc(v) + "</b></td></tr>").join("") +
    "</table>";

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "Zameel website <website@zameel.cx>",
        to: [process.env.CONTACT_TO || "hello@zameel.cx"],
        reply_to: email,
        subject: "Discovery call request: " + (company || name),
        text,
        html,
      }),
    });
    if (!r.ok) {
      console.error("Resend error", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "send_failed" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Resend request failed", e);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
};
