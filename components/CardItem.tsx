export type CardItemProps = {
  src: string;
  text: string;
  label: string;
  path: string;
};

export default function CardItem({ src, text, label, path }: CardItemProps) {
  return (
    <li className="cards__item">
      <a className="cards__item__link" href={path} target={path.startsWith('http') ? '_blank' : undefined} rel={path.startsWith('http') ? 'noopener noreferrer' : undefined}>
        <figure className="cards__item__pic-wrap" data-category={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cards__item__img" alt="Project" src={src} />
        </figure>
        <div className="cards__item__info">
          <h5 className="cards__item__text">{text}</h5>
        </div>
      </a>
    </li>
  );
}
