import NodeCache from 'node-cache';
const myCache = new NodeCache({ stdTTL: 10 });

export { myCache };
