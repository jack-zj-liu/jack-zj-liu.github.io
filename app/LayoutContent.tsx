'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const fullPage = pathname === '/codenames' || pathname === '/animal';

  const backgroundShellStyle: React.CSSProperties = {
    minHeight: '100vh',
    position: 'relative',
    backgroundImage: "url('/images/water_lily.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  if (fullPage) {
    return (
      <div style={backgroundShellStyle}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(180deg, rgba(28, 79, 78, 0.2) 0%, rgba(34, 104, 94, 0.18) 40%, rgba(20, 74, 67, 0.24) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    );
  }

  return (
    <div style={backgroundShellStyle}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(28, 79, 78, 0.2) 0%, rgba(34, 104, 94, 0.18) 40%, rgba(20, 74, 67, 0.24) 100%)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
}
