import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Fallback UI without Ant Design dependency to ensure it renders even if styles are broken
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          width: '100%', 
          padding: '20px',
          color: 'white',
          backgroundColor: '#0b0c10',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#ff4d4f', marginBottom: '10px' }}>界面渲染遇到问题</h2>
          <div style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>
            <p>很抱歉，当前页面发生了意外错误。</p>
            {this.state.error && (
              <pre style={{ 
                marginTop: '10px', 
                padding: '10px', 
                backgroundColor: 'rgba(0,0,0,0.3)', 
                borderRadius: '4px',
                color: '#ff7875',
                overflow: 'auto',
                maxWidth: '800px'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1677ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
