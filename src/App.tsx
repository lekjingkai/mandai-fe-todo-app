// src/App.tsx
import React, { useState, useEffect } from 'react';
import { CssBaseline, Box, useMediaQuery, useTheme } from '@mui/material';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import TaskListsView from './components/TaskListsView';
import { TaskListSummary } from './types';

const App: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // default: hide sidebar on mobile, show on desktop
    const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile);
    const [taskListSummaries, setTaskListSummaries] = useState<TaskListSummary[]>([]);

    // re-sync when screen size changes
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
                    top: '64px', // height of your AppBar
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
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
