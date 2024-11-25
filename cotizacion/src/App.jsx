import React from 'react'
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';

export const App = () => {

    return (
        <BrowserRouter>
            <AppRouter />
        </BrowserRouter>
    )
};