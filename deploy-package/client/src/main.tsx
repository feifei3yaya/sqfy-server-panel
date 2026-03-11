import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom';
import { store } from './store'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './i18n'

console.log('Main.tsx: Starting application...');

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('Main.tsx: Root element found, mounting React app...');
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <Provider store={store}>
          <ErrorBoundary>
            <Suspense fallback={<div style={{ color: 'white', padding: 20 }}>Loading Application Resources...</div>}>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </Suspense>
          </ErrorBoundary>
        </Provider>
      </StrictMode>,
    );
    console.log('Main.tsx: React app mounted successfully.');
  } catch (error) {
    console.error('Main.tsx: Failed to mount React app:', error);
  }
} else {
  console.error('Main.tsx: Root element not found!');
}