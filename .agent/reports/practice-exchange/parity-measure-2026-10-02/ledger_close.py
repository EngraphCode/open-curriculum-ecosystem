#!/usr/bin/env python3
"""Close the parity ledger: recompute its header's count line from its own tables.

Reads `parity-ledger-2026-10-02.md` beside this script (or the path given), parses the tables of
its lettered sections, recomputes every number the header's count line carries (the rows per
section, per reading and per surface, the carries by status and direction, the owner's rows,
the parameters, the host-local rows, the doubts and the anchors), prints the recomputed line
beside the header's, and exits non-zero when they disagree. A validator recomputes; it never
records (`validators-must-recompute-not-just-record`).

With `--rerun <conflict-hunks.md>` it also re-matches every conflict row against a hunk dump cut
at newer tips (the output of `dump_hunks.py`): a row matches by its file and the first non-empty
line of the hunk's JC.net side, outer whitespace dropped and `](` parted as `] (` (the anchors table,
§(i)); a row whose anchor the new dump no
longer carries is marked settled; a hunk in the new dump that no row anchors is marked unread.
A key two hunks of one file share, in the new dump or in §(i), is refused by name, never
collapsed. The rerun changes the exit code only when a row's anchor is malformed or a key is
ambiguous.

usage: ledger_close.py [<ledger.md>] [--rerun <conflict-hunks.md>]
"""
import os
import re
import sys
from collections import Counter, OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
rerun = None
if "--rerun" in args:
    i = args.index("--rerun")
    rerun = args[i + 1]
    del args[i:i + 2]
ledger_path = args[0] if args else os.path.join(HERE, "parity-ledger-2026-10-02.md")
with open(ledger_path, encoding="utf-8") as f:
    ledger = f.read()

READINGS = ("same meaning", "host binding", "capability gap", "host-local")
MERGE_READINGS = ("lands merged", "host-bound inside", "contradiction")
STATUSES = ("queued", "owner", "pointer", "tail-likely")
DIRECTIONS = ("OCE → JC.net", "JC.net → OCE", "both")
SURFACES = OrderedDict([
    (".agent/directives/", "directives"), (".agent/hooks/", "hooks"),
    (".agent/practice-core/", "Practice Core"), (".agent/rules/", "rules"),
    (".agent/skills/", "skills"), (".agent/sub-agents/", "sub-agents"),
])


def cells(line):
    return [c.strip() for c in re.split(r"(?<!\\)\|", line.strip().strip("|"))]


def sections(text):
    """Map each lettered section to its lines; the header is everything before §(a)."""
    out = OrderedDict()
    key = "header"
    out[key] = []
    for line in text.splitlines():
        m = re.match(r"^## \((\w)\)", line)
        if m:
            key = m.group(1)
            out[key] = []
        out[key].append(line)
    return out


def table_rows(lines):
    rows = []
    for line in lines:
        if line.startswith("| ") and not line.startswith("| ---"):
            rows.append(cells(line))
    return rows


def surface_of(path):
    for prefix, name in SURFACES.items():
        if path.startswith(prefix):
            return name
    raise SystemExit(f"row names a path outside the six surfaces: {path}")


def unspan(cell):
    if cell.startswith("`` ") and cell.endswith(" ``"):
        cell = cell[3:-3]
    elif cell.startswith("`") and cell.endswith("`"):
        cell = cell[1:-1]
    return cell.replace("\\|", "|").strip()


def index_anchors(pairs, where):
    """Index (file, first line) -> hunk; refuse a key two hunks share.

    The rerun matches by (file, first non-empty line) alone, so a key two hunks of one file share
    cannot be matched by it. The simplest correct behaviour is to refuse such a key by name: the
    alternative, letting the later hunk overwrite the earlier, undercounts the dump and mis-marks
    rows silently, and matching by hunk order instead would guess. Neither the ledger nor the
    dumps it has been run against carry such a key.
    """
    out = OrderedDict()
    for (file, first), n in pairs:
        if (file, first) in out:
            raise SystemExit(f"ambiguous anchor in {where}: hunks {out[(file, first)]} and {n} of "
                             f"{file} share the first line {first!r}")
        out[(file, first)] = n
    return out


