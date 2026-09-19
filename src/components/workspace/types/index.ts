// Workspace Navigation Views
export type ActiveView =
  | "chat" // AI Chat & Split Canvas
  | "overview" // Asosiy Tahlil Dashboardi
  | "hscode" // HS-Code Katalogi
  | "logistics" // Logistika Kalkulyatori
  | "market" // Bozor Tahlili & B2B
  | "documents" // Hujjatlar
  | "subsidy" // Subsidiyalar & Risklar
  | "settings"; // Sozlamalar

// Chat message interface
export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  time: string;
  text: string;
  hasArtifact?: boolean;
  artifactTitle?: string;
}

// Chat Session interface (yangi qoshildi)
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

// Project interface (real — user tomonidan yaratiladi)
export interface ExportProject {
  id: string;
  name: string;
  productName: string;
  productWeightKg: number;
  destinationCountry: string;
  destinationCity: string;
  originCity: string;
  transportType: TransportType;
  status: "draft" | "analyzing" | "ready" | "exporting";
  createdAt: string;
  updatedAt: string;
  analysisResult?: AnalysisResult;
}

// AI Analysis Result (API dan keladigan real ma'lumot)
export interface AnalysisResult {
  hsCode: string;
  productDescription: string;
  euMfnDuty: number;
  uzbGspDuty: number;
  gspPlusApplicable: boolean;
  roadmap: RoadmapItem[];
  logistics: LogisticsResult;
  documents: DocumentInfo[];
  subsidies: SubsidyInfo[];
  risks: RiskInfo[];
  marketData?: MarketAnalysisData;
  documentsData?: GeneratedDocumentsData;
  subsidiesRisksData?: GeneratedSubsidiesRisksData;
  roadmapData?: GeneratedRoadmap;
  rawAiResponse: string;
  model: string;
  analyzedAt: string;
}

// Logistics information
export interface LogisticsInfo {
  transportType: TransportType;
  route: string;
  transitDays: string;
  costPerKg: number;
  totalCost: number;
  insuranceIncluded: boolean;
  temperatureMode?: string;
  borderCrossing?: string;
}

// Document information
export interface DocumentInfo {
  id: string;
  name: string;
  nameEn: string;
  status: "required" | "in_progress" | "ready";
  description: string;
  estimatedDays: string;
}

// Subsidy information
export interface SubsidyInfo {
  id: string;
  name: string;
  description: string;
  coveragePercent: number;
  estimatedSaving: number;
  eligibility: "eligible" | "maybe" | "not_eligible";
  requirements: string[];
}

// Risk information
export interface RiskInfo {
  id: string;
  category: "logistics" | "customs" | "payment" | "quality" | "weather";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
}

// HS Code from tariff database (real MacMap data)
export interface HSCode {
  code: string;
  name: string;
  category: string;
  euDuty: string;
  gspDuty: string;
  certs: string[];
}

// Roadmap item interface
export interface RoadmapItem {
  id: number;
  title: string;
  done: boolean;
  time: string;
}

// Transport type
export type TransportType = "auto" | "air" | "rail" | "sea";

// Logistics calculator input
export interface LogisticsInput {
  originCity: string;
  destinationCity: string;
  destinationCountry: string;
  weightKg: number;
  transportType: TransportType;
  productType: string;
  temperatureRequired: boolean;
}

// Logistics calculator result
export interface LogisticsResult {
  transportType: TransportType;
  costPerKg: number;
  totalCost: number;
  transitDays: string;
  route: string;
  transportCompany?: string;
  insurance: number;
  temperature?: string;
  notes: string[];
}

// Company settings (from localStorage)
export interface CompanySettings {
  name: string;
  inn: string;
  phone: string;
  address: string;
  email?: string;
  website?: string;
  aiLanguage?: "uz" | "ru" | "en";
  // Valyuta va o'lchov
  currency?: "USD" | "EUR" | "UZS" | "RUB";
  weightUnit?: "kg" | "t";
  // Bildirishnomalar
  notifyEmail?: boolean;
  notifyGspPlus?: boolean;
  notifyWto?: boolean;
}

