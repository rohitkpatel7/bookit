import Badge from "./Badge";
import Button from "./Button";
export default function Card({ item }: { item:any }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 overflow-hidden">
      <img src={item.imageUrl} alt={item.title} className="h-44 w-full object-cover" />
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
          <Badge>{item.location}</Badge>
        </div>
        {item.description && <p className="text-sm text-neutral-500">{item.description}</p>}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-neutral-600">From <span className="text-lg font-bold">₹{item.price}</span></span>
          <Button>View Details</Button>
        </div>
      </div>
    </div>
  );
}
