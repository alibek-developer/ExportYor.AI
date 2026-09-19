"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Download,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { ExportProject, CompanySettings } from "../types";

interface DocumentsViewProps {
  selectedProject: ExportProject | null;
  companySettings: CompanySettings;
  generateModule: (
    type: "market" | "documents" | "subsidies" | "roadmap",
    product: string,
    weight: number,
    dest: string,
  ) => Promise<boolean>;
}

function today(): string {
  return new Date().toLocaleDateString("uz-UZ", { year: "numeric", month: "2-digit", day: "2-digit" });
}
function randomNum(n: number): string {
  return String(Math.floor(Math.random() * (10 ** n - 10 ** (n - 1)) + 10 ** (n - 1)));
}
function currentYear(): string {
  return String(new Date().getFullYear());
}

async function generatePDF(
  type: "contract" | "invoice" | "packing",
  project: ExportProject | null,
  settings: CompanySettings,
  price: string,
  buyer: string,
  buyerAddress: string,
  packages: string,
  dimensions: string,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const seller = settings.name || "_______________";
  const stir = settings.inn || "_______________";
  const address = settings.address || "_______________";
  const phone = settings.phone || "_______________";
  const email = settings.email || "_______________";
  const product = project?.productName || "_______________";
  const kg = project?.productWeightKg ? `${project.productWeightKg} kg` : "___ kg";
  const hsCode = project?.analysisResult?.hsCode || "_______________";
  const destination = project?.destinationCountry || "_______________";
  const docDate = today();
  const year = currentYear();
  const r3 = randomNum(3);
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageW, 20, "F");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("ExportYor.AI", margin, 13);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("O`zbekiston Eksport Platformasi", margin, 18);

  let y = 32;

  if (type === "contract") {
    const contractNum = randomNum(4);
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.text(`EKSPORT SHARTNOMASI No${contractNum}`, pageW / 2, y, { align: "center" });
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(`Sana: ${docDate}`, pageW / 2, y, { align: "center" });
    y += 12;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, margin + contentW, y);
    y += 8;

    const section = (title: string) => {
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(37, 99, 235);
      doc.text(title, margin, y); y += 6; doc.setFont("helvetica", "normal"); doc.setTextColor(17, 24, 39);
    };
    const row = (label: string, value: string) => {
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(75, 85, 99);
      doc.text(label, margin + 4, y); doc.setFont("helvetica", "normal"); doc.setTextColor(17, 24, 39);
      doc.text(value, margin + 50, y); y += 6;
    };

    section("1. Tomonlar");
    row("Sotuvchi:", seller); row("STIR:", stir); row("Manzil:", address);
    row("Xaridor:", buyer || "_______________"); row("Manzil:", buyerAddress || "_______________");
    y += 4;
    section("2. Shartnoma Predmeti");
    row("Mahsulot:", product); row("HS-kod:", hsCode); row("Miqdor:", kg);
    row("Narx:", price ? `${price} USD/kg` : "___ USD/kg");
    const total = price && project?.productWeightKg ? `${(parseFloat(price) * project.productWeightKg).toLocaleString()} USD` : "___ USD";
    row("Jami summa:", total); y += 4;
    section("3. Yetkazib Berish Shartlari");
    row("Incoterms:", "FOB Toshkent"); row("Manzil:", destination); row("Muddat:", "30 ish kuni ichida"); y += 4;
    section("4. To`lov Shartlari");
    row("To`lov usuli:", "Bank o`tkazmasi"); row("Avans:", "30%"); row("Qoldig`i:", "Yuk jo`natilgandan keyin"); y += 4;
    section("5. Sifat Talablari");
    row("Standart:", "O`zDSt"); row("Qadoqlash:", "_______________"); y += 10;
    doc.setDrawColor(229, 231, 235); doc.line(margin, y, margin + contentW, y); y += 8;
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(17, 24, 39);
    doc.text("6. Imzolar", margin, y); y += 8; doc.setFont("helvetica", "normal");
    doc.text("Sotuvchi: _______________", margin, y); doc.text("Xaridor: _______________", pageW / 2 + 10, y);
    doc.save(`Eksport-Shartnoma-${contractNum}.pdf`);
  } else if (type === "invoice") {
    const invNum = `INV-${year}-${r3}`;
    doc.setFontSize(16); doc.setTextColor(17, 24, 39); doc.setFont("helvetica", "bold");
    doc.text("COMMERCIAL INVOICE", pageW / 2, y, { align: "center" }); y += 8;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
    doc.text(`Invoice No: ${invNum}     Sana: ${docDate}`, pageW / 2, y, { align: "center" }); y += 10;
    doc.setDrawColor(229, 231, 235); doc.line(margin, y, margin + contentW, y); y += 8;
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(37, 99, 235);
    doc.text("SOTUVCHI:", margin, y); doc.text("XARIDOR:", pageW / 2 + 5, y); y += 5;
    doc.setFont("helvetica", "normal"); doc.setTextColor(17, 24, 39);
    const sellerLines = [seller, address, phone, email];
    const buyerLines = [buyer || "_______________", buyerAddress || "_______________", "_______________", "_______________"];
    const startY = y;
    sellerLines.forEach((l, i) => { doc.text(l, margin, startY + i * 4.5); });
    buyerLines.forEach((l, i) => { doc.text(l, pageW / 2 + 5, startY + i * 4.5); });
    y = startY + sellerLines.length * 4.5 + 8;
    doc.setFillColor(243, 244, 246); doc.rect(margin, y - 4, contentW, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setTextColor(75, 85, 99); doc.setFontSize(8);
    doc.text("Mahsulot", margin + 2, y); doc.text("Miqdor", margin + 80, y);
    doc.text("Narx (USD)", margin + 110, y); doc.text("Jami (USD)", margin + 140, y); y += 8;
    doc.setFont("helvetica", "normal"); doc.setTextColor(17, 24, 39);
    const total2 = price && project?.productWeightKg ? `${(parseFloat(price) * project.productWeightKg).toLocaleString()}` : "___";
    doc.text(`${product} (HS: ${hsCode})`, margin + 2, y); doc.text(kg, margin + 80, y);
    doc.text(price || "___", margin + 110, y); doc.text(total2, margin + 140, y); y += 8;
    doc.setDrawColor(229, 231, 235); doc.line(margin, y, margin + contentW, y); y += 8;
    doc.setFont("helvetica", "bold"); doc.setTextColor(37, 99, 235);
    doc.text(`JAMI: ${total2} USD`, margin + contentW - 5, y, { align: "right" }); y += 12;
    doc.setFont("helvetica", "normal"); doc.setTextColor(17, 24, 39); doc.setFontSize(8);
    doc.text("To`lov usuli: Bank o`tkazmasi", margin, y); y += 5;
    doc.text("Bank: _______________", margin, y); y += 5;
    doc.text("IBAN: _______________", margin, y); y += 15;
    doc.setDrawColor(229, 231, 235); doc.line(margin, y, margin + contentW, y); y += 8;
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("Sotuvchi imzosi: _______________", margin, y);
    doc.text("Xaridor imzosi: _______________", pageW / 2 + 5, y);
    doc.save(`Invoice-${invNum}.pdf`);
  } else if (type === "packing") {
    const plNum = `PL-${year}-${r3}`;
    doc.setFontSize(16); doc.setTextColor(17, 24, 39); doc.setFont("helvetica", "bold");
    doc.text("PACKING LIST", pageW / 2, y, { align: "center" }); y += 8;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
    doc.text(`PL No: ${plNum}     Sana: ${docDate}`, pageW / 2, y, { align: "center" }); y += 10;
    doc.setDrawColor(229, 231, 235); doc.line(margin, y, margin + contentW, y); y += 8;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(17, 24, 39);
    doc.text(`Sotuvchi: ${seller}`, margin, y); y += 5;
    doc.text(`Xaridor: ${buyer || "_______________"}`, margin, y); y += 10;
    doc.setFillColor(243, 244, 246); doc.rect(margin, y - 4, contentW, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setTextColor(75, 85, 99); doc.setFontSize(8);
    doc.text("No", margin + 2, y); doc.text("Mahsulot", margin + 15, y);
    doc.text("Qadoqlar", margin + 80, y); doc.text("Og`irlik", margin + 110, y); doc.text("O`lcham", margin + 140, y); y += 8;
    doc.setFont("helvetica", "normal"); doc.setTextColor(17, 24, 39);
    doc.text("1", margin + 2, y); doc.text(`${product} (HS: ${hsCode})`, margin + 15, y);
    doc.text(packages || "___", margin + 80, y); doc.text(kg, margin + 110, y); doc.text(dimensions || "___x___", margin + 140, y); y += 10;
    doc.setDrawColor(229, 231, 235); doc.line(margin, y, margin + contentW, y); y += 8;
    const transportLabel = project?.transportType
      ? ({ auto: "Avtotransport", air: "Avia", rail: "Temir yo`l", sea: "Dengiz" } as Record<string, string>)[project.transportType]
      : "_______________";
    [`Brutto og\`irlik: ___ kg`, `Netto og\`irlik: ${kg}`, `Qadoqlar soni: ${packages || "___"}`, `Transport: ${transportLabel || "___"}`].forEach(l => { doc.text(l, margin, y); y += 5; });
    y += 10; doc.setDrawColor(229, 231, 235); doc.line(margin, y, margin + contentW, y); y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Sotuvchi imzosi: _______________", margin, y);
    doc.text("Xaridor imzosi: _______________", pageW / 2 + 5, y);
    doc.save(`PackingList-${plNum}.pdf`);
  }
}

export function DocumentsView({ selectedProject, companySettings }: DocumentsViewProps) {
  const [doneDocs, setDoneDocs] = useState<Record<string, boolean>>({});
  const [pricePerKg, setPricePerKg] = useState("");
  const [buyer, setBuyer] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [packages, setPackages] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const storageKey = `exportyor:doc-check:${selectedProject?.id ?? "none"}`;

  useEffect(() => {
    if (typeof window === "undefined" || !selectedProject) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDoneDocs(JSON.parse(raw));
    } catch {}
  }, [selectedProject?.id]);

  const toggleCheck = (key: string) => {
    setDoneDocs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const totalDocs = 8;
  const autoDone = 3;
  const manualDone = Object.values(doneDocs).filter(Boolean).length;
  const doneCount = autoDone + manualDone;
  const progressPct = Math.min(100, Math.round((doneCount / totalDocs) * 100));

  const handleDownload = async (type: "contract" | "invoice" | "packing") => {
    setPdfLoading(type);
    try { await generatePDF(type, selectedProject, companySettings, pricePerKg, buyer, buyerAddress, packages, dimensions); }
    catch (e) { console.error(e); }
    finally { setPdfLoading(null); }
  };

  const handleDownloadAll = async () => {
    setPdfLoading("all");
    try {
      await generatePDF("contract", selectedProject, companySettings, pricePerKg, buyer, buyerAddress, packages, dimensions);
      await generatePDF("invoice", selectedProject, companySettings, pricePerKg, buyer, buyerAddress, packages, dimensions);
      await generatePDF("packing", selectedProject, companySettings, pricePerKg, buyer, buyerAddress, packages, dimensions);
    } catch (e) { console.error(e); }
    finally { setPdfLoading(null); }
  };

  const product = selectedProject?.productName || "—";
  const kg = selectedProject?.productWeightKg ? `${selectedProject.productWeightKg} kg` : "—";
  const hsCode = selectedProject?.analysisResult?.hsCode || "—";
  const destination = selectedProject?.destinationCountry || "—";

  const externalDocs = [
    { key: "fito", icon: "🌿", name: "Fitosanitariya sertifikati", location: "O'simliklar karantini agentligi", duration: "1 kun", price: "200,000–400,000 so'm" },
    { key: "origin", icon: "📋", name: "Kelib chiqish sertifikati (EUR.1 yoki ST-1)", location: "Savdo-sanoat palatasi", duration: "2–3 kun", price: "150,000–350,000 so'm" },
    { key: "customs", icon: "🏛️", name: "Bojxona deklaratsiyasi (SAD/BYuD)", location: "Broker orqali yoki bojxona postida", duration: "1–2 kun", price: "300,000–600,000 so'm" },
  ];

  const optionalDocs = [
    { key: "globalgap", icon: "⭐", name: "Sifat sertifikati (GlobalGAP)", reason: "Yevropa supermarketlari uchun" },
    { key: "insurance", icon: "🛡️", name: "Sug'urta polisi (CMR/Marine)", reason: "Yuk davomida yo'qotishlardan himoya" },
  ];

  const autoReady = [
    { key: "contract", icon: "📄", name: "Eksport shartnomasi", desc: "Ikki tilda tuzilgan oldi-sotdi shartnomasi", type: "contract" as const },
    { key: "invoice", icon: "🧾", name: "Invoys (Hisob-faktura)", desc: "Xalqaro andoza commercial invoice", type: "invoice" as const },
    { key: "packing", icon: "📦", name: "Packing List", desc: "Mahsulot tarkibi va qadoqlash ro'yxati", type: "packing" as const },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-950">

      {/* Header + Progress */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Hujjatlar Markazi</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{destination}ga eksport uchun hujjatlar ro'yxati</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-blue-600">{doneCount}/{totalDocs}</span>
            <p className="text-xs text-muted-foreground">hujjat tayyor</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${progressPct === 100 ? "bg-emerald-500" : "bg-blue-600"}`} style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">{progressPct === 100 ? "Barcha tayyor! 🎉" : `${progressPct}%`}</span>
        </div>
      </div>

      {/* Loyiha info */}
      <div className="grid gap-2 sm:grid-cols-4">
        {[["Mahsulot", product], ["Miqdor", kg], ["HS-kod", hsCode], ["Bozor", destination]].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-sm font-extrabold truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* PDF form */}
      <div className="rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/10 p-5">
        <h3 className="text-sm font-extrabold text-blue-700 dark:text-blue-400 mb-3">📝 Hujjat uchun qo'shimcha ma'lumotlar</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Narx (USD/kg)", value: pricePerKg, setter: setPricePerKg, placeholder: "masalan: 2.5" },
            { label: "Xaridor nomi", value: buyer, setter: setBuyer, placeholder: "_______________" },
            { label: "Xaridor manzili", value: buyerAddress, setter: setBuyerAddress, placeholder: "_______________" },
            { label: "Qadoqlar soni", value: packages, setter: setPackages, placeholder: "masalan: 200" },
            { label: "O'lcham (uz x keng)", value: dimensions, setter: setDimensions, placeholder: "masalan: 60x40 sm" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-[11px] font-bold text-muted-foreground mb-1 block">{f.label}</label>
              <input type="text" value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder={f.placeholder} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* A) Biz tayyorlaymiz */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="size-2 rounded-full bg-emerald-500"></span>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Biz tayyorlab beramiz — Platformada avtomatik</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {autoReady.map((doc) => (
            <div key={doc.key} className="rounded-2xl border border-emerald-500/30 bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <div className="pl-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{doc.icon}</span>
                    <div>
                      <h4 className="text-sm font-extrabold leading-tight">{doc.name}</h4>
                      <p className="text-[10px] text-emerald-600 font-bold">Avtomatik tayyorlanadi</p>
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">{doc.desc}</p>
                <button type="button" onClick={() => handleDownload(doc.type)} disabled={pdfLoading !== null} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-60">
                  {pdfLoading === doc.type ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  ⬇️ Yuklab olish (PDF)
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={handleDownloadAll} disabled={pdfLoading !== null} className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-60">
          {pdfLoading === "all" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          📥 Barchasini yuklab olish (3 ta PDF)
        </button>
      </div>

      {/* B) Siz olishingiz kerak */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="size-2 rounded-full bg-blue-500"></span>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">Siz olishingiz kerak — Tashqi tashkilotlardan</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {externalDocs.map((doc) => (
            <div key={doc.key} className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden transition-all ${doneDocs[doc.key] ? "border-emerald-500/40 bg-emerald-50/30" : "border-blue-100 dark:border-slate-800"}`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${doneDocs[doc.key] ? "bg-emerald-500" : "bg-blue-500"}`}></div>
              <div className="pl-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{doc.icon}</span>
                    <h4 className={`text-[13px] font-extrabold leading-tight ${doneDocs[doc.key] ? "line-through opacity-60" : ""}`}>{doc.name}</h4>
                  </div>
                  <button type="button" onClick={() => toggleCheck(doc.key)} className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-all ${doneDocs[doc.key] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-blue-500"}`}>
                    <Check size={11} strokeWidth={3} />
                  </button>
                </div>
                <div className="space-y-1.5 text-[11px] mt-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground"><span>📍</span><span className="font-semibold">{doc.location}</span></div>
                  <div className="flex items-center gap-1.5 text-muted-foreground"><span>⏱️</span><span className="font-semibold">{doc.duration}</span></div>
                  <div className="flex items-center gap-1.5 text-muted-foreground"><span>💵</span><span className="font-semibold">{doc.price}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* C) Ixtiyoriy */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="size-2 rounded-full bg-slate-400"></span>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Ixtiyoriy — Tavsiya etiladi</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {optionalDocs.map((doc) => (
            <div key={doc.key} className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden transition-all ${doneDocs[doc.key] ? "border-emerald-500/40 bg-emerald-50/30" : "border-slate-200 dark:border-slate-800 border-dashed"}`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${doneDocs[doc.key] ? "bg-emerald-500" : "bg-slate-300"}`}></div>
              <div className="pl-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{doc.icon}</span>
                  <div>
                    <h4 className={`text-[13px] font-extrabold ${doneDocs[doc.key] ? "line-through opacity-60" : ""}`}>{doc.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{doc.reason}</p>
                  </div>
                </div>
                <button type="button" onClick={() => toggleCheck(doc.key)} className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-all ${doneDocs[doc.key] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-slate-500"}`}>
                  <Check size={11} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rekvizitlar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-3">Sizning Rekvizitlaringiz (Sozlamalardan olinadi)</h3>
        <div className="grid gap-2 sm:grid-cols-2 text-xs">
          {[["Korxona nomi", companySettings.name], ["STIR", companySettings.inn], ["Manzil", companySettings.address], ["Telefon", companySettings.phone], ["Email", companySettings.email || ""]].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-muted-foreground font-semibold">{label}</span>
              <span className="font-bold text-right truncate max-w-[160px]">{value || <span className="text-slate-400 italic">Kiritilmagan</span>}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 italic">* Sozlamalar sahifasida to'ldiring — hujjatlarda avtomatik ko'rinadi</p>
      </div>
    </div>
  );
}
