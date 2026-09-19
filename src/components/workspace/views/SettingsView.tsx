"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  Check,
  Coins,
  Globe,
  Languages,
  Save,
  Sparkles,
  Weight,
} from "lucide-react";
import { toast } from "sonner";
import { CompanySettings } from "../types";

interface SettingsViewProps {
  companySettings: CompanySettings;
  setCompanySettings: (settings: CompanySettings) => void;
}

const LANGUAGES: { value: "uz" | "ru" | "en"; label: string }[] = [
  { value: "uz", label: "O'zbek" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

const CURRENCIES: { value: "USD" | "EUR" | "UZS" | "RUB"; label: string }[] = [
  { value: "USD", label: "USD — AQSH dollari" },
  { value: "EUR", label: "EUR — Yevro" },
  { value: "UZS", label: "UZS — so'm" },
  { value: "RUB", label: "RUB — rubl" },
];

const WEIGHT_UNITS: { value: "kg" | "t"; label: string }[] = [
  { value: "kg", label: "kg — kilogramm" },
  { value: "t", label: "t — tonna" },
];

export function SettingsView({ companySettings, setCompanySettings }: SettingsViewProps) {
  const [form, setForm] = useState<CompanySettings>({
    ...companySettings,
    aiLanguage: companySettings.aiLanguage ?? "uz",
    currency: companySettings.currency ?? "USD",
    weightUnit: companySettings.weightUnit ?? "kg",
    notifyEmail: companySettings.notifyEmail ?? false,
    notifyGspPlus: companySettings.notifyGspPlus ?? true,
    notifyWto: companySettings.notifyWto ?? true,
  });

  // localStorage yuklangach (hydration) kompaniya sozlamalari prop orqali
  // yangilansa — forma ham shunga moslansin
  useEffect(() => {
    setForm({
      ...companySettings,
      aiLanguage: companySettings.aiLanguage ?? "uz",
      currency: companySettings.currency ?? "USD",
      weightUnit: companySettings.weightUnit ?? "kg",
      notifyEmail: companySettings.notifyEmail ?? false,
      notifyGspPlus: companySettings.notifyGspPlus ?? true,
      notifyWto: companySettings.notifyWto ?? true,
    });
  }, [companySettings]);

  const update = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setCompanySettings(form);
    toast.success("Sozlamalar saqlandi ✓");
  };

  const switchClass = (on: boolean) =>
    `relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
      on ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
    }`;

  const knobClass = (on: boolean) =>
    `inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
      on ? "translate-x-[18px]" : "translate-x-[2px]"
    }`;

  const inputClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 font-semibold outline-none focus:border-blue-600";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "font-bold block mb-1";
  const cardClass =
    "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-xs";

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">
          Tizim Sozlamalari &amp; Hisob
        </h2>
        <p className="text-xs text-muted-foreground">
          Hisobingiz, korxona rekvizitlari va ilova sozlamalarini boshqaring
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* ============ LEFT COLUMN — Hisob + Korxona ============ */}
        <div className="space-y-6">
          {/* Hisob ma'lumotlari */}
          <div className={`${cardClass} space-y-4`}>
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="text-blue-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Hisob ma&apos;lumotlari
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-1.5 text-[11px] font-extrabold text-white">
                <Sparkles size={13} />
                Workspace Pro ✨
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                A&apos;zolik boshlangan: 2026-09-19
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  <Activity size={14} className="text-blue-600" />
                  Ishlatilgan AI tahlillar
                </span>
                <span className="font-extrabold text-foreground">
                  5 <span className="font-semibold text-muted-foreground">/ 50</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full w-[10%] rounded-full bg-gradient-to-r from-blue-600 to-fuchsia-600" />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Oyda 50 ta AI tahlil — 45 ta qoldi
              </p>
            </div>
          </div>

          {/* Korxona rekvizitlari */}
          <div className={`${cardClass} space-y-4`}>
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-blue-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Korxona rekvizitlari
              </h3>
            </div>

            <div>
              <label className={labelClass}>Eksportchi korxona nomi</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>STIR / INN</label>
                <input
                  type="text"
                  value={form.inn}
                  onChange={(e) => update("inn", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Aloqa telefoni</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Manzil</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input
                  type="text"
                  value={form.website ?? ""}
                  onChange={(e) => update("website", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ RIGHT COLUMN — Til + Valyuta + Bildirishnomalar ============ */}
        <div className="space-y-6">
          {/* Til sozlamalari */}
          <div className={`${cardClass} space-y-4`}>
            <div className="flex items-center gap-2">
              <Languages size={15} className="text-blue-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Til sozlamalari
              </h3>
            </div>

            <div>
              <label className={labelClass}>AI javob tili</label>
              <select
                value={form.aiLanguage ?? "uz"}
                onChange={(e) => update("aiLanguage", e.target.value as "uz" | "ru" | "en")}
                className={selectClass}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Valyuta va o'lchov */}
          <div className={`${cardClass} space-y-4`}>
            <div className="flex items-center gap-2">
              <Coins size={15} className="text-blue-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Valyuta va o&apos;lchov
              </h3>
            </div>

            <div>
              <label className={labelClass}>Valyuta</label>
              <select
                value={form.currency ?? "USD"}
                onChange={(e) => update("currency", e.target.value as CompanySettings["currency"])}
                className={selectClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Og&apos;irlik birligi</label>
              <select
                value={form.weightUnit ?? "kg"}
                onChange={(e) =>
                  update("weightUnit", e.target.value as CompanySettings["weightUnit"])
                }
                className={selectClass}
              >
                {WEIGHT_UNITS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bildirishnomalar */}
          <div className={`${cardClass} space-y-3`}>
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-blue-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Bildirishnomalar
              </h3>
            </div>

            {(
              [
                { key: "notifyEmail", label: "Email bildirishnomalar" },
                { key: "notifyGspPlus", label: "GSP+ yangiliklari" },
                { key: "notifyWto", label: "WTO yangiliklari" },
              ] as { key: keyof CompanySettings; label: string }[]
            ).map((n) => {
              const on = Boolean(form[n.key]);
              return (
                <div
                  key={n.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5"
                >
                  <label className="flex items-center gap-2 font-bold text-foreground">
                    <Globe size={13} className="text-muted-foreground" />
                    {n.label}
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => update(n.key, !on)}
                    className={switchClass(on)}
                  >
                    <span className={knobClass(on)} />
                  </button>
                </div>
              );
            })}

            <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Weight size={12} />
              Yangiliklar email manzilingizga yuboriladi
            </p>
          </div>

          {/* Saqlash */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-xs active:scale-[0.98]"
            >
              {form === companySettings ? <Check size={14} /> : <Save size={14} />}
              O&apos;zgarishlarni saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
