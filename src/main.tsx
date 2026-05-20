import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { ListPage } from './pages/ListPage';
import { NewPage } from './pages/NewPage';
import { EditPage } from './pages/EditPage';
import { SettingsPage } from './pages/SettingsPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<ListPage />} />
          <Route path="/new" element={<NewPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
);
