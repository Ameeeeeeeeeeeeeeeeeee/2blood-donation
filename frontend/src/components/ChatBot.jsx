import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatBot.css';

const KNOWLEDGE_BASE = [
  {
    keywords: ['how', 'use', 'website', 'guide', 'start'],
    answer: "To use the website, first Register as a donor. Then you can schedule a donation from your Dashboard, view available hospitals, or check emergency blood requests in the 'LifeLine' section.",
    options: ['Register Now', 'Schedule Donation', 'View Hospitals']
  },
  {
    keywords: ['blood', 'types', 'group'],
    answer: "The main blood groups are A, B, AB, and O. Each group can be either RhD positive (e.g., A+) or RhD negative (e.g., A-). Knowing your type helps us match you with patients in need!",
    options: ['Who can donate?', 'Blood compatibility']
  },
  {
    keywords: ['who', 'donate', 'eligibility', 'can i'],
    answer: "Generally, healthy adults aged 18-65 weighing over 50kg can donate. You should be well-rested and have eaten. Certain medical conditions or travel history might affect eligibility.",
    options: ['Safety', 'Donation Process']
  },
  {
    keywords: ['safety', 'safe', 'hurt', 'pain'],
    answer: "Blood donation is very safe! We use sterile, single-use equipment for every donor. You'll feel a small pinch, but it's quick and saves up to 3 lives!",
    options: ['Donation Process', 'What happens after?']
  },
  {
    keywords: ['request', 'need', 'emergency', 'hospitals'],
    answer: "If you need blood urgently, go to the 'LifeLine' section to post a request or browse 'Hospitals' to find blood banks near you.",
    options: ['View LifeLine', 'Browse Hospitals']
  },
  {
    keywords: ['process', 'steps', 'happens'],
    answer: "The process takes about 45 minutes: 1. Registration, 2. Health screening, 3. The donation (10 mins), and 4. Refreshments and rest.",
    options: ['Who can donate?', 'Sign Up']
  }
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! 👋 I'm your Blood Donation Assistant. How can I help you today?", type: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const newMessages = [...messages, { text, type: 'user' }];
    setMessages(newMessages);
    setInputValue('');

    // Generate bot response
    setTimeout(() => {
      const response = findResponse(text);
      setMessages(prev => [...prev, { 
        text: response.answer, 
        type: 'bot', 
        options: response.options 
      }]);
    }, 600);
  };

  const findResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Search in knowledge base
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(keyword => input.includes(keyword))) {
        return item;
      }
    }

    return {
      answer: "I'm not sure about that. Would you like to know about how to use the site or general blood donation info?",
      options: ['How to use site', 'Who can donate?', 'Blood types']
    };
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <div className="chat-header">
              <h3>Blood Assistant</h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className="message-wrapper">
                  <div className={`message ${msg.type}`}>
                    {msg.text}
                  </div>
                  {msg.options && (
                    <div className="options-container">
                      {msg.options.map((opt, i) => (
                        <button key={i} className="option-btn" onClick={() => handleSend(opt)}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit" className="send-btn">➔</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot;
