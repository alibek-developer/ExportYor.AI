"use client";

import { useState, useMemo } from "react";
import { Search, ArrowRight, Sparkles, Loader2, Bot, AlertCircle } from "lucide-react";
import tariffsData from "@/data/tariffs-eu.json";
import { ActiveView } from "../types";

interface HsAiResult {
  holat?: "aniq" | "noaniq";
  ishonch?: number;
  asosiy: {
    kod: string;
    nomi: string;
    bob?: string;
    bob_nomi?: string;
    ei_boj?: string;
    gsplus_boj?: string;
    ishonch?: number;
  } | null;
  alternativlar?:
    | {
        kod: string;
        nomi: string;
        ei_boj?: string;
        gsplus_boj?: string;
        qachon?: string;
        farqi?: string;
      }[]
    | null;
  savol?: string | null;
  izoh?: string;
}

interface HSCodeViewProps {
  setActiveView: (view: ActiveView) => void;
  handleSendMessage: (text: string) => void;
  aiLanguage: string;
}

const CATEGORIES = [
  "Barchasi",
  "Mevalar (08)",
  "Sabzavotlar (07)",
  "To'qimachilik (52)",
  "Don va boshoqli (10)",
  "Yog'lar (15)",
  "Sanoat (84-85)",
];

function chapterToCategory(chapter: string): string {
  const ch = parseInt(chapter, 10);
  if (ch === 8) return "Mevalar (08)";
  if (ch === 7) return "Sabzavotlar (07)";
  if (ch >= 50 && ch <= 63) return "To'qimachilik (52)";
  if (ch === 10) return "Don va boshoqli (10)";
  if (ch === 15) return "Yog'lar (15)";
  if (ch === 84 || ch === 85) return "Sanoat (84-85)";
  return "Boshqa";
}

