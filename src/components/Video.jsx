import React from 'react';
import './Video.css';

function Video(input) {
  return (
    <>
        <video
            className='video__item__vid'
            src={input.src} autoPlay loop muted
        />
    </>
  )
}

export default Video;