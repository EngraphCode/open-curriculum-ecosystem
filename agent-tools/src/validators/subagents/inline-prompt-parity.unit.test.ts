import { describe, expect, it } from 'vitest';

import { inlinePromptParityIssues } from './inline-prompt-parity.js';

const template = [
  '# Corpus Voter',
  '',
  '## System prompt',
  '',
  'The wrapper carries this block verbatim.',
  '',
  '> You are a corpus-analysis adversary voter. Each dispatch supplies the',
  '> complete evidence you need.',
  '',
  '## Delegation triggers',
  '',
  '> A later quote that is not the prompt.',
  '',
].join('\n');

const matchingAdapter = [
  '---',
  'name: corpus-voter',
  'tools:',
  '---',
  '',
  'You are a corpus-analysis adversary voter. Each dispatch supplies the',
  'complete evidence you need.',
  '',
  '<!-- Paired with the canonical definition; keep both in sync. -->',
  '',
].join('\n');

const paths = {
  templatePath: '.agent/sub-agents/templates/corpus-voter.md',
  adapterPath: '.claude/agents/corpus-voter.md',
};

describe('inlinePromptParityIssues', () => {
  it('passes an adapter whose body is the template System prompt block', () => {
    expect(
      inlinePromptParityIssues({ ...paths, template, adapter: matchingAdapter }),
    ).toStrictEqual([]);
  });

  it('passes a copy that differs from the template only in line wrapping', () => {
    const rewrapped = matchingAdapter.replace(
      'Each dispatch supplies the\ncomplete evidence you need.',
      'Each dispatch\nsupplies the complete evidence you need.',
    );

    expect(inlinePromptParityIssues({ ...paths, template, adapter: rewrapped })).toStrictEqual([]);
  });

  it('reports an adapter whose copy has drifted from the template', () => {
    const drifted = matchingAdapter.replace('adversary voter', 'friendly voter');

    expect(inlinePromptParityIssues({ ...paths, template, adapter: drifted })).toStrictEqual([
      '.claude/agents/corpus-voter.md: its prompt is not a verbatim copy of the System prompt block in .agent/sub-agents/templates/corpus-voter.md (PDR-009 exception)',
    ]);
  });

  it('reports substantive adapter text beyond the copied block', () => {
    const extended = matchingAdapter.replace(
      'complete evidence you need.',
      'complete evidence you need.\n\nAlso summarise the corpus.',
    );

    expect(inlinePromptParityIssues({ ...paths, template, adapter: extended })).toHaveLength(1);
  });

  it('reports a template with a System prompt block and no Claude adapter', () => {
    expect(inlinePromptParityIssues({ ...paths, template, adapter: undefined })).toStrictEqual([
      '.agent/sub-agents/templates/corpus-voter.md: has a System prompt block but no Claude adapter at .claude/agents/corpus-voter.md to carry it',
    ]);
  });

  it('asks nothing of a template without a System prompt block', () => {
    const plainTemplate = '# Code Expert\n\n## Purpose\n\n> A quote in another section.\n';

    expect(
      inlinePromptParityIssues({ ...paths, template: plainTemplate, adapter: undefined }),
    ).toStrictEqual([]);
  });
});
