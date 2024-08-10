'use client';

import { type PropsWithChildren, useEffect } from 'react';
import {
      SDKProvider,
      useLaunchParams,
      useMiniApp,
      useThemeParams,
      useViewport,
      bindMiniAppCSSVars,
      bindThemeParamsCSSVars,
      bindViewportCSSVars,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import { useTelegramMock } from '@/hooks/useTelegramMock';
import { useDidMount } from '@/hooks/useDidMount';

import './styles.css';
import '@telegram-apps/telegram-ui/dist/styles.css';


const queryClint = new QueryClient();

function App(props: PropsWithChildren) {
      const lp = useLaunchParams();
      const miniApp = useMiniApp();
      const themeParams = useThemeParams();
      const viewport = useViewport();

      useEffect(() => {
            return bindMiniAppCSSVars(miniApp, themeParams);
      }, [miniApp, themeParams]);

      useEffect(() => {
            return bindThemeParamsCSSVars(themeParams);
      }, [themeParams]);

      useEffect(() => {
            return viewport && bindViewportCSSVars(viewport);
      }, [viewport]);

      return (
            <AppRoot
                  appearance={miniApp.isDark ? 'dark' : 'light'}
                  platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
            >
                  {props.children}
            </AppRoot>
      );
}


function RootInner({ children }: PropsWithChildren) {
      // Mock Telegram environment in development mode if needed.
      if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useTelegramMock();
      }

      const debug = useLaunchParams().startParam === 'debug';

      return (
            <QueryClientProvider client={queryClint}>
                  <SDKProvider acceptCustomStyles debug={debug}>
                        <App>
                              {children}
                        </App>
                  </SDKProvider>
            </QueryClientProvider>
      );
}

export function Root(props: PropsWithChildren) {
      // Unfortunately, Telegram Mini Apps does not allow us to use all features of the Server Side
      // Rendering. That's why we are showing loader on the server side.
      const didMount = useDidMount();

      return didMount ? (
            <ErrorBoundary fallback={ErrorPage}>
                  <RootInner {...props} />
            </ErrorBoundary>
      ) : <div className="root__loading">Loading</div>;
}
