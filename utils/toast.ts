interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
  duration?: number
}

type ToastListener = (toasts: ToastItem[]) => void

class ToastManager {
  private toasts: ToastItem[] = []
  private listeners: ToastListener[] = []

  subscribe(listener: ToastListener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  show(toast: Omit<ToastItem, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastItem = { id, ...toast }
    
    this.toasts.push(newToast)
    this.notify()

    return id
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  success(title: string, message?: string, duration?: number) {
    return this.show({ type: 'success', title, message, duration })
  }

  error(title: string, message?: string, duration?: number) {
    return this.show({ type: 'error', title, message, duration })
  }

  info(title: string, message?: string, duration?: number) {
    return this.show({ type: 'info', title, message, duration })
  }
}

export const toast = new ToastManager()
export type { ToastItem }

