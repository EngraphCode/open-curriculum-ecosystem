#!/usr/bin/env bash
# Run each task twice in the clone: arm A plain, arm B opened with the start-right skill.
set -u
ROOT="$1"; CLONE="$ROOT/clone"; OUT="$ROOT/traces"
while IFS='|' read -r id task; do
  for arm in A B; do
    if [[ "$arm" = "B" ]]; then prompt="/oak-start-right-quick $task"; else prompt="$task"; fi
    ( cd "$CLONE" && timeout 900 claude -p "$prompt" --model opus --effort medium \
        --output-format stream-json --verbose --no-session-persistence \
        --tools Read Grep Glob Skill --allowedTools Read Grep Glob Skill \
        --max-budget-usd 6 > "$OUT/$id-$arm.jsonl" 2> "$OUT/$id-$arm.err"; echo "$id-$arm exit=$?" >> "$OUT/status.txt" ) &
  done
  wait
done < "$ROOT/tools/tasks.txt"
echo done >> "$OUT/status.txt"
