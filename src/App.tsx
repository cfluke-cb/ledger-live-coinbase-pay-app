import { useEffect, useRef } from 'react';
import LedgerLiveApi, { WindowMessageTransport } from '@ledgerhq/live-app-sdk';
import {
  initOnRamp,
  InitOnRampParams,
  CBPayInstanceType,
} from '@coinbase/cbpay-js';
import './App.css';

const App = () => {
  // Define the Ledger Live API variable used to call api methods
  const api = useRef<LedgerLiveApi>();
  const onrampInstance = useRef<CBPayInstanceType>();

  // Instantiate the Ledger Live API on component mount
  useEffect(() => {
    const llapi = new LedgerLiveApi(new WindowMessageTransport());
    llapi.connect();
    if (llapi) {
      api.current = llapi;
    }
    // Cleanup the Ledger Live API on component unmount
    return () => {
      api.current = undefined;
      void llapi.disconnect();
    };
  }, []);

  // A very basic test call to request an account
  const requestAccount = async () => {
    if (!api.current) {
      return;
    }

    const result = await api.current
      .requestAccount()
      .catch((error) => console.error({ error }));

    console.log({ result });
    if (!result?.address) {
      return;
    }

    const options: InitOnRampParams = {
      appId: 'getFromCoinbase',
      widgetParameters: {
        destinationWallets: [
          {
            address: result.address,
            blockchains: [result.currency],
          },
        ],
      },
      onSuccess: () => {
        // handle navigation when user successfully completes the flow
      },
      onExit: () => {
        // handle navigation from dismiss / exit events due to errors
      },
      onEvent: (event) => {
        // event stream
      },
      experienceLoggedIn: 'embedded',
      experienceLoggedOut: 'embedded',
    };

    // instance.destroy() should be called before initOnramp if there is already an instance.
    if (onrampInstance.current) {
      onrampInstance.current?.destroy();
    }

    initOnRamp(options, (error, instance) => {
      if (error) {
        console.error(error);
      }
      if (instance) {
        onrampInstance.current = instance;
        instance.open();
      }
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Select which account you would like to add funds.</p>
        <button onClick={requestAccount}>Request account</button>
      </header>
    </div>
  );
};

export default App;
