import type { Metadata } from 'next';
import './globals.css';
import LayoutContent from './LayoutContent';

export const metadata: Metadata = {
  title: "Jack's Portfolio",
  description: 'Software engineering. Data science. Finance and investing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/mountain_clipart.png" />
        <script
          src="https://kit.fontawesome.com/846eb1a2c3.js"
          crossOrigin="anonymous"
          async
        />
      </head>
      <body>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
