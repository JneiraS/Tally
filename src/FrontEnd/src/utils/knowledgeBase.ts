export const KNOWLEDGE_BASE_URL =
  "https://airbus.service-now.com/now/nav/ui/classic/params/target/kb_view.do%3Fsysparm_article%3D";

export function buildKnowledgeBaseUrl(kbId: string): string {
  return `${KNOWLEDGE_BASE_URL}${kbId}`;
}