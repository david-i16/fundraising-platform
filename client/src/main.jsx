import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
import { StateContextProvider } from './context';

import App from './App';
import './index.css';

//react root
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <ThirdwebProvider
        activeChain="goerli" 
        clientId="971858cab21586ebec636b61e135e305">
        <Router>
            <StateContextProvider>
                <App />    
            </StateContextProvider>
        </Router>
    </ThirdwebProvider>
)