import { ImageResponse } from "next/og";

export const alt = "Andrei Kyle Hidalgo — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#f7f4ef",
        color: "#241914",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ color: "#c2410c", display: "flex", fontSize: 26, letterSpacing: 4 }}>
        ANDREI KYLE HIDALGO
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, letterSpacing: -3 }}>
          Full-Stack Developer
        </div>
        <div style={{ color: "#766960", display: "flex", fontSize: 30 }}>
          Web experiences, AI tools, and interactive interfaces.
        </div>
      </div>
      <div style={{ color: "#c2410c", display: "flex", fontFamily: "monospace", fontSize: 24 }}>
        PORTFOLIO / WEB • CLI • GAME
      </div>
    </div>
  );
}
