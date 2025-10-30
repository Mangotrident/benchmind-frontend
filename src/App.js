import React, { useState } from "react";

const BACKEND = "https://YOUR-RENDER-URL.onrender.com"; // <-- replace with your Render URL

export default function App() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const runAI = async (e) => {
    e.preventDefault();
    if (!file) return;
    setError(""); setBusy(true); setRows([]);

    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${BACKEND}/suggest_next?k=5`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>BenchMind — Experiment Suggestions</h1>
      <p>Upload a CSV with columns <code>dose_uM</code> and <code>viability_pct</code>.</p>

      <form onSubmit={runAI}>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])}/>
        <button type="submit" disabled={!file || busy} style={{ marginLeft: 12 }}>
          {busy ? "Running..." : "Suggest Next Experiments"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {rows.length > 0 && (
        <table border="1" cellPadding="6" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Dose (µM)</th><th>Predicted Viability</th><th>Uncertainty</th><th>Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.dose_uM.toFixed(4)}</td>
                <td>{r.pred.toFixed(2)}</td>
                <td>{r.uncert.toFixed(2)}</td>
                <td>{r.acq.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
