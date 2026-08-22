"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("trtwa_members");
    if (stored) {
      const members = JSON.parse(stored);
      const found = members.find((m: any) => m.id === id);
      setUser(found);
    }
  }, [id]);

  if (!user) {
    return <div style={{ textAlign: "center", marginTop: "4rem" }}>User not found.</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-1" style={{ margin: 0 }}>My Profile</h1>
        <Link href="/union" className="btn">Go to Union Chat</Link>
      </div>

      <div className="card" style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        {user.photo ? (
          <img src={user.photo} alt={user.name} style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <div style={{ 
            width: "150px", height: "150px", 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "3rem", fontWeight: "bold"
          }}>
            {user.name.charAt(0)}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h2 className="heading-2" style={{ marginBottom: "0.25rem" }}>{user.name}</h2>
          <div style={{ 
            display: "inline-block", padding: "0.25rem 0.75rem", 
            background: "rgba(79, 70, 229, 0.2)", color: "var(--primary-color)", 
            borderRadius: "999px", fontSize: "0.875rem", marginBottom: "1.5rem", fontWeight: 600
          }}>
            {user.role}
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>Union ID</p>
              <p style={{ fontWeight: 600, fontSize: "1.125rem", margin: "0.25rem 0 0 0" }}>{user.id}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>Phone</p>
              <p style={{ fontWeight: 600, fontSize: "1.125rem", margin: "0.25rem 0 0 0" }}>{user.phone}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>Date of Birth</p>
              <p style={{ fontWeight: 600, fontSize: "1.125rem", margin: "0.25rem 0 0 0" }}>{user.dob}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>Union Access Status</p>
              <p style={{ 
                fontWeight: 600, fontSize: "1.125rem", margin: "0.25rem 0 0 0",
                color: user.isPermitted ? "var(--success-color)" : "var(--error-color)"
              }}>
                {user.isPermitted ? "Approved" : "Pending Admin Approval"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
