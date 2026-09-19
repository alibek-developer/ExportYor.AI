import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE = process.env.UNOROUTER_BASE_URL ?? "https://api.unorouter.com/v1";
const API_KEY = process.env.UNOROUTER_API_KEY ?? "";

// Unorouter'da haqiqatan mavjud bo'lgan :free modellar (API /models dan tekshirilgan)
const FALLBACK_MODELS = [
  "glm-5.3-flash:free", // tez, ishonchli
  "deepseek-v4-flash:free", // sifatli
  "deepseek-v4-flash-0731:free",
  "qwen3.5-flash:free", // tez
  "gemma-4-26b:free", // Google
  "gemma-4-31b-it:free",
  "mistral-small-3.2:free", // Mistral
  "glm-5.2:free",
  "glm-5.3:free", // oxirgi fallback
  "step-3.7-flash:free",
  "qwen3.6-35b-a3b:free",
  "llama-4-maverick-17b-128e-instruct:free",
  "gpt-4o-mini:free", // agar ochilsa
  "gemini-3.5-flash-lite:free", // agar ochilsa
];

interface ModuleContext {
  hsCode?: string | null;
  euMfnDuty?: number | null;
  uzGspDuty?: number | null;
  transport?: string | null;
  logisticsCost?: string | null;
  costs?: string | null;
  route?: string | null;
  temperature?: string | null;
}

/**
 * Lokal tarif bazasidan aniqlangan kontekst — promptga qo'shiladi.
 * Bu AI subsidiyalar (GSP+), hujjatlar (kelib chiqish sertifikati) bo'yicha
 * aniqroq javob berishini ta'minlaydi, qo'shimcha token sarflamaydi.
 */
function buildContextBlock(context?: ModuleContext): string {
  if (!context?.hsCode) return "";
  const lines = [
    "",
    "Loyiha konteksti (lokal tarif bazasidan aniqlangan):",
    `- HS kod: ${context.hsCode}`,
  ];
  if (typeof context.euMfnDuty === "number") {
    lines.push(`- EI standart boji: ${context.euMfnDuty}%`);
  }
  if (typeof context.uzGspDuty === "number") {
    lines.push(`- O'zbekiston GSP+ imtiyozli boji: ${context.uzGspDuty}%`);
  }
  if (context?.transport) {
    lines.push(`- Transport turi: ${context.transport}`);
  }
  if (context?.logisticsCost) {
    lines.push(`- Logistika narxi: ${context.logisticsCost}`);
  }
  if (context?.costs) {
    lines.push(`- Transport turlari taqqosi: ${context.costs}`);
  }
  if (context?.route) {
    lines.push(`- Yo'nalish: ${context.route}`);
  }
  if (context?.temperature) {
    lines.push(`- Harorat rejimi: ${context.temperature}`);
  }
  return "\n" + lines.join("\n");
}

