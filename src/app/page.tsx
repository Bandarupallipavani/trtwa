import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "4rem 0", textAlign: "center" }}>
      <h1 className="heading-1" style={{ fontSize: "4rem", marginBottom: "1.5rem", background: "linear-gradient(90deg, #4f46e5, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Telangana RO Technicians Welfare Association
      </h1>
      <p className="text-body" style={{ maxWidth: "800px", margin: "0 auto 3rem auto", fontSize: "1.25rem" }}>
        Welcome to the official portal for TRTWA. Empowering RO members with secure ID cards, community support, birthday wishes, and robust customer service management.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "4rem" }}>
        <Link href="/login" className="btn">
          Member Login
        </Link>
        <Link href="/support/public" className="btn btn-secondary">
          Customer Portal
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", textAlign: "left" }}>
        <div className="card">
          <h2 className="heading-2">Union Membership</h2>
          <p className="text-body" style={{ marginBottom: "1.5rem" }}>
            Register new RO members, generate official ID cards, and manage union membership securely.
          </p>
          <Link href="/members" className="btn btn-secondary">Manage Members</Link>
        </div>
        <div className="card">
          <h2 className="heading-2">Community & Support</h2>
          <p className="text-body" style={{ marginBottom: "1.5rem" }}>
            Celebrate member birthdays and access our customer relation service for ticketing and technical support.
          </p>
          <Link href="/dashboard" className="btn btn-secondary">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
