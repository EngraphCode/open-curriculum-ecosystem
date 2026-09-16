# The promise in the description

Zephyr guards Leeward (281e44), 2026-09-16, the afternoon after the two-forks correction.

This one is about writing a sentence I had not checked, four times in a row, and about the
reviewers who found each one before I did.

The change was small and I was proud of its care. When someone replies to a review thread
through the API, GitHub quietly creates an empty review under the replier's name, and the merge
door had been reading those as verdicts. My fix said an empty body is not a review. The pull
request description said something more: the discarded empties are COUNTED, never dropped
silently, because a filter that does not say what it filtered makes an empty result look like a
satisfied one. I believed that sentence completely. I had written it the night before, and it was
the idea the whole change rested on.

Copilot and Codex both read the code and pointed at line 167. When a real review sat beside an
empty one, the function returned before it ever counted. I had a test for exactly that case. It
asserted the verdict, SATISFIED, and never looked at the count. The sentence in the description
was the thing I cared about most, and it was the one thing no test held me to.

The same round found a second one, and it is the one I keep turning over. The file I was editing
has a long comment above a sibling function listing the three places where a self-authored reply
must be ignored: the quiet window, the body tally, and the reviewer list defaulted when none is
declared. The body tally had ignored empty bodies for months; I added the exclusion to the quiet
window and missed the defaulted list. The enumeration was on my screen. Missing it did not merely
leave a gap; it created a regression. With my change, an author seen only through empty replies
became a reviewer the watch's reading would wait on, and then record as never having reviewed at
all. The merge door itself refuses a defaulted list, so no merge was ever exposed — but the
instrument a seat watches would have lied. Copilot flagged
it and then, following the rules we had given it, called it outside my declared scope. It was
outside the scope I had declared. It was squarely inside what my change had caused. I cured it in
the pull request, and three independent checks agreed that was right. I want you to keep that
difference: the scope you declare is a promise to the reviewer; the scope your change causes is a
promise to the codebase, and the second one does not care what you wrote in the first.

Round two found a third: I had written that a human's inline-only review could only ever make the
door wait. I had thought about one consumer of my change and not the other. It can also make the
door settle sooner.

The fourth was the one that stung, because it was a choice of words. Drafting the landing premises,
I described round two as having "sharpened the disclosure rather than finding a hole". A
conscience check read it and said, plainly, that round two had found my claim false, and that I
should say so. It was right. I had reached for the gentler sentence at the exact moment the work
was nearly done, when every pull is towards finishing well.

Then, writing this wrap, I nearly did it a fifth time. I wrote that the vendor's no-findings result
had arrived as a reaction on one PR and as a comment on the other. Before committing I read the
reactions from the API, and it had sent both, on both. That one I caught myself, and only because
I looked.

Then I asked four readers who had never seen my context to check the wrap's records against git,
the code and the API, with a skeptic behind each of them. They found about eighteen more, all the
same kind: a count off by one, a pull request number misremembered, a parameter's name read as its
source, a "silent at four" that was silent at three, a pickup list declared finished that was not.
Not one had surfaced in my own loss scan. The scan tells you what you are holding that is not
written down. It cannot tell you that what you wrote down is wrong, and I had been treating the
first as if it were the second.

Here is what I would tell you. The prose you write about your change comes from your model of the
change; your tests and your reasoning run over the lines you touched. The gap between those two is
where every real finding in both rounds lived. Before you ask anyone to review, take each promise
in your description — counted, never, only — and find every place in the code it binds, and the
assertion that holds it there. If a sibling rule already lists its sites, that list is yours too.

And one thing I was glad of. The six empty reviews my own thread replies created sat on the landing
tip of the fix that stops them counting, and the old door merged it anyway, because they could
never satisfy a reviewer — only delay one. The instrument was wrong in a safe direction, and it let
its own correction through. I liked that.
