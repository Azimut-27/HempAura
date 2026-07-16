import { Minus, Plus } from "lucide-react";

export default function QuantityControl({ value, min = 1, max, onChange, label }) {
  return (
    <div className="inline-grid grid-cols-[44px_58px_44px] border border-forest/20">
      <button
        type="button"
        className="grid min-h-11 place-items-center hover:bg-sage disabled:opacity-35"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Zmanjšaj količino za ${label}`}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <input
        className="w-full border-x border-forest/20 bg-transparent text-center font-semibold outline-none"
        aria-label={`Količina za ${label}`}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(Math.min(max, Math.max(min, Number(event.target.value) || min)))
        }
      />
      <button
        type="button"
        className="grid min-h-11 place-items-center hover:bg-sage disabled:opacity-35"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Povečaj količino za ${label}`}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
