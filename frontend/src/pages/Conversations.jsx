
import { useState } from 'react'
import api from '../api/axiosConfig'
import {
  Bot,
  User,
  Send,
  Languages,
  Phone,
  Building2,
  MessageCircle,
  CalendarDays,
  Sparkles,
  Headphones,
} from 'lucide-react'

const greetings = {
  English:
    "Hello! Welcome to NestVantage. I'm your property assistant. I can help you explore our 2 BHK and 3 BHK apartments, understand the available price range, and arrange a site visit. What would you like to know?",
  Hindi:
    'नमस्ते! NestVantage में आपका स्वागत है। मैं आपकी प्रॉपर्टी असिस्टेंट हूँ। मैं आपको 2 BHK और 3 BHK अपार्टमेंट और उपलब्ध कीमतों की जानकारी दे सकती हूँ। आप क्या जानना चाहेंगे?',
  Gujarati:
    'નમસ્તે! NestVantage માં આપનું સ્વાગત છે. હું તમારી પ્રોપર્ટી સહાયક છું. હું તમને 2 BHK અને 3 BHK એપાર્ટમેન્ટ અને ઉપલબ્ધ કિંમતની માહિતી આપી શકું છું. તમે શું જાણવા માંગો છો?',
}

const quickQuestions = [
  'What apartment types are available?',
  'What is the price range?',
  'I want to book a site visit',
]

