import React from 'react';
import './Picture.css';

function Picture(input) {
  return (
    <>
        <img
            className='picture__item__img'
            src={input.src}
        />
    </>
  )
}

export default Picture;