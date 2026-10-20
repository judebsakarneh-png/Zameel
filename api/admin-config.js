// Vercel serverless function: GET /api/admin-config
// Hands the founders console its Supabase connection, so no key is ever stored in the repo.
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   ADMIN_SUPABASE_URL       the Supabase project URL
//   ADMIN_SUPABASE_ANON_KEY  the project's publishable (anon) key
// Left unset, the console runs as a preview on made-up data and saves nothing.

module.exports = (req, res) => {
  const config = {
    supabaseUrl: process.env.ADMIN_SUPABASE_URL || "",
    supabaseAnonKey: process.env.ADMIN_SUPABASE_ANON_KEY || ""
  };
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.status(200).send("window.ZAMEEL_ADMIN = " + JSON.stringify(config) + ";\n");
};
