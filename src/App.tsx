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
            <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
                {sidebarOpen && (
                    <Sidebar
                        taskListSummaries={taskListSummaries}
                        setTaskListSummaries={setTaskListSummaries}
                    />
                )}
                <TaskListsView enabledTaskLists={taskListSummaries.filter(l => l.enabled)} />
            </Box>
        </>
    );
};

export default App;
