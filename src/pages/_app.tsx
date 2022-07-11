import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { ContextWrapper } from '../context';

function App({ Component, pageProps }: AppProps) {
  return (
    <ContextWrapper>
      <Component {...pageProps} />
    </ContextWrapper>
  )
}

export default App
