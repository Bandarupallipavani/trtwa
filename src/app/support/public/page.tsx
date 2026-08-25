"use client";
import React, { useState } from "react";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function PublicSupportPage() {
  const [mode, setMode] = useState<"ticket" | "rating">("ticket");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ticket state
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", device: "", issue: "" });
  const [ticketId, setTicketId] = useState("");

  // Rating state
  const [ratingData, setRatingData] = useState({ name: "", phone: "", technicianName: "", rating: 5, comments: "" });

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const id = `REQ-${Math.floor(Math.random() * 9000) + 1000}`;
      await setDoc(doc(db, "tickets", id), {
        id,
        ...formData,
        status: "Open",
        createdAt: new Date().toISOString()
      });
      setTicketId(id);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const id = `RTG-${Date.now()}`;
      await setDoc(doc(db, "ratings", id), {
        id,
        ...ratingData,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit rating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 1rem" }}>
      <h1 className="heading-1">Customer Support Portal</h1>
      <p className="text-body" style={{ marginBottom: "2rem" }}>
        {mode === "ticket" ? "Need help with your RO system? Submit a service request." : "Rate your service experience with our members."}
      </p>

      {!submitted && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <button className={`btn ${mode === "ticket" ? "" : "btn-secondary"}`} style={{ flex: 1 }} onClick={() => setMode("ticket")}>Service Request</button>
          <button className={`btn ${mode === "rating" ? "" : "btn-secondary"}`} style={{ flex: 1 }} onClick={() => setMode("rating")}>Submit Rating</button>
        </div>
      )}

      {submitted ? (
        <div className="card" style={{ textAlign: "center", border: "1px solid var(--success-color)" }}>
          <h2 className="heading-2" style={{ color: "var(--success-color)" }}>{mode === "ticket" ? "Request Submitted!" : "Thank You!"}</h2>
          {mode === "ticket" ? (
            <p className="text-body">Your ticket number is #{ticketId}. A member will contact you shortly.</p>
          ) : (
            <p className="text-body">Your feedback has been received. We appreciate your input!</p>
          )}
          <button className="btn btn-secondary" style={{ marginTop: "1rem" }} onClick={() => { setSubmitted(false); setFormData({ name: "", phone: "", address: "", device: "", issue: "" }); setRatingData({ name: "", phone: "", technicianName: "", rating: 5, comments: "" }); }}>Submit Another</button>
        </div>
      ) : (
        <div className="card">
          {mode === "ticket" ? (
            <form onSubmit={handleTicketSubmit}>
              <div className="input-group">
                <label>Your Name</label>
                <input type="text" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" required placeholder="Contact Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Customer Address</label>
                <textarea required rows={2} placeholder="Full residential address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label>Device Name/Model</label>
                <input type="text" required placeholder="e.g. Aquaguard RO Water Purifier" value={formData.device} onChange={e => setFormData({...formData, device: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Issue Description</label>
                <textarea required rows={4} placeholder="Please describe the issue with your RO system..." value={formData.issue} onChange={e => setFormData({...formData, issue: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn" style={{ width: "100%" }} disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRatingSubmit}>
              <div className="input-group">
                <label>Your Name</label>
                <input type="text" required placeholder="John Doe" value={ratingData.name} onChange={e => setRatingData({...ratingData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" required placeholder="Contact Number" value={ratingData.phone} onChange={e => setRatingData({...ratingData, phone: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Member/Technician Name (Optional)</label>
                <input type="text" placeholder="Name of person who serviced" value={ratingData.technicianName} onChange={e => setRatingData({...ratingData, technicianName: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Rating (1-5 Stars)</label>
                <select value={ratingData.rating} onChange={e => setRatingData({...ratingData, rating: parseInt(e.target.value)})}>
                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ (4 - Good)</option>
                  <option value="3">⭐⭐⭐ (3 - Average)</option>
                  <option value="2">⭐⭐ (2 - Poor)</option>
                  <option value="1">⭐ (1 - Terrible)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Comments (Optional)</label>
                <textarea rows={3} placeholder="Tell us about your experience..." value={ratingData.comments} onChange={e => setRatingData({...ratingData, comments: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn" style={{ width: "100%", background: "var(--accent-color)" }} disabled={loading}>
                {loading ? "Submitting..." : "Submit Rating"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