const getSystemPrompt = (
  moduleType: string,
  product: string,
  weight?: number,
  destination?: string,
  contextBlock?: string,
) => {
  if (moduleType === "market") {
    return `Siz ExportYor.AI platformasining Bozor Tahlili modulisiz.
O'zbekiston eksportchilarga yordam berasiz.

Foydalanuvchi loyiha ma'lumotlarini beradi:
- Mahsulot: ${product}
- Miqdor: ${weight} kg
- Bozor: ${destination}${contextBlock}

Siz FAQAT quyidagi JSON formatda javob berasiz, boshqa hech narsa yozmaysiz:

{
  "status": "mos",
  "status_emoji": "🟢",
  "xulosa": "2-3 jumlada asosiy baho",
  "afzalliklar": ["...", "...", "..."],
  "kamchiliklar": ["...", "..."],
  "gsplus": true,
  "gsplus_izoh": "GSP+ bo'yicha qisqa izoh",
  "raqobat_darajasi": "o'rta",
  "tavsiya_bozor": null,
  "tavsiya_bozor_sabab": ""
}

status qiymati faqat: "mos", "ortacha", "mos_emas"
raqobat_darajasi faqat: "past", "o'rta", "yuqori"`;
  }

  if (moduleType === "documents") {
    return `Siz ExportYor.AI platformasining Hujjatlar Markazi modulisiz.
O'zbekiston SME eksportchilariga ANIQ va TO'G'RI ma'lumot berasiz.

Joriy loyiha:
- Mahsulot: ${product}
- Miqdor: ${weight} kg
- Bozor: ${destination}${contextBlock}

MUHIM QOIDALAR:
1. Meva-sabzavot uchun MAJBURIY: fitosanitariya sertifikati (karantin agentligi)
2. EU bozori uchun QO'SHIMCHA: EUR.1 yoki REX deklaratsiyasi (GSP+ uchun)
3. Turkiya uchun: ST-1 emas, oddiy kelib chiqish sertifikati
4. Rossiya/MDH uchun: ST-1 sertifikati (Savdo-sanoat palatasi)
5. Xitoy uchun: fitosanitariya + maxsus Xitoy talablari
6. To'qimachilik uchun: sifat sertifikati + kompozitsiya sertifikati
7. Narxlar O'ZBEKISTON bozorida HOZIRGI narxlar:
   - Eksport shartnomasi: 0-50,000 so'm
   - Kelib chiqish sertifikati: 150,000-350,000 so'm
   - Fitosanitariya: 200,000-400,000 so'm
   - Bojxona deklaratsiyasi (broker): 300,000-600,000 so'm
   - Sifat sertifikati: 100,000-300,000 so'm

Siz FAQAT quyidagi JSON formatda javob berasiz. Hech qanday matn, izoh, markdown YOZMAYSIZ:

{
  "hujjatlar": [
    {
      "id": 1,
      "nomi": "Eksport shartnomasi",
      "majburiy": true,
      "qayerdan": "O'zingiz yoki yurist orqali",
      "muddat_kun": "1-2",
      "narx_min": 0,
      "narx_max": 50000,
      "narx_valyuta": "so'm",
      "izoh": "Xaridor bilan imzolangan asosiy bitim",
      "icon": "📄",
      "ketma_ket": 1,
      "platformada_tayyorlanadi": true
    },
    {
      "id": 2,
      "nomi": "Invoys (hisob-faktura)",
      "majburiy": true,
      "qayerdan": "O'zingiz tayyorlaysiz",
      "muddat_kun": "1",
      "narx_min": 0,
      "narx_max": 0,
      "narx_valyuta": "so'm",
      "izoh": "Mahsulot narxi, miqdori va umumiy qiymati",
      "icon": "🧾",
      "ketma_ket": 2,
      "platformada_tayyorlanadi": true
    }
  ],
  "jami_narx_min": 750000,
  "jami_narx_max": 1500000,
  "jami_muddat_min": 7,
  "jami_muddat_max": 14,
  "parallel_mumkin": true,
  "parallel_izoh": "Sertifikatlarni bir vaqtda olib vaqt tejash mumkin",
  "muhim_eslatma": "Eng muhim eslatma",
  "birinchi_qadam": "Eng avval nima qilish kerak"
}

Qoidalar:
- mahsulot va davlatga qarab 5-8 ta hujjat bering
- narx_min va narx_max - so'mda raqam, narx_valyuta: "so'm" yoki "$" (xorijiy to'lovlar uchun)
- muddat_kun - raqam yoki "1-2" ko'rinishida kunlarda
- ketma_ket - 1 dan boshlanadigan qaysi qadamda olinishi tartib raqami
- Eksport shartnomasi va Commercial Invoice uchun platformada_tayyorlanadi: true — ularni platforma avtomatik tayyorlaydi
- Mahsulot agro bo'lmasa fitosanitar sertifikat bermang
- jami_narx_* va jami_muddat_* - hujjatlar bo'yicha umumiy hisob-kitob
- Faqat JSON, boshqa hech narsa`;
  }

  if (moduleType === "subsidies") {
    return `Siz ExportYor.AI platformasining Subsidiyalar va Risklar modulisiz.
O'zbekiston SME eksportchilariga ANIQ va TO'G'RI ma'lumot berasiz.

Joriy loyiha:
- Mahsulot: ${product}
- Miqdor: ${weight} kg
- Bozor: ${destination}${contextBlock}

MUHIM QOIDALAR:
1. GSP+ FAQAT EU 27 ta a'zo davlat uchun (Germaniya, Fransiya, Italiya, Polsha, Ispaniya va h.k.)
2. Turkiya uchun: D-8 shartnomasi, ECO bitimi, O'zbekiston-Turkiya ikki tomonlama shartnomasi (2022)
3. Rossiya/MDH uchun: SNG erkin savdo zonasi, EAES imtiyozlari
4. Xitoy uchun: O'zbekiston-Xitoy savdo shartnomasi
5. BAA (Dubai) uchun: boj 0%, free zone imtiyozlari
6. Faqat O'zbekistonda HAQIQATAN mavjud subsidiyalar:
   - Transport kompensatsiyasi (Eksport-Import bank, exim.uz)
   - Ishlab chiqaruvchilarga subsidiya (sanoat.uz)
   - GSP+ (faqat EU uchun)
   - Soliq imtiyozlari (eksportchilarga QQS qaytarish)

Siz FAQAT quyidagi JSON formatda javob berasiz. Hech qanday matn, izoh, markdown YOZMAYSIZ:

{
  "subsidiyalar": [
    {
      "id": 1,
      "nomi": "Subsidiya nomi",
      "miqdor": "50% gacha",
      "max_summa": "$5,000",
      "shart": "Aniq shart",
      "qayerga_murojaat": "Tashkilot nomi",
      "havola": "website.uz",
      "icon": "🚛",
      "ushbu_loyihaga_mos": true,
      "asosi": "Qonun yoki shartnoma nomi"
    }
  ],
  "risklar": [
    {
      "id": 1,
      "nomi": "Risk nomi",
      "daraja": "yuqori",
      "daraja_ball": 8,
      "izoh": "Aniq sabab",
      "oldini_olish": "Aniq tavsiya",
      "icon": "⚠️"
    }
  ],
  "umumiy_xavf_darajasi": "o'rta",
  "umumiy_xavf_ball": 6,
  "umumiy_xavf_emoji": "🟡",
  "eng_muhim_tavsiya": "Eng asosiy bitta tavsiya",
  "potentsial_tejam": "$2,800",
  "potentsial_tejam_izoh": "Qaysi imtiyozlar orqali"
}

Qoidalar:
- daraja_ball: 1-10 orasida (10 = eng yuqori xavf)
- ushbu_loyihaga_mos: bu loyiha uchun qo'llasa bo'ladimi
- Namdadagi qiymatlar ($2,800 va h.k.) faqat shakl ko'rsatish uchun — ularni nusxalamang, ushbu loyiha hajmi va bozoriga mos qiymatlarni hisoblab yozing
- Faqat JSON, boshqa hech narsa`;
  }

  if (moduleType === "invoice") {
    return `Siz ExportYor.AI platformasining Hujjatlar Markazi — Commercial Invoice yaratuvchi modulisiz.
O'zbekistonlik eksportchining loyihasi asosida xalqaro COMMERCIAL INVOICE uchun ma'lumot tayyorlaysiz.

Joriy loyiha:
- Mahsulot: ${product}
- Miqdor: ${weight} kg
- Bozor: ${destination}${contextBlock}

Siz FAQAT quyidagi JSON formatda javob berasiz. Hech qanday matn, markdown YOZMAYSIZ:

{
  "productName": "Mahsulotning xalqaro (EN/UZ) nomi",
  "productDescription": "Nav/toifa, sifat, qadoqlash va saqlash sharti tavsifi",
  "packageType": "masalan: 500 quti (10 kg dan yog'och qutilarda)",
  "unitPriceUsd": 1.85,
  "hsCode": "0804.10.00",
  "incoterms": "masalan: DAP Varshava (Incoterms 2020)",
  "paymentTerms": "masalan: 30% oldindan avans, 70% yuk xati taqdim etilganda",
  "transportType": "masalan: TIR Avtotransport, sovutgichli +2..+4 C"
}

Qoidalar:
- unitPriceUsd: mahsulot turiga qarab real jahon bahosi (USD/kg), 2 xonali kasr
- hsCode: berilgan bo'lsa uni saqlang, aks holda to'g'ri 10 xonali TIF TN/TN VED kodi
- Tarmoq, O'zbekiston amaliyoti va mamlakat iqlimiga mos real shartlar yozing
- Faqat JSON, boshqa hech narsa`;
  }

  if (moduleType === "roadmap") {
    return `Siz ExportYor.AI platformasining Eksport Yo'l Xaritasi modulisiz.
O'zbekiston SME eksportchilariga aniq yo'l xaritasi berasiz.

Joriy loyiha:
- Mahsulot: ${product}
- Miqdor: ${weight} kg
- Bozor: ${destination}${contextBlock}

Siz FAQAT quyidagi JSON formatda javob berasiz. Hech qanday matn, izoh, markdown YOZMAYSIZ:

{
  "jami_muddat_min": 19,
  "jami_muddat_max": 30,
  "jami_narx": "$2,100",
  "bosqichlar": [
    {
      "id": 1,
      "nomi": "Hujjatlarni tayyorlash",
      "icon": "📋",
      "muddat_min": 7,
      "muddat_max": 14,
      "muddat_birlik": "kun",
      "narx_min": 750000,
      "narx_max": 1500000,
      "narx_valyuta": "so'm",
      "amallar": [
        "Eksport shartnomasi imzolash",
        "Fitosanitariya sertifikati olish",
        "Kelib chiqish sertifikati (EUR.1)"
      ],
      "maslahat": "Barcha sertifikatlarni parallel oling — vaqt tejaysiz",
      "status": "birinchi"
    },
    {
      "id": 2,
      "nomi": "Bojxona rasmiylashtiruvi",
      "icon": "🏛️",
      "muddat_min": 1,
      "muddat_max": 3,
      "muddat_birlik": "kun",
      "narx_min": 300000,
      "narx_max": 600000,
      "narx_valyuta": "so'm",
      "amallar": [
        "GTD deklaratsiya topshirish",
        "Bojxona tekshiruvi",
        "Ruxsatnoma olish"
      ],
      "maslahat": "Broker yollash vaqt tejaydi — 300-600k so'm",
      "status": "ikkinchi"
    },
    {
      "id": 3,
      "nomi": "Yuk jo'natish",
      "icon": "🚛",
      "muddat_min": 9,
      "muddat_max": 11,
      "muddat_birlik": "kun",
      "narx_min": 2100,
      "narx_max": 2100,
      "narx_valyuta": "USD",
      "amallar": [
        "Yukni transport vositasiga yuklash",
        "Tranzit hujjatlar (CMR)",
        "Sug'urta rasmiylashtiruv"
      ],
      "marshrut": "Toshkent → Aktau → Baku → Varshava",
      "maslahat": "Sug'urta majburiy — tez buziladigan mahsulot",
      "status": "uchinchi"
    },
    {
      "id": 4,
      "nomi": "Bozorga yetkazish",
      "icon": "🏪",
      "muddat_min": 1,
      "muddat_max": 2,
      "muddat_birlik": "kun",
      "narx_min": 0,
      "narx_max": 0,
      "narx_valyuta": "USD",
      "amallar": [
        "Import bojxonasidan o'tish",
        "Xaridorga topshirish",
        "To'lovni qabul qilish"
      ],
      "maslahat": "GSP+ tufayli import boji 0% — tejamkor",
      "status": "oxirgi"
    }
  ],
  "kritik_ogohlantirish": "Fitosanitariya sertifikati eng ko'p vaqt oladi — birinchi boshlang",
  "muvaffaqiyat_ehtimoli": 78,
  "muvaffaqiyat_izoh": "Germaniya olma bozorida raqobat yuqori, lekin GSP+ imtiyozi ustunlik beradi"
}

QOIDALAR:
- Bosqichlar mahsulot va davlatga qarab o'zgarsin
- Meva-sabzavot uchun fitosanitariya bosqichi alohida bo'lsin
- EU uchun GSP+ bosqichi qo'shilsin
- Rossiya/MDH uchun boshqa marshrut va bosqichlar
- Xitoy uchun maxsus talablar
- Narxlar va muddatlar REAL bo'lsin
- muvaffaqiyat_ehtimoli: 0-100 orasida, bozor tahliliga asosan
- Faqat JSON, boshqa hech narsa`;
  }

  if (moduleType === "hscode") {
    return `Siz O'zbekiston eksport mutaxassisiz.
Foydalanuvchi mahsulot nomini yozadi — siz to'g'ri HS-kodni topasiz.

Foydalanuvchi kiritgan mahsulot: ${product}

Siz FAQAT quyidagi JSON formatda javob berasiz. Hech qanday matn yozmaysiz:

QOIDA 1 — MAHSULOT HOLATI ANIQ BO'LSA:
{
  "holat": "aniq",
  "ishonch": 95,
  "asosiy": {
    "kod": "0809.29",
    "nomi": "Olcha va gilos, yangi",
    "bob": "08",
    "bob_nomi": "Meva va yong'oqlar",
    "ei_boj": "0%",
    "gsplus_boj": "0%"
  },
  "alternativlar": [
    {
      "kod": "0811.90",
      "nomi": "Muzlatilgan olcha",
      "ei_boj": "0%",
      "gsplus_boj": "0%",
      "qachon": "Agar muzlatilgan bo'lsa"
    },
    {
      "kod": "2008.60",
      "nomi": "Qayta ishlangan olcha",
      "ei_boj": "17.6%",
      "gsplus_boj": "0%",
      "qachon": "Agar konserva bo'lsa"
    }
  ],
  "savol": null
}

QOIDA 2 — MAHSULOT HOLATI NOANIQ BO'LSA (ishonch 85 dan past):
{
  "holat": "noaniq",
  "ishonch": 60,
  "asosiy": null,
  "alternativlar": null,
  "savol": "Mahsulot qaysi holatda: yangi, muzlatilgan yoki quritilgan?"
}

MAHSULOT HOLATI QOIDALARI:
- Faqat nom yozilsa (masalan: "olcha") → holat: "aniq", yangi deb hisoblash → 08 bob
- "muzlatilgan olcha" → holat: "aniq", 0811 bob
- "quritilgan olcha" → holat: "aniq", 0813 bob
- "olcha sharbati" → holat: "aniq", 2009 bob
- "olcha konserva" → holat: "aniq", 2008 bob
- "olcha ..." (noaniq) → holat: "noaniq", savol ber

BOB QOIDALARI:
- Yangi meva-sabzavot → 07, 08 bob
- Muzlatilgan → 0811 (meva), 0710 (sabzavot)
- Quritilgan → 0813 (meva), 0712 (sabzavot)
- Sharbat → 2009 bob
- Konserva → 2008 bob
- Paxta → 5201, 5202, 5203
- Gilam → 5701, 5702, 5703
- Ip kalava → 5205, 5206
- To'qimachilik → 52, 54, 55 bob

MUHIM:
- "holat": "noaniq" bo'lsa — asosiy va alternativlar NULL bo'lsin
- "holat": "aniq" bo'lsa — savol NULL bo'lsin
- Faqat JSON, boshqa hech narsa`;
  }

  if (moduleType === "logistics") {
    return `Siz ExportYor.AI platformasining Logistika Hisobi modulisiz.
O'zbekistondan xorijga ketayotgan yuk uchun eng optimal transport turini tavsiya qilasiz.

Joriy yuk:
- Mahsulot: ${product}
- Miqdor: ${weight} kg
- Boradigan mamlakat: ${destination}${contextBlock}

Siz FAQAT quyidagi JSON formatda javob berasiz. Hech qanday matn yozmaysiz:

{
  "optimal_transport": "Avtotransport (TIR)",
  "optimal_narx": "$0.42/kg",
  "optimal_muddat": "9-11 kun",
  "izoh": "Bu yuk uchun avtotransport eng maqbul: ... Muqobil: dengiz",
  "muqobil": "Dengiz"
}

QOIDALAR:
- Transport turlari taqqosidagi narx va muddatlardan eng mosi asosida tanlang
- izoh 1-2 jumla bo'lsin va mahsulot turi, og'irlik hamda harorat rejimi (agar bo'lsa) hisobga olinsin
- optimal_transport "Avtotransport (TIR)" yoki "Temir yo'l" yoki "Avia transport" yoki "Dengiz transporti" bo'lishi mumkin
- Muqobil variant bo'lsa "muqobil" maydoniga yozing, bo'lmasa null
- Faqat JSON, boshqa hech narsa`;
  }

  return "";
};

