import { useEffect, useState } from "react";
import { api } from "./lib/api";

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/experiences")
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:16}}>Loading…</div>;
  if (error)   return <div style={{padding:16, color:"crimson"}}>Error: {error}</div>;

  return (
    <div style={{padding:16, display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))"}}>
      {data.map(x => (
        <div key={x.id} style={{border:"1px solid #eee", borderRadius:12, padding:12}}>
          <img src={x.imageUrl} alt={x.title} style={{width:"100%", height:140, objectFit:"cover", borderRadius:8}}/>
          <h3 style={{margin:"8px 0"}}>{x.title}</h3>
          <div>{x.location}</div>
          <div>₹{x.price}</div>
        </div>
      ))}
    </div>
  );
}
