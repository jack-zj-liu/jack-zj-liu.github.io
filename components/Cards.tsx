import CardItem from './CardItem';
import './Cards.css';

const HOME_CARDS = [
  { src: '/images/stock.jpg', text: 'stock and crypto tracker', label: 'reactjs + python + beautifulsoup', path: 'https://github.com/leeds9z/price-fetcher' },
  { src: '/images/discordbot.png', text: 'discord trading bot', label: 'python', path: 'https://github.com/leeds9z/discord-bot' },
  { src: '/images/code.jpg', text: 'competitive programming templates', label: 'c++', path: 'https://github.com/leeds9z/competitive-programing-templates' },
  { src: '/images/thiswebsite.png', text: 'this website!', label: 'reactjs + css', path: '/' },
  { src: '/images/monkey.jpg', text: 'monkey voice assistant', label: 'raspberry pi + gtts', path: 'https://github.com/leeds9z/discord-voice-bot' },
];

export default function Cards() {
  return (
    <div className="cards">
      <h1 className="title">here are some things i&apos;ve built...</h1>
      <div className="cards__container">
        <div className="cards__wrapper">
          <ul className="cards__items">
            <CardItem {...HOME_CARDS[0]} />
            <CardItem {...HOME_CARDS[1]} />
          </ul>
          <ul className="cards__items">
            <CardItem {...HOME_CARDS[2]} />
            <CardItem {...HOME_CARDS[3]} />
            <CardItem {...HOME_CARDS[4]} />
          </ul>
        </div>
      </div>
    </div>
  );
}