secs = sections(ledger)
missing = [k for k in "abcdefghi" if k not in secs]
if missing:
    raise SystemExit(f"ledger lacks sections {missing}")

# (a) the conflict hunks
a = [r for r in table_rows(secs["a"]) if len(r) == 5 and r[2] in READINGS]
a_keys = [(r[0].strip("`"), int(r[1])) for r in a]
if len(set(a_keys)) != len(a_keys):
    raise SystemExit("duplicate (file, hunk) rows in §(a)")
a_reading = Counter(r[2] for r in a)
a_surface = Counter(surface_of(k[0]) for k in a_keys)
a_files = len({k[0] for k in a_keys})

# (b) the clean merges
b = [r for r in table_rows(secs["b"]) if len(r) == 4 and r[1] in MERGE_READINGS]
b_reading = Counter(r[1] for r in b)

# (c) the one-sided files
c = [r for r in table_rows(secs["c"]) if len(r) == 5 and r[2] in READINGS]
c_reading = Counter(r[2] for r in c)
SIDES = {"JC.net": "JC.net", "JC.net (at the report)": "JC.net", "OCE": "OCE"}
unknown_sides = sorted({r[1] for r in c} - set(SIDES))
if unknown_sides:
    raise SystemExit(f"one-sided rows with a side outside the label set: {unknown_sides}")
c_side = Counter(SIDES[r[1]] for r in c)

# (d) the carries
d = [r for r in table_rows(secs["d"]) if len(r) == 7 and re.fullmatch(r"C\d+", r[0])]
bad = [r[0] for r in d if r[5] not in STATUSES or r[2] not in DIRECTIONS]
if bad:
    raise SystemExit(f"carries with a status or direction outside the sets: {bad}")
d_status = Counter(r[5] for r in d)
d_dir = Counter(r[2] for r in d)

# (e) the owner's rows, (f) the parameters, (g) the host-local rows, (h) the doubts, (i) the anchors
e = [r for r in table_rows(secs["e"]) if len(r) == 4 and re.fullmatch(r"O\d+", r[0])]
f_ = [r for r in table_rows(secs["f"]) if len(r) == 5 and re.fullmatch(r"P\d+", r[0])]
g = [r for r in table_rows(secs["g"]) if len(r) == 3 and r[0] != "file"]
h = [r for r in table_rows(secs["h"]) if len(r) == 4 and re.fullmatch(r"D\d+", r[0])]
i_ = [r for r in table_rows(secs["i"]) if len(r) == 4 and r[0] != "file"]
i_keys = [(r[0].strip("`"), int(r[1])) for r in i_]
duplicate_anchors = sorted(k for k, n in Counter(i_keys).items() if n > 1)
if duplicate_anchors:
    raise SystemExit(f"duplicate (file, hunk) anchor rows in §(i): {duplicate_anchors}")
if len(i_keys) != len(a_keys) or set(i_keys) != set(a_keys):
    raise SystemExit(f"anchors and rows disagree: {len(i_keys)} anchors for {len(a_keys)} rows; "
                     f"{sorted(set(i_keys) ^ set(a_keys))}")
ledger_anchors = index_anchors((((r[0].strip("`"), unspan(r[3])), int(r[1])) for r in i_), "§(i)")

# the host-local rows must be the host-local readings of (a) and (c)
expected_g = a_reading["host-local"] + c_reading["host-local"]
if len(g) != expected_g:
    raise SystemExit(f"§(g) holds {len(g)} rows; §(a) and §(c) read {expected_g} host-local")

