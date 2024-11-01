import type { NextPage } from 'next';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
// import Script from 'next/script';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ToastProvider } from 'react-toast-notifications';
import { SocketProvider } from '../contexts/SocketContext'; // import SocketProvider here
import '../css/main.css';
import { store } from '../stores/store';

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
    // Use the layout defined at the page level, if available
    const getLayout = Component.getLayout || ((page) => page);

    const title = `Admin | PAXINTRADE`;

    const description = 'PAXINTRADE';

    const url = '';

    const image = ``;

    const imageWidth = '1920';

    const imageHeight = '960';

    return (
        <Provider store={store}>
            <ToastProvider>
                <SocketProvider>
                    {' '}
                    {/* Wrap your AppComponent with SocketProvider */}
                    {getLayout(
                        <>
                            <Head>
                                <meta name="description" content={description} />

                                <meta property="og:url" content={url} />
                                <meta property="og:site_name" content="paxintrade" />
                                <meta property="og:title" content={title} />
                                <meta property="og:description" content={description} />
                                <meta property="og:image" content={image} />
                                <meta property="og:image:type" content="image/png" />
                                <meta property="og:image:width" content={imageWidth} />
                                <meta property="og:image:height" content={imageHeight} />

                                <meta property="twitter:card" content="summary_large_image" />
                                <meta property="twitter:title" content={title} />
                                <meta property="twitter:description" content={description} />
                                <meta property="twitter:image:src" content={image} />
                                <meta property="twitter:image:width" content={imageWidth} />
                                <meta property="twitter:image:height" content={imageHeight} />

                                <link
                                    rel="apple-touch-icon"
                                    sizes="180x180"
                                    href="/apple-touch-icon.png"
                                />
                                <link
                                    rel="icon"
                                    type="image/png"
                                    sizes="32x32"
                                    href="/favicon-32x32.png"
                                />
                                <link
                                    rel="icon"
                                    type="image/png"
                                    sizes="16x16"
                                    href="/favicon-16x16.png"
                                />
                                <link rel="manifest" href="/site.webmanifest" />
                                <link
                                    rel="mask-icon"
                                    href="/safari-pinned-tab.svg"
                                    color="#5bbad5"
                                />
                            </Head>

                            {/* <Script
                                src="https://www.googletagmanager.com/gtag/js?id=UA-130795909-1"
                                strategy="afterInteractive"
                            />

                            <Script id="google-analytics" strategy="afterInteractive">
                                {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', 'UA-130795909-1');
                            `}
                                            </Script> */}

                            <Component {...pageProps} />
                        </>
                    )}
                </SocketProvider>
            </ToastProvider>
        </Provider>
    );
}

export default appWithTranslation(MyApp);
