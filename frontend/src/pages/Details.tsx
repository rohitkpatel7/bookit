import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Badge from "../components/Badge";
import Button from "../components/Button";

type Slot = { id: string; date: string; capacity: number; remaining?: number };

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exp, setExp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Slot | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    api
      .get(`/experiences/${id}`)
      .then((r) => {
        // Some setups return the object directly, others as { data: { ... } }
        const payload =
          r?.data && !("length" in r.data) ? r.data.data ?? r.data : null;
        console.log("GET /experiences/:id ->", payload);
        setExp(payload);
      })
      .catch((e) => {
        console.error("Details fetch error:", e?.response?.data || e.message);
        setError(e?.response?.data?.message || e.message || "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-3xl p-6">Loading…</div>;
  if (error)
    return (
      <div className="mx-auto max-w-3xl p-6 text-red-600">Error: {error}</div>
    );
  if (!exp)
    return <div className="mx-auto max-w-3xl p-6 text-red-600">Not found.</div>;

  // ✅ guard: make sure slots is always an array before mapping
  const slots: Slot[] = Array.isArray(exp.slots) ? exp.slots : [];

  return (
    <div>
      <img
        src={exp.imageUrl}
        alt={exp.title}
        className="h-72 w-full object-cover"
      />
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">{exp.title}</h1>
          <Badge>{exp.location}</Badge>
        </div>
        {exp.description && (
          <p className="text-neutral-600">{exp.description}</p>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold text-neutral-900">
            Available dates & slots
          </h3>
          {slots.length === 0 ? (
            <p className="text-sm text-neutral-500">No slots available.</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
  {slots.map((s) => {
    const d = new Date(s.date);
    const label = d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    const soldOut = typeof s.remaining === "number" ? s.remaining <= 0 : false;
    const isSelected = selected?.id === s.id;
    return (
      <button
        key={s.id}
        disabled={soldOut}
        onClick={() => setSelected(s)}
        className={[
          "px-4 py-2 rounded-2xl border text-sm font-medium transition",
          soldOut
            ? "bg-neutral-200 text-neutral-400 cursor-not-allowed border-neutral-300"
            : isSelected
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100",
        ].join(" ")}
        title={soldOut ? "Sold out" : "Select slot"}
      >
        {label} • {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        {soldOut && <span className="ml-2 text-red-500">Sold out</span>}
      </button>
    );
  })}
</div>

          )}
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            disabled={!selected}
            onClick={() =>
              navigate(`/checkout/${exp.id}`, {
                state: { exp, slot: selected },
              })
            }>
            Continue to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
