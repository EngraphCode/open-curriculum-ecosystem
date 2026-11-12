#!/usr/bin/env bash
# As run.sh, with each session's standard input closed so the task file cannot leak into a prompt.
set -u
ROOT="$1"; CLONE="$ROOT/clone"; OUT="$ROOT/traces2"
while IFS='|' read -r id task <&3; do
  for arm in A B; do
    if [ "$arm" = "B" ]; then prompt="/oak-start-right-quick $task"; else prompt="$task"; fi
    ( cd "$CLONE" && timeout 900 claude -p "$prompt" --model opus --effort medium \
        --output-format stream-json --verbose --no-session-persistence \
        --tools Read Grep Glob Skill --allowedTools Read Grep Glob Skill \
        --max-budget-usd 6 < /dev/null > "$OUT/$id-$arm.jsonl" 2> "$OUT/$id-$arm.err"; echo "$id-$arm exit=$?" >> "$OUT/status.txt" ) &
  done
  wait
done 3< "$ROOT/tools/tasks.txt"
echo done >> "$OUT/status.txt"
