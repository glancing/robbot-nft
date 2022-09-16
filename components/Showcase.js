import Image from 'next/image'
import Rob from '../public/rob.gif';

export default function Showcase() {
  return (
    <div className="showcase">
      <div className="container">
        <div className="showcase-inner">
          <h1>showcase</h1>
          <div className="gif-container">
            <div className="gif-idk">
              <Image width="200" height="200" src={Rob}/>
            </div>
            <div className="showcase-text">
              <p>introducing rob the bot. there are over 30,000 different rob bot clones existing in our world. each is unique with different traits. traits are set based on rarity percentages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}