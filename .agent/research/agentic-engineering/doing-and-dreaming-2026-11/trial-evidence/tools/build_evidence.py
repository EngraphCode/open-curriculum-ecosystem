"""Copy the two trials' scratch evidence into the repository, scrubbed of machine-local paths and session identifiers."""
import json, os, re, sys, glob, shutil
S, OUT = sys.argv[1], sys.argv[2]
def scrub(t):
    tmp = "/" + "tmp" + r"/[\w.-]+/[^\s\"']*?/scratchpad"
    t = re.sub(tmp + r"/delivery-trial/(cloneT|clone)/", "", t)
    t = re.sub(tmp + r"/delivery-trial", "<trial-root>", t)
    t = re.sub(tmp + r"[^\s\"']*", "<scratch>", t)
    t = re.sub("/" + "home" + r"/\w+/open-curriculum-ecosystem/?", "<repo>/", t)
    t = re.sub("/" + "home" + r"/\w+\b", "<home>", t); t = re.sub("/" + r"root\b", "<home>", t)
    t = re.sub(r"session_[0-9A-Za-z]{10,}", "<session-id>", t)
    t = re.sub(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", "<uuid>", t)
    return t
os.makedirs(OUT + "/habit-text-pack", exist_ok=True); os.makedirs(OUT + "/tools", exist_ok=True)
for src, dst in [("score/answers.md", "habit-text-pack/answers.txt"), ("score/instructions.md", "habit-text-pack/instructions.txt"),
                 ("score/applicable.md", "habit-text-pack/applicable.txt"), ("score/marks.tsv", "habit-text-pack/marks.tsv")]:
    open(f"{OUT}/{dst}", "w", encoding="utf-8").write(scrub(open(f"{S}/{src}", encoding="utf-8").read()))
json.dump(json.load(open(S + "/key.json")), open(OUT + "/habit-text-pack/key.json", "w"), indent=2)
for f in sorted(glob.glob(S + "/tools/*")):
    open(f"{OUT}/tools/{os.path.basename(f)}", "w", encoding="utf-8").write(scrub(open(f, encoding="utf-8").read()))
runs = {"delivery-run-1": "traces", "delivery-run-2-control-1": "traces2", "habit-text-control-2": "traces3C", "habit-text-treatment": "traces3T"}
for name, d in runs.items():
    rows = []
    for f in sorted(glob.glob(f"{S}/{d}/*.jsonl")):
        sid = os.path.basename(f)[:-6]; r = {"session": sid, "model": None, "first_call_input_tokens": None, "reads": [], "skills": [], "greps": 0, "globs": 0}
        for line in open(f, encoding="utf-8"):
            try: e = json.loads(line)
            except Exception: continue
            t = e.get("type")
            if t == "system" and e.get("subtype") == "init": r["model"] = e.get("model")
            if t == "assistant":
                u = e.get("message", {}).get("usage") or {}
                if r["first_call_input_tokens"] is None and u:
                    r["first_call_input_tokens"] = (u.get("input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0) + (u.get("cache_read_input_tokens") or 0)
                for c in e.get("message", {}).get("content", []):
                    if c.get("type") == "tool_use":
                        n, i = c.get("name"), c.get("input", {})
                        if n == "Read": r["reads"].append(scrub(i.get("file_path", "")))
                        elif n == "Skill": r["skills"].append(i.get("skill"))
                        elif n == "Grep": r["greps"] += 1
                        elif n == "Glob": r["globs"] += 1
            if t == "result":
                r.update(cost_usd=e.get("total_cost_usd"), turns=e.get("num_turns"), duration_ms=e.get("duration_ms"), end=e.get("subtype"), final_answer=scrub(e.get("result") or ""))
        rows.append(r)
    json.dump(rows, open(f"{OUT}/sessions-{name}.json", "w"), indent=2, ensure_ascii=False)
    print(name, len(rows), [x["first_call_input_tokens"] for x in rows][:3])
