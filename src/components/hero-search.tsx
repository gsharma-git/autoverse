import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"vehicle" | "size">("vehicle");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [size, setSize] = useState("");
  const [pincode, setPincode] = useState("");

  function submit() {
    nav({
      to: "/tyres",
      search: {
        pincode: pincode || undefined,
        vehicle: mode === "vehicle" ? `${brand} ${model}`.trim() || undefined : undefined,
        size: mode === "size" ? size || undefined : undefined,
      } as any,
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-background p-2 shadow-[var(--shadow-elevated)] md:flex-row md:items-stretch">
      <div className="flex flex-col justify-center rounded-xl px-4 py-3 md:min-w-[180px]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Search by
        </p>
        <div className="mt-1 flex gap-4">
          <button
            onClick={() => setMode("vehicle")}
            className={`pb-1 text-sm font-bold ${
              mode === "vehicle" ? "border-b-2 border-brand text-foreground" : "text-muted-foreground"
            }`}
          >
            Vehicle
          </button>
          <button
            onClick={() => setMode("size")}
            className={`pb-1 text-sm font-bold ${
              mode === "size" ? "border-b-2 border-brand text-foreground" : "text-muted-foreground"
            }`}
          >
            Tyre size
          </button>
        </div>
      </div>

      <div className="grid flex-1 gap-2 md:grid-cols-3">
        {mode === "vehicle" ? (
          <>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="rounded-xl bg-secondary px-4 py-3 text-sm outline-none"
            >
              <option value="">Brand (e.g. Maruti)</option>
              <option>Maruti</option>
              <option>Hyundai</option>
              <option>Honda</option>
              <option>Tata</option>
              <option>Mahindra</option>
              <option>Kia</option>
              <option>Skoda</option>
              <option>Volkswagen</option>
            </select>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-xl bg-secondary px-4 py-3 text-sm outline-none"
            >
              <option value="">Model</option>
              <option>Swift</option>
              <option>City</option>
              <option>Creta</option>
              <option>Nexon</option>
              <option>Verna</option>
              <option>Seltos</option>
              <option>XUV700</option>
            </select>
          </>
        ) : (
          <input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="e.g. 205/55 R16"
            className="col-span-2 rounded-xl bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        )}
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="Enter pincode"
          className="rounded-xl bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <Button
        onClick={submit}
        size="lg"
        className="h-auto rounded-xl bg-brand px-8 text-brand-foreground hover:bg-brand/90"
      >
        <Search className="size-4" />
        Find dealers
      </Button>
    </div>
  );
}