export function HSCodeView({ setActiveView, handleSendMessage, aiLanguage }: HSCodeViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [isLoading] = useState(false);

  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState<HsAiResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiClarify, setAiClarify] = useState("");

  const handleAiSearch = async () => {
    const q = aiQuery.trim();
    if (!q) return;
    setIsAiLoading(true);
    setAiError("");
    try {
      const body = aiClarify
        ? { moduleType: "hscode", product: `${q} — ${aiClarify}`, language: aiLanguage }
        : { moduleType: "hscode", product: q, language: aiLanguage };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || "AI javob bermadi. Qayta urinib ko'ring.");
      }
      setAiResult(json.data as HsAiResult);
      setAiClarify(json.data?.savol ?? "");
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI xatolik yuz berdi");
    } finally {
      setIsAiLoading(false);
    }
  };

  const aiMain = aiResult?.asosiy;

  const products = tariffsData.products;

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((item) => {
      const matchesSearch = item.hs6.includes(q) || item.desc.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === "Barchasi" || chapterToCategory(item.chapter) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, products]);

  const displayedProducts = filteredProducts.slice(0, 50);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">
            HS-Code (TIF TN) Katalogi
          </h2>
          <p className="text-xs text-muted-foreground">
            Haqiqiy bojxona ma&apos;lumotlari asosida {products.length} ta mahsulotni qidirish
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="HS kodi yoki tavsifni kiriting (masalan: 0804, pomidor)..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-semibold text-foreground outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* AI HS-kod qidiruvchisi */}
      <div className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-500/5 via-purple-500/5 to-blue-500/5 p-4">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="shrink-0 text-fuchsia-600" />
          <h3 className="text-sm font-bold">AI yordamida HS-kod topish</h3>
          <span className="rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-extrabold text-fuchsia-600">
            AI
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Mahsulot nomini istalgan tilda yozing — o&apos;zbek, rus yoki ingliz: &quot;olcha&quot;,
          &quot;черешня&quot;, &quot;fresh cherry&quot;
        </p>
        <div className="mt-2.5 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => {
              setAiQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAiSearch();
            }}
            placeholder="masalan: olcha, черешня, mayiz, gilam..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-foreground outline-none focus:border-fuchsia-500"
          />
          <button
            type="button"
            onClick={handleAiSearch}
            disabled={isAiLoading || !aiQuery.trim()}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{isAiLoading ? "Qidirilmoqda..." : "AI qidirish"}</span>
          </button>
        </div>
        {aiClarify && aiResult?.savol && (
          <div className="mt-2 flex items-start justify-between gap-2 rounded-xl bg-amber-500/10 px-3 py-2">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              AI haqida so&apos;rayapti: {aiClarify} Natijani yaxshilash uchun javobni qo&apos;shib,
              yana qidiring.
            </p>
            <button
              type="button"
              onClick={() => {
                setAiQuery((prev) => (prev ? `${prev} — ${aiClarify}` : aiClarify));
              }}
              className="shrink-0 rounded-lg bg-amber-500/20 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-500/30"
            >
              Javobni qo&apos;shish
            </button>
          </div>
        )}
        {aiError && (
          <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600">
            {aiError}
          </p>
        )}
      </div>

      {/* AI natijasi */}
      {aiResult && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} className="text-fuchsia-600" />
            <h3 className="text-sm font-bold">AI natijasi</h3>
            {(aiResult.ishonch ?? aiResult.asosiy?.ishonch) != null && (
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  (aiResult.ishonch ?? aiResult.asosiy?.ishonch ?? 0) >= 85
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-yellow-500/10 text-yellow-600"
                }`}
              >
                Ishonch {aiResult.ishonch ?? aiResult.asosiy?.ishonch}%
              </span>
            )}
          </div>

          {aiMain ? (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-lg font-extrabold text-blue-600">{aiMain.kod}</span>
                <span className="text-sm font-bold">{aiMain.nomi}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {aiMain.bob_nomi
                  ? `Bob ${aiMain.bob ?? ""} — ${aiMain.bob_nomi}`
                  : aiMain.bob
                    ? `Bob ${aiMain.bob}`
                    : ""}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1 font-semibold">
                  EI standart boji:{" "}
                  <strong className="text-foreground">{aiMain.ei_boj ?? "—"}</strong>
                </span>
                <span className="rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1 font-semibold">
                  GSP+ boji:{" "}
                  <strong className="text-emerald-600">{aiMain.gsplus_boj ?? "—"}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveView("chat");
                  handleSendMessage(
                    `${aiMain.kod} - ${aiMain.nomi} bo'yicha eksport tahlilini hisoblab ber`,
                  );
                }}
                className="mt-3 flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
              >
                <Bot size={13} />
                <span>Chatda tahlil qilish</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    Qo&apos;shimcha ma&apos;lumot kerak
                  </p>
                  {aiResult.savol && (
                    <p className="mt-1.5 text-sm font-extrabold text-amber-700 dark:text-amber-300">
                      {aiResult.savol}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    Javobni AI qidiruv maydoniga qo&apos;shib yoki &quot;Javobni qo&apos;shish&quot;
                    tugmasi orqali yana qidiring — natija aniq HS-kodga yangilanadi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {aiResult.alternativlar && aiResult.alternativlar.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Alternativ HS-kodlar
              </p>
              <div className="space-y-2">
                {aiResult.alternativlar.map((alt, i) => (
                  <div
                    key={`${alt.kod}-${i}`}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-blue-600">
                        {alt.kod}
                      </span>
                      <span className="text-xs font-bold">{alt.nomi}</span>
                      <span className="ml-auto text-[11px] text-muted-foreground">
                        EI {alt.ei_boj ?? "—"} · GSP+{" "}
                        <span className="text-emerald-600">{alt.gsplus_boj ?? "—"}</span>
                      </span>
                    </div>
                    {(alt.qachon ?? alt.farqi) && (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {alt.qachon ?? alt.farqi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiResult.izoh && (
            <p className="mt-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 px-3 py-2 text-xs text-muted-foreground">
              {aiResult.izoh}
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filteredProducts.length} ta natija
        {filteredProducts.length > 50 ? ` (50 tasi ko'rsatilmoqda)` : ""}
      </p>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-3 w-64" />
                  <div className="skeleton h-3 w-48" />
                </div>
                <div className="skeleton h-10 w-32" />
              </div>
            ))
          : displayedProducts.map((item) => (
              <div
                key={item.hs6}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-500/40 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md">
                      {item.hs6}
                    </span>
                    <span className="text-xs font-bold text-foreground truncate">{item.desc}</span>
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                      Bob {item.chapter}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>
                      EI MFN boji: <strong className="text-foreground">{item.euMfnPct}%</strong>
                    </span>
                    <span>·</span>
                    <span>
                      O&apos;zbekiston GSP+:{" "}
                      <strong className="text-emerald-600">{item.uzGspPct}%</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveView("chat");
                    handleSendMessage(
                      `${item.hs6} - ${item.desc} bo'yicha eksport tahlilini hisoblab ber`,
                    );
                  }}
                  className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all hover:scale-105 hover:shadow-md active:scale-95 shrink-0"
                >
                  <span>Tahlil qilish</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
      </div>
    </div>
  );
}
