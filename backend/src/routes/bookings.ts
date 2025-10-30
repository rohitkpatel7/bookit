import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { bookingSchema } from "../validation";

const prisma = new PrismaClient();
const router = Router();

router.post("/", async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "INVALID_PAYLOAD", issues: parsed.error.issues });
  }
  const { experienceId, slotId, name, email, persons, promoCode } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Read the slot + its Experience inside the txn
      const slot = await tx.slot.findUnique({
        where: { id: slotId },
        include: { Experience: true }, // <-- fix: relation name is capitalized
      });

      if (!slot || slot.experienceId !== experienceId) {
        throw { code: "SLOT_NOT_FOUND" };
      }
      if (slot.capacity < persons) {
        throw { code: "SOLD_OUT" };
      }

      // compute total from Experience.price (Slot has no price field)
      const base = slot.Experience.price ?? 0; // <-- fix
      const subtotal = base * persons;

      // defensive promo re-check
      let discount = 0;
      if (promoCode) {
        const norm = promoCode.trim().toUpperCase();
        if (subtotal >= 500 && norm === "SAVE10") discount = Math.round(subtotal * 0.10);
        else if (subtotal >= 500 && norm === "FLAT100") discount = 100;
      }
      const totalPrice = Math.max(0, subtotal - discount);

      // create booking (unique(email, slotId) in schema)
      const booking = await tx.booking.create({
        data: {
          experienceId,
          slotId,
          name,
          email,
          persons,
          totalPrice,
          status: "CONFIRMED",
        },
      });

      // decrement capacity
      await tx.slot.update({
        where: { id: slotId },
        data: { capacity: { decrement: persons } },
      });

      return { booking };
    });

    return res.json({ ok: true, booking: result.booking });
  } catch (e: any) {
    if (e?.code === "SOLD_OUT" || e?.code === "SLOT_NOT_FOUND") {
      return res.status(409).json({ ok: false, error: e.code });
    }
    // Prisma unique constraint
    if (e?.code === "P2002" || e?.meta?.target?.includes?.("email_slotId")) {
      return res.status(409).json({ ok: false, error: "DUPLICATE_BOOKING" });
    }
    console.error(e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

export default router;
