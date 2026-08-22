"use client";
import React, { useEffect, useState, useRef } from "react";

import { db } from "../../lib/firebase";
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp } from "firebase/firestore";

export default function UnionCommunityPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<{id?: string, sender: string, text: string, time: string}[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen to Members
    const unsubscribeMembers = onSnapshot(collection(db, "members"), (snapshot) => {
      const membersData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembers(membersData.filter((m: any) => m.isPermitted));
    });

    // Listen to Chat Messages
    const q = query(collection(db, "chat"), orderBy("timestamp", "asc"));
    const unsubscribeChat = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setMessages(chatData);
    });

    return () => {
      unsubscribeMembers();
      unsubscribeChat();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const currentUser = localStorage.getItem("trtwa_current_user") || "Anonymous";

    await addDoc(collection(db, "chat"), {
      sender: currentUser,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: serverTimestamp()
    });
    
    setNewMessage("");
  };

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    alert("Thank you! Your feedback has been sent to the admin.");
    setFeedback("");
    setShowFeedbackModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 className="heading-1" style={{ margin: 0, fontSize: "1.75rem" }}>TRTWA Union Community</h1>
        <button onClick={() => setShowFeedbackModal(true)} className="btn btn-secondary">Send Feedback</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", flex: 1, minHeight: 0 }}>
        {/* Directory Sidebar */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: "1.5rem" }}>
          <h2 className="heading-2" style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Union Directory</h2>
          <p className="text-body" style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>Members approved by Admin</p>
          
          <div style={{ overflowY: "auto", flex: 1, paddingRight: "0.5rem" }}>
            {members.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>No permitted members yet.</p>
            ) : (
              members.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                  <div style={{ 
                    width: "40px", height: "40px", borderRadius: "50%", 
                    background: "var(--primary-color)", color: "white", 
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" 
                  }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>{m.name}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>{m.role}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: "1.5rem" }}>
          <h2 className="heading-2" style={{ fontSize: "1.25rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
            Community Chat
          </h2>
          
          <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "auto", marginBottom: "auto" }}>
                No messages yet. Say hi to the union!
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{ 
                  background: msg.sender.includes("Me") ? "rgba(79, 70, 229, 0.2)" : "rgba(255,255,255,0.05)", 
                  padding: "1rem", borderRadius: "12px",
                  alignSelf: msg.sender.includes("Me") ? "flex-end" : "flex-start",
                  maxWidth: "80%"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--primary-color)", fontWeight: "bold" }}>{msg.sender}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{msg.time}</span>
                  </div>
                  <p style={{ margin: 0, color: "var(--text-primary)" }}>{msg.text}</p>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "1rem" }}>
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message to the union..." 
              style={{ 
                flex: 1, padding: "0.75rem 1rem", borderRadius: "8px", 
                border: "1px solid var(--border-color)", background: "rgba(15, 23, 42, 0.6)", color: "white" 
              }}
            />
            <button type="submit" className="btn">Send</button>
          </form>
        </div>
      </div>

      {showFeedbackModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: "400px", padding: "2rem" }}>
            <h2 className="heading-2">Send Feedback</h2>
            <p className="text-body" style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>Have a suggestion or issue? Let the union admins know!</p>
            <form onSubmit={submitFeedback}>
              <div className="input-group">
                <textarea 
                  required 
                  rows={4}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Type your feedback here..." 
                />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>Submit</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowFeedbackModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
