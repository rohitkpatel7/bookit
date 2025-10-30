import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { api } from "../lib/api";

type Promo = { valid: boolean; type?: "PERCENT" | "FLAT"; value?: number };

export default function Checkout() {
  const { id } = useParams(); // experienceId
  const nav = useNavigate();
  const { state } = useLocation() as any;
  const exp = state?.exp;
  const slot = state?.slot;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [persons, setPersons] = useState(1);
  const [promo, setPromo] = useState("");
  const [promoInfo, setPromoInfo] = useState<Promo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const base = useMemo(
    () => persons * (exp?.price ?? 0),
    [persons, exp?.price]
  );
  const total = useMemo(() => {
    if (!promoInfo?.valid) return base;
    if (promoInfo.type === "PERCENT")
      return Math.max(0, Math.round(base * (1 - (promoInfo.value ?? 0) / 100)));
    if (promoInfo.type === "FLAT")
      return Math.max(0, base - (promoInfo.value ?? 0));
    return base;
  }, [base, promoInfo]);

  const validate = async () => {
    setError(null);
    setPromoInfo(null);
    if (!promo.trim()) return;

    try {
      const subtotal = base;
      const { data } = await api.post("/promo/validate", {
        code: promo,
        experienceId: id,
        persons,
        subtotal,
      });

      const ok = data?.ok ?? data?.valid ?? false;

      if (ok) {
        setPromoInfo({
          valid: true,
          type: data.type, // "PERCENT" | "FLAT"
          value: data.value, // 10 or 100
        });
      } else {
        setPromoInfo({ valid: false });
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e.message || "Promo validation failed"
      );
    }
  };

  const book = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post("/bookings", {
        experienceId: id,
        slotId: slot.id,
        name,
        email,
        persons,
        totalPrice: total,
        promoCode: promoInfo?.valid ? promo.trim() : undefined,
      });

      nav("/result", { state: { ok: true, booking: res.data.booking } });
    } catch (e: any) {
      nav("/result", {
        state: { ok: false, message: e?.response?.data?.message || e.message },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!exp || !slot) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        Missing checkout data. Go back and select a slot.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* left: form */}
      <div className="lg:col-span-3 space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Your details</h2>

        <div>
          <label className="block text-sm text-neutral-600">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Jane Doe"
          />
          {!name && (
            <p className="text-red-600 text-sm mt-1">Name is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-neutral-600">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="jane@example.com"
          />
          {!emailValid && email && (
            <p className="text-red-600 text-sm mt-1">Enter a valid email.</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-neutral-600">Persons</label>
          <input
            type="number"
            min={1}
            value={persons}
            onChange={(e) => setPersons(parseInt(e.target.value || "1", 10))}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 items-center">
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Promo code (SAVE10 / FLAT100)"
          />
          <Button onClick={validate} disabled={!promo.trim()}>
            Validate
          </Button>
        </div>

        {promoInfo?.valid ? (
          <div className="text-sm text-green-700">
            <Badge>Applied</Badge>{" "}
            {promoInfo.type === "PERCENT"
              ? `${promoInfo.value}% off`
              : `₹${promoInfo.value} off`}
          </div>
        ) : promo && promoInfo && !promoInfo.valid ? (
          <p className="text-red-600 text-sm">Invalid code</p>
        ) : null}

        {error && <div className="text-red-600">{error}</div>}

        <Button
          variant="primary"
          disabled={submitting || !name || !emailValid}
          onClick={book}>
          {submitting ? "Booking…" : "Confirm Booking"}
        </Button>
      </div>

      {/* right: summary */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 p-4 space-y-2">
          <div className="font-semibold text-neutral-900">{exp.title}</div>
          <div className="text-sm text-neutral-600">
            {new Date(slot.date).toLocaleString()}
          </div>
          <div className="text-sm text-neutral-600">Persons: {persons}</div>
          <div className="pt-2 border-t border-neutral-200">
            <div className="text-neutral-700">Subtotal: ₹{base}</div>
            {promoInfo?.valid ? (
              <div className="text-emerald-700">
                Promo:{" "}
                {promoInfo.type === "PERCENT"
                  ? `-${promoInfo.value}%`
                  : `-₹${promoInfo.value}`}
              </div>
            ) : null}
            <div className="text-lg font-bold">Total: ₹{total}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
