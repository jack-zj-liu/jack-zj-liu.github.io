'use client';

import { Button } from './Button';
import './HeroSection.css';

export default function HeroSection() {
  const handleButtonClick = () => {
    window.open('https://www.youtube.com/channel/UCfcmQb8K9XG8MFFZLIheoQA', '_blank');
  };

  return (
    <div className="hero-container">
      <h1>jack liu.</h1>
      <p>software engineering. data science. finance and investing.</p>
      <div className="hero-btns">
        <Button
          className="btns"
          buttonStyle="btn--outline"
          buttonSize="btn--large"
          onClick={handleButtonClick}
          buttonLink="/"
        >
          youtube&nbsp; <i className="fab fa-youtube" aria-hidden />
        </Button>
        <Button
          className="btns"
          buttonStyle="btn--outline"
          buttonSize="btn--large"
          buttonLink="/resume"
        >
          resume&nbsp; <i className="fa fa-file" aria-hidden />
        </Button>
        <Button
          className="btns"
          buttonStyle="btn--outline"
          buttonSize="btn--large"
          buttonLink="/projects"
        >
          projects&nbsp; <i className="fa-solid fa-signs-post" />
        </Button>
        <Button
          className="btns"
          buttonStyle="btn--outline"
          buttonSize="btn--large"
          buttonLink="/about"
        >
          about&nbsp; <i className="fa-solid fa-user" />
        </Button>
      </div>
    </div>
  );
}
