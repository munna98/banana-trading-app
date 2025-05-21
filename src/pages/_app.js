// NEXT.JS APP STRUCTURE
// pages/_app.js

import '../styles/globals.css';
import { AppProvider } from '../context/AppContext';
import Layout from '../components/Layout/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppProvider>
  );
}

export default MyApp;