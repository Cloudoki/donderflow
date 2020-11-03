// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isObj(obj: any) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}
