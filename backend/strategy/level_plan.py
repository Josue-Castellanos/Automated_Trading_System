from dataclasses import dataclass
from typing import List, Tuple, Literal, Dict
import math

LevelType = Literal["OI", "SIG", "EM"]

@dataclass(frozen=True)
class Level:
    level: float
    type: LevelType
    label: str  # e.g., "OI 645", "PP Weekly", "Fib 61.8", "EM Up"

def _to_float(x) -> float:
    return float(x) if x is not None and not (isinstance(x, float) and math.isnan(x)) else None

def _clean_levels(vals, label_fn, type_: LevelType) -> List[Level]:
    res = []
    for v in vals:
        if v is None:
            continue
        f = _to_float(v)
        if f is None or math.isnan(f):
            continue
        res.append(Level(level=round(f, 2), type=type_, label=label_fn(f)))
    return res

def _cluster_levels(levels: List[Level], tol: float) -> List[Level]:
    """
    Merge levels that are within `tol` dollars of each other.
    For OI clusters, combine labels; for SIG, keep earliest label but average level.
    """
    if not levels:
        return []
    levels_sorted = sorted(levels, key=lambda x: x.level)
    out = []
    cluster: List[Level] = [levels_sorted[0]]

    def flush(cluster):
        if not cluster:
            return None
        lvl_vals = [l.level for l in cluster]
        avg = round(sum(lvl_vals)/len(lvl_vals), 2)
        types = {l.type for l in cluster}
        # If any SIG present, treat as SIG cluster; else OI
        t = "SIG" if "SIG" in types else "OI"
        if t == "OI":
            lbl = "OI cluster: " + ", ".join(sorted({l.label for l in cluster}))
        else:
            # Keep first SIG label; append count if many
            sig_labels = [l.label for l in cluster if l.type == "SIG"]
            if len(sig_labels) > 1:
                lbl = f"{sig_labels[0]} (+{len(sig_labels)-1} more)"
            else:
                lbl = sig_labels[0] if sig_labels else cluster[0].label
        return Level(level=avg, type=t, label=lbl)

    for l in levels_sorted[1:]:
        if abs(l.level - cluster[-1].level) <= tol:
            cluster.append(l)
        else:
            merged = flush(cluster)
            if merged:
                out.append(merged)
            cluster = [l]
    merged = flush(cluster)
    if merged:
        out.append(merged)
    return out

def build_level_plan(
    open_price: float,
    oi_calls_above: List[float],
    oi_puts_below: List[float],
    significant_levels: List[Tuple[float, str]],  # (price, label)
    expected_move_up: float,
    expected_move_down: float,
    *,
    cluster_tol: float = 0.25,
    trim_step_oi: float = 0.15,      # 15% per OI checkpoint
    trim_step_sig: float = 0.20,     # 20% per SIG checkpoint
    core_floor: float = 0.30,        # keep at least 30% until EM
    stop_pad: float = 0.15           # how far beyond broken level to trail
) -> Dict[str, List[Dict]]:
    """
    Returns two ordered plans: 'up' and 'down'.
    Each step includes: level, type, action, size_to_close, new_stop.
    """

    open_price = round(_to_float(open_price), 2)

    # Normalize & label levels
    oi_up = _clean_levels(oi_calls_above, lambda f: f"OI {int(round(f))}", "OI")
    oi_dn = _clean_levels(oi_puts_below,  lambda f: f"OI {int(round(f))}", "OI")
    sig = _clean_levels([p for p,_ in significant_levels], lambda f: dict(significant_levels)[f], "SIG")

    # EM levels
    em_up = [Level(level=round(_to_float(expected_move_up), 2), type="EM", label="+EM Up")]
    em_dn = [Level(level=round(_to_float(expected_move_down), 2), type="EM", label="-EM Down")]

    # Split SIG into up/down relative to open
    sig_up = [l for l in sig if l.level > open_price]
    sig_dn = [l for l in sig if l.level < open_price]

    # Build raw ladders
    up_raw = [l for l in oi_up if l.level > open_price] + sig_up + em_up
    dn_raw = [l for l in oi_dn if l.level < open_price] + sig_dn + em_dn

    # Cluster nearby levels
    up_clustered = _cluster_levels(up_raw, cluster_tol)
    dn_clustered = _cluster_levels(dn_raw, cluster_tol)

    # Sort
    up_levels = sorted(up_clustered, key=lambda x: x.level)
    dn_levels = sorted(dn_clustered, key=lambda x: x.level, reverse=True)

    # Build execution steps
    def make_plan(levels: List[Level], direction: Literal["up","down"]) -> List[Dict]:
        plan = []
        remaining = 1.00  # start with 100%
        have_trailing = False
        last_broken_level = open_price

        for lv in levels:
            if lv.type == "EM":
                size_to_close = remaining
                action = "Exit all at EM"
                new_stop = None
                remaining = 0.0
            elif lv.type == "OI":
                size_to_close = min(trim_step_oi, max(0.0, remaining - core_floor))
                if size_to_close <= 0:
                    # already at core only
                    size_to_close = 0.0
                    action = "Hold core through OI"
                    new_stop = round((last_broken_level + stop_pad) if direction=="down" else (last_broken_level - stop_pad), 2) if have_trailing else None
                else:
                    action = "Trim at OI"
                    new_stop = None
            else:  # SIG
                size_to_close = min(trim_step_sig, max(0.0, remaining - core_floor))
                action = "Trim at SIG; tighten stop"
                # start or step the trailing stop just beyond this level
                have_trailing = True
                last_broken_level = lv.level
                if direction == "up":
                    new_stop = round(lv.level - stop_pad, 2)
                else:
                    new_stop = round(lv.level + stop_pad, 2)

            # Update remaining
            remaining = round(remaining - size_to_close, 4)

            plan.append({
                "level": lv.level,
                "type": lv.type,
                "label": lv.label,
                "action": action,
                "size_to_close": round(size_to_close, 4),
                "remaining_after": round(remaining, 4),
                "new_stop": new_stop,
            })
        return plan

    return {
        "open_price": open_price,
        "up": make_plan(up_levels, "up"),
        "down": make_plan(dn_levels, "down"),
    }
