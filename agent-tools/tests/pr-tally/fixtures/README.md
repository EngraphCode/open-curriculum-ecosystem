# pr-tally fixtures

Recorded harvests for the `pr-tally` command's tests (the delivery node
`.agent/plans/delivery/pr-tally.plan.md`, todo 3). Tests read these files;
they never call GitHub.

## `pr-135-harvest.json`

The four reads the node's mechanism names, recorded once from PR #135 of
`EngraphCode/open-curriculum-ecosystem` on 2026-09-12 after the PR merged
(merge commit `69a537717`) with the query below — `pageInfo` selected on every
connection, and every recorded `hasNextPage` is false, the machine-readable
evidence that each connection was exhausted — unedited apart from unwrapping
the GraphQL envelope to the `pullRequest` object and pretty-printing:

- `commits` — the branch's commits in PR order, the authoritative head order
  the tally sorts bindings against;
- `reviewThreads` — every thread with all of its comments; the first
  comment's `pullRequestReview.commit.oid` is the thread's round binding;
- `reviews` — the paged reviews connection with each review's commit and
  body (Copilot's suppressed-findings blocks and Codex's badge-and-heading
  items live in these bodies);
- `comments` — the issue comments, where the intake declaration, the
  suppressed-findings dispositions and the round reconciliations were
  recorded.

The recording query as run for PR #135 (the number is hard-coded; change it for another PR):

```graphql
query {
  repository(owner: "EngraphCode", name: "open-curriculum-ecosystem") {
    pullRequest(number: 135) {
      number
      headRefOid
      baseRefName
      mergeCommit {
        oid
      }
      commits(first: 50) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          commit {
            oid
            committedDate
          }
        }
      }
      reviewThreads(first: 50) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first: 50) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              databaseId
              author {
                login
              }
              createdAt
              body
              pullRequestReview {
                id
                commit {
                  oid
                }
              }
            }
          }
        }
      }
      reviews(first: 50) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          author {
            login
          }
          state
          commit {
            oid
          }
          submittedAt
          body
        }
      }
      comments(first: 50) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          databaseId
          author {
            login
          }
          createdAt
          body
        }
      }
    }
  }
}
```

Every connection was under one page for PR #135 (7 commits, 17 threads, 26 reviews, 10
comments; the largest nested thread has two comments) and the recorded `pageInfo` says so. For a larger PR, page each connection to exhaustion before unwrapping: while any
`pageInfo.hasNextPage` is true, re-query that connection with `after: "<endCursor>"` and
concatenate its `nodes` — the nested thread `comments` connection included — as the node's
mechanism requires; a truncated recording is not a fixture.

What the corpus carries, each claim checked against the JSON with `jq` on 2026-09-12:

- nine reviewer reviews bound to five heads; two of the seven commits never reviewed
  (superseded before a review bound);
- four Copilot review bodies, every one carrying a suppressed-findings block with several
  findings; five Codex review bodies, all boilerplate — there is NO Codex body-only item in
  this corpus (every Codex finding on #135 is a thread), so that shape takes a fixture of its
  own at todo 1;
- seventeen seat thread replies (author `el-graphael`). Every one opens with a bar marker
  that satisfies the closed grammar (fourteen over-bar, three below-bar: `3996143642`,
  `3996223154`, `3996223195`). Five over-bar replies name no prong (`3996143427`,
  `3996143456`, `3996143594`, `3996188479`, `3996188520`). One reply carries the literal
  `Rejected` (`3996143642`); the two final below-bar replies carry no disposition verb and
  end "No write" (`3996223154`, `3996223195`); no `Routed to` example is recorded. The
  count reads the marker only, so all seventeen count;
- every one of those seventeen replies ends `— Nettle guards Pistil (2de368), Director`. The
  ratified self-reply predicate (`agent-tools/src/pr-watch/reviewer-legs.ts`,
  `SIGNATURE_SUFFIX`) requires the final line to END with the `(<six hex>)` prefix, so the
  role suffix makes every recorded reply read as NOT signed under the current code. The
  node's ledger carries the pickup question for todo 1: widen the predicate by dated
  amendment, or treat this corpus's replies as unsigned;
- six seat issue comments: two resume-state records and the late intake declaration
  (`5644727301`, `5644730066`, `5645756283`), which disposition nothing, and three body-only
  disposition comments (`5645760733`, `5645857878`, `5645946537`) that batch findings from
  several heads under prose headings and tables, predating the one-line-per-finding form —
  the corpus's "manual tally required" case for body-only items;
- one push marked as the class fix (the epoch reset), in `5645857878`;
- the final head, `b50820152`, read by the intake contract: its two thread findings carry
  marked below-bar replies; its eight Copilot suppressed items are dispositioned only inside
  the batched comment `5645946537`, so the machine reading of that round is "manual tally
  required" for those eight, not terminal success. The terminal-success reading of that
  round is the seat's human tally on the PR; a fixture test asserts the manual verdict.
