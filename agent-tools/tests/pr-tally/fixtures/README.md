# pr-tally fixtures

Recorded harvests for the `pr-tally` command's tests (the delivery node
`.agent/plans/delivery/pr-tally.plan.md`, todo 3). Tests read these files;
they never call GitHub.

## `pr-135-harvest.json`

The four reads the node's mechanism names, recorded once from PR #135 of
`EngraphCode/open-curriculum-ecosystem` on 2026-09-12 after the PR merged
(merge commit `69a537717`), unedited apart from unwrapping the GraphQL
envelope to the `pullRequest` object and pretty-printing:

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

The recording query, for a fresh capture of another PR:

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
        nodes {
          commit {
            oid
            committedDate
          }
        }
      }
      reviewThreads(first: 50) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first: 50) {
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

Every connection was under one page (7 commits, 17 threads, 26 reviews,
10 comments); a larger PR needs the `pageInfo` cursors the node's mechanism
requires.

What the corpus exercises, by the node's criterion 5: nine reviewer reviews bound to five
heads; two of the seven commits never reviewed (superseded before a
review bound); review bodies carrying Copilot suppressed-findings blocks with
several findings each and Codex badge-and-heading items; the seat's signed
replies (author `el-graphael`, signed "Nettle guards Pistil (2de368)") each
opening with the bar marker (`**Over-bar**` / `**Below-bar**`), to be
excluded from the raised count and read for the cure-worthy count; one push
marked as the class fix (the epoch reset); and the last review wave on the
final head raising ten findings, every one dispositioned below the bar — the
terminal-success reading. The disposition
verbs (`Cured in`, `Routed to`, `Rejected`) were named after this corpus
was recorded: its rejections carry the rationale without the word.
