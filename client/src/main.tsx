import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './i18n'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<h1>Root element not found!</h1>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
      </StrictMode>,
    )
  } catch (e) {
    rootElement.innerHTML = `<h1>App crashed: ${e}</h1>`;
  }
}
