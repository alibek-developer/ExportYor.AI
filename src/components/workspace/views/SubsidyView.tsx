"use client";

import { useState } from "react";
import {
  AlertCircle,
  Building2,
  Link as LinkIcon,
  Loader2,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";
import { ExportProject } from "../types";

interface SubsidyViewProps {
  selectedProject: ExportProject | null;
  generateModule: (
    type: "market" | "documents" | "subsidies",
    product: string,
    weight: number,
    dest: string,
  ) => Promise<boolean>;
}

const RISK_STYLES = {
  past: { badge: "bg-emerald-500/10 text-emerald-600", bar: "bg-emerald-500" },
  "o'rta": { badge: "bg-yellow-500/10 text-yellow-600", bar: "bg-yellow-500" },
  yuqori: { badge: "bg-red-500/10 text-red-600", bar: "bg-red-500" },
} as const;

const DEFAULT_EMOJI: Record<string, string> = {
  past: "🟢",
  "o'rta": "🟡",
  yuqori: "🔴",
};

function riskStyle(daraja: string) {
  return RISK_STYLES[daraja as keyof typeof RISK_STYLES] ?? RISK_STYLES["o'rta"];
}

function riskEmoji(risk: { icon?: string; daraja_emoji?: string; daraja: string }): string {
  return risk.icon ?? risk.daraja_emoji ?? DEFAULT_EMOJI[risk.daraja] ?? "⚠️";
}

export function SubsidyView({ selectedProject, generateModule }: SubsidyViewProps) {
  const analysis = selectedProject?.analysisResult;
  const subRiskData = analysis?.subsidiesRisksData;
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    await generateModule(
      "subsidies",
      selectedProject.productName,
      selectedProject.productWeightKg,
      selectedProject.destinationCountry,
    );
    setIsLoading(false);
  };

  if (!selectedProject) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-slate-500/10 mb-4">
            <ShieldCheck size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-extrabold">Loyiha tanlanmagan</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Chap tomondagi menyudan loyiha tanlang yoki yangi loyiha yarating.
          </p>
        </div>
      </div>
    );
  }

  if (!subRiskData) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-blue-500/10 mb-4">
            <ShieldCheck size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-extrabold">Subsidiyalar & Risklar</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            AI orqali ushbu loyiha uchun olinishi mumkin bo&apos;lgan davlat subsidiyalari va
            kutilayotgan risklar tahlil qilinadi
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            <span>Risk va subsidiyalarni hisoblash</span>
          </button>
        </div>
      </div>
    );
  }

  const overallStyle = riskStyle(subRiskData.umumiy_xavf_darajasi);
  const overallBall =
    typeof subRiskData.umumiy_xavf_ball === "number" ? subRiskData.umumiy_xavf_ball : null;
  const mosSubsidies = subRiskData.subsidiyalar.filter((s) => s.ushbu_loyihaga_mos).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">
            Subsidiyalar & Risklar
          </h2>
          <p className="text-xs text-muted-foreground">
            {selectedProject.destinationCountry}ga eksport uchun davlat subsidiyalari va risklar
            tahlili
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-foreground shadow-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          <span>Qayta hisoblash</span>
        </button>
      </div>

      {/* Xulosa paneli: umumiy xavf + potentsial tejam */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Umumiy xavf darajasi
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {subRiskData.umumiy_xavf_emoji ?? DEFAULT_EMOJI[subRiskData.umumiy_xavf_darajasi]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold capitalize">
                {subRiskData.umumiy_xavf_darajasi}
                {overallBall !== null && (
                  <span className="ml-2 text-xs font-bold text-muted-foreground">
                    ball: {overallBall}/10
                  </span>
                )}
              </p>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${overallStyle.bar}`}
                  style={{
                    width: `${overallBall !== null ? Math.min(100, overallBall * 10) : 50}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {subRiskData.potentsial_tejam && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
              <PiggyBank size={14} /> Potentsial tejam
            </p>
            <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {subRiskData.potentsial_tejam}
            </p>
            {subRiskData.potentsial_tejam_izoh && (
              <p className="mt-1 text-xs text-emerald-700/70 dark:text-emerald-400/70">
                {subRiskData.potentsial_tejam_izoh}
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-base font-extrabold mb-4 flex items-center justify-between gap-2">
          <span>Davlat Subsidiyalari va Imtiyozlari</span>
          {mosSubsidies > 0 && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 rounded-full px-2.5 py-1">
              {mosSubsidies} ta ushbu loyihaga mos
            </span>
          )}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {subRiskData.subsidiyalar.map((subsidy, idx) => (
            <div
              key={subsidy.id ?? idx}
              className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between ${
                subsidy.ushbu_loyihaga_mos
                  ? "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-lg"
                    aria-hidden
                  >
                    {subsidy.icon ?? "💰"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                        {subsidy.nomi}
                      </h4>
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {subsidy.miqdor}
                      </span>
                    </div>
                    {subsidy.max_summa && (
                      <p className="text-[11px] font-bold text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">
                        Maksimal: {subsidy.max_summa}
                      </p>
                    )}
                    {subsidy.asosi && (
                      <p className="text-[11px] text-emerald-700/60 dark:text-emerald-400/60 mt-0.5 italic">
                        {subsidy.asosi}
                      </p>
                    )}
                  </div>
                </div>
                <p
                  className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mb-1 h-8 overflow-hidden line-clamp-2"
                  title={subsidy.shart}
                >
                  <span className="font-bold">Shart:</span> {subsidy.shart}
                </p>
                {typeof subsidy.ushbu_loyihaga_mos === "boolean" && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      subsidy.ushbu_loyihaga_mos
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-slate-500/10 text-muted-foreground"
                    }`}
                  >
                    {subsidy.ushbu_loyihaga_mos
                      ? "✓ Ushbu loyihaga mos"
                      : "✗ Ushbu loyihaga mos emas"}
                  </span>
                )}
              </div>

              <div className="mt-2 pt-3 border-t border-emerald-500/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700/70 dark:text-emerald-400/70">
                    <Building2 size={14} /> Murojaat joyi:
                  </span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 text-right truncate max-w-[140px]">
                    {subsidy.qayerga_murojaat}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700/70 dark:text-emerald-400/70">
                    <LinkIcon size={14} /> Havola:
                  </span>
                  <a
                    href={
                      subsidy.havola.startsWith("http")
                        ? subsidy.havola
                        : `https://${subsidy.havola}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline truncate max-w-[140px]"
                  >
                    {subsidy.havola}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-extrabold mb-4 flex items-center gap-2">
          Eksport Risklar Tahlili
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {subRiskData.risklar.map((risk, idx) => {
            const style = riskStyle(risk.daraja);
            return (
              <div
                key={risk.id ?? idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg" aria-hidden>
                      {riskEmoji(risk)}
                    </span>
                    <h4 className="text-sm font-bold truncate">{risk.nomi}</h4>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold capitalize whitespace-nowrap ${style.badge}`}
                  >
                    {risk.daraja} risk
                  </span>
                </div>

                {typeof risk.daraja_ball === "number" && (
                  <div className="mb-3">
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${style.bar}`}
                        style={{
                          width: `${Math.min(100, Math.max(0, risk.daraja_ball * 10))}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] font-bold text-muted-foreground">
                      Daraja balli: {risk.daraja_ball}/10
                    </p>
                  </div>
                )}

                {risk.izoh && (
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{risk.izoh}</p>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Oldini olish:
                  </p>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {risk.oldini_olish ?? risk.tavsiya}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {subRiskData.eng_muhim_tavsiya && (
          <div className="mt-4 flex gap-3 items-start bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50">
            <AlertCircle size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                Eng Muhim Tavsiya
              </p>
              <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-200">
                {subRiskData.eng_muhim_tavsiya}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
