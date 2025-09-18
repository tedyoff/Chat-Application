// src/App.js
import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import "./App.css";

function App() {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Alice", online: true, messages: [] },
    { id: 2, name: "Bob", online: false, messages: [] },
    { id: 3, name: "Charlie", online: true, messages: [] },
  ]);

  const [search, setSearch] = useState("");
  const [activeContactId, setActiveContactId] = useState(contacts[0].id);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typing, setTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeContact = contacts.find((c) => c.id === activeContactId);
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContact?.messages, typing]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !file && !audioURL) return;

    const newMessage = {
      id: Date.now(),
      text: input || (file ? "Attachment" : audioURL ? "Voice message" : ""),
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      reactions: [],
      file: file ? URL.createObjectURL(file) : audioURL,
      fileName: file ? file.name : audioURL ? "voice.mp3" : null,
    };

    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );

    setInput("");
    setFile(null);
    setAudioURL(null);
    setShowEmojiPicker(false);

    // Send via EmailJS
    emailjs
      .send(
        "service_872cqtr",
        "template_2jyor37",
        { name: "Teddy", message: newMessage.text },
        "hWpbI_oH9gVDwrR-0"
      )
      .then(
        (res) => console.log("EmailJS sent:", res.status),
        (err) => console.error("EmailJS error:", err)
      );

    // Simulate bot reply
    setTyping(true);
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: "Reply from " + activeContact.name,
        sender: "bot",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        reactions: [],
      };
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? { ...c, messages: [...c.messages, botMessage] }
            : c
        )
      );
      setTyping(false);
    }, 1000);
  };

  // Emoji
  const addEmoji = (emoji) => setInput((prev) => prev + emoji.native);
  const addReaction = (msgId, emoji) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId ? { ...m, reactions: [...m.reactions, emoji] } : m
              ),
            }
          : c
      )
    );
  };

  // Add contact
  const addContact = () => {
    const name = prompt("Enter new contact name:");
    if (!name) return;
    const newContact = { id: Date.now(), name, online: true, messages: [] };
    setContacts((prev) => [...prev, newContact]);
  };

  // Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  const handleDragOver = (e) => e.preventDefault();

  // Voice recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    let chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
    };
    mediaRecorder.start();
    setRecording(true);
  };
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className={`app ${darkMode ? "dark-theme" : ""}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Contacts</h3>
          <button onClick={addContact} className="add-contact">
            ➕
          </button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-contact"
        />
        <ul>
          {filteredContacts.map((c) => (
            <li
              key={c.id}
              className={c.id === activeContactId ? "active" : ""}
              onClick={() => setActiveContactId(c.id)}
            >
              {c.name} {c.online ? "🟢" : "⚪"}
            </li>
          ))}
        </ul>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="dark-toggle"
        >
          {darkMode ? "🌞" : "🌙"}
        </button>
      </div>

      {/* Chat area */}
      <div
        className="chat-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="chat-header">{activeContact.name}</div>

        <div className="chat-box">
          {activeContact.messages?.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.file ? "audio" : msg.sender}`}
            >
              <p>{msg.text}</p>
              {msg.file && (
                <div className="attachment">
                  {/\.(png|jpe?g|gif)$/i.test(msg.file) ? (
                    <img src={msg.file} alt={msg.fileName} />
                  ) : (
                    <audio controls src={msg.file}></audio>
                  )}
                </div>
              )}
              <span className="time">{msg.time}</span>
              <div className="reactions">
                {msg.reactions.map((r, i) => (
                  <span key={i} className="emoji">{r}</span>
                ))}
                <span className="add-emoji" onClick={() => addReaction(msg.id, "❤️")}>➕</span>
              </div>
            </div>
          ))}

          {typing && (
            <div className="chat-bubble bot typing">
              Typing<span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <form className="chat-input" onSubmit={sendMessage}>
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
          {showEmojiPicker && (
            <Picker onSelect={addEmoji} style={{ position: "absolute", bottom: "60px", right: "20px" }} />
          )}
          <input type="text" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} />
          <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
          <button type="button" onClick={() => fileInputRef.current.click()}>📎</button>
          {!recording && <button type="button" onClick={startRecording}>🎤</button>}
          {recording && <button type="button" onClick={stopRecording}>⏹️</button>}
          <button type="submit">➤</button>
        </form>
      </div>
    </div>
  );
}

export default App;
