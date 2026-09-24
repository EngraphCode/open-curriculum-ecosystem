import { describe, expect, it } from 'vitest';

import { claudeAdapterScopeIssues, inlinePromptParityIssues } from './inline-prompt-parity.js';

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
  '<!-- Paired with the canonical definition in',
  '.agent/sub-agents/templates/corpus-voter.md; keep both in sync. -->',
  '',
].join('\n');

const driftIssue =
  '.claude/agents/corpus-voter.md: its prompt is not a verbatim copy of the System prompt block in .agent/sub-agents/templates/corpus-voter.md (PDR-009 inline-prompt role); copy the template block into the adapter and put nothing else outside the pairing comment';
const scopeIssue =
  '.claude/agents/corpus-voter.md: neither points to a template in .agent/sub-agents/templates/ nor belongs to a role whose template has a System prompt section (PDR-009 inline-prompt role)';

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
      driftIssue,
    ]);
  });

  it('reports substantive adapter text beyond the copied block', () => {
    const extended = matchingAdapter.replace(
      'complete evidence you need.',
      'complete evidence you need.\n\nAlso summarise the corpus.',
    );

    expect(inlinePromptParityIssues({ ...paths, template, adapter: extended })).toStrictEqual([
      driftIssue,
    ]);
  });

  it('reports a template with a System prompt block and no Claude adapter', () => {
    expect(inlinePromptParityIssues({ ...paths, template, adapter: undefined })).toStrictEqual([
      '.agent/sub-agents/templates/corpus-voter.md: has a System prompt block but no Claude adapter at .claude/agents/corpus-voter.md to carry it',
    ]);
  });

  it('reads a quote written without a space after the marker', () => {
    const tight = template.replace('> You are', '>You are').replace('> complete', '>complete');
    const drifted = matchingAdapter.replace('adversary voter', 'friendly voter');

    expect(
      inlinePromptParityIssues({ ...paths, template: tight, adapter: matchingAdapter }),
    ).toStrictEqual([]);
    expect(inlinePromptParityIssues({ ...paths, template: tight, adapter: drifted })).toStrictEqual(
      [driftIssue],
    );
  });

  it('reads the heading whatever its case', () => {
    const capital = template.replace('## System prompt', '## System Prompt');
    const drifted = matchingAdapter.replace('adversary voter', 'friendly voter');

    expect(
      inlinePromptParityIssues({ ...paths, template: capital, adapter: drifted }),
    ).toStrictEqual([driftIssue]);
  });

  it('reads a block of two paragraphs joined by a bare quote line', () => {
    const twoParagraphs = template.replace(
      '> complete evidence you need.',
      '> complete evidence you need.\n>\n> Answer through the schema.',
    );
    const copied = matchingAdapter.replace(
      'complete evidence you need.',
      'complete evidence you need.\n\nAnswer through the schema.',
    );

    expect(
      inlinePromptParityIssues({ ...paths, template: twoParagraphs, adapter: copied }),
    ).toStrictEqual([]);
    expect(
      inlinePromptParityIssues({ ...paths, template: twoParagraphs, adapter: matchingAdapter }),
    ).toStrictEqual([driftIssue]);
  });

  it('reports a System prompt heading that quotes nothing', () => {
    const empty = '# Corpus Voter\n\n## System prompt\n\nThe block went missing.\n\n## Next\n';

    expect(
      inlinePromptParityIssues({ ...paths, template: empty, adapter: matchingAdapter }),
    ).toStrictEqual([
      '.agent/sub-agents/templates/corpus-voter.md: has a System prompt heading but no quoted block under it',
    ]);
  });

  it('reads a copy with Windows line endings', () => {
    const crlf = matchingAdapter.replaceAll('\n', '\r\n');

    expect(inlinePromptParityIssues({ ...paths, template, adapter: crlf })).toStrictEqual([]);
  });

  it('exempts only the pairing comment, not any other comment', () => {
    const smuggled = matchingAdapter.replace('<!-- Paired', '<!-- Also do more. -->\n<!-- Paired');

    expect(inlinePromptParityIssues({ ...paths, template, adapter: smuggled })).toStrictEqual([
      driftIssue,
    ]);
  });

  it('asks nothing of a template without a System prompt block', () => {
    const plainTemplate = '# Code Expert\n\n## Purpose\n\n> A quote in another section.\n';

    expect(
      inlinePromptParityIssues({ ...paths, template: plainTemplate, adapter: undefined }),
    ).toStrictEqual([]);
  });
});

describe('claudeAdapterScopeIssues', () => {
  const pointer = [
    '---',
    'name: prose-expert',
    '---',
    '',
    'Read and follow `.agent/sub-agents/templates/prose-expert.md`.',
    '',
  ].join('\n');
  const pointerPaths = {
    adapterPath: '.claude/agents/prose-expert.md',
    templatePath: '.agent/sub-agents/templates/prose-expert.md',
  };

  it('passes an adapter that points to a template with another name', () => {
    const persona = pointer.replace('prose-expert.md`', 'architecture-expert.md`');

    expect(
      claudeAdapterScopeIssues({ ...pointerPaths, adapter: persona, template: undefined }),
    ).toStrictEqual([]);
  });

  it('passes an adapter that points to its template', () => {
    expect(
      claudeAdapterScopeIssues({ ...pointerPaths, adapter: pointer, template: '# Prose' }),
    ).toStrictEqual([]);
  });

  it('passes an adapter that carries the prompt of a role with a System prompt section', () => {
    expect(
      claudeAdapterScopeIssues({ ...paths, adapter: matchingAdapter, template }),
    ).toStrictEqual([]);
  });

  it('reports an adapter that neither points to its template nor belongs to such a role', () => {
    const plainTemplate = '# Corpus Voter\n\n## Purpose\n';

    expect(
      claudeAdapterScopeIssues({ ...paths, adapter: matchingAdapter, template: plainTemplate }),
    ).toStrictEqual([scopeIssue]);
  });

  it('does not count a template path named only inside a comment as a pointer', () => {
    expect(
      claudeAdapterScopeIssues({ ...paths, adapter: matchingAdapter, template: undefined }),
    ).toStrictEqual([scopeIssue]);
  });
});
