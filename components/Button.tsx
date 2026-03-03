'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

const STYLES = ['btn--primary', 'btn--outline'];
const SIZES = ['button--medium', 'btn--large'];

type ButtonProps = {
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  buttonStyle?: string;
  buttonSize?: string;
  buttonLink: string;
};

export function Button({
  children,
  type,
  onClick,
  buttonStyle,
  buttonSize,
  buttonLink,
}: ButtonProps) {
  const checkButtonStyle = STYLES.includes(buttonStyle ?? '') ? buttonStyle : STYLES[0];
  const checkButtonSize = SIZES.includes(buttonSize ?? '') ? buttonSize : SIZES[0];

  return (
    <Link href={buttonLink} className="btn-mobile">
      <button
        className={`btn ${checkButtonStyle} ${checkButtonSize}`}
        onClick={onClick}
        type={type}
      >
        {children}
      </button>
    </Link>
  );
}
