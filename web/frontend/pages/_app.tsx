import type { AppProps } from 'next/app'
import { AppBridgeProvider } from '../providers/AppBridgeProvider'
import { AppProvider } from '@shopify/polaris'
import translations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import APIProvider from '../providers/APIProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider i18n={translations}>
      <AppBridgeProvider>
        <APIProvider>
          <Component {...pageProps} />
        </APIProvider>
      </AppBridgeProvider>
    </AppProvider>
  )
}