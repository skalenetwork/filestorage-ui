import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { ContextWrapper } from '../store';

function App({ Component, pageProps }: AppProps) {
  return (
    <ContextWrapper>
      <Component {...pageProps} />
    </ContextWrapper>
  )
}

export default App
