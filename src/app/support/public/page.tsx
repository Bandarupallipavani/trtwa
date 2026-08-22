"use client";
import React, { useState } from "react";

export default function PublicSupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          <p className="text-body">Your ticket number is #REQ-{Math.floor(Math.random() * 10000)}. A technician will contact you shortly.</p>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Your Name</label>
              <input type="text" required placeholder="John Doe" />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input type="tel" required placeholder="Contact Number" />
            </div>
            <div className="input-group">
              <label>Customer Address</label>
              <textarea required rows={2} placeholder="Full residential address"></textarea>
            </div>
            <div className="input-group">
              <label>Device Name/Model</label>
              <input type="text" required placeholder="e.g. Aquaguard RO Water Purifier" />
            </div>
            <div className="input-group">
              <label>Issue Description</label>
              <textarea required rows={4} placeholder="Please describe the issue with your RO system..."></textarea>
            </div>
            <button type="submit" className="btn" style={{ width: "100%" }}>Submit Request</button>
          </form>
        </div>
      )}
    </div>
  );
}
