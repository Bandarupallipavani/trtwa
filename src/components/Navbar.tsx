"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth state on mount and when path changes
    const user = localStorage.getItem("trtwa_current_user");
    setCurrentUser(user);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("trtwa_current_user");
    setCurrentUser(null);
    router.push("/login");
  };

  const isAdmin = currentUser?.toLowerCase() === "admin";

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
        <button onClick={handleShare} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid var(--border-color)" }}>Share App</button>
        {currentUser ? (
          <>
            <Link href={isAdmin ? "/admin" : `/user/${currentUser}`}>Profile</Link>
            <Link href="/union">Union Chat</Link>
            <Link href="/members">Members</Link>
            {isAdmin && <Link href="/support">Tickets</Link>}
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "0.5rem 1rem" }}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/support/public">Public Support</Link>
            <Link href="/login" className="btn">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
