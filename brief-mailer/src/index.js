import { EmailMessage } from "cloudflare:email";

const ALLOWED_ORIGINS = ["https://pablovaliente.me", "https://www.pablovaliente.me"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// one-line header value: no CR/LF, trimmed, capped
const clean = (v, max) => String(v == null ? "" : v).replace(/[\r\n]+/g, " ").trim().slice(0, max);

function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
const encHeader = (s) => "=?UTF-8?B?" + b64(s) + "?=";

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return json(405, { ok: false });
    const origin = request.headers.get("origin") || "";
    if (!ALLOWED_ORIGINS.includes(origin)) return json(403, { ok: false });
    if (!env.TO_EMAIL || !env.MAILER) return json(503, { ok: false, error: "not configured" });

    let d;
    try { d = await request.json(); } catch { return json(400, { ok: false }); }
    if (d.website) return json(200, { ok: true }); // honeypot: bots fill it, humans never see it

    const name = clean(d.name, 120);
    const email = clean(d.email, 200);
    const subject = clean(d.subject, 200) || "Nuevo proyecto web";
    const message = String(d.message || "").slice(0, 20000);
    if (!name || !EMAIL_RE.test(email) || !message.trim()) return json(400, { ok: false });

    const body = message + "\n\n—\n" + name + " · " + email + "\nEnviado desde pablovaliente.me/start-a-project";
    const from = env.FROM_EMAIL || "web@pablovaliente.me";
    const domain = from.split("@")[1];
    const raw = [
      "From: " + encHeader("Web pablovaliente.me") + " <" + from + ">",
      "To: <" + env.TO_EMAIL + ">",
      "Reply-To: " + encHeader(name) + " <" + email + ">",
      "Subject: " + encHeader(subject),
      "Message-ID: <" + crypto.randomUUID() + "@" + domain + ">",
      "Date: " + new Date().toUTCString(),
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      b64(body).replace(/.{76}/g, "$&\r\n"),
    ].join("\r\n");

    try {
      await env.MAILER.send(new EmailMessage(from, env.TO_EMAIL, raw));
      return json(200, { ok: true });
    } catch (e) {
      return json(502, { ok: false, error: "send failed" });
    }
  },
};
