// Vercel serverless function: POST /api/contact
// Sends the website contact form to the Zameel inbox through Resend (https://resend.com).
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY  required, from resend.com > API Keys
//   CONTACT_TO      optional, inbox that receives leads (default info@zameel.cx)
//   CONTACT_FROM    optional, sender of the lead email (default "Zameel website <website@zameel.cx>")
//   CONFIRM_FROM    optional, sender of the visitor's confirmation (default "Zameel <info@zameel.cx>")
//   SITE_URL        optional, used for the logo in the confirmation (default https://zameel.cx)

function clean(v, max) {
  return String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
}
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}


// Confirmation sent to the visitor, in the language of the page they used.
// Only the first name is echoed back, and never if it looks like a link, so the form can't be used to relay spam.
function confirmation(name, lang) {
  const site = (process.env.SITE_URL || "https://zameel.cx").replace(/\/$/, "");
  let first = name.split(" ")[0].slice(0, 40);
  if (/[./:@<>]|www|http/i.test(first)) first = "";
  const ar = lang === "ar";
  const t = ar ? {
    subject: "استلمنا طلبكم | زميل",
    hi: first ? "مرحبًا " + first + "،" : "مرحبًا،",
    p1: "شكرًا لتواصلكم مع زميل. استلمنا طلب مكالمة التعارف.",
    p2: "سيتواصل معكم أحد كبار المدراء خلال يوم عمل واحد لترتيب مكالمة قصيرة نفهم فيها احتياجكم.",
    p3: "إن كان لديكم ما تودون إضافته، يكفي الرد على هذه الرسالة.",
    sign: "فريق زميل",
    tag: "عملياتكم. فريقنا. معيار واحد.",
  } : {
    subject: "We received your request | Zameel",
    hi: first ? "Hi " + first + "," : "Hello,",
    p1: "Thank you for contacting Zameel. We have your request for a discovery call.",
    p2: "A senior manager will reply within one working day to arrange a short call about what you need.",
    p3: "If there is anything you'd like to add, simply reply to this email.",
    sign: "The Zameel team",
    tag: "Your operations. Our people. One standard.",
  };
  const dir = ar ? "rtl" : "ltr";
  const font = ar ? "Tajawal,Arial,sans-serif" : "Inter,Arial,Helvetica,sans-serif";
  const para = (x) => '<p style="margin:0 0 16px;font:16px/1.65 ' + font + ';color:#1A1F3D">' + esc(x) + "</p>";
  const html =
    '<!doctype html><html lang="' + (ar ? "ar" : "en") + '" dir="' + dir + '"><body style="margin:0;padding:0;background:#EEF0F8">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0F8"><tr><td align="center" style="padding:32px 16px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FDFBFC;border-radius:12px;overflow:hidden" dir="' + dir + '">' +
    '<tr><td style="background:#0E1D70;padding:28px 32px"><img src="' + site + '/assets/brand/zameel-logo-white-email.png" width="140" alt="Zameel" style="display:block;border:0;height:auto"></td></tr>' +
    '<tr><td style="height:3px;background:#F66747;font-size:0;line-height:0">&nbsp;</td></tr>' +
    '<tr><td style="padding:32px;text-align:' + (ar ? "right" : "left") + '">' +
    para(t.hi) + para(t.p1) + para(t.p2) + para(t.p3) +
    '<p style="margin:24px 0 0;font:600 16px/1.5 ' + font + ';color:#0E1D70">' + esc(t.sign) + "</p>" +
    '<p style="margin:4px 0 0;font:14px/1.5 ' + font + ';color:#6E7391">' + esc(t.tag) + "</p>" +
    "</td></tr>" +
    '<tr><td style="padding:20px 32px;border-top:1px solid #E3E6F2;font:13px/1.5 ' + font + ';color:#6E7391;text-align:' + (ar ? "right" : "left") + '">' +
    '<a href="' + site + (ar ? "/ar/" : "/") + '" style="color:#0E1D70;text-decoration:none">zameel.cx</a> · <a href="mailto:info@zameel.cx" style="color:#0E1D70;text-decoration:none">info@zameel.cx</a>' +
    "</td></tr></table></td></tr></table></body></html>";
  const text = [t.hi, "", t.p1, "", t.p2, "", t.p3, "", t.sign, t.tag, "", "zameel.cx"].join("\n");
  return { subject: t.subject, html, text };
}

async function send(key, payload) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Resend " + r.status + ": " + (await r.text()));
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
    await send(key, {
      from: process.env.CONTACT_FROM || "Zameel website <website@zameel.cx>",
      to: [process.env.CONTACT_TO || "info@zameel.cx"],
      reply_to: email,
      subject: "Discovery call request: " + (company || name),
      text,
      html,
    });
  } catch (e) {
    console.error("Resend error (lead)", e.message);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }

  // The lead is safe in the inbox at this point; a failed confirmation is logged but not shown as an error.
  try {
    const c = confirmation(name, body.lang);
    await send(key, {
      from: process.env.CONFIRM_FROM || "Zameel <info@zameel.cx>",
      to: [email],
      reply_to: process.env.CONTACT_TO || "info@zameel.cx",
      subject: c.subject,
      text: c.text,
      html: c.html,
    });
  } catch (e) {
    console.error("Resend error (confirmation)", e.message);
  }
  return res.status(200).json({ ok: true });
};
