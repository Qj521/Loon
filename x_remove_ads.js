// X/Twitter promoted timeline entry filter for Loon.
// Prototype: X changes its GraphQL response schema frequently.
// It only edits valid JSON responses and otherwise leaves the response untouched.

const PROMOTION_KEYS = new Set([
  "promotedMetadata",
  "promoted_metadata",
  "promotedTweet",
  "promoted_tweet",
  "promotedContent",
  "promoted_content",
  "promotedTrend",
  "promoted_trend",
  "promotedAccount",
  "promoted_account"
]);

function hasPromotionMarker(node, depth = 0) {
  if (!node || typeof node !== "object" || depth > 12) return false;

  if (node.isPromoted === true ||
      node.is_promoted === true ||
      node.is_promoted_content === true ||
      node.promoted === true) return true;

  if (typeof node.__typename === "string" &&
      /promoted(tweet|trend|account|content)/i.test(node.__typename)) return true;

  for (const [key, value] of Object.entries(node)) {
    if (PROMOTION_KEYS.has(key) && value !== null && value !== false &&
        value !== "" && !(Array.isArray(value) && value.length === 0)) {
      return true;
    }
  }
  return false;
}

// Detect a marker anywhere inside a candidate timeline entry.
function containsPromotion(node, depth = 0) {
  if (!node || typeof node !== "object" || depth > 16) return false;
  if (hasPromotionMarker(node)) return true;
  for (const value of Object.values(node)) {
    if (value && typeof value === "object" && containsPromotion(value, depth + 1)) {
      return true;
    }
  }
  return false;
}

function clean(node, parentKey = "", depth = 0) {
  if (depth > 40 || node === null || typeof node !== "object") return node;

  if (Array.isArray(node)) {
    // Only filter entries in arrays that look like X timeline entry collections.
    const isTimelineArray = /entries|items|addentries|replaceentry/i.test(parentKey);
    const kept = isTimelineArray
      ? node.filter(item => !containsPromotion(item))
      : node;
    return kept.map(item => clean(item, parentKey, depth + 1));
  }

  const result = {};
  for (const [key, value] of Object.entries(node)) {
    // Some response variants store promoted timeline entries under an entry wrapper.
    if (/^entry$/i.test(key) && value && typeof value === "object" && containsPromotion(value)) {
      continue;
    }
    result[key] = clean(value, key, depth + 1);
  }
  return result;
}

try {
  if (typeof $response.body !== "string" || !$response.body.length) {
    $done({});
  } else {
    const data = JSON.parse($response.body);
    const filtered = clean(data);
    $done({ body: JSON.stringify(filtered) });
  }
} catch (_) {
  // Preserve the original response if it is not valid JSON.
  $done({});
}
