import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRTWA - RO Technician Union",
  description: "Management and customer support portal for TRTWA RO technicians.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <footer style={{
            background: "rgba(255, 255, 255, 0.03)",
            padding: "1.5rem",
            textAlign: "center",
            borderTop: "1px solid var(--border-color)",
            marginTop: "3rem",
            color: "var(--text-secondary)",
            fontSize: "0.875rem"
          }}>
            <p style={{ margin: 0 }}>
              &copy; {new Date().getFullYear()} TRT Union. All rights reserved.
            </p>
            <p style={{ margin: "0.5rem 0 0 0" }}>
              Contact us at: <a href="mailto:TWTWA2006@gmail.com" style={{ color: "var(--accent-color)", textDecoration: "none" }}>TWTWA2006@gmail.com</a>
            </p>
          </footer>
        </div>
        <WhatsAppButton />
      </body>
    </html>
  );
}
