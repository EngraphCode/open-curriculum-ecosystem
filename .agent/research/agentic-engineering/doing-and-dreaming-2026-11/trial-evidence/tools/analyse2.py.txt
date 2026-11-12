"""Summarise each stream-json trace: model, cost, turns, tools used, and which files were opened. Reads only."""
import json, sys, os, glob, re, collections
root = sys.argv[1]; clone = os.path.realpath(os.path.join(root, "clone")) + "/"
def cls(p):
    p = p.replace(clone, "")
    if p.startswith(".agent/rules/"): return "rule-body"
    if p.startswith(".claude/rules/"): return "rule-adapter"
    if p.startswith(".agent/directives/"): return "directive"
    if "/skills/" in p: return "skill-file"
    if p.startswith(".agent/memory/"): return "memory"
    if p.startswith(".agent/practice-core/"): return "practice-core"
    if p.startswith(".agent/plans/"): return "plan"
    if p.startswith(".agent/"): return "agent-other"
    if p in ("CLAUDE.md", "AGENTS.md"): return "entry"
    return "product"
rows = []
for f in sorted(glob.glob(os.path.join(root, "traces", "*.jsonl"))):
    name = os.path.basename(f)[:-6]
    model = cost = turns = dur = None; reads = []; skills = []; greps = 0; globs = 0; final = ""; err = None
    for line in open(f, encoding="utf-8"):
        try: e = json.loads(line)
        except Exception: continue
        t = e.get("type")
        if t == "system" and e.get("subtype") == "init":
            model = e.get("model")
        if t == "assistant":
            for c in e.get("message", {}).get("content", []):
                if c.get("type") == "tool_use":
                    n = c.get("name"); i = c.get("input", {})
                    if n == "Read": reads.append(i.get("file_path", "").replace(clone, ""))
                    elif n == "Skill": skills.append(i.get("skill"))
                    elif n == "Grep": greps += 1
                    elif n == "Glob": globs += 1
        if t == "result":
            cost = e.get("total_cost_usd"); turns = e.get("num_turns"); dur = e.get("duration_ms"); final = e.get("result") or ""; err = e.get("subtype")
    kinds = collections.Counter(cls(p) for p in reads)
    rows.append((name, model, cost, turns, dur, len(reads), dict(kinds), skills, greps, globs, err, reads, final))
for r in rows:
    print(f"{r[0]} model={r[1]} cost={r[2]} turns={r[3]} secs={round((r[4] or 0)/1000)} end={r[10]} reads={r[5]} grep={r[8]} glob={r[9]} skills={r[7]}")
    print("   kinds:", r[6])
    rb = sorted(set(p for p in r[11] if p.startswith(".agent/rules/") or p.startswith(".claude/rules/")))
    print("   rules opened:", [os.path.basename(p) for p in rb])
    dv = sorted(set(p for p in r[11] if p.startswith(".agent/directives/") or "start-right" in p or p.endswith("AGENT.md")))
    print("   directives/start-right:", dv)
print("TOTAL cost", round(sum((r[2] or 0) for r in rows), 2))
json.dump([{"run": r[0], "reads": r[11], "skills": r[7], "final": r[12]} for r in rows], open(os.path.join(root, "summary.json"), "w"), indent=1)
