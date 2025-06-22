// src/App.tsx
import React, { useState, useEffect } from 'react';
import { CssBaseline, Box, useTheme, useMediaQuery } from '@mui/material';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import TaskListsView from './components/TaskListsView';
import { TaskListSummary } from './types';
import { fetchTaskListSummaries } from './api/tasks';

const App: React.FC = () => {
    // Access the MUI theme and determine if the screen is 'sm' (600px) or smaller
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // sidebarOpen controls whether the sidebar is visible;
    // start closed on mobile, open on desktop
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    // Holds the list of summaries fetched from the API
    const [taskListSummaries, setTaskListSummaries] = useState<TaskListSummary[]>([]);

    // On mount: fetch all task list summaries once
    useEffect(() => {
        fetchTaskListSummaries()
            .then(data => setTaskListSummaries(data))
            .catch(err => console.error('Failed to load task lists:', err));
    }, []);

    // Whenever the breakpoint changes, reset the sidebar visibility:
    // hidden on mobile, shown on larger screens
    useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);

    // Toggle function passed down to NavBar (hamburger button)
    const toggleSidebar = () => setSidebarOpen(open => !open);

    return (
        <>
            {/* Normalize browser CSS and apply Material reset */}
            <CssBaseline />

            {/* Top navigation bar with a button to toggle sidebar */}
            <NavBar onToggleSidebar={toggleSidebar} title="Todo App" />

            {/* Main container: below the AppBar, fills the rest of the viewport */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    position: 'absolute',
                    top: '64px',          // height of AppBar
                    left: 0,
                    right: 0,
                    bottom: 0,            // stretch to bottom
                    overflow: 'hidden',   // prevent both x/y scroll on the page
                    backgroundColor: '#faebcd',
                }}
            >
                {/* Conditionally render the sidebar */}
                {sidebarOpen && (
                    <Sidebar
                        taskListSummaries={taskListSummaries}
                        setTaskListSummaries={setTaskListSummaries}
                    />
                )}

                {/* Main task lists view: only show enabled lists */}
                <TaskListsView
                    enabledTaskLists={taskListSummaries.filter(l => l.enabled)}
                    setTaskListSummaries={setTaskListSummaries}
                />
            </Box>
        </>
    );
};

export default App;