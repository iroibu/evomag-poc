import { GoogleGenAI } from "@google/genai";

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

// Static product catalog — Gemini picks from these based on the query
const PRODUCT_CATALOG = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB Natural Titanium",
    price: 6799,
    originalPrice: 7299,
    rating: 4.8,
    reviewCount: 342,
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
    badge: "-7%",
    tags: "telefon smartphone apple ios camera foto",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra 512GB Titanium Black",
    price: 6299,
    rating: 4.7,
    reviewCount: 289,
    imageUrl:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    tags: "telefon smartphone samsung android camera foto",
  },
  {
    id: "3",
    name: "iPhone 14 Pro 256GB Deep Purple",
    price: 5299,
    originalPrice: 6299,
    rating: 4.8,
    reviewCount: 567,
    imageUrl:
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=400&q=80",
    badge: "-16%",
    tags: "telefon smartphone apple ios",
  },
  {
    id: "4",
    name: "Google Pixel 8 Pro 256GB Obsidian",
    price: 4999,
    rating: 4.6,
    reviewCount: 234,
    imageUrl:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    tags: "telefon smartphone google android camera",
  },
  {
    id: "5",
    name: 'Apple MacBook Air M3 13.6" 16GB RAM',
    price: 7299,
    rating: 4.9,
    reviewCount: 412,
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
    tags: "laptop macbook apple programare design",
  },
  {
    id: "6",
    name: "Dell XPS 15 Intel i7 32GB RAM",
    price: 6999,
    rating: 4.7,
    reviewCount: 198,
    imageUrl:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80",
    tags: "laptop gaming programare design",
  },
  {
    id: "7",
    name: "ASUS ROG Strix G16 RTX 4070",
    price: 8499,
    rating: 4.8,
    reviewCount: 156,
    imageUrl:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80",
    tags: "laptop gaming performanta",
  },
  {
    id: "8",
    name: "Sony WH-1000XM5 Căști Noise Cancelling",
    price: 1799,
    originalPrice: 2199,
    rating: 4.9,
    reviewCount: 823,
    imageUrl:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80",
    badge: "-18%",
    tags: "casti audio wireless noise cancelling muzica calatorie",
  },
  {
    id: "9",
    name: "Apple AirPods Pro 2nd Gen",
    price: 1399,
    rating: 4.8,
    reviewCount: 634,
    imageUrl:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80",
    tags: "casti earbuds apple wireless noise cancelling sport",
  },
  {
    id: "10",
    name: 'Samsung 27" Odyssey G7 4K 144Hz',
    price: 3299,
    rating: 4.7,
    reviewCount: 287,
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80",
    tags: "monitor gaming 4k display",
  },
  {
    id: "11",
    name: 'LG UltraWide 34" 4K Monitor',
    price: 2899,
    originalPrice: 3499,
    rating: 4.6,
    reviewCount: 312,
    imageUrl:
      "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=400&q=80",
    badge: "-17%",
    tags: "monitor 4k design programare ultrawide",
  },
  {
    id: "12",
    name: "PlayStation 5 Console + DualSense",
    price: 2999,
    rating: 4.9,
    reviewCount: 1024,
    imageUrl:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80",
    tags: "consola gaming ps5 playstation",
  },
];

export async function getAIProductSuggestions(
  query: string,
): Promise<AISearchResult> {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyCJJGMIAI5xBn_oOO73nI_FF28AIBWPFB8",
  });

  const catalogSummary = PRODUCT_CATALOG.map(
    (p) =>
      `ID:${p.id} | "${p.name}" | Preț: ${p.price} Lei${p.originalPrice ? ` (redus de la ${p.originalPrice} Lei)` : ""} | Rating: ${p.rating} | Tags: ${p.tags}`,
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
      const { tags: _tags, ...rest } = catalog;
      return { ...rest, aiReason: p.aiReason };
    })
    .filter((p): p is AISuggestedProduct => p !== null);

  return { products: enriched, insight: parsed.insight };
}
