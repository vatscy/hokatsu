import { Outlet } from 'react-router-dom';
import { Header } from './components/layout/Header';

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}
