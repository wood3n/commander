import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 });
export function setCache(appKey: string, secret: string) {
  return cache.mset([
    {
      key: 'appKey',
      val: appKey,
    },
    {
      key: 'secret',
      val: secret,
    },
  ]);
}

export function getCache(key: string) {
  return cache.get(key);
}

export function clearCache() {
  cache.del(['appKey', 'secret']);
}
