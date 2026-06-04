import {
  PRODUCT_CATALOG,
  CATALOG_SUMMARY,
  generateGeminiContent,
  parseJsonResponse,
  type CatalogProduct,
} from "./gemini";

export interface AssistantProduct extends CatalogProduct {
  aiReason: string;
}

export interface AssistantReply {
  message: string;
  products: AssistantProduct[];
  refused: boolean;
}

export async function getAssistantReply(userMessage: string): Promise<AssistantReply> {
  const prompt = `Ești asistentul de shopping EvoMi al magazinului online EvoMag.

REGULI STRICTE:
- Răspunzi DOAR la întrebări legate de cumpărături, produse, recomandări sau comparații de produse.
- Dacă întrebarea NU este legată de shopping, refuzi politicos și explici că poți ajuta doar cu produse.
- Nu răspunzi la întrebări despre politică, știință, rețete, sfaturi medicale sau orice alt subiect în afara shopping-ului.

Mesajul utilizatorului: "${userMessage}"

Catalogul de produse disponibil:
${CATALOG_SUMMARY}

Dacă mesajul NU este legat de shopping, răspunde cu:
{
  "refused": true,
  "message": "Îmi pare rău, pot răspunde doar la întrebări despre produse și cumpărături. Cum te pot ajuta să găsești un produs?",
  "products": []
}

Dacă mesajul este legat de shopping, alege MAXIM 4 produse potrivite și răspunde cu:
{
  "refused": false,
  "message": "mesaj friendly despre selecție (1-2 propoziții)",
  "products": [
    { "id": "ID_produs", "aiReason": "motiv scurt (max 8 cuvinte)" }
  ]
}

Răspunde DOAR cu JSON valid (fără markdown, fără text extra).`;

  const text = await generateGeminiContent(prompt);
  const parsed = parseJsonResponse<{
    refused: boolean;
    message: string;
    products: Array<{ id: string; aiReason: string }>;
  }>(text);

  if (parsed.refused) {
    return { message: parsed.message, products: [], refused: true };
  }

  const enriched: AssistantProduct[] = parsed.products
    .map((p) => {
      const catalog = PRODUCT_CATALOG.find((c) => c.id === p.id);
      if (!catalog) return null;
      return { ...catalog, aiReason: p.aiReason };
    })
    .filter((p): p is AssistantProduct => p !== null);

  return { message: parsed.message, products: enriched, refused: false };
}
