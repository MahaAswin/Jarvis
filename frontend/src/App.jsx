import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2, Loader, VolumeX, Moon, Sun } from 'lucide-react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Apply theme
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  // Send text message to backend
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: text
      });

      // Add assistant response to chat
      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        audioUrl: `${API_BASE_URL}${response.data.audio_url}`
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Play audio response automatically
      playAudio(`${API_BASE_URL}${response.data.audio_url}`);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Play audio response
  const playAudio = (audioUrl) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    setCurrentAudio(audio);
    setIsPlaying(true);
    
    audio.onended = () => setIsPlaying(false);
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      setIsPlaying(false);
    });
  };

  // Stop audio playback
  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Start recording voice
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording voice
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send voice message to backend
  const sendVoiceMessage = async (audioBlob) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await axios.post(`${API_BASE_URL}/voice-chat`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Add user message (transcribed)
      const userMessage = {
        role: 'user',
        content: response.data.user_message
      };
      setMessages(prev => [...prev, userMessage]);

      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        audioUrl: `${API_BASE_URL}${response.data.audio_url}`
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Play audio response automatically
      playAudio(`${API_BASE_URL}${response.data.audio_url}`);
    } catch (error) {
      console.error('Error sending voice message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I could not process your voice message.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <div className="logo">
              <Volume2 size={32} />
            </div>
            <div>
              <h1>JARVIS</h1>
              <p>AI Voice Assistant</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
              <button 
                className="theme-toggle" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {isPlaying && (
                <button className="stop-audio-header" onClick={stopAudio} title="Stop audio">
                  <VolumeX size={24} />
                  <span>Stop Speaking</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <Volume2 size={64} />
              <h2>Hello, I'm Jarvis</h2>
              <p>How can I help you today?</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">
                <p>{message.content}</p>
                {message.audioUrl && (
                  <button
                    className="play-audio-btn"
                    onClick={() => playAudio(message.audioUrl)}
                    title="Play audio"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message assistant">
              <div className="message-content loading">
                <Loader className="spinner" size={20} />
                <span>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-container">
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || isRecording}
              className="text-input"
            />
            
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`mic-button ${isRecording ? 'recording' : ''}`}
              disabled={isLoading}
            >
              <Mic size={20} />
            </button>

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading || isRecording}
              className="send-button"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
