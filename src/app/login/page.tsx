"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("trtwa_current_user", username);
    if (username.toLowerCase() === "admin") {
      router.push("/admin");
    } else {
      router.push(`/user/${username}`);
    }
  };

  const [ads, setAds] = useState<any[]>([]);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "ads"), (snapshot) => {
      if (!snapshot.empty) {
        const adsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAds(adsData);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ maxWidth: "1100px", margin: "4rem auto", padding: "0 1rem", display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "center", justifyContent: "center" }}>
      {ads.length > 0 && (
        <div style={{ flex: "1 1 450px", maxWidth: "550px", overflow: "hidden", borderRadius: "12px", background: "rgba(255,255,255,0.05)", padding: "1.5rem" }}>
          <h2 className="heading-2" style={{ textAlign: "center", fontSize: "1.25rem", marginBottom: "1.5rem" }}>Technician Highlights</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxHeight: "500px", overflowY: "auto", paddingRight: "0.5rem" }}>
            {ads.map(ad => (
              <div key={ad.id} style={{ width: "100%", minHeight: "250px", borderRadius: "8px", overflow: "hidden", background: "#000" }}>
                {ad.type === "video" ? (
                  <video src={ad.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay loop muted playsInline />
                ) : (
                  <img src={ad.url} alt="Ad" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: "1 1 350px", maxWidth: "400px" }}>
        <div className="card">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 className="heading-2">Technician Login</h1>
            <p className="text-body" style={{ fontSize: "0.875rem" }}>Sign in to your TRTWA union account (Hint: type 'admin' for Admin panel, or any ID like 'TRT-001' for User profile)</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Union ID or Email</label>
              <input type="text" required placeholder="admin or TRT-001" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn" style={{ width: "100%", marginBottom: "1rem" }}>Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}
