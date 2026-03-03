export default function AnimalPage() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
      <video
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        src="/videos/trim.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
}
