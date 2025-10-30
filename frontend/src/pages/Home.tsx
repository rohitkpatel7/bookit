import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import Card from "../components/Card";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Search state (syncs with URL)
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState<string>(searchParams.get("q") || "");

  // 📦 Fetch data once
  useEffect(() => {
    api
      .get("/experiences")
      .then((r) => {
        const list = Array.isArray(r.data)
          ? r.data
          : Array.isArray(r.data?.data)
          ? r.data.data
          : [];
        setData(list);
      })
      .catch((e) => {
        console.error("Home fetch error:", e?.response?.data || e.message);
        setError(e?.response?.data?.message || e.message || "Failed to load");
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔎 Filter results
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((x) => {
      const t = `${x.title ?? ""} ${x.location ?? ""} ${
        x.description ?? ""
      }`.toLowerCase();
      return t.includes(term);
    });
  }, [data, q]);

  // 💬 Handle search submit
  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = q.trim();
    if (next) setSearchParams({ q: next });
    else setSearchParams({});
  }

  // 🌀 Loading / error states
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-neutral-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="mx-auto max-w-6xl p-6 text-red-600">Error: {error}</div>
    );

  // 🏠 Main content
  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header: logo (left) + search (right) */}
      <header className="mb-6 flex items-center justify-between gap-4">
        {/* left: logo + brand */}
        {/* left: logo + brand */}
        {/* left: logo + brand */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Highway Delite Logo"
            className="h-10 w-auto object-contain"
          />
          <span className="text-lg font-semibold text-white">
            highway delite
          </span>
        </div>

        {/* right: search bar */}
        <form
          onSubmit={onSearchSubmit}
          className="flex items-center gap-2 w-full max-w-md">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Search experiences"
          />
          <button
            type="submit"
            className="rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-900 text-sm font-medium px-4 py-2 transition">
            Search
          </button>
        </form>
      </header>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-neutral-600">
          No results for “{q || "your search"}”.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((x) => (
            <Link key={x.id} to={`/experience/${x.id}`} className="block">
              <Card item={x} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
