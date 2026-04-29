# AI Customer Support Platform

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
