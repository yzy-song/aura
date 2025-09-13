import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 将日期格式化为 'yyyy-MM-dd HH:mm'
 * @param date - 日期对象、时间戳或 ISO 字符串
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(date: Date | number | string): string {
  if (!date) return ''
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN })
}

/**
 * 将日期格式化为 'yyyy-MM-dd'
 * @param date - 日期对象、时间戳或 ISO 字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string): string {
  if (!date) return ''
  return format(new Date(date), 'yyyy-MM-dd', { locale: zhCN })
}

/**
 * 将日期格式化为相对时间，例如 "3天前"
 * @param date - 日期对象、时间戳或 ISO 字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: Date | number | string): string {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN })
}
