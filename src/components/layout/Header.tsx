import { Link, NavLink } from 'react-router-dom';

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'px-3 py-2 rounded-md text-sm font-medium',
    isActive ? 'bg-primary-600 text-white' : 'text-slate-700 hover:bg-slate-200',
  ].join(' ');

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-screen-lg px-4 py-3 flex items-center gap-3">
        <Link to="/" className="font-bold text-lg text-primary-700">
          保活ノート
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          <NavLink to="/" end className={navClass}>
            一覧
          </NavLink>
          <NavLink to="/new" className={navClass}>
            新規
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            設定
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
