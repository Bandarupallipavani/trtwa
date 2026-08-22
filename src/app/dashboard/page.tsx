"use client";
import React, { useEffect, useState } from "react";

export default function DashboardPage() {
  const [birthdays, setBirthdays] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("trtwa_members");
    if (stored) {
      const members = JSON.parse(stored);
      // For demo, just pick the first member as having a birthday today if there is one
      if (members.length > 0) {
        setBirthdays([members[0]]);
      }
    }
  }, []);

  return (
    <div>
      <h1 className="heading-1">Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        
        <div className="card" style={{ borderLeft: "4px solid var(--accent-color)" }}>
          <h2 className="heading-2">🎉 Birthday Wishes</h2>
          {birthdays.length > 0 ? (
            <div>
              <p className="text-body" style={{ marginBottom: "1rem" }}>
                Today is <strong>{birthdays[0].name}</strong>'s birthday!
              </p>
              <button className="btn" onClick={() => alert("Wishes sent successfully!")}>Send Automated Wishes</button>
            </div>
          ) : (
            <p className="text-body">No birthdays today.</p>
          )}
        </div>

        <div className="card">
          <h2 className="heading-2">Union Stats</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between" }}>
              <span className="text-body">Total Members</span>
              <strong>1</strong>
            </li>
            <li style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between" }}>
              <span className="text-body">Active Tickets</span>
              <strong>0</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
