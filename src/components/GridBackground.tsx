"use client";

export function GridBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#07080b] via-[#0c111b] to-[#0a0a0f]" />

      {/* Slow-shift gradient wash */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(circle at 10% 20%, rgba(34,211,238,0.08), transparent 45%), radial-gradient(circle at 80% 10%, rgba(168,85,247,0.08), transparent 40%)",
          animation: "gradient-drift 24s ease-in-out infinite",
        }}
      />

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          animation: "grid-move 20s linear infinite",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />

      {/* Additional glow orb */}
      <div
        className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"
        style={{ animation: "glow-float 15s ease-in-out infinite" }}
      />

      {/* Subtle noise overlay */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-soft-light" style={{ backgroundImage: "repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 2px, transparent 4px)" }} />

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes gradient-drift {
          0% { background: radial-gradient(circle at 10% 20%, rgba(34,211,238,0.08), transparent 45%), radial-gradient(circle at 80% 10%, rgba(168,85,247,0.08), transparent 40%); }
          50% { background: radial-gradient(circle at 20% 70%, rgba(236,72,153,0.1), transparent 45%), radial-gradient(circle at 70% 30%, rgba(34,211,238,0.06), transparent 40%); }
          100% { background: radial-gradient(circle at 10% 20%, rgba(34,211,238,0.08), transparent 45%), radial-gradient(circle at 80% 10%, rgba(168,85,247,0.08), transparent 40%); }
        }
        @keyframes glow-float {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(-30px, 20px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
