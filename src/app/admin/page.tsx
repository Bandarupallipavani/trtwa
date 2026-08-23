"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export default function AdminDashboardPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ads, setAds] = useState<any[]>([]);
  const [newAd, setNewAd] = useState({ type: "image", url: "" });

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

    return () => {
      unsubscribeAds();
      unsubscribeMembers();
    };
  }, []);

  const [editingMember, setEditingMember] = useState<any>(null);

  const togglePermission = async (id: string) => {
    // Note: id here is the TRT ID, we need to find the member and use its uid
    const member = members.find(m => m.id === id);
    if (member) {
      await updateDoc(doc(db, "members", member.uid), { isPermitted: !member.isPermitted });
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
      `"${m.name}"`,
      m.role,
      m.phone,
      m.dob,
      `"${m.address || ""}"`,
      m.isPermitted ? "Permitted" : "Pending"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\\n" 
      + rows.map(e => e.join(",")).join("\\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trtwa_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.url) return;
    const id = Date.now().toString();
    await setDoc(doc(db, "ads", id), { ...newAd });
    setNewAd({ type: "image", url: "" });
  };

  const removeAd = async (id: string) => {
    await deleteDoc(doc(db, "ads", id));
  };

  const sendWhatsApp = (member: any) => {
    const text = `Hello ${member.name}, this is an official message from TRTWA Union Admin.`;
    // Using wa.me API. Phone number should ideally include country code, assuming India +91 if not present for prototype
    const phone = member.phone.length === 10 ? `91${member.phone}` : member.phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-1" style={{ margin: 0 }}>Admin Dashboard</h1>
        <div>
          <button onClick={exportToCSV} className="btn btn-secondary" style={{ marginRight: "1rem" }}>Export to Excel/CSV</button>
          <Link href="/members/new" className="btn btn-secondary" style={{ marginRight: "1rem" }}>Add User</Link>
          <Link href="/union" className="btn">View Union Page</Link>
        </div>
      </div>

      <div className="card" style={{ padding: 0, position: "relative" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem" }}>User Management & Permissions</h2>
            <p className="text-body" style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>Toggle 'Permitted' to allow users to appear in the Union directory and chat. Use Edit to modify roles.</p>
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
              <th style={{ padding: "1rem 1.5rem" }}>Mobile</th>
              <th style={{ padding: "1rem 1.5rem" }}>Address</th>
              <th style={{ padding: "1rem 1.5rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.filter(m => 
              (m.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (m.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
            ).map(member => (
              <tr key={member.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>{member.id}</td>
                <td style={{ padding: "1rem 1.5rem" }}>{member.name}</td>
                <td style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)" }}>{member.role}</td>
                <td style={{ padding: "1rem 1.5rem" }}>{member.phone}</td>
                <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={member.address}>{member.address || "N/A"}</td>
                <td style={{ padding: "1rem 1.5rem", display: "flex", gap: "0.5rem" }}>
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

      <div className="card" style={{ padding: 0, marginTop: "2rem" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem" }}>Login Page Ads Management</h2>
          <p className="text-body" style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>Manage the scrolling images and videos displayed on the login page.</p>
        </div>
        
        <div style={{ padding: "1.5rem" }}>
          <form onSubmit={addAd} style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "flex-end" }}>
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label>Media URL</label>
              <input type="url" placeholder="https://..." value={newAd.url} onChange={e => setNewAd({...newAd, url: e.target.value})} required />
            </div>
            <div className="input-group" style={{ width: "150px", margin: 0 }}>
              <label>Type</label>
              <select value={newAd.type} onChange={e => setNewAd({...newAd, type: e.target.value})}>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <button type="submit" className="btn">Add Media</button>
          </form>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
            {ads.map(ad => (
              <div key={ad.id} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
                {ad.type === "video" ? (
                  <video src={ad.url} style={{ width: "100%", height: "150px", objectFit: "cover" }} controls />
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
              <div style={{ color: "var(--text-secondary)" }}>No ads configured.</div>
            )}
          </div>
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
                  <option>Junior Technician</option>
                  <option>Senior Technician</option>
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
    </div>
  );
}
