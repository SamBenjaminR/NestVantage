
import { useState } from 'react'
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

function getDemoReply(message, language) {
  const text = message.toLowerCase()

  if (
    text.includes('price') ||
    text.includes('cost') ||
    text.includes('budget') ||
    text.includes('कीमत') ||
    text.includes('કિંમત')
  ) {
    if (language === 'Hindi') {
      return 'दिए गए प्रोजेक्ट विवरण के अनुसार, अपार्टमेंट की कीमत ₹65 लाख से ₹1.2 करोड़ तक है। सटीक कीमत और उपलब्धता हमारी सेल्स टीम से कन्फर्म करनी होगी।'
    }
    if (language === 'Gujarati') {
      return 'આપેલી પ્રોજેક્ટ માહિતી મુજબ, એપાર્ટમેન્ટની કિંમત ₹65 લાખથી ₹1.2 કરોડ સુધી છે. ચોક્કસ કિંમત અને ઉપલબ્ધતા અમારી સેલ્સ ટીમ પાસેથી ખાતરી કરવી પડશે.'
    }
    return 'According to the available project information, apartment prices range from ₹65 lakh to ₹1.2 crore. Our sales team will need to confirm the exact price and availability.'
  }

  if (
    text.includes('bhk') ||
    text.includes('apartment') ||
    text.includes('flat') ||
    text.includes('घर') ||
    text.includes('ફ્લેટ')
  ) {
    if (language === 'Hindi') {
      return 'उपलब्ध जानकारी के अनुसार, 2 BHK और 3 BHK अपार्टमेंट विकल्प हैं। आप किस प्रकार का अपार्टमेंट देखना चाहेंगे?'
    }
    if (language === 'Gujarati') {
      return 'ઉપલબ્ધ માહિતી મુજબ, 2 BHK અને 3 BHK એપાર્ટમેન્ટ વિકલ્પો છે. તમે કયા પ્રકારનો એપાર્ટમેન્ટ જોવા માંગો છો?'
    }
    return 'The developer has two residential projects with 2 BHK and 3 BHK apartment options. Are you interested in a 2 BHK or a 3 BHK?'
  }

  if (
    text.includes('visit') ||
    text.includes('book') ||
    text.includes('tour') ||
    text.includes('મુલાકાત') ||
    text.includes('विजिट')
  ) {
    if (language === 'Hindi') {
      return 'ज़रूर! मैं आपकी साइट विज़िट की व्यवस्था करने में मदद कर सकती हूँ। कृपया अपनी पसंद की तारीख और समय बताएं। हमारी टीम उपलब्ध स्लॉट की पुष्टि करेगी।'
    }
    if (language === 'Gujarati') {
      return 'ચોક્કસ! હું તમારી સાઇટ મુલાકાત ગોઠવવામાં મદદ કરી શકું છું. કૃપા કરીને તમારી પસંદગીની તારીખ અને સમય જણાવો. અમારી ટીમ ઉપલબ્ધ સમયની પુષ્ટિ કરશે.'
    }
    return 'Certainly! I can help arrange a site visit. Please tell me your preferred date and time. Our team will confirm the available slot.'
  }

  if (language === 'Hindi') {
    return 'इस जानकारी की पुष्टि मेरे पास उपलब्ध प्रोजेक्ट विवरण में नहीं है। मैं आपको हमारी सेल्स टीम से जोड़ सकती हूँ।'
  }

  if (language === 'Gujarati') {
    return 'આ માહિતી ઉપલબ્ધ પ્રોજેક્ટ વિગતોમાં નથી. હું તમને અમારી સેલ્સ ટીમ સાથે જોડવામાં મદદ કરી શકું છું.'
  }

  return "I don't have verified information about that in the project fact sheet. I can connect you with a sales executive who can confirm it."
}

function Conversations() {
  const [language, setLanguage] = useState('English')
  const [message, setMessage] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [budget, setBudget] = useState('')
  const [requirements, setRequirements] = useState('')
  const [handoff, setHandoff] = useState(false)

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

  function sendMessage(textToSend = message) {
    const cleanMessage = textToSend.trim()
    if (!cleanMessage) return

    const buyerMessage = {
      id: Date.now(),
      sender: 'buyer',
      text: cleanMessage,
    }

    const botMessage = {
      id: Date.now() + 1,
      sender: 'bot',
      text: getDemoReply(cleanMessage, language),
    }

    setMessages((current) => [...current, buyerMessage, botMessage])
    setMessage('')
  }

  function requestHuman() {
    setHandoff(true)

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: 'buyer',
        text: 'I would like to speak to a human sales executive.',
      },
      {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Your request has been marked for human follow-up. A sales executive will need to contact you. This demo does not send a real notification.',
      },
    ])
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
                    Demo assistant
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
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-emerald-600 hover:text-emerald-700"
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
                  className="rounded-xl bg-emerald-700 px-4 text-white transition hover:bg-emerald-800"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>

              <button
                onClick={requestHuman}
                disabled={handoff}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Headphones size={17} />
                {handoff ? 'Human follow-up requested' : 'Talk to a human'}
              </button>
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
                Demo fields only. Details are not saved to a database yet.
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
          Prototype notice: replies are rule-based demo responses. No real AI,
          database storage, executive notification or external messaging is
          connected yet.
        </p>
      </div>
    </main>
  )
}

export default Conversations
