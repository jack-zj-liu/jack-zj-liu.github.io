import React from 'react'
import '../Cards.css';
import CardItem from '../CardItem';
import Navbar from '../Navbar';
import Footer from '../Footer';

function Projects() {
  return (
    <>
    <Navbar />
    <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='/images/stock.jpg'
              text='stock and crypto tracker'
              label='reactJS + python + beautifulsoup'
              path='https://github.com/leeds9z/price-fetcher'
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='/images/discordbot.png'
              text='discord trading bot'
              label='python'
              path='https://github.com/leeds9z/discord-bot'
            />
            <CardItem
              src='/images/code.jpg'
              text='competitive programming templates'
              label='C++'
              path='https://github.com/leeds9z/competitive-programing-templates'
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='/images/thiswebsite.png'
              text='this website!'
              label='reactJS + css'
              path='/'
            />
            <CardItem
              src='/images/question-mark-ping-lol.jpg'
              text='league predictor'
              label='tensorFlow + jupyter'
              path='https://github.com/leeds9z/league-predict'
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
      <Footer />
    </>
  )
}

export default Projects;