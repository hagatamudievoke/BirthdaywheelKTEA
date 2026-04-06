# Birthday Wheel Frontend

Next.js frontend for the Birthday Wheel Admin application.

## Local Development

1. Install dependencies.

```bash
npm install
```

2. Create your local env file from `.env.example` and set backend URL.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

3. Run the app.

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Deploy to Vercel

1. Import the `frontend` folder as a Vercel project.
2. Set framework to Next.js (already defined in `vercel.json`).
3. Add environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=https://<your-render-backend>.onrender.com
```

4. Deploy.

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Run production server
