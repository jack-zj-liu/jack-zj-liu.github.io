import CardItem from '@/components/CardItem';
import '@/components/Cards.css';

const PROJECTS = [
  { src: '/images/stock.jpg', text: 'stock and crypto tracker', label: 'reactJS + python + beautifulsoup', path: 'https://github.com/leeds9z/price-fetcher' },
  { src: '/images/discordbot.png', text: 'discord trading bot', label: 'python', path: 'https://github.com/leeds9z/discord-bot' },
  { src: '/images/code.jpg', text: 'competitive programming templates', label: 'C++', path: 'https://github.com/leeds9z/competitive-programing-templates' },
  { src: '/images/thiswebsite.png', text: 'this website!', label: 'reactJS + css', path: '/' },
  { src: '/images/question-mark-ping-lol.jpg', text: 'league predictor', label: 'tensorFlow + jupyter', path: 'https://github.com/leeds9z/league-predict' },
  { src: '/images/monkey.jpg', text: 'monkey voice assistant', label: 'rasberry pi + gTTS', path: 'https://github.com/leeds9z/discord-voice-bot' },
];

export default function ProjectsPage() {
  return (
    <div className="cards__container">
      <div className="cards__wrapper">
        <ul className="cards__items">
          <CardItem {...PROJECTS[0]} />
        </ul>
        <ul className="cards__items">
          <CardItem {...PROJECTS[1]} />
          <CardItem {...PROJECTS[2]} />
        </ul>
        <ul className="cards__items">
          <CardItem {...PROJECTS[3]} />
          <CardItem {...PROJECTS[4]} />
          <CardItem {...PROJECTS[5]} />
        </ul>
      </div>
    </div>
  );
}
