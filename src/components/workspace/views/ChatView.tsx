"use client";

import {
  Bot,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Sparkles,
  ArrowRight,
  Zap,
  Loader2,
  GripVertical,
} from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useState, useEffect, useRef } from "react";
import type { ChatMessage, ExportProject } from "../types";
import { PROMPT_CHIPS } from "../hooks/useExportData";

interface ChatViewProps {
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  isTyping: boolean;
  isPanelOpen: boolean;
  setIsPanelOpen: (value: boolean) => void;
  canvasTab: "customs" | "market" | "documents";
  setCanvasTab: (tab: "customs" | "market" | "documents") => void;
  handleSendMessage: (text?: string) => void;
  selectedProject: ExportProject | null;
  toggleRoadmap: (id: number) => void;
  handleSendOffer: (companyId: string) => void;
  sentOfferIds: Record<string, boolean>;
}

const Typewriter = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, index));
      index += 2; // tezroq yozish uchun 2 ta harfdan qo'shamiz
      if (index > text.length + 1) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span className="whitespace-pre-wrap">{displayed}</span>;
};

// JSON ma'lumotlarni chiroyli ko'rsatish uchun komponentlar
interface DocAutoItem {
  icon?: string;
  nomi: string;
}
interface DocExternalItem {
  icon?: string;
  nomi: string;
  qayerda?: string;
  muddat?: string;
  narx?: string;
}
interface DocOptionalItem {
  icon?: string;
  nomi: string;
  sabab?: string;
}
interface JsonCardsData {
  biz_tayyorlaymiz?: DocAutoItem[];
  siz_olasiz?: DocExternalItem[];
  ixtiyoriy?: DocOptionalItem[];
}
const JsonCards = ({ data }: { data: JsonCardsData }) => {
  if (!data) return null;

  return (
    <div className="mt-5 space-y-5 text-[13px] font-sans">
      {/* Biz tayyorlaymiz */}
      {data.biz_tayyorlaymiz && data.biz_tayyorlaymiz.length > 0 && (
        <div>
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500"></span>
            Biz tayyorlab beramiz
          </h4>
          <div className="grid gap-2">
            {data.biz_tayyorlaymiz.map((item: DocAutoItem, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-50 px-3 py-2.5 dark:bg-emerald-500/10 dark:border-emerald-500/30 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon || "📄"}</span>
                  <span className="font-bold text-foreground">{item.nomi}</span>
                </div>
                <a
                  href="/documents"
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Hoziroq yuklab oling
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Siz olishingiz kerak */}
      {data.siz_olasiz && data.siz_olasiz.length > 0 && (
        <div>
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 mb-2 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500"></span>
            Siz olishingiz kerak (Tashqi)
          </h4>
          <div className="grid gap-2">
            {data.siz_olasiz.map((item: DocExternalItem, i: number) => (
              <div
                key={i}
                className="rounded-xl border border-blue-100 bg-white px-3 py-2.5 dark:bg-slate-900/50 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{item.icon || "🏛️"}</span>
                  <span className="font-bold text-foreground">{item.nomi}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-7 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">📍 {item.qayerda}</span>
                  <span className="flex items-center gap-1">⏱️ {item.muddat}</span>
                  <span className="flex items-center gap-1">💵 {item.narx}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ixtiyoriy */}
      {data.ixtiyoriy && data.ixtiyoriy.length > 0 && (
        <div>
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-400"></span>
            Ixtiyoriy (Tavsiya etiladi)
          </h4>
          <div className="grid gap-2">
            {data.ixtiyoriy.map((item: DocOptionalItem, i: number) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 border-dashed bg-slate-50 px-3 py-2.5 dark:bg-slate-900/30 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon || "⭐"}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{item.nomi}</span>
                </div>
                <div className="pl-7 mt-0.5 text-[11px] text-slate-500">{item.sabab}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function ChatView({
  messages,
  chatInput,
  setChatInput,
  isTyping,
  isPanelOpen,
  setIsPanelOpen,
  canvasTab,
  setCanvasTab,
  handleSendMessage,
  selectedProject,
  toggleRoadmap,
  handleSendOffer,
  sentOfferIds,
}: ChatViewProps) {
  const analysis = selectedProject?.analysisResult;
  const roadmap = analysis?.roadmap ?? [];

  // Qaysi xabarlar allaqachon typewrite bo'lganini saqlash
  const [typedMap, setTypedMap] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dastlabki o'rnatishda hamma xabarlarni tayyor deb belgilash (refresh bo'lsa animation qayta ishlamasin)
  useEffect(() => {
    setTypedMap((prev) => {
      const newMap = { ...prev };
      let changed = false;
      messages.forEach((m) => {
        if (!newMap[m.id]) {
          newMap[m.id] = true;
          changed = true;
        }
      });
      return changed ? newMap : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xabar qo'shilganda scroll qildirish
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const chatColumn = (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-slate-950 font-sans">
      {/* HEADER */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">ExportYor AI</span>
        </div>

        {!isPanelOpen && (
          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-100 transition-all dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
          >
            <PanelRightOpen size={13} />
            <span>Tahlil Kanvasi</span>
          </button>
        )}
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.sender === "user";

          // Parse JSON block if exists
          let mainText = msg.text;
          let jsonData = null;

          if (!isUser) {
            const jsonMatch = mainText.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
              try {
                jsonData = JSON.parse(jsonMatch[1]);
                mainText = mainText.replace(jsonMatch[0], "").trim();
              } catch (e) {
                console.error("JSON parse error", e);
              }
            }
          }

          // Yangi AI xabari bo'lsa va hali typewrite tugamagan bo'lsa
          const isNewAiMessage = !isUser && !typedMap[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex gap-3 w-full max-w-3xl mx-auto ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : "bg-[#F8F9FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg"
                }`}
              >
                {isUser ? "AK" : "🤖"}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-3 text-[14px] leading-[1.6] shadow-sm rounded-2xl ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-[#F8F9FA] dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-800"
                  }`}
                >
                  {isNewAiMessage ? (
                    <Typewriter
                      text={mainText}
                      onComplete={() => setTypedMap((prev) => ({ ...prev, [msg.id]: true }))}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{mainText}</div>
                  )}

                  {/* Render JSON UI block */}
                  {!isNewAiMessage && jsonData && <JsonCards data={jsonData} />}
                </div>

                <div className="mt-1 text-[10px] text-slate-400 font-medium px-1">{msg.time}</div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 w-full max-w-3xl mx-auto flex-row">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F8F9FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg shadow-xs">
              🤖
            </div>
            <div className="px-4 py-3 bg-[#F8F9FA] dark:bg-slate-900 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-2 h-[46px]">
              <div className="flex gap-1">
                <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" />
                <span className="size-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK CHIPS - ONLY SHOW IF MESSAGES <= 1 */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 w-full max-w-3xl mx-auto flex flex-wrap gap-2">
          {PROMPT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 transition-all hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* INPUT AREA */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mx-auto max-w-3xl relative flex items-center"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Eksport bo'yicha savolingizni yozing..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-900 py-3.5 pl-4 pr-12 text-[14px] text-slate-800 dark:text-slate-100 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isTyping}
            className="absolute right-2 grid size-9 place-items-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );

  const canvasColumn = (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-foreground transition-colors"
            title="Kanvasni yopish"
          >
            <PanelRightClose size={16} />
          </button>
          <span className="text-xs font-bold text-foreground">
            Tahlil Kanvasi
            {analysis ? `: HS ${analysis.hsCode} — AI tahlili` : ""}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 p-1">
          <button
            type="button"
            onClick={() => setCanvasTab("customs")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              canvasTab === "customs"
                ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bojxona &amp; Logistika
          </button>
          <button
            type="button"
            onClick={() => setCanvasTab("market")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              canvasTab === "market"
                ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bozor Tahlili
          </button>
          <button
            type="button"
            onClick={() => setCanvasTab("documents")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              canvasTab === "documents"
                ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hujjatlar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {canvasTab === "customs" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-[11px] text-muted-foreground font-semibold">
                  TIF TN / HS-Code
                </span>
                <p className="text-xl font-extrabold text-foreground mt-1">
                  {analysis ? analysis.hsCode : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {analysis
                    ? analysis.productDescription
                    : "Hali tahlil qilinmagan — chatga mahsulot yozing"}
                </p>
              </div>
              <div
                className={`p-4 rounded-2xl border ${
                  analysis
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                }`}
              >
                <span className="text-[11px] text-emerald-600 font-semibold">
                  GSP+ Boji (O&apos;zbekiston → EI)
                </span>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">
                  {analysis ? `${analysis.uzbGspDuty}%` : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {analysis ? "MacMap 2024 bazasidan" : "Kutilmoqda"}
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-[11px] text-muted-foreground font-semibold">
                  EI Standart Boji (MFN)
                </span>
                <p className="text-xl font-extrabold text-blue-600 mt-1">
                  {analysis ? `${analysis.euMfnDuty}%` : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">Imtiyozsiz rejim</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
              <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                <Zap size={14} className="text-blue-600" />
                <span>Eksport Bosqichlari Cheklisti</span>
              </h4>
              <div className="space-y-2">
                {roadmap.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleRoadmap(item.id)}
                    className={`flex cursor-pointer items-center justify-between p-2.5 rounded-xl border transition-all hover:scale-102 hover:shadow-sm active:scale-98 ${
                      item.done
                        ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.done ? (
                        <div className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                          <svg
                            className="size-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="size-4 rounded-full border-2 border-slate-300" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground">{item.time}</span>
                  </div>
                ))}
                {roadmap.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    Tahlil tugallanmagan — roadmap mavjud emas
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {canvasTab === "market" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {analysis ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="p-3.5 rounded-2xl border border-blue-500/40 bg-blue-500/5">
                    <span className="text-2xl">🇵🇱</span>
                    <h4 className="text-sm font-bold mt-1">Polsha</h4>
                    <p className="text-xs font-extrabold text-blue-600 mt-2">Talab: 92/100</p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-2xl">🇩🇪</span>
                    <h4 className="text-sm font-bold mt-1">Germaniya</h4>
                    <p className="text-xs font-extrabold text-emerald-600 mt-2">Talab: 88/100</p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-2xl">🇨🇿</span>
                    <h4 className="text-sm font-bold mt-1">Chexiya</h4>
                    <p className="text-xs font-extrabold text-foreground mt-2">Talab: 84/100</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <h4 className="text-xs font-bold mb-3">
                    Tekshirilgan B2B Xaridor: PolFruit Sp. z o.o.
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Varshava, Polsha · Talab: 15-20 tonna
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSendOffer("polfruit_canvas")}
                    className="mt-3 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    {sentOfferIds["polfruit_canvas"]
                      ? "Taklif yuborildi ✓"
                      : "Tijorat taklifi yuborish"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-muted-foreground mb-4">
                  <Zap size={24} />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">Bozor ma&apos;lumotlari</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  AI tahlilidan keyin bozor ma&apos;lumotlari ko&apos;rsatiladi
                </p>
              </div>
            )}
          </div>
        )}

        {canvasTab === "documents" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {analysis ? (
              <>
                {analysis.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold">{doc.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{doc.description}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Taxminiy muddat: {doc.estimatedDays}
                      </p>
                    </div>
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                        doc.status === "ready"
                          ? "bg-emerald-100 text-emerald-700"
                          : doc.status === "in_progress"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {doc.status === "ready"
                        ? "Tayyor"
                        : doc.status === "in_progress"
                          ? "Jarayonda"
                          : "Talab qilinadi"}
                    </span>
                  </div>
                ))}
                <a
                  href="/documents"
                  className="block rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white text-center hover:bg-blue-700 transition-colors"
                >
                  Barcha hujjatlarni ko&apos;rish →
                </a>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-muted-foreground mb-4">
                  <Send size={24} />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">Hujjatlar</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  AI tahlilidan keyin hujjatlar generatsiya qilinadi
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (!isPanelOpen) {
    return (
      <div className="flex flex-1 overflow-hidden h-full">
        <div className="w-full mx-auto">{chatColumn}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <Group orientation="horizontal" className="h-full w-full">
        <Panel defaultSize={35} minSize={20} maxSize={80}>
          {chatColumn}
        </Panel>
        <Separator className="group relative flex w-1.5 items-center justify-center bg-slate-200 dark:bg-slate-800 transition-colors hover:bg-blue-400/60 focus-visible:bg-blue-500 cursor-col-resize">
          <GripVertical
            size={14}
            className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors"
          />
        </Separator>
        <Panel defaultSize={65} minSize={20} maxSize={80}>
          {canvasColumn}
        </Panel>
      </Group>
    </div>
  );
}
