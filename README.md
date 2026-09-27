# GATI

GATI is a standalone Maharashtra approvals and incentives workflow prototype. It is not an official government service. Approval requirements, fees, timelines, schemes and eligibility shown in the demo are illustrative and must be verified before real-world use.

## Run locally

Use Node.js 20 or 22. Install each app's dependencies, then start both processes in separate terminals:

```powershell
npm install --prefix frontend
npm install --prefix backend
npm run dev:backend
```

In a second terminal:

```powershell
npm run dev:frontend
```

Open `http://localhost:5173`. The API is available at `http://localhost:4000/api`; its health endpoint is `/api/health`.

## Deploy to Render

The repository includes a Render Blueprint in `render.yaml`. Push the project to a GitHub or GitLab repository, then in Render choose **New → Blueprint**, connect that repository, and deploy the `gati` service. The blueprint builds the frontend and backend together, generates a production `JWT_SECRET`, and configures `/api/health` as the health check. Render assigns a `gati.onrender.com` URL if that service name is available.

To use a custom GATI domain, add the domain in the Render service's **Settings → Custom Domains**, then create the DNS records Render provides at your domain registrar. Domain registration and DNS access are not included with this project.

For a separate local frontend/backend deployment, set `VITE_API_URL` to the backend API URL when building the frontend. Set `FRONTEND_URL` on the backend to the frontend origin; multiple origins can be comma-separated.

## Demo accounts

All demo accounts use `password123`:

- `applicant@gati.demo`
- `officer@gati.demo`
- `admin@gati.demo`

## Prototype storage and security limits

This deployment is for demonstration with non-sensitive sample data only. Users, project/application state, and audit-like records are currently kept in server memory; uploaded files are stored on the local filesystem. These are not durable on Render's free web service and may be lost on restart, redeploy, or sleep. Demo credentials are public by design. Do not use this prototype for real applicant data, identity documents, production decisions, or official government services until durable database/object storage, account security, authorization, backups, and operational controls have been implemented and reviewed.
