import React from 'react';
import './Footer.css';
import { Button } from './Button'
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <div className='footer-container'>
      <section class='social-media'>
        <div class='social-media-wrap'>
          <div class='footer-logo'>
            <Link to='/' className='social-logo'>
                jack liu.
            </Link>
          </div>
          <small class='website-rights'>jack-liu-personal-website © 2024</small>
          <div class='social-icons'>
            <a class='social-icon-link youtube' target="_blank" href="https://www.youtube.com/channel/UCfcmQb8K9XG8MFFZLIheoQA">
              <i class='fab fa-youtube' />
            </a> 
            <a class='social-icon-link twitter' target="_blank" href="https://twitter.com/leeds9z">
              <i class='fab fa-twitter' />
            </a>
            <a class='social-icon-link github' target="_blank" href="https://github.com/leeds9z">
              <i class='fab fa-github' />
            </a>
            <a class='social-icon-link linkedin' target="_blank" href="https://www.linkedin.com/in/leeds9z/">
              <i class='fab fa-linkedin' />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Footer;