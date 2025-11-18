'use client'

import { useEffect, useState } from 'react'
import { toast, ToastItem } from '@/utils/toast'
import Toast from './Toast'

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const unsubscribe = toast.subscribe(setToasts)
    return unsubscribe
  }, [])

  return (
    <div className="toast-container">
      {toasts.map((toastItem, index) => (
        <div 
          key={toastItem.id} 
          style={{ 
            position: 'fixed', 
            top: `${1 + index * 5.5}rem`, 
            right: '1rem',
            zIndex: 50 
          }}
        >
          <Toast
            {...toastItem}
            onClose={toast.remove.bind(toast)}
          />
        </div>
      ))}
    </div>
  )
}

