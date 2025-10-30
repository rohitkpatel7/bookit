import express from "express";
import cors from "cors";
import promoRouter from "./routes/promo";
import bookingsRouter from "./routes/bookings";
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/promo", promoRouter);
app.use("/bookings", bookingsRouter);

// ✅ Get all experiences
app.get("/experiences", async (_req, res) => {
  const data = await prisma.experience.findMany({
    include: { slots: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(data);
});

// ✅ Get a single experience + remaining seats per slot
app.get("/experiences/:id", async (req, res) => {
  const exp = await prisma.experience.findUnique({
    where: { id: req.params.id },
    include: { slots: { orderBy: { date: "asc" } } },
  });
  if (!exp) return res.status(404).json({ message: "Not found" });

  const counts = await prisma.booking.groupBy({
    by: ["slotId"],
    where: { slotId: { in: exp.slots.map(s => s.id) } },
    _sum: { persons: true },
  });
  const used: Record<string, number> = {};
  counts.forEach(c => (used[c.slotId] = c._sum.persons ?? 0));

  res.json({
    ...exp,
    slots: exp.slots.map(s => ({
      ...s,
      remaining: s.capacity - (used[s.id] ?? 0),
    })),
  });
});

// ✅ Promo code validation
app.post("/promo/validate", (req, res) => {
  const code = String(req.body?.code || "").toUpperCase();
  if (code === "SAVE10") return res.json({ type: "PERCENT", value: 10, valid: true });
  if (code === "FLAT100") return res.json({ type: "FLAT", value: 100, valid: true });
  res.json({ valid: false });
});

// ✅ Create a booking
app.post("/bookings", async (req, res) => {
  const { experienceId, slotId, name, email, persons, totalPrice } = req.body || {};
  if (!experienceId || !slotId || !name || !email || !persons || !totalPrice) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({ where: { id: slotId } });
      if (!slot) throw new Error("SLOT_NOT_FOUND");

      const agg = await tx.booking.aggregate({
        where: { slotId },
        _sum: { persons: true }
      });
      const already = agg._sum.persons ?? 0;
      if (already + persons > slot.capacity) throw new Error("SOLD_OUT");

      return tx.booking.create({
        data: { experienceId, slotId, name, email, persons, totalPrice }
      });
    });

    res.status(201).json({ status: "CONFIRMED", booking });
  } catch (e: any) {
    // Prisma duplicate error (unique constraint on [email, slotId])
    if (e?.code === "P2002") {
      return res.status(409).json({ status: "FAILED", message: "You already booked this slot with this email." });
    }

    const message =
      e.message === "SOLD_OUT" ? "Slot is sold out" :
      e.message === "SLOT_NOT_FOUND" ? "Slot not found" :
      "Booking failed";

    res.status(409).json({ status: "FAILED", message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ API running at http://localhost:${port}`));
