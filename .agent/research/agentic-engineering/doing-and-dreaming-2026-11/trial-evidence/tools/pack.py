"""Build the blind scoring pack: 30 final answers under shuffled labels, a key kept apart, and per-session opens. Reads traces; writes under <root>/score/."""
import json, os, random, sys, glob
root = sys.argv[1]; random.seed(20261112)
conds = {"C1": "traces2", "C2": "traces3C", "T": "traces3T"}
items = []; opens = []
for c, d in conds.items():
    for f in sorted(glob.glob(os.path.join(root, d, "*.jsonl"))):
        sid = os.path.basename(f)[:-6]; final = ""; reads = []; cost = None; first = ""
        for line in open(f, encoding="utf-8"):
            try: e = json.loads(line)
            except Exception: continue
            if e.get("type") == "assistant":
                for b in e.get("message", {}).get("content", []):
                    if b.get("type") == "tool_use" and b.get("name") == "Read":
                        reads.append(b["input"].get("file_path", ""))
                    if b.get("type") == "text" and not first: first = b["text"][:160]
            if e.get("type") == "result":
                final = e.get("result") or ""; cost = e.get("total_cost_usd")
        rules = sorted({os.path.basename(p)[:-3] for p in reads if "/.agent/rules/" in p})
        opens.append((c, sid, len(final), round(cost or 0, 2), rules, first.replace("\n", " ")))
        items.append((c, sid, final))
random.shuffle(items)
os.makedirs(os.path.join(root, "score"), exist_ok=True)
tasks = dict(l.rstrip("\n").split("|", 1) for l in open(os.path.join(root, "tools/tasks.txt")))
key = {}
with open(os.path.join(root, "score/answers.md"), "w", encoding="utf-8") as o:
    for i, (c, sid, final) in enumerate(items, 1):
        lab = f"A{i:02d}"; key[lab] = [c, sid]
        o.write(f"\n\n=================== ANSWER {lab} ===================\nTASK GIVEN: {tasks[sid[:2]]}\n\nANSWER:\n{final}\n")
json.dump(key, open(os.path.join(root, "key.json"), "w"), indent=1)
for r in opens: print(*r, sep=" | ")
print("total cost", round(sum(r[3] for r in opens if r[0] != "C1"), 2))
