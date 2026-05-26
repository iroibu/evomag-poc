import { GoogleGenAI } from "@google/genai";
import { allProducts } from "../../data/index";

const _CIPHER = "evomag-poc-secret";
const _ENC_KEY = "243f150c321e695d1b3c43465234165321130018220717653e1f1b7a111c3508173a0413350112";

function _decryptKey(hex: string, cipher: string): string {
  let result = "";
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    result += String.fromCharCode(byte ^ cipher.charCodeAt((i / 2) % cipher.length));
  }
  return result;
}

export interface AISuggestedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  aiReason: string;
}

export interface AISearchResult {
  products: AISuggestedProduct[];
  insight: string;
}

// Product catalog built from all products in the data store
const PRODUCT_CATALOG = allProducts.map((p: any) => ({
  id: String(p.id),
  name: p.name,
  price: p.price,
  originalPrice: p.oldPrice,
  rating: p.rating ?? 0,
  reviewCount: p.reviews ?? 0,
  imageUrl: p.image ?? (Array.isArray(p.images) ? p.images[0] : ""),
  badge: p.discount,
}));

export async function getAIProductSuggestions(
  query: string,
): Promise<AISearchResult> {
  const ai = new GoogleGenAI({
    apiKey: _decryptKey(_ENC_KEY, _CIPHER),
  });

  const catalogSummary = PRODUCT_CATALOG.map(
    (p) =>
      `ID:${p.id} | "${p.name}" | Preț: ${p.price} Lei${p.originalPrice ? ` (redus de la ${p.originalPrice} Lei)` : ""} | Rating: ${p.rating}`,
  ).join("\n");

  const prompt = `Ești un asistent de shopping AI pentru un magazin online românesc. 
Utilizatorul a căutat: "${query}"

Catalogul de produse disponibil:
${catalogSummary}

Sarcina ta:
1. Alege MAXIM 4 produse din catalog care se potrivesc cel mai bine căutării utilizatorului.
2. Identifică CEL MAI BUN produs din selecție și scrie o recomandare scurtă (max 1-2 propoziții) care menționează explicit numele produsului și motivul principal pentru care este cea mai bună alegere.
3. Pentru fiecare produs ales, scrie un motiv scurt (max 8 cuvinte) de ce îl recomanzi.

Răspunde DOAR cu un JSON valid în acest format exact (fără markdown, fără text extra):
{
  "insight": "mesaj scurt despre selecție",
  "products": [
    { "id": "ID_produs", "aiReason": "motiv scurt" }
  ]
}`;

  const response = await ai.models.generateContent({
    model: "gemma-4-31b-it",
    contents: prompt,
  });

  const text = response.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response format");

  const parsed: {
    insight: string;
    products: Array<{ id: string; aiReason: string }>;
  } = JSON.parse(jsonMatch[0]);

  const enriched: AISuggestedProduct[] = parsed.products
    .map((p) => {
      const catalog = PRODUCT_CATALOG.find((c) => c.id === p.id);
      if (!catalog) return null;
      return { ...catalog, aiReason: p.aiReason };
    })
    .filter((p): p is AISuggestedProduct => p !== null);

  return { products: enriched, insight: parsed.insight };
}
