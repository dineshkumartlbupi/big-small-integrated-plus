const DEFAULT_UPI_LIST = ["demoalice@ybl","demobob@upi","example@ybl","mock@okicici"];
export function getUpiList() { return DEFAULT_UPI_LIST; }
export function pickRandomUpi() { const list = getUpiList(); return list[Math.floor(Math.random()*list.length)]; }
