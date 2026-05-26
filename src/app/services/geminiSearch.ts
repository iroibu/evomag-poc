import { PRODUCT_CATALOG, CATALOG_SUMMARY, generateGeminiContent, parseJsonResponse, CatalogProduct } from "./gemini";

export interface AISuggestedProduct extends CatalogProduct {
  aiReason: string;
}

export interface AISearchResult {
  products: AISuggestedProduct[];
  insight: string;
}

export async function getAIProductSuggestions(
  query: string,
): Promise<AISearchResult> {
  const catalogSummary = CATALOG_SUMMARY;

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

  const text = await generateGeminiContent(prompt);
  const parsed = parseJsonResponse<{
    insight: string;
    products: Array<{ id: string; aiReason: string }>;
  }>(text);

  const enriched: AISuggestedProduct[] = parsed.products
    .map((p) => {
      const catalog = PRODUCT_CATALOG.find((c) => c.id === p.id);
      if (!catalog) return null;
      return { ...catalog, aiReason: p.aiReason };
    })
    .filter((p): p is AISuggestedProduct => p !== null);

  return { products: enriched, insight: parsed.insight };
}
