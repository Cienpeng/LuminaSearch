/** Split a CSS selector list without treating commas inside :is(), :has(),
 * attribute selectors, or quoted strings as list separators. */
export function splitSelectorList(selectorList: string): string[] {
  const selectors: string[] = []
  let start = 0
  let roundDepth = 0
  let squareDepth = 0
  let quote = ''
  let escaped = false

  for (let index = 0; index < selectorList.length; index += 1) {
    const character = selectorList[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (character === '\\') {
      escaped = true
      continue
    }
    if (quote) {
      if (character === quote) quote = ''
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      continue
    }
    if (character === '(') roundDepth += 1
    else if (character === ')') roundDepth = Math.max(0, roundDepth - 1)
    else if (character === '[') squareDepth += 1
    else if (character === ']') squareDepth = Math.max(0, squareDepth - 1)
    else if (character === ',' && roundDepth === 0 && squareDepth === 0) {
      const selector = selectorList.slice(start, index).trim()
      if (selector) selectors.push(selector)
      start = index + 1
    }
  }

  const selector = selectorList.slice(start).trim()
  if (selector) selectors.push(selector)
  return selectors
}
