# API Testing Guide (`test.md`)

This file helps you test all backend APIs quickly using `curl`.

## 1) Start Server

```bash
cd "/Users/manvendrapratapsingh/Desktop/AI-Customer-Support-Platform/server"
cp .env.example .env
npm install
npm run dev
```

Base URL:

```bash
export BASE_URL="http://localhost:3000/api/v1"
```

---

## 2) Auth APIs

### Register Tenant + Admin

```bash
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName":"Acme Support",
    "slug":"acme-support",
    "adminName":"Admin User",
    "email":"admin@acme.com",
    "password":"Admin@123"
  }'
```

### Login

```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@acme.com",
    "password":"Admin@123"
  }'
```

Copy `data.accessToken` from response and set:

```bash
export TOKEN="<PASTE_ACCESS_TOKEN>"
```

### Refresh Token (cookie based)

```bash
curl -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json"
```

### Forgot Password

```bash
curl -X POST "$BASE_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com"}'
```

### Reset Password

```bash
curl -X POST "$BASE_URL/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token":"<RESET_TOKEN>",
    "newPassword":"NewPass@123"
  }'
```

### Logout

```bash
curl -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3) User APIs

### Create User (Admin/Super Admin)

```bash
curl -X POST "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Agent One",
    "email":"agent1@acme.com",
    "password":"Agent@123",
    "role":"agent"
  }'
```

### Get Users

```bash
curl -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4) Ticket APIs

### Create Ticket

```bash
curl -X POST "$BASE_URL/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Login issue",
    "description":"Cannot login after password reset",
    "priority":"high"
  }'
```

Set ticket ID:

```bash
export TICKET_ID="<PASTE_TICKET_ID>"
```

### List Tickets

```bash
curl -X GET "$BASE_URL/tickets" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Ticket by ID

```bash
curl -X GET "$BASE_URL/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Change Ticket Status

```bash
curl -X PUT "$BASE_URL/tickets/$TICKET_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

### Add Ticket Message

```bash
curl -X POST "$BASE_URL/tickets/$TICKET_ID/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"We are investigating this issue."}'
```

### Get Ticket Messages

```bash
curl -X GET "$BASE_URL/tickets/$TICKET_ID/messages" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5) Chat APIs

### Start Chat Session

```bash
curl -X POST "$BASE_URL/chat/session" \
  -H "Authorization: Bearer $TOKEN"
```

Set session ID:

```bash
export SESSION_ID="<PASTE_SESSION_ID>"
```

### Send Chat Message

```bash
curl -X POST "$BASE_URL/chat/session/$SESSION_ID/message" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"I need help with billing."}'
```

---

## 6) AI APIs

### Query AI

```bash
curl -X POST "$BASE_URL/ai/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\":\"$SESSION_ID\",
    \"message\":\"What is your refund policy?\"
  }"
```

### Categorize Ticket

```bash
curl -X POST "$BASE_URL/ai/categorize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Payment failed",
    "description":"Card charged but order not created"
  }'
```

### Suggest Reply for Ticket

```bash
curl -X GET "$BASE_URL/ai/suggest-reply/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 7) Knowledge Base APIs

### Create KB Article

```bash
curl -X POST "$BASE_URL/kb" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Refund Policy",
    "content":"Refunds are processed within 5 business days.",
    "tags":["billing","refund"]
  }'
```

### List KB Articles

```bash
curl -X GET "$BASE_URL/kb" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 8) Tenant APIs

> Works only for `super_admin` role.

### List Tenants

```bash
curl -X GET "$BASE_URL/tenant" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 9) Analytics APIs

### Overview

```bash
curl -X GET "$BASE_URL/analytics/overview" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 10) Health Check

```bash
curl -X GET "http://localhost:3000/health"
```

---

## Quick Notes

- If you get `401`, verify `TOKEN` is set and valid.
- If AI endpoints fail, verify `GEMINI_API_KEY` in `server/.env`.
- If DB errors occur, verify `MONGO_URI` in `server/.env`.
