"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db, storage } from "../../lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminDashboardPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ads, setAds] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const [newAd, setNewAd] = useState({ type: "image", url: "" });
  const [adFile, setAdFile] = useState<File | null>(null);
  const [adUploading, setAdUploading] = useState(false);
  const [newsText, setNewsText] = useState("");
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [newElectionTitle, setNewElectionTitle] = useState("");
  const [candidates, setCandidates] = useState<{name: string, file: File | null}[]>([{name: "", file: null}, {name: "", file: null}]);
  const [settings, setSettings] = useState<any>({ whatsapp1: "7799116692", whatsapp2: "9908894681", signatureUrl: "" });
  const [whatsapp1Input, setWhatsapp1Input] = useState("");
  const [whatsapp2Input, setWhatsapp2Input] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    // Listen to Ads
    const unsubscribeAds = onSnapshot(collection(db, "ads"), (snapshot) => {
      if (snapshot.empty) {
        const defaultAds = [
          { id: "1", type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
          { id: "2", type: "image", url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80" }
        ];
        defaultAds.forEach(ad => setDoc(doc(db, "ads", ad.id), ad));
      } else {
        const adsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAds(adsData);
      }
    });

    // Listen to Members
    const unsubscribeMembers = onSnapshot(collection(db, "members"), (snapshot) => {
      const membersData = snapshot.docs.map(d => ({ ...d.data(), uid: d.id }));
      setMembers(membersData);
    });

    // Listen to Ratings
    const unsubscribeRatings = onSnapshot(collection(db, "ratings"), (snapshot) => {
      const ratingsData = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as any));
      ratingsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setRatings(ratingsData);
    });

    // Listen to News
    const unsubscribeNews = onSnapshot(collection(db, "news"), (snapshot) => {
      const newsData = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as any));
      newsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setNews(newsData);
    });

    // Listen to Elections
    const unsubscribeElections = onSnapshot(collection(db, "elections"), (snapshot) => {
      const electionsData = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as any));
      electionsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setElections(electionsData);
    });

    // Listen to Meetings
    const unsubscribeMeetings = onSnapshot(collection(db, "meetings"), (snapshot) => {
      const meetingsData = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as any));
      const active = meetingsData.find(m => m.isActive);
      setActiveMeeting(active || null);
    });

    // Listen to Settings
    const unsubscribeSettings = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(data);
        setWhatsapp1Input(data.whatsapp1 || "7799116692");
        setWhatsapp2Input(data.whatsapp2 || "9908894681");
      } else {
        setWhatsapp1Input("7799116692");
        setWhatsapp2Input("9908894681");
      }
    });

    return () => {
      unsubscribeAds();
      unsubscribeMembers();
      unsubscribeRatings();
      unsubscribeNews();
      unsubscribeElections();
      unsubscribeMeetings();
      unsubscribeSettings();
    };
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let sigUrl = settings?.signatureUrl || "";
      if (signatureFile) {
        const sigRef = ref(storage, `settings/signature_${Date.now()}`);
        await uploadBytes(sigRef, signatureFile);
        sigUrl = await getDownloadURL(sigRef);
      }
      await setDoc(doc(db, "settings", "general"), {
        whatsapp1: whatsapp1Input,
        whatsapp2: whatsapp2Input,
        signatureUrl: sigUrl
      }, { merge: true });
      setSignatureFile(null);
      alert("Settings updated successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const startMeeting = async () => {
    try {
      const newId = `trtwa-meeting-${Date.now()}`;
      await setDoc(doc(db, "meetings", newId), {
        isActive: true,
        startedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const endMeeting = async (id: string) => {
    try {
      await updateDoc(doc(db, "meetings", id), { isActive: false });
    } catch (err) {
      console.error(err);
    }
  };

  const addNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsText.trim() && !newsFile) return;
    try {
      const newId = Date.now().toString();
      let attachmentUrl = "";
      
      if (newsFile) {
        const fileRef = ref(storage, `news/${newId}_${newsFile.name}`);
        await uploadBytes(fileRef, newsFile);
        attachmentUrl = await getDownloadURL(fileRef);
      }

      await setDoc(doc(db, "news", newId), {
        text: newsText,
        attachmentUrl,
        createdAt: new Date().toISOString()
      });
      setNewsText("");
      setNewsFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const createElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElectionTitle.trim()) return;
    setAdUploading(true);
    try {
      const newId = Date.now().toString();
      const optionsArray = [];
      for (const cand of candidates) {
        if (!cand.name.trim()) continue;
        let photoUrl = "";
        if (cand.file) {
          const fileRef = ref(storage, `elections/${newId}_${cand.file.name}`);
          await uploadBytes(fileRef, cand.file);
          photoUrl = await getDownloadURL(fileRef);
        }
        optionsArray.push({ name: cand.name.trim(), photoUrl });
      }

      if (optionsArray.length < 2) {
        alert("Please provide at least 2 candidates");
        setAdUploading(false);
        return;
      }

      await setDoc(doc(db, "elections", newId), {
        title: newElectionTitle,
        options: optionsArray,
        votes: {},
        isActive: true,
        createdAt: new Date().toISOString()
      });
      setNewElectionTitle("");
      setCandidates([{name: "", file: null}, {name: "", file: null}]);
    } catch (err) {
      console.error(err);
    } finally {
      setAdUploading(false);
    }
  };

  const closeElection = async (id: string) => {
    await updateDoc(doc(db, "elections", id), { isActive: false });
  };
  
  const deleteElection = async (id: string) => {
    if (confirm("Delete this election?")) {
      await deleteDoc(doc(db, "elections", id));
    }
  };

  const deleteNews = async (id: string) => {
    try {
      await deleteDoc(doc(db, "news", id));
    } catch (err) {
      console.error(err);
    }
  };

  const [editingMember, setEditingMember] = useState<any>(null);
  const [adminTab, setAdminTab] = useState<"all" | "pending">("all");

  const togglePermission = async (id: string) => {
    const member = members.find(m => m.id === id);
    if (member) {
      await updateDoc(doc(db, "members", member.uid), { isPermitted: !member.isPermitted });
    }
  };

  const deleteMember = async (uid: string) => {
    if (confirm("Are you sure you want to completely remove this member?")) {
      await deleteDoc(doc(db, "members", uid));
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    await updateDoc(doc(db, "members", editingMember.uid), editingMember);
    setEditingMember(null);
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Role", "Phone", "DOB", "Address", "Union Access"];
    const rows = members.map(m => [
      m.id,
      `"${(m.name || "").replace(/"/g, '""')}"`,
      m.role,
      m.phone,
      m.dob,
      `"${(m.address || "").replace(/"/g, '""')}"`,
      m.isPermitted ? "Permitted" : "Pending"
    ]);
    
    const csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "trtwa_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.url && !adFile) return;
    setAdUploading(true);
    const id = Date.now().toString();
    
    let finalUrl = newAd.url;
    try {
      if (adFile) {
        const fileRef = ref(storage, `ads/${id}_${adFile.name}`);
        await uploadBytes(fileRef, adFile);
        finalUrl = await getDownloadURL(fileRef);
      }
      
      await setDoc(doc(db, "ads", id), { type: newAd.type, url: finalUrl });
      setNewAd({ type: "image", url: "" });
      setAdFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setAdUploading(false);
    }
  };

  const removeAd = async (id: string) => {
    await deleteDoc(doc(db, "ads", id));
  };

  const sendWhatsApp = (member: any) => {
    const text = `Hello ${member.name}, this is an official message from TRT Union Admin.`;
    const phone = member.phone.length === 10 ? `91${member.phone}` : member.phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      await updatePassword(auth.currentUser, newPassword);
      setPasswordMsg("Password updated successfully!");
      setNewPassword("");
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err: any) {
      console.error(err);
      setPasswordMsg("Error updating password: " + err.message);
    }
  };

  return (
    <div>
      <div className="flex-row-mobile-col mobile-gap-sm mobile-mt" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-1" style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={() => setShowPasswordModal(true)} className="btn btn-secondary">Change My Password</button>
          <button onClick={exportToCSV} className="btn btn-secondary">Export to Excel/CSV</button>
          <Link href="/members/new" className="btn btn-secondary">Add User</Link>
          <Link href="/union" className="btn">View Union Page</Link>
        </div>
      </div>

      <div className="card" style={{ padding: 0, position: "relative" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              User Management
              <span style={{ fontSize: "0.875rem", background: "var(--primary-color)", color: "white", padding: "0.25rem 0.75rem", borderRadius: "999px", fontWeight: "normal" }}>
                Total Members: {members.length}
              </span>
            </h2>
            <p className="text-body" style={{ margin: "0.5rem 0 1rem 0", fontSize: "0.875rem" }}>Toggle 'Permitted' to allow users to appear in the Union directory and chat. Use Edit to modify roles.</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                className={adminTab === "all" ? "btn" : "btn btn-secondary"} 
                onClick={() => setAdminTab("all")}
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                All Members
              </button>
              <button 
                className={adminTab === "pending" ? "btn" : "btn btn-secondary"} 
                onClick={() => setAdminTab("pending")}
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                Pending Permissions
                {members.filter(m => !m.isPermitted).length > 0 && (
                  <span style={{ background: "var(--error-color)", color: "white", padding: "0.1rem 0.5rem", borderRadius: "999px", fontSize: "0.75rem" }}>
                    {members.filter(m => !m.isPermitted).length}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div style={{ minWidth: "300px" }}>
            <input 
              type="text" 
              placeholder="Search by Village, Name, or Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "1rem 1.5rem" }}>ID</th>
              <th style={{ padding: "1rem 1.5rem" }}>Name</th>
              <th style={{ padding: "1rem 1.5rem" }}>Role</th>
              <th style={{ padding: "1rem 1.5rem" }}>Email ID</th>
              <th style={{ padding: "1rem 1.5rem" }}>Mobile</th>
              <th style={{ padding: "1rem 1.5rem" }}>Address</th>
              <th style={{ padding: "1rem 1.5rem" }}>Password</th>
              <th style={{ padding: "1rem 1.5rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.filter(m => adminTab === "pending" ? !m.isPermitted : true).filter(m => 
              (m.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (m.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
            ).map(member => (
              <tr key={member.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>{member.id}</td>
                <td style={{ padding: "1rem 1.5rem" }}>{member.name}</td>
                <td style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)" }}>{member.role}</td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", minWidth: "200px" }}>{member.email || "N/A"}</td>
                <td style={{ padding: "1rem 1.5rem", whiteSpace: "nowrap" }}>{member.phone}</td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={member.address}>{member.address || "N/A"}</td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem" }}>{member.password || "Not Available"}</td>
                <td style={{ padding: "1rem 1.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <button 
                    className={member.isPermitted ? "btn" : "btn btn-secondary"} 
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", background: member.isPermitted ? "var(--success-color)" : "" }}
                    onClick={() => togglePermission(member.id)}
                  >
                    {member.isPermitted ? "Permitted" : "Grant Access"}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    onClick={() => setEditingMember(member)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn" 
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", background: "#25D366", borderColor: "#25D366", color: "white" }}
                    onClick={() => sendWhatsApp(member)}
                  >
                    WhatsApp
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}
                    onClick={() => deleteMember(member.uid)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {members.filter(m => 
          (m.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            No users found matching your search.
          </div>
        )}
      </div>

        <div className="card" style={{ flex: "1 1 350px", padding: 0, marginTop: "2rem" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem" }}>Daily News & Updates</h2>
            <p className="text-body" style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>Post updates to be displayed on every member's dashboard.</p>
          </div>
          
          <div style={{ padding: "1.5rem" }}>
            <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem", borderLeft: "4px solid #3b82f6" }}>
              <h2 className="heading-2" style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>Live Video Meetings</h2>
              <p className="text-body" style={{ margin: "0 0 1rem 0", fontSize: "0.875rem" }}>Start a live video broadcast for all union members.</p>
              
              {activeMeeting ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>🔴 Meeting in Progress</span>
                    <button onClick={() => endMeeting(activeMeeting.id)} className="btn btn-secondary" style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}>End Meeting</button>
                  </div>
                  <iframe 
                    src={`https://meet.jit.si/${activeMeeting.id}`} 
                    width="100%" 
                    height="600px" 
                    style={{ border: "1px solid var(--border-color)", borderRadius: "8px" }}
                    allow="camera; microphone; fullscreen; display-capture"
                  />
                </div>
              ) : (
                <button onClick={startMeeting} className="btn" style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}>▶ Start Live Meeting</button>
              )}
            </div>

            <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
              <h2 className="heading-2" style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>Union Settings (WhatsApp & Signature)</h2>
              <p className="text-body" style={{ margin: "0 0 1rem 0", fontSize: "0.875rem" }}>Update the contact numbers for the floating WhatsApp button and upload the Union Leader's signature for ID cards.</p>
              <form onSubmit={saveSettings} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div className="input-group" style={{ margin: 0, flex: "1 1 150px" }}>
                  <label>WhatsApp Number 1</label>
                  <input type="text" value={whatsapp1Input} onChange={e => setWhatsapp1Input(e.target.value)} required />
                </div>
                <div className="input-group" style={{ margin: 0, flex: "1 1 150px" }}>
                  <label>WhatsApp Number 2</label>
                  <input type="text" value={whatsapp2Input} onChange={e => setWhatsapp2Input(e.target.value)} required />
                </div>
                <div className="input-group" style={{ margin: 0, flex: "1 1 200px" }}>
                  <label>Union Leader Signature (Image)</label>
                  <input type="file" accept="image/*" onChange={e => setSignatureFile(e.target.files?.[0] || null)} />
                  {settings?.signatureUrl && <div style={{marginTop:"0.5rem", fontSize:"0.8rem", color:"var(--success-color)"}}>✓ Signature Currently Uploaded</div>}
                </div>
                <button type="submit" className="btn" style={{ height: "42px" }}>Save Settings</button>
              </form>
            </div>

            <form onSubmit={addNews} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label>Update Content</label>
              <textarea 
                placeholder="Write your news update here..." 
                value={newsText} 
                onChange={e => setNewsText(e.target.value)} 
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)", resize: "vertical", minHeight: "80px" }}
              />
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label>Attach PDF (Optional)</label>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={e => setNewsFile(e.target.files?.[0] || null)}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}
              />
            </div>
            <button type="submit" className="btn" style={{ height: "42px" }}>Post Update</button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {news.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", textAlign: "center" }}>No news updates posted yet.</div>
            ) : (
              news.map(item => (
                <div key={item.id} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div>
                    <p style={{ margin: "0 0 0.5rem 0", whiteSpace: "pre-wrap" }}>{item.text}</p>
                    {item.attachmentUrl && (
                      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                        <iframe 
                          src={`${item.attachmentUrl}#view=FitH`} 
                          width="100%" 
                          height="400px" 
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
                  <button onClick={() => deleteNews(item.id)} className="btn btn-secondary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}>Delete</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, marginTop: "2rem" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem" }}>Union Voting & Elections</h2>
          <p className="text-body" style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>Create elections for union members to vote on securely.</p>
        </div>
        
        <div style={{ padding: "1.5rem" }}>
          <form onSubmit={createElection} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label>Election Title</label>
              <input type="text" placeholder="e.g. Union President 2026" value={newElectionTitle} onChange={e => setNewElectionTitle(e.target.value)} required />
            </div>
            
            <label>Candidates</label>
            {candidates.map((cand, idx) => (
              <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
                <div className="input-group" style={{ flex: 1, margin: 0 }}>
                  <input type="text" placeholder={`Candidate ${idx + 1} Name`} value={cand.name} onChange={e => {
                    const newC = [...candidates];
                    newC[idx].name = e.target.value;
                    setCandidates(newC);
                  }} />
                </div>
                <div className="input-group" style={{ flex: 1, margin: 0 }}>
                  <input type="file" accept="image/*" onChange={e => {
                    const newC = [...candidates];
                    newC[idx].file = e.target.files?.[0] || null;
                    setCandidates(newC);
                  }} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setCandidates([...candidates, {name: "", file: null}])} className="btn btn-secondary" style={{ width: "fit-content" }}>+ Add Another Candidate</button>

            <button type="submit" className="btn" style={{ height: "42px", marginTop: "1rem" }} disabled={adUploading}>{adUploading ? "Creating..." : "Create Election"}</button>
          </form>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
            {elections.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", textAlign: "center" }}>No elections found.</div>
            ) : (
              elections.map(election => {
                const voteCounts: Record<string, number> = {};
                election.options.forEach((opt: any) => {
                  const name = typeof opt === 'string' ? opt : opt.name;
                  voteCounts[name] = 0;
                });
                let totalVotes = 0;
                
                if (election.votes) {
                  Object.values(election.votes).forEach((vote: any) => {
                    if (voteCounts[vote] !== undefined) {
                      voteCounts[vote]++;
                      totalVotes++;
                    }
                  });
                }

                return (
                  <div key={election.id} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1.5rem", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ margin: "0 0 0.5rem 0" }}>{election.title}</h3>
                        <span style={{ 
                          display: "inline-block", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold",
                          background: election.isActive ? "var(--success-color)" : "rgba(255,255,255,0.1)", color: election.isActive ? "white" : "var(--text-secondary)"
                        }}>
                          {election.isActive ? "ACTIVE" : "CLOSED"}
                        </span>
                        <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginLeft: "1rem" }}>{totalVotes} total votes</span>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {election.isActive && (
                          <button onClick={() => closeElection(election.id)} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Close Voting</button>
                        )}
                        <button onClick={() => deleteElection(election.id)} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}>Delete</button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {election.options.map((opt: any) => {
                        const name = typeof opt === 'string' ? opt : opt.name;
                        const photoUrl = typeof opt === 'string' ? '' : opt.photoUrl;
                        const count = voteCounts[name] || 0;
                        const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                        return (
                          <div key={name} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                            {photoUrl && (
                              <img src={photoUrl} alt={name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                                <span>{name}</span>
                                <span style={{ fontWeight: "bold" }}>{count} votes ({percentage}%)</span>
                              </div>
                              <div style={{ width: "100%", height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px", overflow: "hidden" }}>
                                <div style={{ width: `${percentage}%`, height: "100%", background: "var(--primary-color)", borderRadius: "6px" }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>


      <div className="card" style={{ padding: 0, marginTop: "2rem" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem" }}>Dashboard Highlights & Media</h2>
          <p className="text-body" style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>Manage the scrolling images, videos, and music displayed on the member dashboards.</p>
        </div>
        
        <div style={{ padding: "1.5rem" }}>
          <form onSubmit={addAd} style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="input-group" style={{ flex: 1, margin: 0, minWidth: "200px" }}>
              <label>Upload Media File</label>
              <input type="file" accept="image/*,video/*,audio/*" onChange={e => setAdFile(e.target.files?.[0] || null)} />
            </div>
            <div className="input-group" style={{ flex: 1, margin: 0, minWidth: "200px" }}>
              <label>OR External Media URL</label>
              <input type="url" placeholder="https://..." value={newAd.url} onChange={e => setNewAd({...newAd, url: e.target.value})} />
            </div>
            <div className="input-group" style={{ width: "150px", margin: 0 }}>
              <label>Type</label>
              <select value={newAd.type} onChange={e => setNewAd({...newAd, type: e.target.value})}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Music/Audio</option>
              </select>
            </div>
            <button type="submit" className="btn" disabled={adUploading}>{adUploading ? "Uploading..." : "Add Media"}</button>
          </form>

          <div className="grid-3-mobile-1" style={{ gap: "1.5rem" }}>
            {ads.map(ad => (
              <div key={ad.id} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
                {ad.type === "video" ? (
                  <video src={ad.url} style={{ width: "100%", height: "150px", objectFit: "cover" }} controls />
                ) : ad.type === "audio" ? (
                  <div style={{ padding: "1rem", height: "150px", display: "flex", alignItems: "center", background: "var(--bg-color)" }}>
                    <audio src={ad.url} style={{ width: "100%" }} controls />
                  </div>
                ) : (
                  <img src={ad.url} alt="Ad" style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                )}
                <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>{ad.type}</span>
                  <button onClick={() => removeAd(ad.id)} className="btn btn-secondary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}>Delete</button>
                </div>
              </div>
            ))}
            {ads.length === 0 && (
              <div style={{ color: "var(--text-secondary)" }}>No media configured.</div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, marginTop: "2rem" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem" }}>Customer Ratings & Feedback</h2>
          <p className="text-body" style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>Reviews submitted by customers on the public support portal.</p>
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {ratings.length === 0 ? (
            <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>No customer ratings yet.</div>
          ) : (
            ratings.map(rating => (
              <div key={rating.id} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong>{rating.name}</strong>
                  <span style={{ color: "var(--accent-color)" }}>
                    {Array(rating.rating).fill("⭐").join("")}
                  </span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  Phone: {rating.phone} {rating.technicianName && `| Serviced by: ${rating.technicianName}`}
                </div>
                {rating.comments && (
                  <p style={{ margin: 0, fontSize: "0.875rem", fontStyle: "italic" }}>"{rating.comments}"</p>
                )}
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  {new Date(rating.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingMember && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: "400px", padding: "2rem" }}>
            <h2 className="heading-2">Edit Member</h2>
            <form onSubmit={handleEditSave}>
              <div className="input-group">
                <label>Name</label>
                <input type="text" value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value})}>
                  <option>Junior Member</option>
                  <option>Senior Member</option>
                  <option>Supervisor</option>
                  <option>Union Admin</option>
                </select>
              </div>
              <div className="input-group">
                <label>Phone</label>
                <input type="tel" value={editingMember.phone} onChange={e => setEditingMember({...editingMember, phone: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Address</label>
                <textarea value={editingMember.address || ""} onChange={e => setEditingMember({...editingMember, address: e.target.value})} rows={2} required />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingMember(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem" }}>Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>✕</button>
            </div>
            {passwordMsg && <div style={{ background: passwordMsg.includes("Error") ? "var(--error-color)" : "var(--success-color)", color: "white", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.875rem" }}>{passwordMsg}</div>}
            <form onSubmit={handleChangePassword}>
              <div className="input-group">
                <label>New Password</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
