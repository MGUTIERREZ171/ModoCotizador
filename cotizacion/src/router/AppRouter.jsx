import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginScreen } from '../screens/LoginScreen';
import { CreditoRutas } from '../router/CreditoRutas';
import { PublicRoutes } from './PublicRoutes';
import { PrivateRoutes } from './PrivateRutes';


export const AppRouter = () => {
    return (
        <AnimatePresence>
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
            >
                <Routes>
                    {/* Rutas públicas */}
                    <Route element={<PublicRoutes />}>
                        <Route path="/" element={<LoginScreen />} />
                    </Route>

                    {/* Rutas privadas */}
                    <Route element={<PrivateRoutes />}>
                        <Route path="/modocotizador" element={<CreditoRutas />} />
                    </Route>
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
};
