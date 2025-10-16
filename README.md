# Well Known — Modern UI scaffold

This is a fresh React + Vite + Tailwind scaffold for a video-sharing UI.

Quick start (PowerShell):

```powershell
npm install
npm run dev
```

Open http://localhost:5173 to view the app.

Files created:
- `index.html` - Vite entry
- `src/` - React source files
- `tailwind.config.cjs`, `postcss.config.cjs`

Supabase setup
1. Create a Supabase project and get the URL and anon public key.
2. Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON=your-anon-public-key
```

Restart the dev server after adding `.env`.

You can customize components in `src/components` and styles in `src/styles/index.css`.