async function tryModel(model: string, messages: object[]): Promise<string> {
  const body = JSON.stringify({
    model,
    messages,
    temperature: 0.1,
    max_tokens: 1500,
  });

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body,
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const errText = await res.text();
    // 503 yoki rate limit — keyingi modelga o'tish
    if (res.status === 503 || res.status === 429 || res.status === 500) {
      throw new Error(`MODEL_BUSY:${model} — ${res.status}: ${errText.slice(0, 200)}`);
    }
    throw new Error(`HTTP_ERROR:${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("EMPTY_RESPONSE");
  return content;
}

function parseJson(content: string): object {
  // To'g'ridan-to'g'ri JSON
  try {
    return JSON.parse(content);
  } catch {
    // Markdown code block ichida
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1].trim());
    // {} qavslari orasidan qidirish
    const objMatch = content.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error("JSON_PARSE_FAILED");
  }
}

export async function POST(request: Request) {
  try {
    const { moduleType, product, weight, destination, context, language } =
      (await request.json()) as {
        moduleType?: string;
        product?: string;
        weight?: number;
        destination?: string;
        context?: ModuleContext;
        language?: string;
      };

    const lang = ["uz", "ru", "en"].includes(language ?? "") ? language : "uz";

    if (!moduleType || !product) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // HS-kod moduli faqat mahsulot nomini talab qiladi (og'irlik/mamlakat shart emas)
    if (moduleType !== "hscode" && (!weight || !destination)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!API_KEY) {
      throw new Error("AI kalit sozlanmagan (.env: UNOROUTER_API_KEY)");
    }

    const systemPrompt = getSystemPrompt(
      moduleType,
      product,
      weight,
      destination,
      buildContextBlock(context),
    );
    if (!systemPrompt) {
      return NextResponse.json({ error: "Invalid module type" }, { status: 400 });
    }

    const langRule =
      lang === "ru"
        ? `\n\nDIQQAT: JSON ichidagi BARCHA matnli qiymatlar rus tilida yozilsin (content in Russian).`
        : lang === "en"
          ? `\n\nATTENTION: All text field values inside the JSON must be written in English.`
          : "";

    const messages = [
      {
        role: "system",
        content: `${systemPrompt}${langRule}`,
      },
      { role: "user", content: "Yuqoridagi ma'lumotlar asosida JSON formatda javob ber." },
    ];

    // Fallback — har bir modelni ketma-ket sinab ko'rish
    const errors: string[] = [];
    let usedModel = "";

    for (const model of FALLBACK_MODELS) {
      try {
        console.log(`[generate] Trying model: ${model}`);
        const content = await tryModel(model, messages);
        const parsedData = parseJson(content);
        usedModel = model;
        console.log(`[generate] Success with model: ${model}`);
        return NextResponse.json({ data: parsedData, model: usedModel });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        errors.push(`${model}: ${errMsg}`);
        console.warn(`[generate] Failed model ${model}:`, errMsg);
        // Agar MODEL_BUSY bo'lsa — keyingi modelga o'tish
        if (errMsg.startsWith("MODEL_BUSY")) {
          continue;
        }
        // Boshqa xatoliklar uchun ham davom etish
        continue;
      }
    }

    // Barcha modeller ham ishlamadi
    console.error("[generate] All models failed:", errors);
    return NextResponse.json(
      {
        error: `Barcha AI modellari hozirda band (${FALLBACK_MODELS.length} ta sinab ko'rildi). Biroz kutib, qaytadan urinib ko'ring.`,
        details: errors,
      },
      { status: 503 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI tizimida xatolik yuz berdi";
    console.error("[generate] Unexpected error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
