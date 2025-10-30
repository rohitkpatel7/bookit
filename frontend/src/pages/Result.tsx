import { useLocation, Link } from "react-router-dom";
import Button from "../components/Button";

export default function Result() {
  const { state } = useLocation() as any;
  const ok = state?.ok;

  return (
    <div className="mx-auto max-w-xl p-6 text-center space-y-4">
      {ok ? (
        <div className="rounded-xl bg-green-50 text-green-700 p-4">
          <h2 className="text-xl font-semibold">Booking Confirmed ✅</h2>
          <pre className="text-left bg-white rounded-lg p-3 mt-3 overflow-auto">
{JSON.stringify(state.booking, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="rounded-xl bg-red-50 text-red-700 p-4">
          <h2 className="text-xl font-semibold">Booking Failed ❌</h2>
          <p className="mt-1">{state?.message || "Please try a different slot."}</p>
        </div>
      )}

      <Link to="/"><Button variant="ghost">Back to Home</Button></Link>
    </div>
  );
}
