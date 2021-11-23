const { createHash } = require('crypto');

export function generateHash(char) {
  const hash = createHash('sha256');
  hash.update(char);
  return hash.digest('hex');
}

export function generateSign(query, appKey, salt, curtime, secret) {
  return generateHash(appKey + truncate(query) + salt + curtime + secret);
}

function truncate(q) {
  var len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}
