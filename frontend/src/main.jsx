import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import store from './store/store.jsx';
import { Provider } from 'react-redux';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <HashRouter>
      <StrictMode>
        <App />
      </StrictMode>
    </HashRouter>
  </Provider>,
)
