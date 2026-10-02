#!/usr/bin/env python3
"""Assemble the Practice inventory report: the generated inventory with the register's closure
section spliced in before the rows table.  usage: assemble_report.py <inventory> <closure> <out>"""
import sys

inv, clo, out = sys.argv[1:4]
text = open(inv, encoding="utf-8").read()
closure = open(clo, encoding="utf-8").read().rstrip("\n") + "\n\n"
marker = "## Rows\n"
assert text.count(marker) == 1
head, tail = text.split(marker)
open(out, "w", encoding="utf-8").write(head + closure + marker + tail)
print(f"assembled {out}: {len((head + closure + marker + tail).splitlines())} lines")
