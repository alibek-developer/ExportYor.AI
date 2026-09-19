"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { LogisticsInput, LogisticsResult, TransportType } from "../types";

interface LogisticsViewProps {
  logisticsInput: LogisticsInput;
  setLogisticsInput: (input: LogisticsInput) => void;
  calculateLogistics: (input: LogisticsInput) => LogisticsResult;
  currency: "USD" | "EUR" | "UZS" | "RUB";
  weightUnit: "kg" | "t";
  aiLanguage: string;
}

// Taxminiy kurslar (USD bazadan)
const USD_TO: Record<string, number> = { USD: 1, EUR: 0.92, UZS: 12750, RUB: 92 };
const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  EUR: "€",
  UZS: "so'm",
  RUB: "₽",
};

function formatMoney(usd: number, currency: "USD" | "EUR" | "UZS" | "RUB"): string {
  const rate = USD_TO[currency] ?? 1;
  const value = usd * rate;
  if (currency === "UZS") return `${value.toLocaleString("ru-RU")} so'm`;
  if (currency === "RUB") return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
  return `${CURRENCY_SYMBOL[currency]}${value.toFixed(2)}`;
}

function formatWeight(kg: number, unit: "kg" | "t"): string {
  if (unit === "t") {
    const t = kg / 1000;
    return `${t % 1 === 0 ? t.toFixed(0) : t.toFixed(1)} t`;
  }
  return `${kg.toLocaleString("ru-RU")} kg`;
}

const COUNTRIES = [
  { value: "Polsha", label: "Polsha (Polsha) — 🇵🇱" },
  { value: "Germaniya", label: "Germaniya (Berlin) — 🇩🇪" },
  { value: "BAA", label: "BAA (Dubay) — 🇦🇪" },
  { value: "Turkiya", label: "Turkiya (Stanbul) — 🇹🇷" },
  { value: "Rossiya", label: "Rossiya (Moskva) — 🇷🇺" },
];

const TRANSPORT_BUTTONS: { type: LogisticsInput["transportType"]; label: string }[] = [
  { type: "auto", label: "Avto" },
  { type: "air", label: "Avia" },
  { type: "rail", label: "Temiryo'l" },
  { type: "sea", label: "Dengiz" },
];

const TRANSPORT_LABELS: Record<string, string> = {
  auto: "Avto",
  rail: "Temir",
  air: "Avia",
  sea: "Dengiz",
};

const COMPARE_TYPES: TransportType[] = ["auto", "rail", "air", "sea"];

interface LogisticsAiRec {
  optimal_transport?: string;
  optimal_narx?: string;
  optimal_muddat?: string;
  izoh?: string;
  muqobil?: string | null;
}

