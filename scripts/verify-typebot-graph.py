#!/usr/bin/env python3
import json
import sys

if len(sys.argv) != 2:
    raise SystemExit("usage: verify-typebot-graph.py <typebot-json>")

payload = json.load(open(sys.argv[1], encoding="utf-8"))
typebot = payload.get("typebot", payload)

groups = typebot.get("groups") or []
edges_list = typebot.get("edges") or []
events = typebot.get("events") or []

groups_by_id = {}
blocks = {}
items = {}
problems = []

for group in groups:
    gid = group.get("id")
    if not gid:
        problems.append("group missing id")
        continue
    if gid in groups_by_id:
        problems.append(f"duplicate group id: {gid}")
    groups_by_id[gid] = group
    for block in group.get("blocks") or []:
        bid = block.get("id")
        if not bid:
            problems.append(f"group {gid} has block without id")
            continue
        if bid in blocks:
            problems.append(f"duplicate block id: {bid}")
        blocks[bid] = (gid, block)
        for item in block.get("items") or []:
            iid = item.get("id")
            if iid:
                key = (bid, iid)
                if key in items:
                    problems.append(f"duplicate item id on block {bid}: {iid}")
                items[key] = item

edges = {}
for edge in edges_list:
    eid = edge.get("id")
    if not eid:
        problems.append("edge missing id")
        continue
    if eid in edges:
        problems.append(f"duplicate edge id: {eid}")
    edges[eid] = edge

for bid, (gid, block) in blocks.items():
    outgoing = block.get("outgoingEdgeId")
    if outgoing:
        edge = edges.get(outgoing)
        if not edge:
            problems.append(f"block {bid} references missing edge {outgoing}")
        elif edge.get("from", {}).get("blockId") != bid:
            problems.append(f"block {bid} outgoing edge {outgoing} has wrong source")
    for item in block.get("items") or []:
        iid = item.get("id")
        outgoing = item.get("outgoingEdgeId")
        if outgoing:
            edge = edges.get(outgoing)
            if not edge:
                problems.append(f"item {bid}/{iid} references missing edge {outgoing}")
            else:
                source = edge.get("from", {})
                if source.get("blockId") != bid or source.get("itemId") != iid:
                    problems.append(f"item {bid}/{iid} outgoing edge {outgoing} has wrong source")

event_ids = {event.get("id") for event in events if event.get("id")}
for eid, edge in edges.items():
    source = edge.get("from") or {}
    target = edge.get("to") or {}
    source_block = source.get("blockId")
    source_event = source.get("eventId")
    if source_block:
        if source_block not in blocks:
            problems.append(f"edge {eid} source block missing: {source_block}")
        source_item = source.get("itemId")
        if source_item and (source_block, source_item) not in items:
            problems.append(f"edge {eid} source item missing: {source_block}/{source_item}")
    elif source_event and source_event not in event_ids:
        problems.append(f"edge {eid} source event missing: {source_event}")
    elif not source_event:
        problems.append(f"edge {eid} has no source block/event")

    target_group = target.get("groupId")
    target_block = target.get("blockId")
    if target_group not in groups_by_id:
        problems.append(f"edge {eid} target group missing: {target_group}")
    if target_block:
        block_info = blocks.get(target_block)
        if not block_info:
            problems.append(f"edge {eid} target block missing: {target_block}")
        elif block_info[0] != target_group:
            problems.append(
                f"edge {eid} target block {target_block} is not in target group {target_group}"
            )

required_groups = {
    "g-assistant-call-prepare",
    "g-clear-user-input",
    "g-assistant-response-guard",
    "g-assistant-failure-router",
    "g-guest-email-guard",
    "g-guest-email-result",
    "g-internal-email-guard",
    "g-internal-email-result",
    "g-email-delivery-failure",
}
missing_required = sorted(required_groups - set(groups_by_id))
if missing_required:
    problems.append("required groups missing: " + ", ".join(missing_required))

forbidden_groups = {
    "w6w5ps6qwyrqjc2o50m64nze",  # legacy random ticket generator
    "l2249u9bdj7j1v772h0o526d",  # legacy yes/no branch
}
present_forbidden = sorted(forbidden_groups & set(groups_by_id))
if present_forbidden:
    problems.append("obsolete groups still present: " + ", ".join(present_forbidden))

required_edges = {
    "e-name-tr-to-prepare",
    "e-name-ru-to-prepare",
    "e-name-zh-to-prepare",
    "e-name-en-to-prepare",
    "e-user-message-to-prepare",
    "e-prepare-to-assistant",
    "e-assistant-to-response-guard",
    "e-response-guard-success",
    "e-response-guard-fail",
    "e-reply-to-handoff-router",
    "e-handoff-default-to-clear-input",
    "e-clear-input-to-user-input",
    "e-email-input-to-guest-guard",
    "e-guest-mail-to-result",
    "e-internal-mail-to-result",
    "e-email-failure-retry",
}
missing_edges = sorted(required_edges - set(edges))
if missing_edges:
    problems.append("required edges missing: " + ", ".join(missing_edges))

if problems:
    for problem in problems:
        print(f"FAIL: {problem}", file=sys.stderr)
    raise SystemExit(1)

print(
    f"PASS: Typebot graph integrity ({len(groups_by_id)} groups, "
    f"{len(blocks)} blocks, {len(edges)} edges)"
)
