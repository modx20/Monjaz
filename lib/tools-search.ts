import { ToolCategoryId, ToolDefinition, TOOLS_REGISTRY } from './tools-registry';

/**
 * Normalizes Arabic text for resilient search matching (handles Alef variants,
 * Ta Marbuta, Ya/Alif Maqsura, and strips diacritics).
 */
export function normalizeArabicForSearch(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '') // Strip Arabic diacritics/tashkeel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ');
}

export function searchAndFilterTools(
  query: string,
  category: ToolCategoryId | 'all' = 'all',
  tools: ToolDefinition[] = TOOLS_REGISTRY
): ToolDefinition[] {
  const normalizedQuery = normalizeArabicForSearch(query);

  const byCategory =
    category === 'all' ? tools : tools.filter((tool) => tool.category === category);

  if (!normalizedQuery) {
    return byCategory;
  }

  const terms = normalizedQuery.split(' ').filter(Boolean);

  const scored = byCategory
    .map((tool) => {
      const title = normalizeArabicForSearch(tool.title);
      const shortDesc = normalizeArabicForSearch(tool.shortDesc);
      const keywords = tool.keywords.map(normalizeArabicForSearch).join(' ');
      const categoryLabel = normalizeArabicForSearch(tool.categoryLabel);
      const slug = tool.slug.toLowerCase();

      let score = 0;
      let allMatch = true;

      for (const term of terms) {
        if (title.includes(term)) {
          score += title.startsWith(term) ? 12 : 8;
        } else if (keywords.includes(term) || slug.includes(term)) {
          score += 5;
        } else if (shortDesc.includes(term) || categoryLabel.includes(term)) {
          score += 2;
        } else {
          allMatch = false;
          break;
        }
      }

      return { tool, score, matched: allMatch };
    })
    .filter((entry) => entry.matched && entry.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.tool);
}
