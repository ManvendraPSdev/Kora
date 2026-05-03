# AI Customer Support Platform

# Kohra AI — User & Operator Manual

This guide explains **Kohra AI** in plain language: what it is, how to run it, and how to use it day to day. Kohra AI is a **multi-tenant** customer support platform: each **business (tenant)** has its own data, and users belong to one tenant.

---

## 1. What is Kohra AI?

- **Customers** can open **tickets**, chat with **AI**, and message **human agents**.
- **Agents** handle assigned tickets and reply in real time.
- **Admins** manage the tenant: users, knowledge base, and (where available) analytics.
- **Super admins** (if your deployment uses them) can see cross-tenant tools such as tenants list.

The product has a **web app** (React) talking to a **server** (Node.js + Express) and a **database** (MongoDB). Optional **Redis** speeds up repeated reads. **Google Gemini** powers AI replies where configured.

---

## 2. What you need on your computer

| Item | Why |
|------|-----|
| **Modern browser** | Chrome, Firefox, Safari, or Edge |
| **Internet** (or local network) | To reach the app and API |
| **Account** | Someone must have created your tenant and (for agents/customers) invited you or registered you |

Developers or self-hosters also need **Node.js**, **MongoDB**, and optionally **Redis** or **Docker** — see section 12.

---

## 3. Important URLs (typical setup)

| URL | What it is |
|-----|------------|
| **Frontend** | Often `http://localhost:5173` in development, or your deployed site |
| **API** | Usually under `/api/v1` on the same host or a separate port (e.g. `http://localhost:3000/api/v1`) |

The exact addresses depend on your `.env` and hosting. The main app lives at **`/`** (home). Special pages:

| Path | Who it is for |
|------|----------------|
| **`/agent`** | **Agents** — dedicated dashboard: assigned tickets, thread, replies, notifications |
| **`/my-tickets`** | **Customers** — list of your tickets |
| **`/tickets/<id>`** | **Customers** — one ticket: details + full message thread + reply box |

The **main workspace** (tickets, chat, knowledge base, etc.) opens after you sign in at **`/`**.

---

## 4. Signing up (Register)

Open the app and use **Register** (or your registration screen).

### 4.1 Choose your **Role**

You will see a **role** control (for example: **Admin**, **Agent**, **Customer**). What you see depends on the screen:

- **Admin** — Creates a **new business (tenant)** and becomes its first administrator.  
- **Agent** — Joins an **existing** business using the business **slug**.  
- **Customer** — Joins an **existing** business using the business **name** (as stored when the admin created the company).

### 4.2 Admin registration (new company)

Fill in roughly:

- **Business name** — Display name of the company  
- **Slug** — Short unique code in the URL (letters, numbers, hyphens; no spaces)  
- **Admin name** — Your name  
- **Email** and **password**

Submit. You become **admin** of that new tenant.

### 4.3 Agent registration (join existing company)

Fill in:

- **Name**, **email**, **password**  
- **Company slug** — The same slug the admin chose when the tenant was created  

Submit. You become an **agent** for that tenant.

### 4.4 Customer registration (join existing company)

Fill in:

- **Name**, **email**, **password**  
- **Company name** — Must match the **tenant’s business name** exactly (same spelling and spacing as the admin used)

Submit. You become a **customer** for that tenant.

---

## 5. Signing in (Login)

Use **Login** and pick your **role** again:

| Role | What you type besides email & password |
|------|----------------------------------------|
| **Admin** or **Agent** | **Company slug** |
| **Customer** | **Company name** (exact match with the tenant name) |

If login fails, check:

- Email and password  
- Slug or company name (no typos; customer uses **name**, not slug)  
- Your account is still **active**

---

## 6. After you sign in — main workspace (`/`)

Once logged in, you see the **workspace**: sidebar (or menu) and a main area. Sections depend on **your role**.

### 6.1 Everyone (typical)

- **Tickets** — List, open, and work on support tickets  
- **Chat** — AI-assisted chat session (where enabled)  
- **Knowledge base (KB)** — Articles the AI can use (who can **edit** depends on role)

### 6.2 Admins (and super admins where shown)

- **Overview** — High-level numbers (tickets, resolved, escalated, etc.) when analytics is wired  
- **Users** — Create or manage users for your tenant (where your deployment allows it)

### 6.3 Super admin only (if present)

- **Tenants** — List or manage businesses across the platform  

### 6.4 Common actions

- **Create ticket** — Title, description, priority; customers create for themselves; staff may create on behalf of a customer where the UI allows  
- **Open a ticket** — Select it to see details and **message thread**  
- **Send a message** — Type in the box and send; thread updates for everyone with access  
- **Change status** — e.g. open → in progress → resolved (labels depend on your workflow)  
- **AI suggest replies** — Where available, asks the AI for suggested replies for the selected ticket  
- **Start chat / send in chat** — Uses the AI chat flow for the active session  
- **Logout** — Ends your session on this device  

---

## 7. How tickets work (simple story)

1. A **customer** (or staff) **creates a ticket**.  
2. The system looks for **free agents** in the same tenant (agents with the fewest “active” tickets).  
3. If an agent is available, **one agent is picked at random** among those tied for lowest load, and the ticket is **assigned** and often moved to **in progress**.  
4. If **no agent** is available, the ticket stays **open** and **unassigned** until someone picks it up or rules change.  
5. **Messages** on the ticket are stored in the database.  
6. **Sockets** (real-time) can notify agents and refresh threads so people see new messages without refreshing the page.

### 7.1 Ticket statuses (typical)

