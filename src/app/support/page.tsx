"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function TechnicianSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tickets"), (snapshot) => {
      const ticketsData = snapshot.docs.map(d => ({ dbId: d.id, ...d.data() } as any));
      // Sort by newest first (descending)
      ticketsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTickets(ticketsData);
    });
    return () => unsubscribe();
  }, []);

  const exportToCSV = () => {
    const headers = ["Ticket ID", "Customer", "Address", "Device", "Issue", "Status"];
    const rows = tickets.map(t => [
      t.id,
      `"${t.customer}"`,
      `"${t.address}"`,
      `"${t.device}"`,
      `"${t.issue}"`,
      t.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "support_tickets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleStatus = async (ticket: any) => {
    const nextStatus = ticket.status === "Open" ? "In Progress" : (ticket.status === "In Progress" ? "Closed" : "Open");
    await updateDoc(doc(db, "tickets", ticket.dbId), { status: nextStatus });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-1" style={{ margin: 0 }}>Service Tickets</h1>
        <div>
          <button onClick={exportToCSV} className="btn btn-secondary" style={{ marginRight: "1rem" }}>Export to Excel/CSV</button>
          <Link href="/support/public" className="btn btn-secondary" target="_blank">View Public Portal</Link>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "1rem 1.5rem" }}>Ticket ID</th>
              <th style={{ padding: "1rem 1.5rem" }}>Customer</th>
              <th style={{ padding: "1rem 1.5rem" }}>Address</th>
              <th style={{ padding: "1rem 1.5rem" }}>Device</th>
              <th style={{ padding: "1rem 1.5rem" }}>Issue</th>
              <th style={{ padding: "1rem 1.5rem" }}>Status</th>
              <th style={{ padding: "1rem 1.5rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.dbId} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>{t.id}</td>
                <td style={{ padding: "1rem 1.5rem" }}>{t.name}</td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem" }}>{t.address}</td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem" }}>{t.device}</td>
                <td style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)" }}>{t.issue}</td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  <span style={{ 
                    padding: "0.25rem 0.75rem", 
                    borderRadius: "999px", 
                    fontSize: "0.875rem",
                    background: t.status === "Open" ? "rgba(245, 158, 11, 0.2)" : (t.status === "Closed" ? "rgba(107, 114, 128, 0.2)" : "rgba(16, 185, 129, 0.2)"),
                    color: t.status === "Open" ? "var(--accent-color)" : (t.status === "Closed" ? "#6b7280" : "var(--success-color)")
                  }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding: "1rem 1.5rem", display: "flex", gap: "0.5rem" }}>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.address)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn" 
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", background: "#3b82f6", color: "white", borderColor: "#3b82f6", textDecoration: "none" }}
                  >
                    Map
                  </a>
                  <button onClick={() => toggleStatus(t)} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Update</button>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  No service tickets found. Customer requests will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

