export function publicPath(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  const trimmed = path.replace(/^\//, '')
  return `${base}${trimmed}`
}

export function flagSrc(code: string) {
  return publicPath(`flags/${code.toLowerCase()}.png`)
}
