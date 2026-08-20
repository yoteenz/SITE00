/** Expanded CTRL ROOM hex chamber schematic — derived from mobile nav icon geometry. */
export function CtrlRoomCommandHeroArtwork({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`site00-ctrl-room-hero__art ${className}`.trim()}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M100 28 L158 58 V142 L100 172 L42 142 V58 Z" stroke="rgba(196,30,58,0.14)" strokeWidth="0.75" />
      <path d="M100 44 L142 66 V134 L100 156 L58 134 V66 Z" stroke="rgba(196,30,58,0.22)" strokeWidth="0.75" />
      <path d="M100 60 L126 74 V126 L100 140 L74 126 V74 Z" stroke="rgba(196,30,58,0.32)" strokeWidth="0.85" />
      <path d="M100 28 V172 M42 58 L158 142 M158 58 L42 142" stroke="rgba(196,30,58,0.1)" strokeWidth="0.75" />
      <path d="M100 44 L158 58 M100 44 L42 58 M158 58 V142 M42 58 V142 M100 156 L158 142 M100 156 L42 142" stroke="rgba(196,30,58,0.16)" strokeWidth="0.75" />
      <circle cx="100" cy="100" r="5" fill="rgba(196, 30, 58, 0.45)" />
      <circle cx="100" cy="28" r="2" fill="rgba(196, 30, 58, 0.35)" />
      <circle cx="158" cy="58" r="2" fill="rgba(196, 30, 58, 0.3)" />
      <circle cx="158" cy="142" r="2" fill="rgba(196, 30, 58, 0.3)" />
      <circle cx="100" cy="172" r="2" fill="rgba(196, 30, 58, 0.3)" />
      <circle cx="42" cy="142" r="2" fill="rgba(196, 30, 58, 0.3)" />
      <circle cx="42" cy="58" r="2" fill="rgba(196, 30, 58, 0.3)" />
      <line x1="168" y1="100" x2="188" y2="100" stroke="rgba(196,30,58,0.12)" strokeWidth="0.75" />
      <line x1="12" y1="100" x2="32" y2="100" stroke="rgba(196,30,58,0.12)" strokeWidth="0.75" />
    </svg>
  );
}
