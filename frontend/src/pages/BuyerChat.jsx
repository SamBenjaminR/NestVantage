
import { useEffect, useRef, useState } from 'react';
import publicApi from '../api/publicApi';
import {
  Send,
  Bot,
  User,
  Building2,
  Phone,
  CalendarDays,
  Loader2,
  MapPin,
  Moon,
  Sun,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const TOKEN_KEY = 'nestvantage_public_chat_token';

const quickQuestions = {
  English: [
    'Show 2 BHK options',
    'Show 3 BHK options',
    'Properties under ₹80 lakh',
    'Compare both projects',
  ],
  Hindi: [
    '2 BHK विकल्प दिखाएं',
    '3 BHK विकल्प दिखाएं',
    '₹80 लाख से कम की प्रॉपर्टी',
    'दोनों प्रोजेक्ट की तुलना करें',
  ],
  Gujarati: [
    '2 BHK વિકલ્પો બતાવો',
    '3 BHK વિકલ્પો બતાવો',
    '₹80 લાખથી ઓછી કિંમતની પ્રોપર્ટી',
    'બંને પ્રોજેક્ટની સરખામણી કરો',
  ],
};

const getLocalDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function BuyerChat() {
  const [accessToken, setAccessToken] = useState(
    () => sessionStorage.getItem(TOKEN_KEY) || ''
  );

  // Customer details are part of the booking form.
  const [buyerName, setBuyerName] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [requirements, setRequirements] = useState('');

  const [language, setLanguage] = useState('English');
  const [darkMode, setDarkMode] = useState(false);

  // AI chat
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState('');

  // Callback
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [handoffComplete, setHandoffComplete] = useState(false);

  // Site visit booking
  const [bookingProject, setBookingProject] = useState('Project 1');
  const [bookingDate, setBookingDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(null);
  const [bookingError, setBookingError] = useState('');

  const messagesEndRef = useRef(null);
  const slotRequestRef = useRef(0);

  const theme = (base, dark) =>
    darkMode ? { ...base, ...dark } : base;

  useEffect(() => {
    startChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (bookingDate && bookingProject) {
      fetchAvailableSlots();
    }
  }, [bookingDate, bookingProject]);

  const startChat = async () => {
    try {
      setStarting(true);

      const existingToken = sessionStorage.getItem(TOKEN_KEY);

      if (existingToken) {
        setAccessToken(existingToken);
        setMessages([
          {
            sender: 'AI',
            message:
              'Welcome back! How can I help you with your property search?',
          },
        ]);
      } else {
        const response = await publicApi.post('/public/chat/start', {
          language,
        });

        const token = response.data.accessToken;

        sessionStorage.setItem(TOKEN_KEY, token);
        setAccessToken(token);

        setMessages([
          {
            sender: 'AI',
            message: response.data.message,
          },
        ]);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Unable to start the chat. Please refresh and try again.'
      );
    } finally {
      setStarting(false);
    }
  };

  const sendMessage = async (event, quickQuestion) => {
    event?.preventDefault();

    const currentMessage = (quickQuestion ?? message).trim();

    if (!currentMessage || !accessToken || loading) return;

    setMessages((previous) => [
      ...previous,
      { sender: 'BUYER', message: currentMessage },
    ]);

    setMessage('');
    setLoading(true);
    setError('');

    try {
      const response = await publicApi.post('/public/chat/message', {
        accessToken,
        message: currentMessage,
        buyerName: buyerName.trim() || 'Website Visitor',
        budget,
        requirements,
        language,
      });

      setMessages((previous) => [
        ...previous,
        { sender: 'AI', message: response.data.reply },
      ]);
    } catch (err) {
      setMessages((previous) => [
        ...previous,
        {
          sender: 'AI',
          message:
            'Sorry, I could not process that message. Please try again.',
        },
      ]);

      setError(
        err.response?.data?.error || 'Unable to send your message.'
      );
    } finally {
      setLoading(false);
    }
  };

  const requestHandoff = async () => {
    if (!accessToken || handoffLoading || handoffComplete) return;

    if (!buyerName.trim()) {
      setBookingError('Please enter your name first.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setBookingError('Enter a valid 10-digit phone number.');
      return;
    }

    setHandoffLoading(true);
    setBookingError('');

    try {
      const response = await publicApi.post('/public/chat/handoff', {
        accessToken,
        buyerName: buyerName.trim(),
        phone: phone.trim(),
        budget,
        requirements,
      });

      setHandoffComplete(true);

      setMessages((previous) => [
        ...previous,
        {
          sender: 'AI',
          message:
            `${response.data.message} ` +
            `Status: ${response.data.status}. ` +
            `Assigned to: ${response.data.executiveName}.`,
        },
      ]);
    } catch (err) {
      setBookingError(
        err.response?.data?.error ||
          'Unable to connect you with the sales team.'
      );
    } finally {
      setHandoffLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!bookingDate || !bookingProject) return;

    const requestId = ++slotRequestRef.current;

    setSlotsLoading(true);
    setAvailableSlots([]);
    setSelectedSlot('');
    setBookingConfirmation(false);
    setBookingError('');

    try {
      const response = await publicApi.get(
        '/public/site-visits/availability',
        {
          params: {
            projectName: bookingProject,
            visitDate: bookingDate,
          },
        }
      );

      if (requestId !== slotRequestRef.current) return;

      setAvailableSlots(response.data.slots || []);

      if (!response.data.slots?.length) {
        setBookingError(
          'No available slots for this date. Please select another date.'
        );
      }
    } catch (err) {
      if (requestId !== slotRequestRef.current) return;

      setBookingError(
        err.response?.data?.error ||
          'Unable to retrieve available slots. Please try again.'
      );
    } finally {
      if (requestId === slotRequestRef.current) {
        setSlotsLoading(false);
      }
    }
  };

  const canReviewBooking =
    buyerName.trim().length > 0 &&
    /^[0-9]{10}$/.test(phone.trim()) &&
    Boolean(selectedSlot) &&
    Boolean(bookingDate) &&
    Boolean(bookingProject);

  const confirmSiteVisit = async () => {
    if (!accessToken || bookingLoading) return;

    if (!canReviewBooking) {
      setBookingError(
        'Please complete your name, phone number, date and time selection.'
      );
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      const response = await publicApi.post(
        '/public/site-visits/book',
        {
          accessToken,
          buyerName: buyerName.trim(),
          phone: phone.trim(),
          budget,
          requirements,
          projectName: bookingProject,
          visitDate: bookingDate,
          visitTime: selectedSlot,
        }
      );

      setBookingComplete(response.data);
      setBookingConfirmation(false);
      setSelectedSlot('');
      setAvailableSlots([]);
      setBookingError('');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        'Unable to book your site visit. Please try again.';

      await fetchAvailableSlots();
      setBookingError(message);
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBooking = () => {
    slotRequestRef.current += 1;
    setBookingComplete(null);
    setBookingDate('');
    setAvailableSlots([]);
    setSelectedSlot('');
    setBookingConfirmation(false);
    setBookingError('');
    setSlotsLoading(false);
  };

  const handleQuickQuestion = (question) => {
    sendMessage(null, question);
  };

  if (starting) {
    return (
      <div style={styles.loadingPage}>
        <Loader2 size={30} className="spin" />
        <p>Connecting to NestVantage...</p>
      </div>
    );
  }

  return (
    <div
      style={theme(styles.page, {
        background: '#101827',
        color: '#e5eaf3',
      })}
    >
      <header
        style={theme(styles.header, {
          background: '#172235',
          borderBottom: '1px solid #2c3a50',
          color: '#e5eaf3',
        })}
      >
        <div style={styles.brand}>
          <div style={styles.logo}>
            <Building2 size={25} />
          </div>
          <div>
            <h2 style={styles.brandName}>NestVantage</h2>
            <p style={styles.tagline}>
              Smarter conversations. Better property decisions.
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.online}>
            <span style={styles.onlineDot} />
            Property Assistant
          </div>

          <select
            aria-label="Choose language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={theme(styles.headerSelect, {
              background: '#243249',
              color: '#e5eaf3',
              border: '1px solid #465671',
            })}
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी</option>
            <option value="Gujarati">ગુજરાતી</option>
          </select>

          <button
            type="button"
            onClick={() => setDarkMode((previous) => !previous)}
            style={theme(styles.themeButton, {
              background: '#243249',
              color: '#f5d77b',
              border: '1px solid #465671',
            })}
            aria-label={
              darkMode ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.intro}>
          <span style={styles.eyebrow}>REAL ESTATE INTELLIGENCE</span>
          <h1>Find a home that feels right.</h1>
          <p>
            Explore our properties, understand your options, and
            schedule a site visit with our assistance.
          </p>
        </section>

        {/* LEFT: Booking panel | RIGHT: AI chat */}
        <div style={styles.layout}>
          <section
            style={theme(styles.bookingCard, {
              background: '#172235',
              border: '1px solid #2c3a50',
              color: '#e5eaf3',
            })}
          >
            <div style={styles.bookingHeading}>
              <div style={styles.bookingIcon}>
                <CalendarDays size={21} />
              </div>
              <div>
                <h2 style={styles.panelTitle}>Book a Site Visit</h2>
                <p style={styles.bookingSubtitle}>
                  Follow the steps below to schedule your visit.
                </p>
              </div>
            </div>

            {bookingComplete ? (
              <div style={styles.bookingSuccess}>
                <CheckCircle2 size={36} color="#16a36a" />
                <h3>Your visit is booked!</h3>
                <p style={styles.successDescription}>
                  Your site-visit booking has been confirmed.
                </p>

                <div style={styles.bookingSummary}>
                  <div>
                    <span style={styles.summaryLabel}>Booking reference</span>
                    <strong>{bookingComplete.visitCode}</strong>
                  </div>
                  <div>
                    <span style={styles.summaryLabel}>Buyer</span>
                    <strong>{bookingComplete.buyerName}</strong>
                  </div>
                  <div>
                    <span style={styles.summaryLabel}>Project</span>
                    <strong>{bookingComplete.projectName}</strong>
                  </div>
                  <div>
                    <span style={styles.summaryLabel}>Date</span>
                    <strong>{bookingComplete.visitDate}</strong>
                  </div>
                  <div>
                    <span style={styles.summaryLabel}>Time</span>
                    <strong>{bookingComplete.visitTime}</strong>
                  </div>
                </div>

                {bookingComplete.locationUrl && (
                  <a
                    href={bookingComplete.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.successMapLink}
                  >
                    <MapPin size={16} />
                    View project on Google Maps
                  </a>
                )}

                <button
                  type="button"
                  onClick={resetBooking}
                  style={styles.secondaryButton}
                >
                  Book Another Visit
                </button>
              </div>
            ) : (
              <>
                <div style={styles.stepBlock}>
                  <div style={styles.stepHeading}>
                    <span style={styles.stepNumber}>1</span>
                    <h3>Select your property</h3>
                  </div>

                  <label style={styles.bookingLabel}>
                    Choose project
                  </label>
                  <select
                    value={bookingProject}
                    onChange={(e) => {
                      setBookingProject(e.target.value);
                      setAvailableSlots([]);
                      setSelectedSlot('');
                      setBookingConfirmation(false);
                      setBookingError('');
                    }}
                    style={styles.bookingInput}
                  >
                    <option value="Project 1">Project 1</option>
                    <option value="Project 2">Project 2</option>
                  </select>

                  <div style={styles.projectNote}>
                    <Building2 size={15} />
                    Residential apartments · 2 & 3 BHK · Ahmedabad
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${bookingProject}, Ahmedabad`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.locationLink}
                  >
                    <MapPin size={15} />
                    View project location
                  </a>
                </div>

                <div style={styles.stepBlock}>
                  <div style={styles.stepHeading}>
                    <span style={styles.stepNumber}>2</span>
                    <h3>Choose your visit date and time</h3>
                  </div>

                  <label style={styles.bookingLabel}>
                    Preferred visit date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={getLocalDate()}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      setAvailableSlots([]);
                      setSelectedSlot('');
                      setBookingConfirmation(false);
                      setBookingError('');
                    }}
                    style={styles.bookingInput}
                  />

                  {bookingDate && (
                    <div style={styles.availabilityArea}>
                      <div style={styles.availabilityHeading}>
                        <Clock size={16} />
                        Available time slots
                      </div>

                      {slotsLoading ? (
                        <div style={styles.loadingSlots}>
                          <Loader2 size={18} className="spin" />
                          Checking available times...
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div style={styles.slotGrid}>
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.slotTime}
                              type="button"
                              onClick={() => {
                                setSelectedSlot(slot.slotTime);
                                setBookingConfirmation(false);
                                setBookingError('');
                              }}
                              style={{
                                ...styles.slotButton,
                                ...(selectedSlot === slot.slotTime
                                  ? styles.selectedSlot
                                  : {}),
                              }}
                            >
                              {slot.slotTime}
                              {selectedSlot === slot.slotTime && (
                                <CheckCircle2 size={15} />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        !bookingError && (
                          <p style={styles.noSlots}>
                            No available slots for this date.
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div style={styles.stepBlock}>
                  <div style={styles.stepHeading}>
                    <span style={styles.stepNumber}>3</span>
                    <h3>Your contact and property details</h3>
                  </div>

                  <label style={styles.bookingLabel}>
                    Full name *
                  </label>
                  <input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Enter your full name"
                    maxLength={100}
                    style={styles.bookingInput}
                  />

                  <label style={styles.bookingLabel}>
                    10-digit phone number *
                  </label>
                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    placeholder="Enter your phone number"
                    inputMode="numeric"
                    maxLength={10}
                    style={styles.bookingInput}
                  />

                  <label style={styles.bookingLabel}>
                    Your budget
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    style={styles.bookingInput}
                  >
                    <option value="">Select your budget</option>
                    <option value="₹65–80 lakh">₹65–80 lakh</option>
                    <option value="₹80 lakh–1 crore">₹80 lakh–1 crore</option>
                    <option value="₹1–1.2 crore">₹1–1.2 crore</option>
                    <option value="Flexible">Flexible</option>
                  </select>

                  <label style={styles.bookingLabel}>
                    Property requirements
                  </label>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Example: 3 BHK, preferred floor, family requirements..."
                    rows={3}
                    maxLength={1000}
                    style={styles.bookingTextarea}
                  />

                  <p style={styles.requiredNote}>
                    * Name and phone number are required for booking.
                  </p>
                </div>

                {bookingError && (
                  <div style={styles.bookingError}>
                    {bookingError}
                  </div>
                )}

                {selectedSlot && (
                  <div style={styles.selectedSlotInfo}>
                    <CheckCircle2 size={17} />
                    Selected: {bookingProject} · {bookingDate} · {selectedSlot}
                  </div>
                )}

                {!bookingConfirmation && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!bookingDate || !selectedSlot) {
                        setBookingError(
                          'Please select your project, visit date and available time slot.'
                        );
                        return;
                      }

                      if (!buyerName.trim()) {
                        setBookingError('Please enter your name.');
                        return;
                      }

                      if (!/^[0-9]{10}$/.test(phone.trim())) {
                        setBookingError(
                          'Please enter a valid 10-digit phone number.'
                        );
                        return;
                      }

                      setBookingError('');
                      setBookingConfirmation(true);
                    }}
                    disabled={!canReviewBooking || slotsLoading}
                    style={{
                      ...styles.primaryBookingButton,
                      opacity:
                        !canReviewBooking || slotsLoading ? 0.5 : 1,
                      cursor:
                        !canReviewBooking || slotsLoading
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    Review Booking
                  </button>
                )}

                {bookingConfirmation && (
                  <div style={styles.confirmationPanel}>
                    <div style={styles.stepHeading}>
                      <span style={styles.stepNumber}>4</span>
                      <h3>Review your booking</h3>
                    </div>

                    <div style={styles.confirmationDetails}>
                      <p><span>Name: </span><strong>{buyerName}</strong></p>
                      <p><span>Phone: </span><strong>{phone}</strong></p>
                      <p><span>Project: </span><strong>{bookingProject}</strong></p>
                      <p><span>Date: </span><strong>{bookingDate}</strong></p>
                      <p><span>Time: </span><strong>{selectedSlot}</strong></p>
                      <p><span>Budget: </span><strong>{budget || 'Not specified'}</strong></p>
                      <p><span>Requirements: </span><strong>{requirements || 'Not specified'}</strong></p>
                    </div>

                    <button
                      type="button"
                      onClick={confirmSiteVisit}
                      disabled={bookingLoading}
                      style={{
                        ...styles.primaryBookingButton,
                        opacity: bookingLoading ? 0.65 : 1,
                      }}
                    >
                      {bookingLoading
                        ? 'Confirming your visit...'
                        : 'Confirm Site Visit'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingConfirmation(false)}
                      disabled={bookingLoading}
                      style={styles.secondaryButton}
                    >
                      Edit Details
                    </button>
                  </div>
                )}

                <div style={styles.callbackOption}>
                  <Phone size={15} />
                  <span>Prefer to speak with our team?</span>
                  <button
                    type="button"
                    onClick={requestHandoff}
                    disabled={
                      handoffLoading ||
                      handoffComplete ||
                      !buyerName.trim() ||
                      !/^[0-9]{10}$/.test(phone.trim())
                    }
                    style={styles.callbackLink}
                  >
                    {handoffLoading
                      ? 'Requesting...'
                      : handoffComplete
                        ? 'Callback requested'
                        : 'Request a callback'}
                  </button>
                </div>
              </>
            )}
          </section>

          {/* RIGHT: NestVantage AI chat */}
          <section
            style={theme(styles.chatCard, {
              background: '#172235',
              border: '1px solid #2c3a50',
            })}
          >
            <div
              style={theme(styles.chatHeader, {
                borderBottom: '1px solid #2c3a50',
              })}
            >
              <div style={styles.botAvatar}>
                <Bot size={22} />
              </div>
              <div>
                <h3 style={styles.chatTitle}>NestVantage Assistant</h3>
                <p style={styles.chatSubtitle}>
                  Here to help with your property search
                </p>
              </div>
              <span style={styles.chatStatus}>Online</span>
            </div>

            <div
              style={theme(styles.messages, {
                background: '#111c2c',
              })}
            >
              {messages.map((item, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.messageRow,
                    justifyContent:
                      item.sender === 'BUYER' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {item.sender !== 'BUYER' && (
                    <div style={styles.messageAvatar}>
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    style={{
                      ...styles.bubble,
                      ...(item.sender === 'BUYER'
                        ? styles.buyerBubble
                        : darkMode
                          ? {
                              ...styles.aiBubble,
                              background: '#26364d',
                              color: '#e5eaf3',
                            }
                          : styles.aiBubble),
                    }}
                  >
                    {item.message}
                  </div>

                  {item.sender === 'BUYER' && (
                    <div style={styles.userAvatar}>
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={styles.messageRow}>
                  <div style={styles.messageAvatar}>
                    <Bot size={16} />
                  </div>
                  <div
                    style={theme(styles.typing, {
                      background: '#26364d',
                      color: '#c3cede',
                    })}
                  >
                    NestVantage Assistant is typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div
              style={theme(styles.quickQuestions, {
                borderTop: '1px solid #2c3a50',
              })}
            >
              <p style={styles.quickQuestionTitle}>Try asking</p>
              <div style={styles.quickQuestionList}>
                {quickQuestions[language].map((question) => (
                  <button
                    key={question}
                    type="button"
                    style={theme(styles.quickChip, {
                      background: '#243249',
                      color: '#dce7ff',
                      border: '1px solid #465671',
                    })}
                    disabled={loading || !accessToken}
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <form
              onSubmit={sendMessage}
              style={theme(styles.chatForm, {
                borderTop: '1px solid #2c3a50',
              })}
            >
              <input
                style={theme(styles.chatInput, styles.darkInput)}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about our properties..."
                disabled={loading || !accessToken}
                maxLength={2000}
              />
              <button
                type="submit"
                style={styles.sendButton}
                disabled={loading || !message.trim() || !accessToken}
                aria-label="Send message"
              >
                <Send size={19} />
              </button>
            </form>

            <p style={styles.chatFooter}>
              <Building2 size={14} />
              Ask about projects, property options and site visits.
            </p>
          </section>
        </div>
      </main>

      <footer style={styles.footer}>
        NestVantage · Company A · Ahmedabad
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f7fb',
    color: '#172033',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  loadingPage: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e5e9f0',
    padding: '18px 5%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 12,
    background: '#e9efff',
    color: '#3158b8',
    display: 'grid',
    placeItems: 'center',
  },
  brandName: {
    margin: 0,
    fontSize: 21,
    fontWeight: 750,
  },
  tagline: {
    margin: '4px 0 0',
    fontSize: 12,
    color: '#778197',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  headerSelect: {
    padding: '9px 12px',
    border: '1px solid #dce2eb',
    borderRadius: 8,
    background: '#ffffff',
    color: '#172033',
    fontSize: 12,
    cursor: 'pointer',
  },
  themeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '9px 12px',
    border: '1px solid #dce2eb',
    borderRadius: 8,
    background: '#ffffff',
    color: '#34425b',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  online: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#526078',
    fontSize: 13,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#16a36a',
  },
  main: {
    width: '100%',
    boxSizing: 'border-box',
    margin: '0 auto',
    padding: '30px 4%',
  },
  intro: {
    marginBottom: 25,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: '#4264bc',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(320px, 0.95fr) minmax(400px, 1.15fr)',
    gap: 22,
    alignItems: 'start',
    width: '100%',
  },
  bookingCard: {
    background: '#ffffff',
    border: '1px solid #e5e9f0',
    borderRadius: 14,
    padding: 22,
    minWidth: 0,
  },
  bookingHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },
  bookingIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    display: 'grid',
    placeItems: 'center',
    background: '#e9efff',
    color: '#3158b8',
    flexShrink: 0,
  },
  panelTitle: {
    margin: 0,
    fontSize: 19,
  },
  bookingSubtitle: {
    margin: '5px 0 0',
    color: '#8992a3',
    fontSize: 12,
    lineHeight: 1.5,
  },
  stepBlock: {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottom: '1px solid #e9edf3',
  },
  stepHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  stepNumber: {
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: '#e9efff',
    color: '#3158b8',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 750,
    flexShrink: 0,
  },
  stepBlockHeading: {
    fontSize: 14,
  },
  stepBlockTitle: {
    margin: 0,
    fontSize: 14,
  },
  bookingLabel: {
    display: 'block',
    fontSize: 12,
    fontWeight: 650,
    color: '#526078',
    marginBottom: 7,
    marginTop: 13,
  },
  bookingInput: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 11px',
    border: '1px solid #cbd5e1',
    borderRadius: 9,
    background: '#ffffff',
    color: '#172033',
    fontSize: 13,
    fontFamily: 'inherit',
    colorScheme: 'light',
  },
  bookingTextarea: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: 12,
    border: '1px solid #cbd5e1',
    borderRadius: 9,
    background: '#ffffff',
    color: '#172033',
    fontSize: 13,
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  projectNote: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    marginTop: 11,
    fontSize: 11,
    color: '#778197',
  },
  locationLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    marginTop: 11,
    color: '#3158b8',
    fontSize: 12,
    fontWeight: 650,
    textDecoration: 'none',
  },
  availabilityArea: {
    marginTop: 17,
  },
  availabilityHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    color: '#526078',
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 11,
  },
  loadingSlots: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: 13,
    background: '#f1f5f9',
    color: '#475569',
    borderRadius: 9,
    fontSize: 12,
  },
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 9,
  },
  slotButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 43,
    padding: '10px 7px',
    border: '1px solid #cbd5e1',
    borderRadius: 9,
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: 13,
    fontWeight: 650,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  selectedSlot: {
    background: '#e8efff',
    color: '#23458f',
    border: '2px solid #3158b8',
  },
  noSlots: {
    padding: 12,
    borderRadius: 8,
    background: '#fff7ed',
    color: '#9a3412',
    fontSize: 12,
  },
  requiredNote: {
    margin: '10px 0 0',
    fontSize: 11,
    color: '#8992a3',
  },
  selectedSlotInfo: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 15,
    padding: 11,
    borderRadius: 8,
    background: '#ecfdf5',
    color: '#16845a',
    fontSize: 12,
  },
  primaryBookingButton: {
    width: '100%',
    padding: '13px 14px',
    marginTop: 17,
    border: 0,
    borderRadius: 9,
    background: '#29488f',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  secondaryButton: {
    width: '100%',
    padding: '11px 14px',
    marginTop: 9,
    border: '1px solid #cbd5e1',
    borderRadius: 9,
    background: '#ffffff',
    color: '#334155',
    fontSize: 12,
    fontWeight: 650,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  confirmationPanel: {
    marginTop: 18,
    padding: 15,
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    background: '#f8fafc',
    color: '#172033',
  },
  confirmationDetails: {
    display: 'grid',
    gap: 9,
  },
  confirmationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    fontSize: 12,
  },
  bookingError: {
    marginTop: 12,
    padding: 11,
    borderRadius: 8,
    background: '#fff0ee',
    color: '#b42318',
    border: '1px solid #fecaca',
    fontSize: 12,
    lineHeight: 1.5,
  },
  callbackOption: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1px solid #e9edf3',
    color: '#778197',
    fontSize: 11,
  },
  callbackLink: {
    border: 0,
    padding: 0,
    background: 'transparent',
    color: '#3158b8',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  bookingSuccess: {
    padding: 17,
    borderRadius: 11,
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#14532d',
    textAlign: 'center',
  },
  successDescription: {
    margin: '8px 0 15px',
    fontSize: 12,
    color: '#4b6353',
  },
  bookingSummary: {
    display: 'grid',
    gap: 11,
    textAlign: 'left',
    padding: 13,
    borderRadius: 9,
    background: '#ffffff',
    color: '#172033',
  },
  summaryLabel: {
    display: 'block',
    marginBottom: 4,
    fontSize: 11,
    color: '#64748b',
  },
  successMapLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    color: '#3158b8',
    fontSize: 12,
    fontWeight: 650,
    textDecoration: 'none',
  },
  chatCard: {
    background: '#ffffff',
    border: '1px solid #e5e9f0',
    borderRadius: 14,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 720,
    minWidth: 0,
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderBottom: '1px solid #e9edf3',
  },
  botAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: '#e9efff',
    color: '#3158b8',
    display: 'grid',
    placeItems: 'center',
  },
  chatTitle: {
    margin: 0,
    fontSize: 15,
  },
  chatSubtitle: {
    margin: '4px 0 0',
    fontSize: 12,
    color: '#8992a3',
  },
  chatStatus: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#16845a',
    background: '#e9f8f0',
    padding: '6px 9px',
    borderRadius: 20,
  },
  messages: {
    flex: 1,
    padding: 20,
    minHeight: 450,
    maxHeight: 600,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 17,
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    background: '#e9efff',
    color: '#3158b8',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    background: '#e9edf3',
    color: '#536078',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '78%',
    padding: '12px 15px',
    borderRadius: 13,
    fontSize: 13,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  aiBubble: {
    background: '#f0f3f9',
    color: '#263248',
    borderBottomLeftRadius: 4,
  },
  buyerBubble: {
    background: '#29488f',
    color: '#ffffff',
    borderBottomRightRadius: 4,
  },
  typing: {
    background: '#f0f3f9',
    padding: '11px 15px',
    borderRadius: 12,
    fontSize: 12,
    color: '#778197',
  },
  quickQuestions: {
    padding: '12px 18px',
    borderTop: '1px solid #e9edf3',
  },
  quickQuestionTitle: {
    margin: '0 0 9px',
    fontSize: 11,
    fontWeight: 700,
    color: '#8992a3',
  },
  quickQuestionList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    padding: '8px 11px',
    border: '1px solid #dce4f4',
    borderRadius: 20,
    background: '#f5f7fc',
    color: '#3158b8',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    color: '#b42318',
    background: '#fff0ee',
    fontSize: 12,
    padding: '10px 14px',
    margin: '0 18px 10px',
    borderRadius: 8,
  },
  chatForm: {
    display: 'flex',
    gap: 10,
    padding: '14px 18px',
    borderTop: '1px solid #e9edf3',
  },
  chatInput: {
    flex: 1,
    minWidth: 0,
    border: '1px solid #dce2eb',
    borderRadius: 9,
    padding: '12px 14px',
    fontSize: 13,
    outline: 'none',
  },
  darkInput: {
    background: '#243249',
    color: '#e5eaf3',
    border: '1px solid #465671',
  },
  sendButton: {
    width: 44,
    height: 44,
    border: 0,
    borderRadius: 9,
    background: '#29488f',
    color: '#ffffff',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
  },
  chatFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '0 18px 16px',
    margin: 0,
    fontSize: 11,
    color: '#8992a3',
  },
  footer: {
    textAlign: 'center',
    padding: 20,
    fontSize: 12,
    color: '#8992a3',
  },
};
