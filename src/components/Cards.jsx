import React from 'react';
import './Cards.css';
import CardItem from './CardItem';

function Cards() {
  return (
    <div className='cards'>
      <h1 class='title'>here are some of my sample projects...</h1>
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='/images/stock.jpg'
              text='stock and crypto tracker'
              label='reactJS + python + beautifulsoup'
              path='https://github.com/leeds9z/price-fetcher'
            />
            <CardItem
              src='/images/discordbot.png'
              text='discord trading bot'
              label='python'
              path='https://github.com/leeds9z/discord-bot'
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='/images/code.jpg'
              text='competitive programming templates'
              label='C++'
              path='https://github.com/leeds9z/competitive-programing-templates'
            />
            <CardItem
              src='/images/thiswebsite.png'
              text='this website!'
              label='reactJS + css'
              path='/'
            />
            <CardItem
              src='/images/monkey.jpg'
              text='monkey voice assistant'
              label='rasberry pi + gTTS'
              path='https://github.com/leeds9z/discord-voice-bot'
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Cards;