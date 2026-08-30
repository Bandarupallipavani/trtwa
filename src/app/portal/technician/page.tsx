"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { auth, db, storage } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, collection, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function TechnicianPortal() {
  const [id, setId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const newsContainerRef = React.useRef<HTMLDivElement>(null);
  
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setId(currentUser.uid);
      } else {
        setId(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!id) return;
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

    const unsubscribeAds = onSnapshot(collection(db, "ads"), (snapshot) => {
      setAds(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as any)));
    });

    return () => {
      unsubscribeUser();
      unsubscribeNews();
      unsubscribeElections();
      unsubscribeMeetings();
      unsubscribeAds();
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

  const updateIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof id !== "string") return;
    setUploading(true);
    try {
      let photoUrl = user.idPhotoUrl || "";
      if (idPhotoFile) {
        const fileRef = ref(storage, `id_photos/${id}_${Date.now()}`);
        await uploadBytes(fileRef, idPhotoFile);
        photoUrl = await getDownloadURL(fileRef);
      }
      
      await updateDoc(doc(db, "members", id), {
        aadhaar: aadhaarInput || user.aadhaar || "",
        idPhotoUrl: photoUrl
      });
      setShowIdentityForm(false);
      setIdPhotoFile(null);
      alert("Identity Details Updated Successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating identity details.");
    } finally {
      setUploading(false);
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
        <h1 className="heading-1" style={{ margin: 0 }}>Technician Portal</h1>
        <Link href="/support/public" className="btn">View Support Tickets</Link>
      </div>

      {ads.length > 0 && (
        <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <h2 className="heading-2" style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>Dashboard Highlights</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
            {ads.map(ad => (
              <div key={ad.id} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
                {ad.type === "video" ? (
                  <video src={ad.url} style={{ width: "100%", height: "200px", objectFit: "cover" }} controls />
                ) : ad.type === "audio" ? (
                  <div style={{ padding: "1rem", height: "200px", display: "flex", alignItems: "center", background: "var(--bg-color)" }}>
                    <audio src={ad.url} style={{ width: "100%" }} controls />
                  </div>
                ) : (
                  <img src={ad.url} alt="Highlight" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>Email ID</p>
              <p style={{ fontWeight: 600, fontSize: "1.125rem", margin: "0.25rem 0 0 0", wordBreak: "break-all" }}>{user.email || "N/A"}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>Aadhaar Number</p>
              <p style={{ fontWeight: 600, fontSize: "1.125rem", margin: "0.25rem 0 0 0" }}>{user.aadhaar || "Not Provided"}</p>
            </div>
          </div>
          
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)", width: "100%" }}>
            <h3 className="heading-2" style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Identity Verification</h3>
            
            {user.idPhotoUrl ? (
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Uploaded ID Card:</p>
                <img src={user.idPhotoUrl} alt="ID Card" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", objectFit: "contain", border: "1px solid var(--border-color)" }} />
              </div>
            ) : (
              <div style={{ padding: "1rem", background: "rgba(245, 158, 11, 0.1)", color: "#d97706", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.875rem" }}>
                ⚠️ Please upload your ID Card photo for verification.
              </div>
            )}

            {!showIdentityForm ? (
              <button onClick={() => { setShowIdentityForm(true); setAadhaarInput(user.aadhaar || ""); }} className="btn btn-secondary">Update Identity Details</button>
            ) : (
              <form onSubmit={updateIdentity} style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "var(--bg-color)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Aadhaar Number</label>
                  <input type="text" value={aadhaarInput} onChange={e => setAadhaarInput(e.target.value)} placeholder="Enter Aadhaar Number" />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Upload ID Card Photo</label>
                  <input type="file" accept="image/*" capture="environment" onChange={e => setIdPhotoFile(e.target.files?.[0] || null)} />
                  <small style={{ color: "var(--text-secondary)" }}>Take a photo using your camera or select from gallery.</small>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="submit" className="btn" disabled={uploading}>
                    {uploading ? "Saving..." : "Save Details"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowIdentityForm(false)}>Cancel</button>
                </div>
              </form>
            )}
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
                        {election.options.map((opt: any) => {
                          const name = typeof opt === 'string' ? opt : opt.name;
                          const photoUrl = typeof opt === 'string' ? '' : opt.photoUrl;
                          return (
                          <button 
                            key={name}
                            onClick={() => castVote(election.id, name)}
                            className="btn btn-secondary" 
                            style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem", display: "flex", gap: "1rem", alignItems: "center" }}
                          >
                            {photoUrl && <img src={photoUrl} alt={name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />}
                            {name}
                          </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {/* Technician Portal Features */}
      <div className="card" style={{ padding: "1.5rem", marginTop: "2rem", border: "1px solid var(--border-color)" }}>
        <h2 className="heading-2" style={{ marginBottom: "1rem" }}>My Tasks</h2>
        <div style={{ padding: "1.5rem", background: "var(--bg-color)", borderRadius: "8px", textAlign: "center", color: "var(--text-secondary)" }}>
          <p>No tasks currently assigned to you.</p>
        </div>
      </div>
    </div>
  );
}
