# Birthday Wheel Backend

This is the Node.js (Express) backend for the Birthday Wheel project.
- Validates employee number
- Checks birthday month
- Ensures the employee hasn’t spun already
- Records the prize

## Local Development

1. Install dependencies.

```bash
npm install
```

2. Create a local env file from `.env.example`.

```bash
PORT=3001
FRONTEND_URL=http://localhost:3000
```

3. Start backend.

```bash
npm start
```

Backend runs on `http://localhost:3001`.

## Deploy to Render

This repository includes `render.yaml` in the root configured for this backend service.

1. Create a new Render Blueprint from the repo.
2. Confirm service root directory is `backend`.
3. Add environment variable:

```bash
FRONTEND_URL=https://<your-vercel-frontend>.vercel.app
```

4. Deploy and verify health endpoint:

```bash
GET /health
```
