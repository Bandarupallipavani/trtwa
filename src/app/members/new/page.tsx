"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

export default function AddMemberPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", phone: "", dob: "", role: "Junior Member", address: "", bloodGroup: "O+", photo: "" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const querySnapshot = await getDocs(collection(db, "members"));
    const membersCount = querySnapshot.size;
    const newId = `TRT-${String(membersCount + 1).padStart(3, '0')}`;
    
    const newMember = { ...formData, id: newId, isPermitted: false };
    await setDoc(doc(db, "members", newId), newMember);
    
    router.push("/members");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/members" style={{ color: "var(--text-secondary)", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          &larr; Back to Members
        </Link>
        <h1 className="heading-1" style={{ margin: 0 }}>Add New Member</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ramesh Kumar" />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="e.g. 9876543210" />
          </div>
          <div className="input-group">
            <label>Date of Birth</label>
            <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Home Address</label>
            <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full residential address" rows={3} />
          </div>
          <div className="input-group">
            <label>Blood Group</label>
            <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>O+</option>
              <option>O-</option>
              <option>AB+</option>
              <option>AB-</option>
            </select>
          </div>
          <div className="input-group">
            <label>Role</label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option>Junior Member</option>
              <option>Senior Member</option>
              <option>Supervisor</option>
              <option>Union Admin</option>
            </select>
          </div>
          <div className="input-group">
            <label>ID Photo (Optional)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {formData.photo && <img src={formData.photo} alt="Preview" style={{ marginTop: "1rem", width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }} />}
          </div>
          <button type="submit" className="btn" style={{ width: "100%" }}>Register Member</button>
        </form>
      </div>
    </div>
  );
}
