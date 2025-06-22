// src/App.tsx
import React, { useState, useEffect } from 'react';
import { CssBaseline, Box, useTheme, useMediaQuery } from '@mui/material';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import TaskListsView from './components/TaskListsView';
import { TaskListSummary } from './types';
import { fetchTaskListSummaries } from './api/tasks';

const App: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // sidebarOpen still controls visibility,
    // but summaries load regardless
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [taskListSummaries, setTaskListSummaries] = useState<TaskListSummary[]>([]);

    // 1) always fetch lists on mount
    useEffect(() => {
        fetchTaskListSummaries()
            .then(data => setTaskListSummaries(data))
            .catch(err => console.error(err));
    }, []);

    // 2) re-sync sidebar visibility when resizing
    useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);

    const toggleSidebar = () => setSidebarOpen(open => !open);

    return (
        <>
            <CssBaseline />
            <NavBar onToggleSidebar={toggleSidebar} title="Todo App" />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    position: 'absolute',
                    top: '64px',          // below the AppBar
                    left: 0,
                    right: 0,
                    bottom: 0,            // fills to bottom
                    overflow: 'hidden',   // hide BOTH axes by default
                    backgroundColor: '#faebcd',
                }}
            >
                {sidebarOpen && (
                    <Sidebar
                        taskListSummaries={taskListSummaries}
                        setTaskListSummaries={setTaskListSummaries}
                    />
                )}
                <TaskListsView
                    enabledTaskLists={taskListSummaries.filter(l => l.enabled)}
                    setTaskListSummaries={setTaskListSummaries}
                />
            </Box>
        </>
    );
};

export default App;
