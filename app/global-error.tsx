"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f1f5f9", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>Application error</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>{error.message || "A critical error occurred."}</p>
          <button onClick={reset} style={{ background: "#0049BD", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
