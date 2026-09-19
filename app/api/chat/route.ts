import { NextResponse } from "next/server";
import { cacheGet, cacheSet, rateLimitOk } from "@/lib/ai/cache";
import { findCandidates, getTariff, tariffInfoBlock } from "@/lib/ai/tariffs";

export const runtime = "nodejs";

const API_BASE = process.env.UNOROUTER_BASE_URL ?? "https://api.unorouter.com/v1";
const API_KEY = process.env.UNOROUTER_API_KEY ?? "";

// Unorouter'da haqiqatan mavjud bo'lgan :free modellar
const FALLBACK_MODELS = [
  "glm-5.3-flash:free",
  "deepseek-v4-flash:free",
  "deepseek-v4-flash-0731:free",
  "qwen3.5-flash:free",
  "gemma-4-26b:free",
  "gemma-4-31b-it:free",
  "mistral-small-3.2:free",
  "glm-5.2:free",
  "glm-5.3:free",
  "step-3.7-flash:free",
  "qwen3.6-35b-a3b:free",
  "llama-4-maverick-17b-128e-instruct:free",
  "gpt-4o-mini:free",
  "gemini-3.5-flash-lite:free",
];
const MODEL = FALLBACK_MODELS[0]; // default (for body template)

// Token tejash: max javob uzunligi + past harorat
const MAX_OUTPUT_TOKENS = 900;
const TEMPERATURE = 0.4;

function systemPrompt(candidatesBlock: string, message: string, language: string): string {
  return `Siz ExportYor.AI — O'zbekiston eksport yordamchisisiz.
Foydalanuvchi bilan doim O'zbek tilida gaplashing.
Hech qachon ** bold ** yoki markdown ishlatma (faqatgina JSON yozish uchun \`\`\`json ishlatsangiz bo'ladi).
Javoblarni doim shu formatda ber:

[Qisqa xulosa — 1 jumla]

[Raqamlangan qadamlar — har biri alohida qatorda]
1️⃣ Qadam nomi
   📍 Qayerga: aniq joy
   ⏱️ Muddat: X kun
   💵 Narx: X so'm

[Oxirida]
💰 Jami: ... | ⏱️ Jami muddat: ...

Shundan so'ng, quyidagi JSON formatda qo'shimcha ma'lumotlarni qaytaring (Alohida \`\`\`json bloki ichida bo'lsin). O'zingizdan ham logistika/bojxona uchun idea qo'shishingiz mumkin:

\`\`\`json
{
  "biz_tayyorlaymiz": [
    {
      "nomi": "Eksport shartnomasi",
      "icon": "📄",
      "status": "tayyor",
      "havola": "/documents"
    },
    {
      "nomi": "Invoys (hisob-faktura)",
      "icon": "🧾",
      "status": "tayyor",
      "havola": "/documents"
    }
  ],
  "siz_olasiz": [
    {
      "nomi": "Fitosanitariya sertifikati",
      "icon": "🌿",
      "qayerda": "Karantin agentligi",
      "muddat": "1 kun",
      "narx": "200,000-400,000 so'm",
      "majburiy": true
    }
  ],
  "ixtiyoriy": [
    {
      "nomi": "GlobalGAP sertifikati",
      "icon": "⭐",
      "qayerda": "Akkreditatsiya markazi",
      "muddat": "30 kun",
      "narx": "500,000+ so'm",
      "sabab": "EU supermarketlari talab qiladi"
    }
  ]
}
\`\`\`

Agar savol salomlashish bo'lsa, qisqacha javob bering va JSON/Qadamlar kerak emas.

MAHSULOT KANDIDATLARI (HS kodi uchun):
${candidatesBlock || "Mos kandidat yo'q"}

FOYDALANUVCHI XABARI: ${message}`;
}

async function callAI(
  message: string,
  candidatesBlock: string,
  language: string,
): Promise<{ content: string; model: string }> {
  if (!API_KEY) throw new Error("AI kalit sozlanmagan (.env: UNOROUTER_API_KEY)");

  const userContent =
    language === "ru"
      ? `${message}\n\n[ИНСТРУКЦИЯ: Весь твой ответ напиши ТОЛЬКО на русском языке. Не используй узбекский.]`
      : language === "en"
        ? `${message}\n\n[INSTRUCTION: Write your entire answer ONLY in English.]`
        : message;

  const body = JSON.stringify({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt(candidatesBlock, message, language) },
      { role: "user", content: userContent },
    ],
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: TEMPERATURE,
  });

  for (const model of [MODEL, ...FALLBACK_MODELS]) {
    try {
      const res = await fetch(`${API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: body.replace(`"model":"${MODEL}"`, `"model":"${model}"`),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) {
        console.error(`AI ${model}: HTTP ${res.status}`);
        continue;
      }
      const json = await res.json();
      const content: string | undefined = json?.choices?.[0]?.message?.content;
      if (content) return { content, model };
    } catch (err) {
      console.error(`AI ${model} xato:`, err);
    }
  }
  throw new Error("Barcha AI modellar javob bermadi");
}

export async function POST(request: Request) {
  try {
    const { message, language } = (await request.json()) as {
      message?: string;
      language?: string;
    };
    if (!message?.trim()) {
      return NextResponse.json({ error: "Xabar bo'sh" }, { status: 400 });
    }
    const lang: string = ["uz", "ru", "en"].includes(language ?? "") ? (language as string) : "uz";

    // Token tejash: keshda bo'lsa API'ga borilmaydi
    const cacheKey = lang === "uz" ? message : `${lang}:${message}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      const cachedTariff = cached.hs6 ? (getTariff(cached.hs6) ?? null) : null;
      return NextResponse.json({
        answer: cached.answer,
        hs6: cached.hs6,
        tariff: cachedTariff,
        hasAnalysis: Boolean(cachedTariff || cached.hs6),
        cached: true,
      });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    if (!rateLimitOk(ip)) {
      return NextResponse.json(
        { error: "Kunlik so'rov limiti tugadi (50). Ertaga davom eting." },
        { status: 429 },
      );
    }

    // Lokal kandidatlar (0 token)
    const candidates = findCandidates(message);
    const block = tariffInfoBlock(candidates);

    const { content, model } = await callAI(message, block, lang);

    // Tahlil bor-yo'qligi: lokal kandidat topilgan bo'lsa yoki javobda HS kod chiqsa
    const hs6Match = content.match(/HS[:\s]*([0-9]{4}[.,][0-9]{2}|[0-9]{6})/i);
    const hs6 = hs6Match?.[1]?.replace(/[.,]/g, "");
    const tariff =
      (candidates.length > 0 ? candidates[0] : hs6 ? getTariff(hs6) : undefined) ?? null;
    const hasAnalysis = Boolean(tariff || hs6);

    cacheSet(cacheKey, content, hs6);

    return NextResponse.json({
      answer: content,
      hs6,
      tariff,
      hasAnalysis,
      model,
      cached: false,
      debugCandidates: candidates.map((c) => c.hs6),
    });
  } catch (err) {
    console.error("Chat API xato:", err);
    return NextResponse.json(
      { error: "AI tizimida xatolik. Keyinroq urinib ko'ring." },
      { status: 500 },
    );
  }
}
