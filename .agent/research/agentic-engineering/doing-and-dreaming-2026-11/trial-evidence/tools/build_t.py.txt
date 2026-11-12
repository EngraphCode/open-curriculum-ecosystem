"""Replace the 28 habit rules' one-line adapters in the treatment clone with the instruction text. Writes only under cloneT/.claude/rules/."""
import csv, os, re, sys
root, sort = sys.argv[1], sys.argv[2]
names = [r["name"] for r in csv.DictReader(open(sort), delimiter="\t") if r["kind"] == "H"]
tot = 0
for n in names:
    src = open(os.path.join(root, "cloneT/.agent/rules", n + ".md"), encoding="utf-8").read()
    fm = src.split("---")[1]
    m = re.search(r"^description:\s*(.*?)(?=^\w[\w-]*:|\Z)", fm, re.S | re.M)
    d = " ".join(m.group(1).split()).strip("'\"")
    if d.startswith(">-") or d.startswith(">") or d.startswith("|"): d = d.lstrip(">|-").strip()
    out = f"# {n}\n\n{d}\n\nThe record behind this instruction is `.agent/rules/{n}.md`.\n"
    open(os.path.join(root, "cloneT/.claude/rules", n + ".md"), "w", encoding="utf-8").write(out)
    tot += len(d); print(n, len(d), "|", d[:90])
print(len(names), "rules;", tot, "chars of instruction")
