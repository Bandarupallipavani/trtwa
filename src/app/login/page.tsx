"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "../../lib/firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (username === "admin@trtwa.com") {
        await signInWithEmailAndPassword(auth, username, password);
        localStorage.setItem("trtwa_current_user", "Admin");
        router.push("/admin");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const user = userCredential.user;

      const docSnap = await getDoc(doc(db, "members", user.uid));
      if (docSnap.exists()) {
        const userData = docSnap.data();
        localStorage.setItem("trtwa_current_user", userData.name);
        
        if (userData.role === "Admin" || userData.role === "Union Admin") {
          router.push("/admin");
        } else {
          router.push(`/user/${user.uid}`);
        }
      } else {
        setError("User profile not found in database.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const docSnap = await getDoc(doc(db, "members", user.uid));
      if (docSnap.exists()) {
        const userData = docSnap.data();
        localStorage.setItem("trtwa_current_user", userData.name);
        
        if (userData.role === "Admin" || userData.role === "Union Admin") {
          router.push("/admin");
        } else {
          router.push(`/user/${user.uid}`);
        }
      } else {
        setError("Account not found. Please sign up first.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Google Sign-In failed.");
    } finally {
      setLoading(false);
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
            <p className="text-body" style={{ fontSize: "0.875rem" }}>Sign in to your official TRTWA union account</p>
          </div>
          {error && <div style={{ background: "var(--error-color)", color: "white", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" }}>{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" required placeholder="name@example.com" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn" style={{ width: "100%", marginBottom: "1rem" }} disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          
          <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
            <span style={{ padding: "0 1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
          </div>

          <button onClick={handleGoogleSignIn} className="btn btn-secondary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} disabled={loading}>
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Don't have an account? <Link href="/signup" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Sign Up Here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
