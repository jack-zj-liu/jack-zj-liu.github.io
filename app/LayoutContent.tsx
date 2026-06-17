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
  const usesPondTheme = pathname === '/' || pathname === '/projects' || pathname === '/about';

  if (fullPage) {
    return <>{children}</>;
  }

  if (usesPondTheme) {
    return (
      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
          backgroundImage: "url('/images/pond.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
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

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
