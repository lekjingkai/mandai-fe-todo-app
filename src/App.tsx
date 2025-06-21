// src/App.tsx
import React from 'react';
import { CssBaseline, Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import TaskListsView from './components/TaskListsView';

const App: React.FC = () => (
    <>
        <CssBaseline />
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <TaskListsView />
        </Box>
    </>
);

export default App;
