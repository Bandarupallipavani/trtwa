"use client";
import React, { useState } from "react";

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999 }}>
      {open && (
        <div style={{
          position: "absolute",
          bottom: "70px",
          right: "0",
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          padding: "1rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          minWidth: "200px"
        }}>
          <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)" }}>Contact TRT Union</h4>
          <a
            href="https://wa.me/917799116692?text=Hello%20TRTWA%20Union,"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ display: "block", textAlign: "center", background: "#25D366", borderColor: "#25D366", color: "white" }}
          >
            Chat with 7799116692
          </a>
          <a
            href="https://wa.me/919908894681?text=Hello%20TRTWA%20Union,"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ display: "block", textAlign: "center", background: "#25D366", borderColor: "#25D366", color: "white" }}
          >
            Chat with 9908894681
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "#25D366",
          color: "white",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          border: "none",
          cursor: "pointer",
          outline: "none"
        }}
        title="TRT Union"
      >
        <svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor">
          <path d="M12.031 2c-5.466 0-9.914 4.45-9.914 9.916 0 1.942.508 3.834 1.472 5.505l-1.573 5.753 5.88-1.543c1.611.912 3.447 1.393 5.342 1.393h.004c5.466 0 9.914-4.449 9.914-9.915C23.156 7.643 18.175 2 12.031 2zm0 18.006c-1.644 0-3.253-.442-4.664-1.278l-.334-.199-3.468.91 .928-3.383-.217-.346C3.411 14.28 2.946 12.636 2.946 10.957 2.946 5.94 7.027 1.86 12.035 1.86c2.43 0 4.713.946 6.43 2.664 1.717 1.717 2.664 4 2.664 6.43 0 5.018-4.08 9.098-9.098 9.098zM17.02 13.911c-.274-.138-1.618-.798-1.869-.888-.251-.091-.433-.138-.616.138-.182.274-.707.888-.867 1.07-.159.182-.32.205-.593.068-.274-.138-1.155-.426-2.198-1.353-.812-.72-1.359-1.609-1.519-1.883-.159-.274-.017-.423.12-.56.123-.123.274-.32.411-.479.138-.16.182-.274.274-.457.091-.182.046-.342-.023-.479-.068-.138-.616-1.485-.845-2.034-.222-.53-.447-.458-.616-.466-.159-.008-.342-.008-.525-.008-.182 0-.479.068-.731.342-.251.274-.959.936-.959 2.28 0 1.345.982 2.646 1.119 2.829.138.182 1.928 2.94 4.667 4.122.651.282 1.159.45 1.554.576.654.208 1.25.178 1.716.107.525-.079 1.618-.662 1.846-1.3.228-.638.228-1.185.159-1.3-.068-.115-.251-.182-.525-.32z"/>
        </svg>
      </button>
    </div>
  );
}