export function LogisticsView({
  logisticsInput,
  setLogisticsInput,
  calculateLogistics,
  currency,
  weightUnit,
  aiLanguage,
}: LogisticsViewProps) {
  const result = calculateLogistics(logisticsInput);

  const [aiRec, setAiRec] = useState<LogisticsAiRec | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const compare = COMPARE_TYPES.map((type) => {
    const r = calculateLogistics({ ...logisticsInput, transportType: type });
    return {
      type,
      label: TRANSPORT_LABELS[type] ?? type,
      costPerKg: r.costPerKg,
      transitDays: r.transitDays,
    };
  });

  const handleWeightChange = (value: string) => {
    const n = parseFloat(value) || 0;
    setLogisticsInput({ ...logisticsInput, weightKg: weightUnit === "t" ? n * 1000 : n });
  };

  const update = <K extends keyof LogisticsInput>(key: K, value: LogisticsInput[K]) => {
    setLogisticsInput({ ...logisticsInput, [key]: value });
  };

  const handleAiRecommend = async () => {
    setAiLoading(true);
    setAiError("");
    setAiRec(null);
    try {
      const costsText = compare
        .map((t) => `${t.label}: $${t.costPerKg.toFixed(2)}/kg, ${t.transitDays}`)
        .join("; ");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleType: "logistics",
          product: logisticsInput.productType || "belgilanmagan mahsulot",
          weight: logisticsInput.weightKg,
          destination: logisticsInput.destinationCountry,
          language: aiLanguage,
          context: {
            costs: costsText,
            route: `${logisticsInput.originCity || "Toshkent"} → ${
              logisticsInput.destinationCity || logisticsInput.destinationCountry
            }`,
            temperature: logisticsInput.temperatureRequired ? "ha, kerak" : null,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.data) throw new Error(json.error || "AI javob bermadi");
      setAiRec(json.data as LogisticsAiRec);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI xatolik yuz berdi");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">
          Multimodal Logistika Kalkulyatori
        </h2>
        <p className="text-xs text-muted-foreground">
          Toshkentdan Yevropa va Osiyo bozorlariga 1 kg mahsulot yetkazib berish narxini aniq
          hisoblang
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {/* Input Form — Left Panel */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Parametrlarni Kiritish
          </h3>

          <div>
            <label className="text-xs font-bold block mb-1">Manba shahri</label>
            <input
              type="text"
              value={logisticsInput.originCity}
              onChange={(e) => update("originCity", e.target.value)}
              placeholder="Toshkent"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Boradgan davlat</label>
            <select
              value={logisticsInput.destinationCountry}
              onChange={(e) => update("destinationCountry", e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold outline-none focus:border-blue-600"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Boradgan shahri</label>
            <input
              type="text"
              value={logisticsInput.destinationCity}
              onChange={(e) => update("destinationCity", e.target.value)}
              placeholder="Shahar kiriting"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">
              Yuk hajmi ({weightUnit === "t" ? "tonna" : "kg"})
            </label>
            <input
              type="number"
              value={weightUnit === "t" ? logisticsInput.weightKg / 1000 : logisticsInput.weightKg}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Transport turi</label>
            <div className="grid grid-cols-2 gap-2">
              {TRANSPORT_BUTTONS.map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update("transportType", type)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    logisticsInput.transportType === type
                      ? "border-blue-600 bg-blue-500/10 text-blue-600"
                      : "border-slate-200 dark:border-slate-800 text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="temperature-toggle"
              checked={logisticsInput.temperatureRequired}
              onChange={(e) => update("temperatureRequired", e.target.checked)}
              className="h-4 w-4 rounded border-slate-200 dark:border-slate-800 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="temperature-toggle" className="text-xs font-bold">
              Harorat talab qilinadi
            </label>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Mahsulot turi</label>
            <input
              type="text"
              value={logisticsInput.productType}
              onChange={(e) => update("productType", e.target.value)}
              placeholder="Masalan: Quruq mevalar"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Result Card — Right Panel */}
        <div className="sm:col-span-2 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 flex flex-col">
          <div>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
              Hisoblangan Natija
            </span>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-blue-600">
                {formatMoney(result.costPerKg, currency)}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                / 1 kg transport xarajati
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Jami yuk partiyasi ({formatWeight(logisticsInput.weightKg, weightUnit)}) uchun:{" "}
              <strong className="text-foreground text-sm">
                {formatMoney(result.totalCost, currency)}
              </strong>
            </p>
          </div>

          {/* Transport comparison */}
          <div className="mt-6">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Transport turlari narx taqqosi
            </span>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {compare.map((t) => {
                const selected = logisticsInput.transportType === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => update("transportType", t.type)}
                    className={`rounded-xl border p-3 text-left text-xs transition-all ${
                      selected
                        ? "border-blue-600 bg-blue-600/10 text-blue-600 shadow-[0_0_0_1px] shadow-blue-600/40"
                        : "border-blue-500/20 bg-white/60 dark:bg-slate-900/60 text-muted-foreground hover:border-blue-500/40"
                    }`}
                  >
                    <span className="block font-extrabold">
                      {t.label}
                      {selected && <span className="ml-1">✓</span>}
                    </span>
                    <span className={`mt-1 block font-black ${selected ? "" : "text-foreground"}`}>
                      {formatMoney(t.costPerKg, currency)}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {t.transitDays}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-blue-500/20 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Tranzit muddati:</span>
              <span className="font-bold text-foreground">{result.transitDays}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Marshrut:</span>
              <span className="font-bold text-foreground">{result.route}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Sug&apos;urta:</span>
              <span className="font-bold text-foreground">
                {formatMoney(result.insurance, currency)}
              </span>
            </div>
            {result.temperature && (
              <div>
                <span className="text-muted-foreground block">Harorat rejimi:</span>
                <span className="font-bold text-foreground">{result.temperature}</span>
              </div>
            )}
          </div>

          {/* AI recommendation */}
          <div className="mt-6 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                AI tavsiya
              </span>
              <button
                type="button"
                onClick={handleAiRecommend}
                disabled={aiLoading}
                className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-violet-700 active:scale-95 disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                {aiRec ? "Yangilash" : "AI tavsiya olish"}
              </button>
            </div>

            {aiError && <p className="mt-2 text-[11px] font-semibold text-red-500">{aiError}</p>}

            {aiRec ? (
              <div className="mt-3 space-y-1">
                <span className="text-sm font-bold text-foreground">
                  Optimal:{" "}
                  <span className="text-violet-700 dark:text-violet-400">
                    {aiRec.optimal_transport ?? "—"}
                  </span>
                  {aiRec.optimal_narx && (
                    <span className="ml-2 text-xs font-semibold text-muted-foreground">
                      {aiRec.optimal_narx}
                      {aiRec.optimal_muddat && ` • ${aiRec.optimal_muddat}`}
                    </span>
                  )}
                </span>
                <p className="text-xs text-muted-foreground">{aiRec.izoh}</p>
              </div>
            ) : (
              !aiError && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Qaysi transport turi ushbu mahsulot uchun optimal ekanini AI tahlil qiladi.
                </p>
              )
            )}
          </div>

          {result.notes.length > 0 && (
            <div className="mt-4 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Eslatmalar
              </span>
              <ul className="space-y-1">
                {result.notes.map((note, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
