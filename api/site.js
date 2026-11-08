import { neon } from '@neondatabase/serverless';
export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const a = req.query.a;
    if (a === 'visit') {
      await sql`CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT now())`;
      if (req.method === 'POST') await sql`INSERT INTO visits DEFAULT VALUES`;
      const r = await sql`SELECT count(*)::int AS n FROM visits`;
      return res.status(200).json({ visits: r[0].n });
    }
    if (a === 'contact' && req.method === 'POST') {
      const { name, email, message, website } = req.body || {};
      if (website) return res.status(200).json({ ok: true });
      if (!name || !message || !/^\S+@\S+\.\S+$/.test(email || ''))
        return res.status(400).json({ error: 'Add your name, a valid email and a message.' });
      await sql`CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, message TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`;
      await sql`INSERT INTO messages (name,email,message) VALUES (${name.slice(0,100)},${email.slice(0,150)},${message.slice(0,2000)})`;
      return res.status(200).json({ ok: true });
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error. Email me directly instead.' }); }
}
