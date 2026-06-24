import "dotenv/config";
import express from "express";
import cors from "cors";
import { listingsRouter } from "./routes/listings.js";
import { officesRouter } from "./routes/offices.js";
import { usersRouter } from "./routes/users.js";
import { leadsRouter } from "./routes/leads.js";
import { notificationsRouter } from "./routes/notifications.js";
import { agentRouter } from "./routes/agent.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/listings", listingsRouter);
app.use("/offices", officesRouter);
app.use("/users", usersRouter);
app.use("/leads", leadsRouter);
app.use("/notifications", notificationsRouter);
app.use("/agent", agentRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});

// Last-resort safety net: keep the server alive even if some code path outside
// the route handlers (e.g. a fire-and-forget background task) throws.
process.on("unhandledRejection", (err) => console.error("[api] unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("[api] uncaught exception:", err));
