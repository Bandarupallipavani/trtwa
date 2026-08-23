"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Member {
  id: string;
  name: string;
  phone: string;
  dob: string;
  role: string;
  address?: string;
  bloodGroup?: string;
  photo?: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "members"), (snapshot) => {
      const membersData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Member[];
      setMembers(membersData);
    });
    return () => unsubscribe();
  }, []);

  const downloadIDCard = (member: Member) => {
    // Generate a simple ID card HTML, draw to canvas or just open a print window for the prototype
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ID Card - ${member.name}</title>
            <style>
              body { font-family: 'Arial', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0; margin: 0; }
              @media print {
                body { background: white; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .id-card { box-shadow: none !important; border: 1px solid #ccc !important; }
              }
              .id-card { background: white; width: 320px; height: 500px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); overflow: hidden; position: relative; display: flex; flex-direction: column; }
              .header { background: #4f46e5; color: white; padding: 15px; text-align: center; }
              .header h2 { margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px; }
              .header small { font-size: 12px; opacity: 0.9; }
              .content { 
                padding: 20px 20px 20px 35px; flex: 1; position: relative; display: flex; flex-direction: column;
              }
              .watermark {
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 160px; height: 160px; border-radius: 50%; object-fit: cover; opacity: 0.08; z-index: 0; pointer-events: none;
              }
              
              .main-info { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; margin-bottom: 15px; }
              .photo { width: 100px; height: 100px; background: #eee; border-radius: 50%; border: 3px solid #4f46e5; object-fit: cover; margin-bottom: 10px; }
              h3 { margin: 0 0 15px 0; color: #111; font-size: 22px; text-align: center; }
              
              .details { display: flex; flex-direction: column; align-items: flex-start; margin: 0 auto; width: fit-content; }
              .details p { margin: 5px 0; font-size: 13px; color: #333; text-align: left; }
              .details strong { color: #4f46e5; display: inline-block; width: 60px; }
              
              .left-code { 
                position: absolute; left: -45px; top: 50%; transform: translateY(-50%) rotate(-90deg); 
                font-size: 18px; font-weight: bold; color: rgba(79, 70, 229, 0.2); letter-spacing: 5px; z-index: 1; 
              }
              
              .signature { position: relative; z-index: 1; margin-top: auto; text-align: left; }
              .sig-line { width: 120px; border-bottom: 1px solid #333; margin-bottom: 5px; }
              .sig-text { font-size: 11px; color: #555; font-style: italic; }
              
              .footer { background: #10b981; color: white; text-align: center; padding: 10px; font-size: 12px; font-weight: bold; margin-top: 15px; z-index: 2; position: relative; }
            </style>
          </head>
          <body>
            <div class="id-card">
              <div class="header">
                <h2>TRTWA UNION</h2>
                <small>RO Technician</small>
              </div>
              <div class="content">
                <img src="${window.location.origin}/logo.jpeg" class="watermark" />
                <div class="left-code">${member.id}</div>
                
                <div class="main-info">
                  ${member.photo ? `<img src="${member.photo}" class="photo" />` : `<div class="photo"></div>`}
                  <div style="display: flex; gap: 15px; align-items: center; justify-content: center; width: 100%;">
                    <div class="details" style="margin: 0;">
                      <p><strong>Name:</strong> ${member.name}</p>
                      <p><strong>ID No:</strong> ${member.id}</p>
                      <p><strong>Phone:</strong> ${member.phone}</p>
                      <p><strong>Blood Grp:</strong> <span style="color: red; font-weight: bold;">${member.bloodGroup || 'N/A'}</span></p>
                    </div>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`Name: ${member.name}\nMobile: ${member.phone}\nBlood Group: ${member.bloodGroup || 'N/A'}`)}" style="width: 50px; height: 50px;" />
                  </div>
                </div>
                
                <div style="display: flex; gap: 15px; align-items: flex-end; width: 100%; position: relative; z-index: 1; margin-top: auto;">
                  <div class="signature" style="margin-top: 0;">
                    <div class="sig-line"></div>
                    <div class="sig-text">Authorised Signature</div>
                  </div>
                </div>
              </div>
              
              <div class="footer">Authorized Union Member</div>
            </div>
            <script>
              setTimeout(() => { window.print(); }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-1" style={{ margin: 0 }}>Union Members</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input 
            type="text" 
            placeholder="Search by ID, Name, or Phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ minWidth: "250px", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
          />
          <Link href="/members/new" className="btn">Add New Member</Link>
        </div>
      </div>

      <div className="card" style={{ padding: "0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "1rem 1.5rem" }}>ID</th>
              <th style={{ padding: "1rem 1.5rem" }}>Name</th>
              <th style={{ padding: "1rem 1.5rem" }}>Role</th>
              <th style={{ padding: "1rem 1.5rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.filter(m => 
              (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (m.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (m.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
            ).map(member => (
              <tr key={member.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "1rem 1.5rem" }}>{member.id}</td>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>{member.name}</td>
                <td style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)" }}>{member.role}</td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  <button className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }} onClick={() => downloadIDCard(member)}>
                    Generate ID
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.filter(m => 
          (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            No members found.
          </div>
        )}
      </div>
    </div>
  );
}
