// src/App.tsx
import React, { useState } from 'react';
import { CssBaseline, Box } from '@mui/material';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import TaskListsView from './components/TaskListsView';
import {TaskListSummary} from "./types";

const App: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [taskListSummaries, setTaskListSummaries] = useState<TaskListSummary[]>([]);

    const toggleSidebar = () => setSidebarOpen(open => !open);

    return (
        <>
            <CssBaseline />
            <NavBar onToggleSidebar={toggleSidebar} title="Google Tasks Clone" />
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
