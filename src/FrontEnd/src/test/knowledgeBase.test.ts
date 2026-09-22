/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { KNOWLEDGE_BASE_URL, buildKnowledgeBaseUrl } from '../utils/knowledgeBase';

describe('buildKnowledgeBaseUrl', () => {
  it('concatène le préfixe d’URL avec le knowledge_base_id brut', () => {
    expect(buildKnowledgeBaseUrl('KB-00000001')).toBe(
      `${KNOWLEDGE_BASE_URL}KB-00000001`
    );
  });

  it('préserve le format d’article sans tiret', () => {
    expect(buildKnowledgeBaseUrl('KB0101834')).toBe(
      `${KNOWLEDGE_BASE_URL}KB0101834`
    );
  });
});