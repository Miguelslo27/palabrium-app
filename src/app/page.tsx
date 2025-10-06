import { auth } from '@clerk/nextjs/server';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import HomeGuest from '@/components/HomeGuest';

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      {userId ? <Dashboard /> : <HomeGuest />}
    </div>
  );
}
