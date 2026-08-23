"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function DashboardPage() {
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "members"), (snapshot) => {
      const membersData = snapshot.docs.map(d => d.data());
      setTotalMembers(membersData.length);
      
      const today = new Date();
      const todayMonth = today.getMonth() + 1; // 1-12
      const todayDay = today.getDate(); // 1-31
      
      const bdays = membersData.filter(m => {
        if (!m.dob) return false;
        // Assume YYYY-MM-DD
        const parts = m.dob.split("-");
        if (parts.length === 3) {
          const month = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          return month === todayMonth && day === todayDay;
        }
        return false;
      });
      setBirthdays(bdays);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1 className="heading-1">Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        
        <div className="card" style={{ borderLeft: "4px solid var(--accent-color)" }}>
          <h2 className="heading-2">🎉 Birthday Wishes</h2>
          {birthdays.length > 0 ? (
            <div>
              {birthdays.map((b, i) => (
                <p key={i} className="text-body" style={{ marginBottom: "1rem" }}>
                  Today is <strong>{b.name}</strong>'s birthday!
                </p>
              ))}
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
              <strong>{totalMembers}</strong>
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
