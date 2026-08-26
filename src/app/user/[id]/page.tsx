"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { db } from "../../../lib/firebase";
import { doc, collection, onSnapshot, updateDoc } from "firebase/firestore";

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const newsContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = newsContainerRef.current;
    if (!container) return;
    
    let scrollInterval: NodeJS.Timeout;
    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 1) {
          container.scrollTop = 0;
        } else {
          container.scrollTop += 1;
        }
      }, 50);
    };

    startScrolling();

    const stopScrolling = () => clearInterval(scrollInterval);
    container.addEventListener('mouseenter', stopScrolling);
    container.addEventListener('mouseleave', startScrolling);

    return () => {
      clearInterval(scrollInterval);
      if (container) {
        container.removeEventListener('mouseenter', stopScrolling);
        container.removeEventListener('mouseleave', startScrolling);
      }
    };
  }, [news]);

  useEffect(() => {
    if (typeof id !== "string") return;
    const unsubscribeUser = onSnapshot(doc(db, "members", id), (docSnap) => {
      if (docSnap.exists()) {
        setUser({ id: docSnap.id, ...docSnap.data() });
      } else {
        setUser(null);
      }
    });

    const unsubscribeNews = onSnapshot(collection(db, "news"), (snapshot) => {
      const newsData = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as any));
      newsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setNews(newsData);
    });

    const unsubscribeElections = onSnapshot(collection(db, "elections"), (snapshot) => {
      const electionsData = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as any));
      electionsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setElections(electionsData);
    });

    const unsubscribeMeetings = onSnapshot(collection(db, "meetings"), (snapshot) => {
      const meetingsData = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as any));
      const active = meetingsData.find(m => m.isActive);
      setActiveMeeting(active || null);
    });

    return () => {
      unsubscribeUser();
      unsubscribeNews();
      unsubscribeElections();
      unsubscribeMeetings();
    };
  }, [id]);

  const castVote = async (electionId: string, option: string) => {
    if (typeof id !== "string") return;
    try {
      const election = elections.find(e => e.id === electionId);
      if (!election) return;
      const newVotes = { ...election.votes, [id]: option };
      await updateDoc(doc(db, "elections", electionId), { votes: newVotes });
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return <div style={{ textAlign: "center", marginTop: "4rem" }}>User not found.</div>;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}>
      {activeMeeting && (
        <div style={{ marginBottom: "2rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "8px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", animation: "pulse 2s infinite" }}></span>
              LIVE: Union Meeting in Progress
            </h3>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>The Admin has started a live video broadcast.</p>
          </div>
          <a href={`https://meet.jit.si/${activeMeeting.id}`} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: "#ef4444", color: "white" }}>
            Click to Join
          </a>
        </div>
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-1" style={{ margin: 0 }}>My Profile</h1>
        <Link href="/union" className="btn">Go to Union Chat</Link>
      </div>

      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 500px", display: "flex", gap: "2rem", alignItems: "flex-start" }}>
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
        <div className="card" style={{ flex: "1 1 350px", padding: 0 }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem" }}>Daily News & Updates</h2>
            <p className="text-body" style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>Latest announcements from TRT Union Admin</p>
          </div>
          <div ref={newsContainerRef} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "400px", overflowY: "auto", scrollBehavior: "smooth" }}>
            {news.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", textAlign: "center" }}>No news updates yet.</div>
            ) : (
              news.map(item => (
                <div key={item.id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                  <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{item.text}</p>
                  {item.attachmentUrl && (
                    <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                      <iframe 
                        src={`${item.attachmentUrl}#view=FitH`} 
                        width="100%" 
                        height="300px" 
                        style={{ border: "1px solid var(--border-color)", borderRadius: "8px" }}
                        title="PDF Attachment"
                      />
                      <div style={{ marginTop: "0.5rem" }}>
                        <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", color: "var(--primary-color)", fontWeight: "bold", textDecoration: "none", fontSize: "0.875rem" }}>
                          ↗ Open PDF in New Tab
                        </a>
                      </div>
                    </div>
                  )}
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="card" style={{ flex: "1 1 350px", padding: 0 }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem" }}>Active Union Votes</h2>
            <p className="text-body" style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>Cast your vote for active union elections.</p>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "400px", overflowY: "auto" }}>
            {elections.filter(e => e.isActive).length === 0 ? (
              <div style={{ color: "var(--text-secondary)", textAlign: "center" }}>No active elections right now.</div>
            ) : (
              elections.filter(e => e.isActive).map(election => {
                const hasVoted = typeof id === "string" && election.votes && election.votes[id];
                return (
                  <div key={election.id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>{election.title}</h3>
                    {hasVoted ? (
                      <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success-color)", padding: "1rem", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>
                        ✅ Vote Submitted
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {election.options.map((opt: string) => (
                          <button 
                            key={opt}
                            onClick={() => castVote(election.id, opt)}
                            className="btn btn-secondary" 
                            style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem" }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
