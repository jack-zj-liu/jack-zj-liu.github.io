import Link from 'next/link';
import './Footer.css';

export default function Footer() {
  return (
    <div className="footer-container">
      <section className="social-media">
        <div className="social-media-wrap">
          <div className="footer-logo">
            <Link href="/" className="social-logo">
              jack liu.
            </Link>
          </div>
          <small className="website-rights">jack-liu-personal-website © 2024</small>
          <div className="social-icons">
            <a className="social-icon-link youtube" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/channel/UCfcmQb8K9XG8MFFZLIheoQA">
              <i className="fab fa-youtube" />
            </a>
            <a className="social-icon-link twitter" target="_blank" rel="noopener noreferrer" href="https://twitter.com/leeds9z">
              <i className="fab fa-twitter" />
            </a>
            <a className="social-icon-link github" target="_blank" rel="noopener noreferrer" href="https://github.com/jack-zj-liu">
              <i className="fab fa-github" />
            </a>
            <a className="social-icon-link linkedin" target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/jack-zj-liu/">
              <i className="fab fa-linkedin" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
