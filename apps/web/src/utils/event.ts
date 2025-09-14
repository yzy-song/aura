/**
 * 创建一个防抖函数，该函数会从上一次被调用后，延迟 wait 毫秒后调用 func 方法。
 * @param func 要防抖的函数。
 * @param wait 需要延迟的毫秒数。
 * @param immediate 是否立即执行一次。
 * @returns 返回新的防抖函数。
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this
    if (timeout) clearTimeout(timeout)
    if (immediate) {
      const callNow = !timeout
      timeout = setTimeout(() => {
        timeout = null
      }, wait)
      if (callNow) func.apply(context, args)
    } else {
      timeout = setTimeout(() => {
        func.apply(context, args)
      }, wait)
    }
  }
}

/**
 * 创建一个节流函数，在 wait 秒内最多执行 func 一次的函数。
 * @param func 要节流的函数。
 * @param wait 需要节流的毫秒数。
 * @returns 返回新的节流函数。
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let previous = 0
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now()
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this
    if (now - previous > wait) {
      func.apply(context, args)
      previous = now
    }
  }
}
