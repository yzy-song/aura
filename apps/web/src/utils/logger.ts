// src/utils/logger.ts
import type { App } from 'vue'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  persistErrors?: boolean // 是否持久化错误日志（如发送到服务器）
  maxPersistLevel?: LogLevel // 持久化日志的最高级别
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLogLevel = (import.meta.env.VITE_LOG_LEVEL || 'info') as LogLevel
const enableLog = import.meta.env.VITE_ENABLE_LOG !== 'false' // 默认启用
const isDev = import.meta.env.DEV

class Logger {
  private readonly options: LoggerOptions

  constructor(options: LoggerOptions = {}) {
    this.options = {
      persistErrors: true,
      maxPersistLevel: 'error',
      ...options,
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!enableLog) return false
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel]
  }

  private formatMessage(level: LogLevel, ...args: unknown[]): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    return `${prefix}: ${args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg))
      .join(' ')}`
  }

  private persistLog(message: string, level: LogLevel) {
    if (
      this.options.persistErrors &&
      LOG_LEVELS[level] >= LOG_LEVELS[this.options.maxPersistLevel!]
    ) {
      // 实际项目中可替换为API调用或IndexedDB存储
      console.log('Persisting log:', message)
    }
  }

  debug(...args: unknown[]) {
    if (this.shouldLog('debug') && isDev) {
      const message = this.formatMessage('debug', ...args)
      console.debug(message)
      this.persistLog(message, 'debug')
    }
  }

  log(...args: unknown[]) {
    this.info(...args) // 直接调用现有的 info 方法
  }

  info(...args: unknown[]) {
    if (this.shouldLog('info')) {
      const message = this.formatMessage('info', ...args)
      console.info(message)
      this.persistLog(message, 'info')
    }
  }

  warn(...args: unknown[]) {
    if (this.shouldLog('warn')) {
      const message = this.formatMessage('warn', ...args)
      console.warn(message)
      this.persistLog(message, 'warn')
    }
  }

  error(...args: unknown[]) {
    if (this.shouldLog('error')) {
      const message = this.formatMessage('error', ...args)
      console.error(message)
      this.persistLog(message, 'error')

      // 生产环境可自动上报错误
      if (!isDev && this.options.persistErrors) {
        this.sendErrorToServer(args)
      }
    }
  }

  private sendErrorToServer(args: unknown[]) {
    // 实际项目中使用Sentry/LogRocket等工具
    console.warn('Error would be sent to server:', args)
  }
}

// 默认配置实例
export const logger = new Logger()

// Vue插件安装方式（可选）
export const installLogger = (app: App, options?: LoggerOptions) => {
  app.config.globalProperties.$logger = new Logger(options)
  app.provide('logger', app.config.globalProperties.$logger)
}
