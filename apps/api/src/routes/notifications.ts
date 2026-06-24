import { Router } from "express";
import { db } from "../db.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", async (req, res) => {
  const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
  if (!userId) return res.status(400).json({ error: "userId query param required" });

  const notifications = await db.notification.findMany({
    where: { userId },
    include: { listing: { select: { title: true, neighborhood: true, price: true, type: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      listingId: n.listingId,
      reason: n.reason,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      listing: n.listing,
    }))
  );
});

notificationsRouter.patch("/:id/read", async (req, res) => {
  const existing = await db.notification.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Notification not found" });

  const notification = await db.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json({ id: notification.id, read: notification.read });
});
