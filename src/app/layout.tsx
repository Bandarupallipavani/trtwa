import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
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
              &copy; {new Date().getFullYear()} TRTWA Union. All rights reserved.
            </p>
            <p style={{ margin: "0.5rem 0 0 0" }}>
              Contact us at: <a href="mailto:TWTWA2006@gmail.com" style={{ color: "var(--accent-color)", textDecoration: "none" }}>TWTWA2006@gmail.com</a>
            </p>
          </footer>
        </div>
          <a
            href="https://wa.me/9177711711?text=Hello%20TRTWA%20Union,"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "fixed",
              bottom: "2rem",
              right: "2rem",
              background: "#25D366",
              color: "white",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              zIndex: 9999,
            }}
            title="TRTWA Union"
          >
            <svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor">
              <path d="M12.031 2c-5.466 0-9.914 4.45-9.914 9.916 0 1.942.508 3.834 1.472 5.505l-1.573 5.753 5.88-1.543c1.611.912 3.447 1.393 5.342 1.393h.004c5.466 0 9.914-4.449 9.914-9.915C23.156 7.643 18.175 2 12.031 2zm0 18.006c-1.644 0-3.253-.442-4.664-1.278l-.334-.199-3.468.91 .928-3.383-.217-.346C3.411 14.28 2.946 12.636 2.946 10.957 2.946 5.94 7.027 1.86 12.035 1.86c2.43 0 4.713.946 6.43 2.664 1.717 1.717 2.664 4 2.664 6.43 0 5.018-4.08 9.098-9.098 9.098zM17.02 13.911c-.274-.138-1.618-.798-1.869-.888-.251-.091-.433-.138-.616.138-.182.274-.707.888-.867 1.07-.159.182-.32.205-.593.068-.274-.138-1.155-.426-2.198-1.353-.812-.72-1.359-1.609-1.519-1.883-.159-.274-.017-.423.12-.56.123-.123.274-.32.411-.479.138-.16.182-.274.274-.457.091-.182.046-.342-.023-.479-.068-.138-.616-1.485-.845-2.034-.222-.53-.447-.458-.616-.466-.159-.008-.342-.008-.525-.008-.182 0-.479.068-.731.342-.251.274-.959.936-.959 2.28 0 1.345.982 2.646 1.119 2.829.138.182 1.928 2.94 4.667 4.122.651.282 1.159.45 1.554.576.654.208 1.25.178 1.716.107.525-.079 1.618-.662 1.846-1.3.228-.638.228-1.185.159-1.3-.068-.115-.251-.182-.525-.32z"/>
            </svg>
          </a>
      </body>
    </html>
  );
}
