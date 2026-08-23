"use client";
import React, { useState } from "react";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function PublicSupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", device: "", issue: "" });
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 className="heading-1">Customer Support Portal</h1>
      <p className="text-body" style={{ marginBottom: "2rem" }}>
        Need help with your RO system? Submit a service request and one of our certified TRTWA technicians will assist you.
      </p>

      {submitted ? (
        <div className="card" style={{ textAlign: "center", border: "1px solid var(--success-color)" }}>
          <h2 className="heading-2" style={{ color: "var(--success-color)" }}>Request Submitted!</h2>
          <p className="text-body">Your ticket number is #{ticketId}. A technician will contact you shortly.</p>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handleSubmit}>
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
        </div>
      )}
    </div>
  );
}
