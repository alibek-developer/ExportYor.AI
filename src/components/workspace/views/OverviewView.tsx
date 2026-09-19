"use client";

import { useState } from "react";
import {
  Truck,
  FileCheck2,
  Bot,
  Package,
  Sparkles,
  Loader2,
  Clock,
  Lightbulb,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { ExportProject, LogisticsInput, LogisticsResult, ActiveView } from "../types";

interface OverviewViewProps {
  selectedProject: ExportProject | null;
  logisticsInput: LogisticsInput;
  setLogisticsInput: (input: LogisticsInput) => void;
  calculateLogistics: (input: LogisticsInput) => LogisticsResult;
  toggleRoadmap: (id: number) => void;
  setActiveView: (view: ActiveView) => void;
  generateModule: (
    type: "market" | "documents" | "subsidies" | "roadmap",
    product: string,
    weight: number,
    dest: string,
  ) => Promise<boolean>;
}

export function OverviewView({
  selectedProject,
  logisticsInput,
  setLogisticsInput,
  calculateLogistics,
  toggleRoadmap,
  setActiveView,
  generateModule,
}: OverviewViewProps) {
  const analysis = selectedProject?.analysisResult;
  const logistics = calculateLogistics(logisticsInput);
  const roadmap = analysis?.roadmap ?? [];
  const roadmapData = analysis?.roadmapData;
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);

  const handleGenerateRoadmap = async () => {
    if (!selectedProject) return;
    setIsRoadmapLoading(true);
    await generateModule(
      "roadmap",
      selectedProject.productName,
      selectedProject.productWeightKg,
      selectedProject.destinationCountry,
    );
    setIsRoadmapLoading(false);
  };

  const formatMuddat = (min: number, max: number, birlik = "kun") =>
    min === max ? `${min} ${birlik}` : `${min}-${max} ${birlik}`;

  const formatNarx = (min?: number, max?: number, valyuta?: string) => {
    if (min == null && max == null) return null;
    const v = valyuta === "USD" ? "$" : "";
    const fmt = (n: number) =>
      valyuta === "USD" ? n.toLocaleString("en-US") : n.toLocaleString("uz-UZ");
    if (min == null) return `${v}${fmt(max ?? 0)} ${valyuta === "USD" ? "" : "so'm"}`;
    if (max == null || min === max)
      return `${v}${fmt(min)} ${valyuta === "USD" ? "" : "so'm"}`.trim();
    return `${v}${fmt(min)}–${v}${fmt(max)} ${valyuta === "USD" ? "" : "so'm"}`.trim();
  };

  const statusLabels: Record<string, string> = {
    birinchi: "1-bosqich",
    ikkinchi: "2-bosqich",
    uchinchi: "3-bosqich",
    oxirgi: "Yakuniy bosqich",
  };

  if (!selectedProject) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-blue-500/10 mb-4">
            <Package size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-extrabold">Loyiha tanlanmagan</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Yangi eksport loyihasi yarating yoki mavjudini tanlang. AI sizga HS-Code, boj stavkasi
            va logistika hisobini tuzib beradi.
          </p>
          <button
            type="button"
            onClick={() => setActiveView("chat")}
            className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all hover:scale-105"
          >
            <Bot size={16} />
            <span>AI Konsultant bilan boshlash</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">
            {selectedProject.name}
          </h2>
          <p className="text-xs text-muted-foreground">
            {analysis
              ? `AI tahlili tayyor · ${analysis.model} · ${new Date(analysis.analyzedAt).toLocaleString("uz-UZ")}`
              : "AI tahlili hali o'tkazilmagan — Chat bo'limiga o'ting"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveView("chat")}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all active:scale-95"
        >
          <Bot size={14} />
          <span>{analysis ? "Qayta tahlil qilish" : "AI Konsultant"}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>HS-Code (TIF TN)</span>
            {analysis && (
              <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                MacMap
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-extrabold text-foreground">
            {analysis ? analysis.hsCode : "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {analysis ? analysis.productDescription : "AI tahlili kutilmoqda"}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 shadow-xs ${
            analysis?.gspPlusApplicable
              ? "border-emerald-500/30 bg-emerald-500/5 ring-1 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span
              className={analysis?.gspPlusApplicable ? "text-emerald-600" : "text-muted-foreground"}
            >
              EI Boj Stavkasi
            </span>
            {analysis?.gspPlusApplicable && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-bold text-emerald-600">
                GSP+ Faol
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">
            {analysis ? `${analysis.uzbGspDuty}%` : "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {analysis ? `Standart: ${analysis.euMfnDuty}% MFN` : "Kutilmoqda"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Yetkazish Tannarxi</span>
            <span className="text-[10px] font-bold text-foreground">
              {logistics.route.split("→")[1]?.trim() || "Maqsad"}
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">
            ${logistics.costPerKg.toFixed(2)} / kg
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Jami: ${logistics.totalCost.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Tranzit muddati</span>
            <span className="text-[10px] font-bold text-foreground">
              {logistics.transportType === "auto" ? "Avto" : "Avia"}
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-foreground">
            {logistics.transitDays} kun
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{logistics.route}</p>
        </div>
      </div>

      {/* Logistics & Roadmap */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Logistics Calculator */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Truck size={16} className="text-blue-600" />
              <span>Logistika Hisobi</span>
            </h3>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {(["auto", "air"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLogisticsInput({ ...logisticsInput, transportType: t })}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    logisticsInput.transportType === t
                      ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xs"
                      : "text-muted-foreground"
                  }`}
                >
                  {t === "auto" ? "Avto" : "Avia"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-bold text-foreground">{logistics.route}</span>
                <p className="text-muted-foreground mt-0.5">
                  {logistics.transitDays} kun · {logisticsInput.weightKg.toLocaleString()} kg
                </p>
              </div>
              <span className="font-extrabold text-blue-600 text-sm">
                ${logistics.totalCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FileCheck2 size={16} className="text-blue-600" />
              <span>Eksport Yo&apos;l Xaritasi</span>
              {roadmapData && (
                <span className="rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-extrabold text-fuchsia-600">
                  AI
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {roadmap.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(roadmap.filter((r) => r.done).length / roadmap.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-blue-600">
                    {roadmap.filter((r) => r.done).length}/{roadmap.length}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleGenerateRoadmap}
                disabled={isRoadmapLoading}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-75"
                title="AI yordamida yo'l xaritasini qayta yaratish"
              >
                {isRoadmapLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                <span>
                  {isRoadmapLoading ? "Tayyorlanmoqda..." : roadmapData ? "Yangilash" : "AI tahlil"}
                </span>
              </button>
            </div>
          </div>

          {roadmapData ? (
            <div className="space-y-4">
              {/* Xulosa: jami muddat, narx, muvaffaqiyat */}
              {(roadmapData.jami_muddat_min != null ||
                roadmapData.jami_muddat_max != null ||
                roadmapData.jami_narx ||
                roadmapData.muvaffaqiyat_ehtimoli != null) && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {roadmapData.jami_muddat_min != null && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Clock size={11} /> Jami muddat
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-blue-600">
                        {formatMuddat(
                          roadmapData.jami_muddat_min,
                          roadmapData.jami_muddat_max ?? roadmapData.jami_muddat_min,
                        )}
                      </p>
                    </div>
                  )}
                  {roadmapData.jami_narx && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Jami taxminiy narx
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-blue-600">
                        {roadmapData.jami_narx}
                      </p>
                    </div>
                  )}
                  {roadmapData.muvaffaqiyat_ehtimoli != null && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Muvaffaqiyat ehtimoli
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`text-lg font-extrabold ${
                            roadmapData.muvaffaqiyat_ehtimoli >= 60
                              ? "text-emerald-600"
                              : roadmapData.muvaffaqiyat_ehtimoli >= 40
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {roadmapData.muvaffaqiyat_ehtimoli}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            roadmapData.muvaffaqiyat_ehtimoli >= 60
                              ? "bg-emerald-500"
                              : roadmapData.muvaffaqiyat_ehtimoli >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${roadmapData.muvaffaqiyat_ehtimoli}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {roadmapData.kritik_ogohlantirish && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    {roadmapData.kritik_ogohlantirish}
                  </p>
                </div>
              )}

              {roadmapData.muvaffaqiyat_izoh && (
                <p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-muted-foreground">
                  {roadmapData.muvaffaqiyat_izoh}
                </p>
              )}

              {/* Bosqichlar */}
              <ol className="relative space-y-4">
                {roadmapData.bosqichlar.map((stage, idx) => (
                  <li key={stage.id} className="relative pl-7">
                    {idx < roadmapData.bosqichlar.length - 1 && (
                      <span className="absolute left-[13px] top-7 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-blue-500/60 to-transparent" />
                    )}
                    <span className="absolute left-0 top-0 grid size-7 place-items-center rounded-full bg-blue-500/10 text-base">
                      {stage.icon ?? String(idx + 1)}
                    </span>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold">{stage.nomi}</p>
                        <div className="flex items-center gap-2">
                          {stage.status && (
                            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-extrabold text-blue-600">
                              {statusLabels[stage.status] ?? stage.status}
                            </span>
                          )}
                          {stage.muddat_min != null && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                              <Clock size={11} />
                              {formatMuddat(
                                stage.muddat_min,
                                stage.muddat_max,
                                stage.muddat_birlik,
                              )}
                            </span>
                          )}
                          {formatNarx(stage.narx_min, stage.narx_max, stage.narx_valyuta) && (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600">
                              {formatNarx(stage.narx_min, stage.narx_max, stage.narx_valyuta)}
                            </span>
                          )}
                        </div>
                      </div>
                      {stage.marshrut && (
                        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
                          <MapPin size={11} /> {stage.marshrut}
                        </p>
                      )}
                      {stage.amallar.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {stage.amallar.map((a, ai) => (
                            <li
                              key={ai}
                              className="flex items-start gap-1.5 text-xs text-muted-foreground"
                            >
                              <span className="mt-0.5 text-emerald-500">✓</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {stage.maslahat && (
                        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-blue-500/5 p-2 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                          <Lightbulb size={12} className="mt-0.5 shrink-0" />
                          <span>{stage.maslahat}</span>
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {roadmap.length > 0 ? (
                roadmap.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleRoadmap(item.id)}
                    className={`flex cursor-pointer items-center justify-between p-3 rounded-xl border transition-all ${
                      item.done
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.done ? (
                        <div className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                          <svg
                            className="size-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="size-4 rounded-full border-2 border-slate-300" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground">{item.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles size={20} className="mx-auto mb-2 text-fuchsia-500" />
                  AI tahlil tugmasi orqali bosqichma-bosqich yo&apos;l xaritasi (muddat, narx,
                  amallar va maslahatlar bilan) yaratib oling. Aks holda chat orqali tahlil
                  o&apos;tkazilgandan keyin ham xarita ko&apos;rsatiladi.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
