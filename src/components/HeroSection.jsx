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
          buttonLink='/projects'
        >
          view projects&nbsp; <i class="fa-solid fa-signs-post"></i>
        </Button>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
          buttonLink='/resume'
        >
          <a href="/images/resume2022dec.pdf" download = "Jack_Liu_Resume.pdf">
            my resume&nbsp; <i class="fa fa-file" aria-hidden="true"></i>
          </a>
          
        </Button>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
          buttonLink='/about'
        >
          about me&nbsp; <i class="fa-solid fa-user"></i>
        </Button>
      </div>
    </div>
  );
}

export default HeroSection;