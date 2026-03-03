'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  useEffect(() => {
    const showButton = () => {
      if (typeof window !== 'undefined' && window.innerWidth <= 960) {
        setClick(false);
      }
    };
    showButton();
    window.addEventListener('resize', showButton);
    return () => window.removeEventListener('resize', showButton);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo" onClick={closeMobileMenu}>
          jack liu.
        </Link>
        <div className="menu-icon" onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link href="/" className="nav-links" onClick={closeMobileMenu}>
              home
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/projects" className="nav-links" onClick={closeMobileMenu}>
              projects
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/about" className="nav-links" onClick={closeMobileMenu}>
              about
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
