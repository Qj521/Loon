// X/Twitter ad-filter prototype for Loon
// Conservative behavior: only edits parseable JSON and removes objects with explicit promotion markers.
// Not tested against live X responses; API structures change frequently.
function walk(value) {
  if (Array.isArray(value)) {
    return value
      .filter(item => !isPromoted(item))
      .map(item => walk(item));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      if (Array.isArray(child)) {
        out[key] = child.filter(item => !isPromoted(item)).map(item => walk(item));
      } else {
        out[key] = walk(child);
      }
    }
    return out;
  }
  return value;
}

function isPromoted(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  const trueFlags = ["isPromoted", "is_promoted", "promoted", "is_promoted_content"];
  for (const key of trueFlags) {
    if (obj[key] === true) return true;
  }
  const markerKeys = [
    "promotedMetadata", "promoted_metadata", "promotedTrend", "promoted_trend",
    "promotedContent", "promoted_content"
  ];
  for (const key of markerKeys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== false && obj[key] !== "") return true;
  }
  if (typeof obj.__typename === "string") {
    const t = obj.__typename.toLowerCase();
    if (t.includes("promotedtweet") || t.includes("promotedtrend") || t.includes("promotedaccount")) return true;
  }
  return false;
}

try {
  const body = $response.body;
  if (typeof body !== "string" || !body.length) {
    $done({});
  } else {
    const parsed = JSON.parse(body);
    $done({ body: JSON.stringify(walk(parsed)) });
  }
} catch (e) {
  // If the response is not JSON or parsing fails, leave it untouched.
  $done({});
}