total = len(a) + len(b) + len(c)
line = (
    f"Count line: {total} items read at the tips above: {len(a)} conflict hunks in {a_files} files "
    f"(same meaning {a_reading['same meaning']}, host binding {a_reading['host binding']}, "
    f"capability gap {a_reading['capability gap']}, host-local {a_reading['host-local']}; "
    f"directives {a_surface['directives']}, hooks {a_surface['hooks']}, Practice Core "
    f"{a_surface['Practice Core']}, rules {a_surface['rules']}, skills {a_surface['skills']}, "
    f"sub-agents {a_surface['sub-agents']}); {len(b)} clean merges (lands merged "
    f"{b_reading['lands merged']}, host-bound inside {b_reading['host-bound inside']}, contradiction "
    f"{b_reading['contradiction']}); {len(c)} one-sided files (same meaning {c_reading['same meaning']}, "
    f"host binding {c_reading['host binding']}, capability gap {c_reading['capability gap']}, host-local "
    f"{c_reading['host-local']}; JC.net-only {c_side['JC.net']}, OCE-only {c_side['OCE']}); "
    f"{len(d)} carries (queued {d_status['queued']}, owner {d_status['owner']}, pointer "
    f"{d_status['pointer']}, tail-likely {d_status['tail-likely']}; OCE → JC.net {d_dir['OCE → JC.net']}, "
    f"JC.net → OCE {d_dir['JC.net → OCE']}, both {d_dir['both']}); {len(e)} owner's rows; "
    f"{len(f_)} host-binding parameters; {len(g)} host-local rows; {len(h)} doubts; {len(i_)} anchors."
)

header_lines = [l for l in secs["header"] if l.startswith("Count line:")]
if len(header_lines) != 1:
    raise SystemExit(f"the header carries {len(header_lines)} count lines; exactly one is required")
header = header_lines[0]
print("recomputed:", line)
print("header:    ", header)
agree = " ".join(header.split()) == " ".join(line.split())
print("count line", "agrees" if agree else "DISAGREES")


def dump_anchors(path):
    with open(path, encoding="utf-8") as f:
        text = f.read()
    parts = re.split(r"^### (.+?) — hunk (\d+)\n", text, flags=re.M)
    pairs = []
    for k in range(1, len(parts), 3):
        file, n, body = parts[k], int(parts[k + 1]), parts[k + 2]
        hunk = body.split("```text\n", 1)[1].rsplit("\n```", 1)[0]
        lines = hunk.split("\n")
        jc = []
        for l in lines[1:]:
            if l.startswith("||||||| BASE") or l.startswith("======="):
                break
            jc.append(l)
        first = next((l for l in jc if l.strip()), None)
        if first is None:
            sep = next(j for j, l in enumerate(lines) if l.startswith("======="))
            first = next((l for l in lines[sep + 1:] if l.strip() and not l.startswith(">>>>>>> OCE")), "")
        pairs.append(((file, first.strip().replace("](", "] (")), n))
    return index_anchors(pairs, path)


if rerun:
    new = dump_anchors(rerun)
    open_rows, settled = [], []
    for (file, first), n in ledger_anchors.items():
        if (file, first) in new:
            open_rows.append((file, n, new[(file, first)]))
        else:
            settled.append((file, n))
    unread = [(file, n) for (file, first), n in new.items() if (file, first) not in ledger_anchors]
    print(f"rerun against {rerun}: {len(new)} hunks in {len({k[0] for k in new})} files; "
          f"{len(open_rows)} rows still open, {len(settled)} rows settled, {len(unread)} hunks unread")
    moved = [(f_, n, m) for f_, n, m in open_rows if n != m]
    if moved:
        print(f"  {len(moved)} open rows carry a new hunk index at the rerun:")
        for f_, n, m in moved:
            print(f"    {f_} hunk {n} -> {m}")
    if settled:
        print("  settled (the anchor is gone at the rerun):")
        for f_, n in settled:
            print(f"    {f_} hunk {n}")
    if unread:
        print("  unread (a hunk at the rerun that no row anchors):")
        for f_, n in unread:
            print(f"    {f_} hunk {n}")

sys.exit(0 if agree else 1)
