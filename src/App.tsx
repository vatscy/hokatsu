import { Outlet } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { UpdateBanner } from './components/layout/UpdateBanner';

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <UpdateBanner />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}
