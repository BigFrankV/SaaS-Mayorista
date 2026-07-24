import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/router';
import './css/01-tokens.css';
import './css/02-base.css';
import './css/03-atomos.css';
import './css/04-moleculas.css';
import './css/05-organismos.css';
import './css/06-paginas.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);
