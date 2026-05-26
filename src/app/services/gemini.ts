import { GoogleGenAI } from "@google/genai";
import { allProducts } from "../../data/index";

const _CIPHER = "evomag-poc-secret";
const _ENC_KEY =
  "243f150c321e695d1b3c43465234165321130018220717653e1f1b7a111c3508173a0413350112";

function _decryptKey(hex: string, cipher: string): string {
  let result = "";
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    result += String.fromCharCode(byte ^ cipher.charCodeAt((i / 2) % cipher.length));
  }
  return result;
}

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  badge?: string;
}

export const PRODUCT_CATALOG: CatalogProduct[] = allProducts.map((p: any) => ({
  id: String(p.id),
  name: p.name,
  price: p.price,
  originalPrice: p.oldPrice,
  rating: p.rating ?? 0,
  reviewCount: p.reviews ?? 0,
  imageUrl: p.image ?? p.imageUrl ?? (Array.isArray(p.images) ? p.images[0] : ""),
  badge: p.discount,
}));

export const CATALOG_SUMMARY = PRODUCT_CATALOG.map(
  (p) =>
    `ID:${p.id} | "${p.name}" | Preț: ${p.price} Lei${p.originalPrice ? ` (redus de la ${p.originalPrice} Lei)` : ""} | Rating: ${p.rating}`,
).join("\n");

export async function generateGeminiContent(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: _decryptKey(_ENC_KEY, _CIPHER) });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
  });
  return response.text ?? "";
}

export function parseJsonResponse<T>(text: string): T {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response format");
  return JSON.parse(jsonMatch[0]) as T;
}
