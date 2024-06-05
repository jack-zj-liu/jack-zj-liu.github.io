import React from 'react';
import '../App.css';
import { Button } from './Button';
import './HeroSection.css';

function HeroSection() {
  return (
    <div className='hero-container'>
      <h1>jack liu.</h1>
      <p>software engineering. data science. finance and investing. </p>
      <div className='hero-btns'>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
          onClick='https://www.youtube.com/channel/UCfcmQb8K9XG8MFFZLIheoQA'
          target='_blank'
        >
          <a href="https://www.youtube.com/channel/UCfcmQb8K9XG8MFFZLIheoQA" target='_blank'>
            youtube&nbsp; <i class="fab fa-youtube" aria-hidden="true"></i>
          </a>
          
        </Button>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
          buttonLink='/resume'
        >
          <a href="/images/Resume_May_2024.pdf" download = "Jack_Liu_Resume.pdf">
            resume&nbsp; <i class="fa fa-file" aria-hidden="true"></i>
          </a>
          
        </Button>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
          buttonLink='/projects'
        >
          projects&nbsp; <i class="fa-solid fa-signs-post"></i>
        </Button>
        
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
          buttonLink='/about'
        >
          about&nbsp; <i class="fa-solid fa-user"></i>
        </Button>
      </div>
    </div>
  );
}

export default HeroSection;