// Market analysis result (AI asosida)
export interface MarketAnalysisData {
  status: "mos" | "ortacha" | "mos_emas";
  status_emoji: string;
  xulosa: string;
  afzalliklar: string[];
  kamchiliklar: string[];
  gsplus: boolean;
  gsplus_izoh: string;
  raqobat_darajasi: "past" | "o'rta" | "yuqori";
  tavsiya_bozor: string | null;
  tavsiya_bozor_sabab: string;
}

export interface GeneratedDocument {
  id?: number;
  nomi: string;
  majburiy: boolean;
  /** Tayyorlov | Sertifikatlash | Bojxona | Logistika (eski sxema) */
  bosqich?: string;
  qayerdan: string;
  /** Eski sxema: "1-2 kun" */
  muddat?: string;
  muddat_kun?: string;
  /** Eski sxema: "0-50,000 so'm" */
  narx?: string;
  narx_min?: number;
  narx_max?: number;
  narx_valyuta?: string;
  izoh: string;
  icon?: string;
  /** 1 dan boshlanadigan bosqich tartibi */
  ketma_ket?: number;
  /** true — platforma /documents sahifasida avtomatik tayyorlaydi (shartnoma, invoys) */
  platformada_tayyorlanadi?: boolean;
}

export interface GeneratedDocumentsData {
  hujjatlar: GeneratedDocument[];
  /** Eski sxema: "500,000 - 1,200,000 so'm" */
  jami_taxmin?: string;
  /** Eski sxema: "7-14 kun" */
  jami_muddat?: string;
  jami_narx_min?: number;
  jami_narx_max?: number;
  jami_muddat_min?: number;
  jami_muddat_max?: number;
  parallel_mumkin?: boolean;
  parallel_izoh?: string;
  muhim_eslatma: string;
  birinchi_qadam?: string;
}

export interface GeneratedSubsidy {
  id?: number;
  nomi: string;
  miqdor: string;
  max_summa?: string | null;
  shart: string;
  qayerga_murojaat: string;
  havola: string;
  icon?: string;
  /** Bu loyiha uchun qo'llasa bo'ladimi */
  ushbu_loyihaga_mos?: boolean;
  /** Qonun yoki shartnoma nomi */
  asosi?: string;
}

export interface GeneratedRisk {
  id?: number;
  nomi: string;
  daraja: "past" | "o'rta" | "yuqori";
  /** 1-10 (10 = eng yuqori xavf) */
  daraja_ball?: number;
  izoh?: string;
  oldini_olish?: string;
  icon?: string;
  /** Eskirgan saqlangan format bilan moslik uchun */
  daraja_emoji?: string;
  tavsiya?: string;
}

export interface GeneratedSubsidiesRisksData {
  subsidiyalar: GeneratedSubsidy[];
  risklar: GeneratedRisk[];
  umumiy_xavf_darajasi: "past" | "o'rta" | "yuqori";
  umumiy_xavf_ball?: number;
  umumiy_xavf_emoji?: string;
  eng_muhim_tavsiya: string;
  potentsial_tejam?: string;
  potentsial_tejam_izoh?: string;
}

// Export yo'l xaritasi (AI roadmap moduli) — bosqichdan-bosqich amallar, muddat va narxlar
export interface RoadmapStage {
  id: number;
  nomi: string;
  icon?: string;
  muddat_min: number;
  muddat_max: number;
  muddat_birlik?: string;
  narx_min?: number;
  narx_max?: number;
  narx_valyuta?: "so'm" | "USD";
  amallar: string[];
  maslahat?: string;
  marshrut?: string;
  status?: "birinchi" | "ikkinchi" | "uchinchi" | "oxirgi";
}

export interface GeneratedRoadmap {
  jami_muddat_min: number;
  jami_muddat_max: number;
  jami_narx?: string;
  bosqichlar: RoadmapStage[];
  kritik_ogohlantirish?: string;
  muvaffaqiyat_ehtimoli?: number;
  muvaffaqiyat_izoh?: string;
}

// Target country for market analysis
export interface TargetCountry {
  code: string;
  name: string;
  flag: string;
  demandScore: number;
  topCities: string[];
  importRegulations: string[];
}

// API Response from /api/chat
export interface ChatApiResponse {
  answer: string;
  hs6?: string;
  tariff?: {
    hs6: string;
    desc: string;
    chapter: string;
    euMfnPct: number;
    uzGspPct: number;
  };
  hasAnalysis: boolean;
  model?: string;
  cached?: boolean;
  debugCandidates?: string[];
}
