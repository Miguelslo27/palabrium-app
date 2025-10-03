import Navbar from '@/components/Navbar';
import HomeAuth from '@/components/HomeAuth';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <HomeAuth />
    </div>
  );
}
