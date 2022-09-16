import Navbar from '../components/Navbar';
import Showcase from '../components/Showcase';
import Mint from '../components/Mint';

export default function Home() {
  return (
    <div className="home">
      <Navbar/>
      <Showcase/>
      <Mint/>
    </div>
  )
}
