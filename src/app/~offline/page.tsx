export default function OfflinePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        gap: "1rem",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "3rem", margin: 0 }}>📴</p>
      <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
        オフラインです
      </p>
      <p style={{ color: "#868e96", margin: 0 }}>
        インターネット接続を確認してから再度お試しください。
      </p>
    </div>
  );
}
