interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error'
  title?: string
  children: React.ReactNode
}

const styles = {
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
  success: 'border-green-200 bg-green-50 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
  error: 'border-red-200 bg-red-50 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
}

const icons = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✓',
  error: '✗',
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  return (
    <div className={`border rounded-lg p-4 my-4 ${styles[type]}`}>
      <div className="flex gap-3">
        <div className="text-lg flex-shrink-0">{icons[type]}</div>
        <div className="flex-1">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
