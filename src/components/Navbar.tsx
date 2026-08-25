"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setIsAdmin(user.email === "admin@trtwa.com");
      } else {
        setIsAdmin(false);
        localStorage.removeItem("trtwa_current_user");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("trtwa_current_user");
    router.push("/login");
  };

  const handleShare = async () => {
    const shareData = {
      title: "TRTWA Union",
      text: "Join the Telangana RO Technician Welfare Association Portal!",
      url: window.location.origin
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert("App link copied to clipboard!");
    }
  };

  return (
    <nav className="nav-bar">
      <Link href="/" className="nav-logo" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <img src="/logo.jpeg" alt="TRTWA Logo" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
        TRTWA Union
      </Link>
      <div className="nav-links">
        {isAdmin && <button onClick={handleShare} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid var(--border-color)" }}>Share App</button>}
        {currentUser ? (
          <>
            <Link href={isAdmin ? "/admin" : `/user/${currentUser.uid}`}>Profile</Link>
            <Link href="/union">Union Chat</Link>
            {isAdmin && <Link href="/members">Members</Link>}
            {isAdmin && <Link href="/rules">Rules & Bylaws</Link>}
            {isAdmin && <Link href="/support">Tickets</Link>}
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "0.5rem 1rem" }}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/rules">Rules & Bylaws</Link>
            <Link href="/support/public">Public Support</Link>
            <Link href="/login" className="btn">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
