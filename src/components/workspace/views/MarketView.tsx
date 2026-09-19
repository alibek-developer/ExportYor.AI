"use client";

import { useState } from "react";
import {
  Globe,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  Shield,
  BarChart3,
  MapPin,
  ArrowRight,
  Star,
  Zap,
  Info,
  RefreshCw,
} from "lucide-react";
import { ExportProject, MarketAnalysisData } from "../types";

interface MarketViewProps {
  selectedProject: ExportProject | null;
  handleSendMessage: (text: string) => void;
  aiLanguage: string;
  generateModule: (
    type: "market" | "documents" | "subsidies",
    product: string,
    weight: number,
    dest: string,
  ) => Promise<boolean>;
}

// Eksport uchun eng yaxshi davlatlar ro'yxati
const EXPORT_COUNTRIES = [
  {
    code: "DE",
    name: "Germaniya",
    flag: "🇩🇪",
    region: "Yevropa",
    gdpB: 4.5,
    population: "84M",
    tags: ["GSP+", "Katta bozor"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    code: "PL",
    name: "Polsha",
    flag: "🇵🇱",
    region: "Yevropa",
    gdpB: 0.7,
    population: "38M",
    tags: ["GSP+", "Tranzit"],
    color: "from-red-500 to-rose-600",
  },
  {
    code: "AE",
    name: "BAA (Dubai)",
    flag: "🇦🇪",
    region: "Yaqin Sharq",
    gdpB: 0.5,
    population: "10M",
    tags: ["Boj 0%", "Hub"],
    color: "from-amber-500 to-orange-500",
  },
  {
    code: "TR",
    name: "Turkiya",
    flag: "🇹🇷",
    region: "Evro-Osiyo",
    gdpB: 1.1,
    population: "85M",
    tags: ["Yaqin", "Tranzit"],
    color: "from-red-600 to-orange-500",
  },
  {
    code: "CN",
    name: "Xitoy",
    flag: "🇨🇳",
    region: "Osiyo",
    gdpB: 18.0,
    population: "1.4B",
    tags: ["Eng katta", "Raqobat"],
    color: "from-red-500 to-yellow-500",
  },
  {
    code: "SA",
    name: "Saudiya Arabistoni",
    flag: "🇸🇦",
    region: "Yaqin Sharq",
    gdpB: 1.1,
    population: "36M",
    tags: ["Yuqori daromad"],
    color: "from-green-600 to-emerald-500",
  },
  {
    code: "RU",
    name: "Rossiya",
    flag: "🇷🇺",
    region: "MDH",
    gdpB: 2.2,
    population: "145M",
    tags: ["Yaqin", "MDH"],
    color: "from-blue-600 to-slate-600",
  },
  {
    code: "KZ",
    name: "Qozog'iston",
    flag: "🇰🇿",
    region: "MDH",
    gdpB: 0.26,
    population: "19M",
    tags: ["Tranzit", "MDH"],
    color: "from-sky-400 to-yellow-400",
  },
  {
    code: "FR",
    name: "Fransiya",
    flag: "🇫🇷",
    region: "Yevropa",
    gdpB: 3.0,
    population: "68M",
    tags: ["GSP+", "Premium"],
    color: "from-blue-600 to-red-500",
  },
  {
    code: "GB",
    name: "Britaniya",
    flag: "🇬🇧",
    region: "Yevropa",
    gdpB: 3.1,
    population: "67M",
    tags: ["Premium", "Ingliz tili"],
    color: "from-blue-700 to-red-600",
  },
  {
    code: "IN",
    name: "Hindiston",
    flag: "🇮🇳",
    region: "Osiyo",
    gdpB: 3.7,
    population: "1.4B",
    tags: ["Rivojlanmoqda"],
    color: "from-orange-500 to-green-600",
  },
  {
    code: "EG",
    name: "Misr",
    flag: "🇪🇬",
    region: "Afrika",
    gdpB: 0.4,
    population: "104M",
    tags: ["Afrika hub"],
    color: "from-yellow-600 to-red-500",
  },
];

type CountryAnalysisMap = Record<string, MarketAnalysisData & { loadingAt?: string }>;

const statusConfig = {
  mos: {
    label: "Mos",
    shortLabel: "Mos",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/30",
    icon: CheckCircle2,
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  ortacha: {
    label: "O'rta",
    shortLabel: "O'rta",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
    ring: "ring-amber-500/30",
    icon: AlertTriangle,
    gradient: "from-amber-500/20 to-amber-500/5",
  },
  mos_emas: {
    label: "Mos emas",
    shortLabel: "Mos emas",
    color: "text-red-600",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    dot: "bg-red-500",
    ring: "ring-red-500/30",
    icon: XCircle,
    gradient: "from-red-500/20 to-red-500/5",
  },
};

export function MarketView({ selectedProject, handleSendMessage, aiLanguage }: MarketViewProps) {
  const [analysisMap, setAnalysisMap] = useState<CountryAnalysisMap>({});
  const [loadingCountry, setLoadingCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<string>("Barchasi");
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const regions = ["Barchasi", "Yevropa", "Yaqin Sharq", "Osiyo", "MDH", "Afrika", "Evro-Osiyo"];

  const filteredCountries =
    filterRegion === "Barchasi"
      ? EXPORT_COUNTRIES
      : EXPORT_COUNTRIES.filter((c) => c.region === filterRegion);

  const handleAnalyze = async (countryName: string) => {
    if (!selectedProject) return;
    setLoadingCountry(countryName);
    setSelectedCountry(countryName);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleType: "market",
          product: selectedProject.productName,
          weight: selectedProject.productWeightKg,
          destination: countryName,
          language: aiLanguage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status}: ${errData.error || "Xatolik"}`);
      }

      const json = await res.json();
      if (json.data) {
        setAnalysisMap((prev) => ({
          ...prev,
          [countryName]: { ...json.data, loadingAt: new Date().toISOString() },
        }));
        setErrorMap((prev) => {
          const n = { ...prev };
          delete n[countryName];
          return n;
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Noma'lum xatolik";
      setErrorMap((prev) => ({ ...prev, [countryName]: message }));
    } finally {
      setLoadingCountry(null);
    }
  };

  const selectedCountryData = selectedCountry
    ? EXPORT_COUNTRIES.find((c) => c.name === selectedCountry)
    : null;
  const selectedAnalysis = selectedCountry ? analysisMap[selectedCountry] : null;

  const analyzedCount = Object.keys(analysisMap).length;
  const mosCount = Object.values(analysisMap).filter((a) => a.status === "mos").length;

  // No project selected
  if (!selectedProject) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-5 size-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
            <Globe size={36} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-extrabold mb-2">Loyiha tanlanmagan</h2>
          <p className="text-sm text-muted-foreground">
            Bozor tahlilini boshlash uchun chap menyudan loyiha tanlang.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT: Countries List */}
      <div className="w-80 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
              <Globe size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold">Bozor Tahlili</h2>
              <p className="text-[10px] text-muted-foreground">
                {selectedProject.productName} · {selectedProject.productWeightKg}kg
              </p>
            </div>
          </div>

          {/* Stats */}
          {analyzedCount > 0 && (
            <div className="flex gap-2 mb-3">
              <div className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-center">
                <div className="text-base font-extrabold">{analyzedCount}</div>
                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">
                  Tahlil qilindi
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-emerald-500/10 px-2.5 py-1.5 text-center">
                <div className="text-base font-extrabold text-emerald-600">{mosCount}</div>
                <div className="text-[9px] text-emerald-600/70 font-bold uppercase tracking-wide">
                  Mos bozor
                </div>
              </div>
            </div>
          )}

          {/* Region Filter */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setFilterRegion(r)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                  filterRegion === r
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div className="flex-1 overflow-y-auto">
          {filteredCountries.map((country) => {
            const analysis = analysisMap[country.name];
            const isLoading = loadingCountry === country.name;
            const isSelected = selectedCountry === country.name;
            const sConf = analysis ? statusConfig[analysis.status] : null;

            return (
              <button
                key={country.code}
                onClick={() => {
                  setSelectedCountry(country.name);
                  if (!analysis && !isLoading) {
                    handleAnalyze(country.name);
                  }
                }}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 transition-all group ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl shrink-0">{country.flag}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold truncate">{country.name}</span>
                      {analysis && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${sConf?.bg} ${sConf?.color}`}
                        >
                          {sConf?.shortLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{country.region}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">
                        {country.population}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {country.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isLoading ? (
                      <Loader2 size={16} className="text-blue-500 animate-spin" />
                    ) : analysis ? (
                      <div
                        className={`size-7 rounded-full flex items-center justify-center ${sConf?.bg} ring-2 ${sConf?.ring}`}
                      >
                        {sConf && <sConf.icon size={14} className={sConf.color} />}
                      </div>
                    ) : (
                      <div className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles size={12} className="text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Mini progress bar for analyzed */}
                {analysis && (
                  <div className="mt-2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        analysis.status === "mos"
                          ? "bg-emerald-500 w-4/5"
                          : analysis.status === "ortacha"
                            ? "bg-amber-500 w-1/2"
                            : "bg-red-500 w-1/4"
                      }`}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Detail Panel */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {!selectedCountry ? (
          /* Empty State */
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-xs">
              <div className="mx-auto mb-5 size-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 flex items-center justify-center ring-1 ring-blue-500/10">
                <MapPin size={36} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-extrabold mb-2">Davlat tanlang</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Chap tomondagi ro&apos;yxatdan davlatni tanlang — AI avtomatik bozor tahlilini
                amalga oshiradi.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 justify-center">
                {["🇩🇪", "🇵🇱", "🇦🇪", "🇹🇷"].map((flag) => (
                  <span
                    key={flag}
                    className="text-2xl opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : loadingCountry === selectedCountry ? (
          /* Loading State */
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto mb-5 size-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center ring-1 ring-blue-500/20 animate-pulse">
                <Sparkles size={36} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-extrabold mb-2">AI tahlil qilmoqda...</h3>
              <p className="text-sm text-muted-foreground mb-1">
                {selectedCountryData?.flag} {selectedCountry} bozori uchun
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedProject.productName} · {selectedProject.productWeightKg}kg
              </p>
              <div className="mt-6 flex gap-1 justify-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="size-2 rounded-full bg-blue-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : selectedAnalysis ? (
          /* Analysis Result */
          <div className="p-6 space-y-5">
            {/* Header Card */}
            <div
              className={`rounded-2xl bg-gradient-to-br ${statusConfig[selectedAnalysis.status].gradient} border ${statusConfig[selectedAnalysis.status].border} p-5 shadow-sm`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{selectedCountryData?.flag}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-extrabold">{selectedCountry}</h2>
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${statusConfig[selectedAnalysis.status].bg} ${statusConfig[selectedAnalysis.status].color}`}
                      >
                        {selectedAnalysis.status_emoji}{" "}
                        {statusConfig[selectedAnalysis.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedProject.productName} ·{" "}
                      {selectedProject.productWeightKg.toLocaleString()}kg uchun tahlil
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAnalyze(selectedCountry!)}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground border border-white/40 dark:border-slate-700/40 transition-all hover:scale-105 active:scale-95"
                >
                  <RefreshCw size={12} />
                  <span>Yangilash</span>
                </button>
              </div>

              <p className="mt-4 text-sm leading-relaxed font-medium">{selectedAnalysis.xulosa}</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-3 border border-white/30 dark:border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={14} className="text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Raqobat
                    </span>
                  </div>
                  <div
                    className={`text-sm font-extrabold capitalize ${
                      selectedAnalysis.raqobat_darajasi === "past"
                        ? "text-emerald-600"
                        : selectedAnalysis.raqobat_darajasi === "o'rta"
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {selectedAnalysis.raqobat_darajasi === "past"
                      ? "🟢 Past"
                      : selectedAnalysis.raqobat_darajasi === "o'rta"
                        ? "🟡 O'rta"
                        : "🔴 Yuqori"}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-3 border border-white/30 dark:border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={14} className="text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      GSP+ imtiyoz
                    </span>
                  </div>
                  <div
                    className={`text-sm font-extrabold ${selectedAnalysis.gsplus ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {selectedAnalysis.gsplus ? "✅ Mavjud" : "❌ Yo'q"}
                  </div>
                </div>
              </div>
            </div>

            {/* GSP+ Info */}
            {selectedAnalysis.gsplus_izoh && (
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3">
                <div className="size-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Info size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
                    GSP+ ma&apos;lumoti
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedAnalysis.gsplus_izoh}
                  </p>
                </div>
              </div>
            )}

            {/* Advantages & Disadvantages */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Afzalliklar */}
              <div className="rounded-2xl border border-emerald-500/20 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-emerald-500/5 border-b border-emerald-500/10 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <h3 className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    Afzalliklar
                  </h3>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                    {selectedAnalysis.afzalliklar.length}
                  </span>
                </div>
                <ul className="p-4 space-y-2.5">
                  {selectedAnalysis.afzalliklar.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="mt-1.5 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kamchiliklar */}
              <div className="rounded-2xl border border-red-500/20 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-red-500/5 border-b border-red-500/10 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-600" />
                  <h3 className="text-sm font-extrabold text-red-700 dark:text-red-400">
                    Kamchiliklar
                  </h3>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600">
                    {selectedAnalysis.kamchiliklar.length}
                  </span>
                </div>
                <ul className="p-4 space-y-2.5">
                  {selectedAnalysis.kamchiliklar.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="mt-1.5 size-1.5 rounded-full bg-red-500 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Alternative Market */}
            {selectedAnalysis.tavsiya_bozor && (
              <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                    <Star size={16} className="text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-violet-700 dark:text-violet-400">
                      AI Tavsiya qiladi: {selectedAnalysis.tavsiya_bozor}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">Muqobil yaxshiroq bozor</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {selectedAnalysis.tavsiya_bozor_sabab}
                </p>
                <button
                  onClick={() => {
                    const found = EXPORT_COUNTRIES.find(
                      (c) =>
                        c.name
                          .toLowerCase()
                          .includes(selectedAnalysis.tavsiya_bozor!.toLowerCase()) ||
                        selectedAnalysis
                          .tavsiya_bozor!.toLowerCase()
                          .includes(c.name.toLowerCase()),
                    );
                    if (found) {
                      setSelectedCountry(found.name);
                      if (!analysisMap[found.name]) {
                        handleAnalyze(found.name);
                      }
                    }
                  }}
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors group"
                >
                  <span>{selectedAnalysis.tavsiya_bozor} ni tahlil qilish</span>
                  <ArrowRight
                    size={12}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() =>
                  handleSendMessage(
                    `${selectedCountry} bozori bo'yicha batafsil ma'lumot ber: ${selectedProject.productName} uchun raqobatchilar, narx darajasi, va yirik importyorlar haqida`,
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <Zap size={13} />
                <span>AI dan batafsil so&apos;rash</span>
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    `${selectedCountry} ga ${selectedProject.productName} eksport qilish uchun qanday hujjatlar kerak?`,
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
              >
                <ChevronRight size={13} />
                <span>Hujjatlar haqida</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not yet analyzed or error */
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-xs">
              <div className="mx-auto mb-5 size-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 flex items-center justify-center">
                <span className="text-4xl">{selectedCountryData?.flag}</span>
              </div>
              <h3 className="text-lg font-extrabold mb-2">{selectedCountry}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedCountryData?.region} · {selectedCountryData?.population}
              </p>
              <div className="flex gap-1.5 justify-center mb-5">
                {selectedCountryData?.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Error message */}
              {errorMap[selectedCountry!] && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-left">
                  <p className="text-xs font-bold text-red-600 mb-1">⚠️ Tahlil amalga oshmadi</p>
                  <p className="text-[10px] text-red-500/80 leading-relaxed">
                    AI serverlari band — biroz kuting va qayta urinib ko&apos;ring
                  </p>
                </div>
              )}

              <button
                onClick={() => handleAnalyze(selectedCountry!)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/25 mx-auto"
              >
                <Sparkles size={15} />
                <span>
                  {errorMap[selectedCountry!] ? "Qayta urinib ko'rish" : "AI tahlilini boshlash"}
                </span>
              </button>
              <p className="text-[10px] text-muted-foreground mt-3">
                {selectedProject.productName} uchun {selectedCountry} bozori tahlil qilinadi
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Compared countries sidebar (if multiple analyzed) */}
      {analyzedCount >= 2 && (
        <div className="w-52 shrink-0 flex flex-col border-l border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
              Taqqoslash
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {Object.entries(analysisMap)
              .sort(([, a], [, b]) => {
                const order = { mos: 0, ortacha: 1, mos_emas: 2 };
                return order[a.status] - order[b.status];
              })
              .map(([country, analysis]) => {
                const conf = statusConfig[analysis.status];
                const countryInfo = EXPORT_COUNTRIES.find((c) => c.name === country);
                return (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className={`w-full text-left rounded-xl p-2.5 transition-all border ${
                      selectedCountry === country
                        ? `${conf.bg} ${conf.border}`
                        : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{countryInfo?.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{country}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`size-1.5 rounded-full ${conf.dot}`} />
                          <span className={`text-[9px] font-bold ${conf.color}`}>{conf.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          analysis.status === "mos"
                            ? "bg-emerald-500 w-4/5"
                            : analysis.status === "ortacha"
                              ? "bg-amber-500 w-1/2"
                              : "bg-red-500 w-1/5"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
          </div>
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[9px] text-muted-foreground text-center leading-relaxed">
              Eng yaxshi bozorni tanlash uchun bir nechta davlatni tahlil qiling
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
