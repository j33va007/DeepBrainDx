import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UnifiedPortal from './components/UnifiedPortal';

const App = () => {
    return (
        <Routes>
            <Route path="/admin/*" element={<UnifiedPortal key="admin" portalType="admin" />} />
            <Route path="/*" element={<UnifiedPortal key="user" portalType="user" />} />
        </Routes>
    );
};

export default App;
