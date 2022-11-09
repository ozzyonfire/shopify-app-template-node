import type { AppProps } from 'next/app'
import { AppBridgeProvider } from '../providers/AppBridgeProvider'
import { AppProvider } from '@shopify/polaris'
import translations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';

export default function App({ Component, pageProps }: AppProps) {
  console.log('in App');

  return (
    <AppProvider i18n={translations}>
      <AppBridgeProvider>
        <Component {...pageProps} />
      </AppBridgeProvider>
    </AppProvider>
  )
}