| Status | Plain meaning |
|--------|----------------|
| **open** | New or waiting to be picked up |
| **in_progress** | Someone is actively working on it |
| **escalated** | Needs more attention or a human override |
| **resolved** | Fixed from the business point of view |
| **closed** | Done; no more replies expected |

Exact names may match your database enums.

---

## 8. Agent dashboard (`/agent`)

**Who:** Users with the **agent** role.

**What it does:**

- Lists **tickets assigned to you** (with filters like open / in progress / resolved).  
- Click a ticket to load the **full thread**.  
- Type a **reply** and send; it is saved and broadcast to others in that ticket “room”.  
- **Bell / notifications** — New assignments or customer replies can show here (real-time).  
- The browser connects to the server with **Socket.IO** and joins your personal **agent** room so pushes reach you.

If you are not an agent, the app may send you back to the home page.

---

## 9. Customer ticket pages

### 9.1 My tickets (`/my-tickets`)

Lists **your** tickets. Click one to open the detail page.

### 9.2 Ticket detail (`/tickets/<id>`)

- Header: ticket number, title, status, priority, **assigned agent** (when set).  
- **Thread** — Messages from you, the agent, and sometimes **AI** (if used).  
- **Reply box** — Hidden when the ticket is **closed** or **resolved** (so you open a new ticket if you still need help).  
- **Back** — Returns to **My tickets**.  
- Real-time updates use the same **Socket.IO** “ticket room” idea as the agent side.

---

## 10. Password recovery

On the sign-in area you may see **Password recovery**:

1. Enter your **email** and request a reset (if your server sends email or tokens, follow the email instructions).  
2. Enter the **token** (or link) and **new password** when the product asks for it.

If you never receive an email, your administrator may need to check mail or token settings on the server.

---

## 11. Roles — quick reference

| Role | Typical job |
|------|-------------|
| **Customer** | Open tickets, reply, use chat |
| **Agent** | Work assigned tickets, reply, use workspace + `/agent` dashboard |
| **Admin** | Manage users, KB, settings for one tenant |
| **Super admin** | Cross-tenant operations (if enabled) |

---

## 12. For operators: running the app yourself

### 12.1 Environment variables (server)

Copy `server/.env.example` to `server/.env` and set at least:

| Variable | Meaning |
|----------|---------|
| `PORT` | Port the API listens on (often `3000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Long random secrets for tokens |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | How long tokens live |
| `GEMINI_API_KEY` | Google AI key for Gemini features |
| `CLIENT_URL` | Browser origin allowed for cookies/CORS (e.g. `http://localhost:5173`) |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Optional Redis for caching |

**Never commit real secrets** to public repositories.

### 12.2 Client environment

The client often uses `VITE_API_BASE_URL` or defaults to a dev API URL. Point it at your running API so login and API calls succeed.

### 12.3 Development (two terminals)

1. **MongoDB** (and **Redis** if you use caching) running.  
2. **Server:** from `server/` run `npm install` then `npm run dev` or `npm start`.  
3. **Client:** from `client/` run `npm install` then `npm run dev`.

Open the URL Vite prints (commonly port **5173**).

### 12.4 Docker

`docker-compose.yml` can start **MongoDB**, **Redis**, **server**, and **client** together. Adjust `CLIENT_URL` and env files so the browser, API, and cookies line up (especially in production behind HTTPS).

---

## 13. Redis (optional)

If Redis is configured, some reads (conversation history, tenant AI config, knowledge text) are **cached** for speed. If Redis is down, the app is designed to **fall back to MongoDB** without crashing. For local Docker Redis, point `REDIS_HOST` at the Redis service name or `127.0.0.1` depending on where Node runs.

---

## 14. API overview (for integrators)

- Base path: **`/api/v1`**  
- **Auth:** register variants, login, refresh, logout, forgot/reset password  
- **Tickets:** list, create, get one, change status, list messages, add message  
- **Chat:** sessions and messages (as implemented in your deployment)  
- **AI:** query, suggest replies, categorize  
- **Users, tenant, KB, analytics:** as enabled by routes and your role  

Use **HTTPS** in production and keep **refresh tokens** in **httpOnly** cookies as the server does by default.

---

## 15. Troubleshooting

| Problem | Things to check |
|---------|-------------------|
| **Cannot log in** | Role, slug vs company name, caps lock, account active |
| **404 on API from browser** | Client `VITE_API_BASE_URL` / proxy / CORS / correct port |
| **Redis connection errors** | Redis running? `REDIS_HOST` / `PORT` correct? |
| **AI errors** | `GEMINI_API_KEY` set and billing enabled on Google Cloud |
| **Socket not updating** | `CLIENT_URL` / CORS matches your site; firewall; HTTPS mixed content |
| **Agent sees no tickets** | Tickets must be **assigned** to that agent; create new tickets as customer to test assignment |

---

## 16. Good habits

- Use **strong passwords** and different passwords per site.  
- **Log out** on shared computers.  
- For **customers**, use **exact company name** your admin used when creating the tenant.  
- For **agents/admins**, keep the **company slug** handy — it is like your company’s short “username” for login.

---

## 17. Getting help

- **In-app:** Use tickets or chat to reach your organization’s support.  
- **Technical:** Your developer or IT team should use server logs, MongoDB, and environment checks described above.

---

*This manual describes the Kohra AI / AI Customer Support Platform behavior as implemented in the repository. Small differences may exist if your fork adds features or renames UI labels.*

**Document version:** May 2026  



## Docker Usage

Run the full production stack (MongoDB + Express API + React app via Nginx):

```bash
docker compose up --build
```

Run the development stack with bind mounts and hot reload (Node with nodemon + Vite dev server):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Stop all services and remove volumes (including MongoDB persisted data):

```bash
docker compose down -v
```
