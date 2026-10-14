import { Inbox, LoaderCircle, RefreshCw } from 'lucide-react'

const stateClassName = 'flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-gray-800 bg-gray-900/70 p-6 text-center'

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className={stateClassName} role="status">
      <LoaderCircle className="animate-spin text-green-500" size={24} />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}

export function EmptyState({ title = 'Nothing to show yet', message }) {
  return (
    <div className={stateClassName}>
      <Inbox className="text-gray-500" size={24} />
      <div>
        <p className="font-medium text-white">{title}</p>
        {message && <p className="mt-1 text-sm text-gray-400">{message}</p>}
      </div>
    </div>
  )
}

export function ErrorState({ message = 'Unable to load this data.', onRetry }) {
  return (
    <div className={stateClassName} role="alert">
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </div>
  )
}