function Conversations() {
  const [language, setLanguage] = useState('English')
  const [message, setMessage] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [budget, setBudget] = useState('')
  const [requirements, setRequirements] = useState('')
  const [handoff, setHandoff] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [phone, setPhone] = useState('')
  const [isHandoffLoading, setIsHandoffLoading] = useState(false)
  const [handoffStatus, setHandoffStatus] = useState('')
  const [handoffExecutive, setHandoffExecutive] = useState('')
  

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: greetings.English,
    },
  ])

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage)
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: greetings[nextLanguage],
      },
    ])
  }

  async function sendMessage(textToSend = message) {
    const cleanMessage = textToSend.trim()
    if (!cleanMessage || isLoading) return

    const buyerMessage = {
      id: Date.now(),
      sender: 'buyer',
      text: cleanMessage,
    }

    // Include recent turns so Gemini can understand follow-up questions.
    const recentConversation = messages
      .slice(-8)
      .map((item) => `${item.sender === 'buyer' ? 'Buyer' : 'Assistant'}: ${item.text}`)
      .join('\\n')

    setMessages((current) => [...current, buyerMessage])
    setMessage('')
    setIsLoading(true)

    try {
      const response = await api.post('/ai/chat', {
        message: cleanMessage,
        conversationId,
        buyerName: buyerName.trim() || null,
        budget: budget || null,
        requirements: requirements.trim() || null,
        language,
        context: `Continue this conversation using only the approved project facts. If a detail is not in the approved facts, say that the sales team must confirm it.

        Recent conversation:
        ${recentConversation}`,
      })

      setConversationId(response.data.conversationId)

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.reply,
      }

      setMessages((current) => [...current, botMessage])
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        'I could not connect to the AI assistant right now. Please try again.'

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: errorMessage,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

      
async function requestHuman() {
  if (!conversationId) {
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Please send at least one message before requesting a sales executive.',
      },
    ])
    return
  }

  if (!buyerName.trim()) {
    alert('Please enter your name in Buyer details.')
    return
  }

  if (!/^[0-9]{10}$/.test(phone.trim())) {
    alert('Please enter a valid 10-digit phone number.')
    return
  }

  if (isHandoffLoading || handoff) return

  setIsHandoffLoading(true)

  setMessages((current) => [
    ...current,
    {
      id: Date.now(),
      sender: 'buyer',
      text: 'I would like to speak to a human sales executive.',
    },
  ])

  try {
    const response = await api.post('/handoffs', {
      conversationId,
          phone: phone.trim(),
        })

    const { status, executiveName } = response.data

    setHandoff(true)
    setHandoffStatus(status)
    setHandoffExecutive(executiveName)

    const confirmation =
      status === 'ASSIGNED'
        ? `Your request has been successfully assigned to ${executiveName}. The sales team can now review your conversation and contact you.`
        : 'Your request has been saved successfully. No sales executive is currently available, so your request is waiting for manual assignment.'

    setMessages((current) => [
      ...current,
      {
        id: Date.now() + 1,
        sender: 'bot',
        text: confirmation,
      },
    ])
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      'Unable to submit your request right now. Please try again.'

    setMessages((current) => [
      ...current,
      {
        id: Date.now() + 1,
        sender: 'bot',
        text: errorMessage,
      },
    ])
  } finally {
    setIsHandoffLoading(false)
  }
}


  return (
    <main className="min-w-0 flex-1 bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Sparkles size={16} />
            NestVantage AI Assistant
          </div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            AI Conversations
          </h1>
          <p className="mt-1 text-slate-500">
            Help property buyers get information and connect with your sales team.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                  <Bot size={23} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    NestVantage Assistant
                  </h2>
                  <p className="text-xs text-slate-500">
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    Gemini AI assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Languages size={17} className="text-slate-500" />
                <select
                  value={language}
                  onChange={(event) => changeLanguage(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Gujarati</option>
                </select>
              </div>
            </div>

            <div className="flex h-[430px] flex-col gap-4 overflow-y-auto bg-slate-50 p-4">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-2 ${
                    item.sender === 'buyer' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {item.sender === 'bot' && (
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                      <Bot size={17} />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      item.sender === 'buyer'
                        ? 'rounded-br-sm bg-emerald-700 text-white'
                        : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {item.text}
                  </div>

                  {item.sender === 'buyer' && (
                    <div className="rounded-full bg-slate-200 p-2 text-slate-600">
                      <User size={17} />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                    <Bot size={17} />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    Gemini is typing...
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-4">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Suggested questions
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    disabled={isLoading}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  sendMessage()
                }}
                className="flex gap-2"
              >
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type your message..."
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-emerald-700 px-4 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
                                                 
                <button
                onClick={requestHuman}
                  disabled={handoff || isHandoffLoading || isLoading}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                 <Headphones size={17} />
                {isHandoffLoading
                ? 'Submitting request...'
                : handoff
                ? `Request ${handoffStatus}`
                : 'Talk to a human'}
                </button>

                {handoff && (
                
                <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                  <p className="font-semibold">Human handoff: {handoffStatus}</p>
                    <p className="mt-1">
                    Sales executive: {handoffExecutive}
                  </p>
                </div>
              )}

            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <User size={19} className="text-emerald-700" />
                <h2 className="font-semibold text-slate-900">
                  Buyer details
                </h2>
              </div>

              <label className="mb-1 block text-sm font-medium text-slate-600">
                Buyer name
              </label>
              <input
                value={buyerName}
                onChange={(event) => setBuyerName(event.target.value)}
                placeholder="Enter buyer name"
                className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              />

                      
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                        Phone number
                  </label>
                  <input
                    type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                      className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                    />


              <label className="mb-1 block text-sm font-medium text-slate-600">
                Budget range
              </label>
              <select
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              >
                <option value="">Select budget</option>
                <option>₹65 lakh – ₹80 lakh</option>
                <option>₹80 lakh – ₹1 crore</option>
                <option>₹1 crore – ₹1.2 crore</option>
                <option>Not decided</option>
              </select>

              <label className="mb-1 block text-sm font-medium text-slate-600">
                Requirements
              </label>
              <textarea
                value={requirements}
                onChange={(event) => setRequirements(event.target.value)}
                placeholder="Preferred BHK, location, requirements..."
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              />

              <p className="mt-3 text-xs text-slate-400">
                Buyer details are saved when a human handoff is requested.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-slate-900">
                Project information
              </h2>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Building2 size={17} className="text-emerald-700" />
                  2 residential projects
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle size={17} className="text-emerald-700" />
                  2 BHK and 3 BHK apartments
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays size={17} className="text-emerald-700" />
                  Site visits by appointment
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={17} className="text-emerald-700" />
                  Sales team follow-up
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-emerald-50 p-3">
                <p className="text-xs font-medium text-emerald-900">
                  Indicative price range
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-800">
                  ₹65 lakh – ₹1.2 crore
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Exact pricing and availability must be confirmed by sales.
                </p>
              </div>
            </section>
          </aside>
        </div>

                <p className="mt-4 text-xs text-slate-400">
                  Prototype notice: Gemini generates chat replies using approved
                  project facts. Human handoff requests are saved in the database
                  and assigned to available sales executives.
                </p>
      </div>
    </main>
  )
}

export default Conversations
