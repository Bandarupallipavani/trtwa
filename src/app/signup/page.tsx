"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    aadhaar: "",
    role: "Junior Member",
    bloodGroup: "O+",
    address: "",
    pincode: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Generate a TRT ID (Using timestamp for simplicity/uniqueness, or you can query count)
      const trtId = `TRT-${Math.floor(Math.random() * 9000) + 1000}`;

      // 3. Save User Data to Firestore
      const isAdmin = formData.email.toLowerCase() === "admin@trtwa.com";
      await setDoc(doc(db, "members", user.uid), {
        id: isAdmin ? "TRT-ADMIN" : trtId, // Official Union ID
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        aadhaar: formData.aadhaar,
        role: isAdmin ? "Admin" : formData.role,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        pincode: formData.pincode,
        isPermitted: isAdmin ? true : false, // Admin is auto-permitted
        password: formData.password, // Added for admin recovery as requested
        photo: ""
      });

      // 4. Redirect to User Profile/Dashboard
      localStorage.setItem("trtwa_current_user", isAdmin ? "Admin" : formData.name);
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push(`/user/${user.uid}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user already exists in db
      const docSnap = await getDoc(doc(db, "members", user.uid));
      if (!docSnap.exists()) {
        const trtId = `TRT-${Math.floor(Math.random() * 9000) + 1000}`;
        await setDoc(doc(db, "members", user.uid), {
          id: trtId,
          uid: user.uid,
          name: user.displayName || "New Member",
          email: user.email || "",
          phone: "",
          role: "Junior Member",
          bloodGroup: "O+",
          address: "",
          pincode: "",
          isPermitted: false,
          photo: user.photoURL || ""
        });
      }

      localStorage.setItem("trtwa_current_user", user.displayName || "Member");
      router.push(`/user/${user.uid}`);
    } catch (err: any) {
      console.error(err);
      setError("Google Sign-Up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "4rem auto" }}>
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 className="heading-2">Union Registration</h1>
          <p style={{ color: "var(--text-secondary)" }}>Create your official TRTWA account</p>
        </div>

        {error && <div style={{ background: "var(--error-color)", color: "white", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ramesh Kumar" />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ramesh@example.com" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Minimum 6 characters" minLength={6} />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="e.g. 9876543210" />
          </div>
          <div className="input-group">
            <label>Aadhaar Number</label>
            <input type="text" required value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} placeholder="e.g. 123456789012" />
          </div>
          <div className="grid-2-mobile-1" style={{ gap: "1rem" }}>
            <div className="input-group">
              <label>Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option>Junior Member</option>
                <option>Senior Member</option>
              </select>
            </div>
            <div className="input-group">
              <label>Blood Group</label>
              <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                <option>A+</option><option>B+</option><option>O+</option><option>AB+</option>
                <option>A-</option><option>B-</option><option>O-</option><option>AB-</option>
              </select>
            </div>
          </div>
          <div className="grid-2-mobile-1" style={{ gap: "1rem" }}>
            <div className="input-group">
              <label>Home Address</label>
              <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} />
            </div>
            <div className="input-group">
              <label>Pincode</label>
              <input type="text" required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} placeholder="e.g. 500001" style={{ height: "100%" }} />
            </div>
          </div>

          <button type="submit" className="btn" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
          <span style={{ padding: "0 1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
        </div>

        <button onClick={handleGoogleSignUp} className="btn btn-secondary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} disabled={loading}>
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>
            Already a member? <Link href="/login" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
