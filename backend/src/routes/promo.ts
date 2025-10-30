import { Router } from "express";
import { promoSchema } from "../validation";

const router = Router();

// Example business rules:
// - SAVE10: 10% off; min subtotal ₹500
// - FLAT100: ₹100 off; min subtotal ₹500
// - One promo per booking (enforced client/server by accepting only one code)
router.post("/validate", (req, res) => {
  const parsed = promoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "INVALID_PAYLOAD" });
  }
  const { code, subtotal } = parsed.data;
  const minSubtotal = 500;

  if (subtotal < minSubtotal) {
    return res.status(200).json({ ok: false, code, reason: "MIN_AMOUNT", minSubtotal });
  }

  const norm = code.trim().toUpperCase();
  if (norm === "SAVE10") {
    const discount = Math.round(subtotal * 0.10);
    return res.json({ ok: true, code: norm, type: "PERCENT", value: 10, discount, total: subtotal - discount });
  }
  if (norm === "FLAT100") {
    const discount = 100;
    const total = Math.max(0, subtotal - discount);
    return res.json({ ok: true, code: norm, type: "FLAT", value: 100, discount, total });
  }

  return res.status(200).json({ ok: false, code: norm, reason: "UNKNOWN" });
});

export default router;
