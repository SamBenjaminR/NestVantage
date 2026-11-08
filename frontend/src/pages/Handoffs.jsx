
import { useEffect, useState } from 'react'
import api from '../api/axiosConfig'
import ReactMarkdown from 'react-markdown'
import { Handshake, RefreshCw, Phone, User, Clock } from 'lucide-react'

const API_URL = '/handoffs'

function Handoffs() {
  const [handoffs, setHandoffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversationMessages, setConversationMessages] = useState([])
  const [conversationLoading, setConversationLoading] = useState(false)

      const fetchHandoffs = async () => {
  try {
    setLoading(true)
    setError('')

    const response = await api.get(API_URL)
    setHandoffs(response.data)
  } catch (err) {
    setError('Unable to load handoff requests. Please try again.')
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchHandoffs()
  }, [])

  const handleAction = async (handoffId, action) => {
    try {
      setActionLoading(handoffId)
      setError('')

      await api.post(`${API_URL}/${handoffId}/${action}`)
      await fetchHandoffs()
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to update the handoff request.'
      )
    } finally {
      setActionLoading(null)
    }
  }
    const handleViewConversation = async (handoff) => {
    setSelectedConversation(handoff)
    setConversationMessages([])
    setConversationLoading(true)

    try {
    const response = await api.get(
      `${API_URL}/${handoff.handoffId}/messages`
    )
    setConversationMessages(response.data)
    } catch (error) {
    
        console.error('Failed to load conversation:', error)
            alert('Unable to load conversation history. Please try again.')
                setSelectedConversation(null)
                } finally {
        setConversationLoading(false)
        }
    }

  const getStatusStyle = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700',
      ASSIGNED: 'bg-blue-100 text-blue-700',
      ACCEPTED: 'bg-purple-100 text-purple-700',
      RESOLVED: 'bg-green-100 text-green-700',
    }

    return styles[status] || 'bg-slate-100 text-slate-700'
  }

  return (
    <main className="min-w-0 flex-1 bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Handshake size={28} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Sales Handoffs
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Manage buyer requests transferred from the AI assistant.
            </p>
          </div>

          <button
            onClick={fetchHandoffs}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Loading handoff requests...
          </div>
        ) : handoffs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <Handshake size={36} className="mx-auto text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">
              No handoff requests yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Buyer requests transferred from the AI assistant will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {handoffs.map((handoff) => (
              <div
                key={handoff.handoffId}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {handoff.buyerName}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Handoff #{handoff.handoffId}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(handoff.status)}`}
                  >
                    {handoff.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={16} />
                    {handoff.phone || 'Not available'}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={16} />
                    {handoff.executiveName}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock size={16} />
                    {handoff.requestedAt
                      ? new Date(handoff.requestedAt).toLocaleString()
                      : 'Time unavailable'}
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Buyer Details
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    <strong>Budget:</strong> {handoff.budget || 'Not specified'}
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    <strong>Requirements:</strong>{' '}
                    {handoff.requirements || 'Not provided yet'}
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    <strong>Language:</strong> {handoff.language || 'Not specified'}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-800">
                    AI Conversation Summary
                  </p>

                <div className="mt-2 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-black dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-bold [&_strong]:text-black dark:[&_strong]:text-white">
                <ReactMarkdown>
                    {handoff.summary || 'No summary available.'}
                 </ReactMarkdown>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">

                  {handoff.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleAction(handoff.handoffId, 'accept')}
                      disabled={actionLoading === handoff.handoffId}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {actionLoading === handoff.handoffId
                        ? 'Processing...'
                        : 'Accept Handoff'}
                    </button>
                  )}

                  {handoff.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleAction(handoff.handoffId, 'resolve')}
                      disabled={actionLoading === handoff.handoffId}
                      className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === handoff.handoffId
                        ? 'Processing...'
                        : 'Resolve Handoff'}
                    </button>
                  )}

                  {handoff.status === 'RESOLVED' && (
                    <span className="text-sm font-medium text-green-700">
                      This handoff has been resolved.
                    </span>
                  )}

                  {handoff.status === 'PENDING' && (
                    <span className="text-sm text-amber-700">
                      Awaiting sales executive assignment.
                    </span>
                  )}

                    <div className="w-full flex justify-end mt-4">
                  <button
                  onClick={() => handleViewConversation(handoff)}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  View Conversation
                        </button>
                    </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
        {selectedConversation && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
             <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl max-h-[85vh]">

            <div className="flex items-center justify-between border-b p-5">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Conversation with {selectedConversation.buyerName}
                </h2>
                <p className="text-sm text-slate-500">
                Handoff #{selectedConversation.handoffId}
                </p>
            </div>

        <button
          onClick={() => setSelectedConversation(null)}
          className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">

        {conversationLoading && (
          <p className="text-center text-slate-500">
            Loading conversation...
          </p>
        )}

        {!conversationLoading && conversationMessages.length === 0 && (
          <p className="text-center text-slate-500">
            No conversation messages found.
          </p>
        )}

        {!conversationLoading && conversationMessages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === 'BUYER'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 shadow-sm ${
                message.sender === 'BUYER'
                  ? 'bg-blue-600 text-white'
                  : 'border bg-white text-slate-800'
              }`}
            >
              <p className="mb-1 text-xs font-semibold opacity-75">
                {message.sender === 'BUYER' ? 'BUYER' : 'AI ASSISTANT'}
              </p>

              <p className="whitespace-pre-wrap text-sm">
                {message.message}
              </p>

              <p className="mt-2 text-right text-xs opacity-70">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}

      </div>

      <div className="border-t p-4 text-right">
        <button
          onClick={() => setSelectedConversation(null)}
          className="rounded-lg bg-slate-700 px-5 py-2 text-white hover:bg-slate-800"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
    </main>
  )
}

export default Handoffs
