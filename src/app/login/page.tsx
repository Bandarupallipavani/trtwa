"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "../../lib/firebase";
import { collection, doc, getDoc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<"member" | "admin">("member");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (loginMode === "admin") {
        const allowedAdmins = ["admin@trtwa.com", "admin2@gmail.com", "admin@test1.com", "admin@test2.com", "admin@test1", "admin@test2"];
        if (!allowedAdmins.includes(username)) {
          setError("You do not have admin access.");
          setLoading(false);
          return;
        }
      }

      if (username === "admin@test1.com" || username === "admin@test2.com" || username === "admin@test1" || username === "admin@test2") {
        try {
          await signInWithEmailAndPassword(auth, username, password);
        } catch (adminErr: any) {
          if (adminErr.code === "auth/user-not-found" || adminErr.code === "auth/invalid-credential") {
            // Auto create for the prototype
            await createUserWithEmailAndPassword(auth, username, password);
          } else {
            throw adminErr;
          }
        }
        localStorage.setItem("trtwa_current_user", "Admin");
        router.push("/admin");
        return;
      }

      if (username === "admin@trtwa.com") {
        await signInWithEmailAndPassword(auth, username, password);
        localStorage.setItem("trtwa_current_user", "Admin");
        router.push("/admin");
        return;
      }
      
      if (username === "admin2@gmail.com") {
        try {
          await signInWithEmailAndPassword(auth, username, password);
        } catch (admin2Err: any) {
          if (admin2Err.code === "auth/user-not-found" || admin2Err.code === "auth/invalid-credential") {
             await createUserWithEmailAndPassword(auth, username, password);
          } else {
             throw admin2Err;
          }
        }
        localStorage.setItem("trtwa_current_user", "Support Admin");
        router.push("/admin2");
        return;
      }

      let loginEmail = username;
      if (!username.includes("@")) {
        const q = query(collection(db, "members"), where("aadhaar", "==", username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          loginEmail = querySnapshot.docs[0].data().email;
        } else {
          setError("Aadhaar number not found in database.");
          setLoading(false);
          return;
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
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

  const handleForgotPassword = async () => {
    const emailPrompt = window.prompt("Enter your registered Email Address for password reset:");
    if (!emailPrompt) return;
    
    try {
      await sendPasswordResetEmail(auth, emailPrompt);
      setResetMessage("Password reset email sent! Please check your inbox.");
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to send reset email. Ensure the email address is correct.");
      setResetMessage("");
    }
  };

  const [ads, setAds] = useState<any[]>([]);
  const [memberCount, setMemberCount] = useState(0);

  React.useEffect(() => {
    const unsubscribeAds = onSnapshot(collection(db, "ads"), (snapshot: any) => {
      const adsData = snapshot.docs.map((d: any) => ({ ...d.data(), id: d.id }));
      setAds(adsData);
    });
    
    const unsubscribeMembers = onSnapshot(collection(db, "members"), (snapshot: any) => {
      setMemberCount(snapshot.size);
    });

    return () => {
      unsubscribeAds();
      unsubscribeMembers();
    };
  }, []);

  return (
    <div style={{ maxWidth: "1100px", margin: "4rem auto", padding: "0 1rem", display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "center", justifyContent: "center" }}>
      {ads.length > 0 && (
        <div style={{ flex: "1 1 450px", maxWidth: "550px", overflow: "hidden", borderRadius: "12px", background: "rgba(255,255,255,0.05)", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 className="heading-2" style={{ margin: 0, fontSize: "1.25rem" }}>Union Highlights</h2>
            <span style={{ fontSize: "0.875rem", background: "var(--primary-color)", color: "white", padding: "0.25rem 0.75rem", borderRadius: "999px" }}>
              Total Members: {memberCount}
            </span>
          </div>
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
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <button 
              type="button"
              className={loginMode === "member" ? "btn" : "btn btn-secondary"} 
              style={{ flex: 1, padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              onClick={() => { setLoginMode("member"); setError(""); setUsername(""); setPassword(""); }}
            >
              Member Login
            </button>
            <button 
              type="button"
              className={loginMode === "admin" ? "btn" : "btn btn-secondary"} 
              style={{ flex: 1, padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              onClick={() => { setLoginMode("admin"); setError(""); setUsername(""); setPassword(""); }}
            >
              Admin Login
            </button>
          </div>
          
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 className="heading-2">{loginMode === "admin" ? "Admin Login" : "Member Login"}</h1>
            <p className="text-body" style={{ fontSize: "0.875rem" }}>
              {loginMode === "admin" ? "Sign in to access the TRT Admin Dashboards" : "Sign in to your official TRT union account"}
            </p>
          </div>
          {error && <div style={{ background: "var(--error-color)", color: "white", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" }}>{error}</div>}
          {resetMessage && <div style={{ background: "var(--success-color)", color: "white", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" }}>{resetMessage}</div>}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>{loginMode === "admin" ? "Admin Email Address" : "Email Address or Aadhaar Number"}</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder={loginMode === "admin" ? "admin@trtwa.com" : "ramesh@example.com or 123456789012"} 
            />
            </div>
            <div className="input-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ margin: 0 }}>Password</label>
                <button type="button" onClick={handleForgotPassword} style={{ background: "transparent", border: "none", color: "var(--primary-color)", fontSize: "0.875rem", cursor: "pointer", padding: 0 }}>Forgot Password?</button>
              </div>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn" style={{ width: "100%", marginBottom: "1rem" }} disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          
          {loginMode === "member" && (
            <>
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
                </svg>
                Continue with Google
              </button>
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Don't have an account? <Link href="/signup" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Sign Up Here</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
