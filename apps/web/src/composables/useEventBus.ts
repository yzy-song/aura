import { ref } from 'vue'
// 定义一个类型，表示事件的回调函数
type EventListener<T> = (payload: T) => void

// 创建一个全局的、响应式的对象来存储所有的“收听者”
const listeners = ref<Record<string, EventListener<any>[]>>({})

/**
 * 一个迷你的、基于 Vue Composition API 的全局事件总线
 */
export function useEventBus() {
  /**
   * 注册一个事件监听器 (收听广播)
   * @param eventName - 要收听的事件名称 (频道)
   * @param callback - 收到消息时要执行的回调函数
   */
  function on<T>(eventName: string, callback: EventListener<T>) {
    if (!listeners.value[eventName]) {
      listeners.value[eventName] = []
    }
    listeners.value[eventName].push(callback)
  }

  /**
   * 发送一个事件 (广播消息)
   * @param eventName - 要广播的事件名称 (频道)
   * @param payload - 要发送的数据
   */
  function emit<T>(eventName: string, payload: T) {
    if (listeners.value[eventName]) {
      listeners.value[eventName].forEach((callback) => callback(payload))
    }
  }

  return { on, emit }
}
