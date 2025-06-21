// src/components/Sidebar.tsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    Divider,
    CircularProgress, ListItemIcon, Checkbox
} from '@mui/material';
import api from '../api/client';
import {fetchTaskListSummaries, updateTaskListEnabled} from "../api/tasks";  // your axios instance
import '../style/Sidebar.css';
import {TaskListSummary} from "../types";

// match your API shape
interface TaskList {
    tasklistId: string;
    title: string;
    enabled: boolean;
    amount: number;
}

export const Sidebar: React.FC<{
    taskListSummaries: TaskListSummary[];
    setTaskListSummaries: React.Dispatch<React.SetStateAction<TaskListSummary[]>>;
}> = ({ taskListSummaries, setTaskListSummaries }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    useEffect(() => {
        fetchTaskListSummaries()
            .then(data => setTaskListSummaries(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [setTaskListSummaries]);

    const handleCheckboxToggle = (tasklistId: string) => {
        const current = taskListSummaries.find(list => list.tasklistId === tasklistId);
        if (!current) return;

        const newEnabled = !current.enabled;
        setTaskListSummaries(prev =>
            prev.map(list =>
                list.tasklistId === tasklistId ? { ...list, enabled: newEnabled } : list
            )
        );

        updateTaskListEnabled(tasklistId, newEnabled).catch(() => {
            // revert if error
            setTaskListSummaries(prev =>
                prev.map(list =>
                    list.tasklistId === tasklistId ? { ...list, enabled: current.enabled } : list
                )
            );
        });
    };

    return (
        <Box
            component="nav"
            sx={{
                width: 240,
                flexShrink: 0,
                bgcolor: 'background.paper',
                height: '100vh',
                borderRight: 1,
                borderColor: 'divider',
                p: 2,
                padding: "12px 8px 0",
            }}
        >
            <Button
                variant="contained"
                fullWidth
                sx={{ mb: 2 }}
            >
                CREATE
            </Button>

            <List disablePadding>
                <ListItemButton>
                    <ListItemText primary="ALL TASKS" />
                </ListItemButton>
                <ListItemButton>
                    <ListItemText primary="STARRED" />
                </ListItemButton>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
                LISTS:
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <List>
                    {taskListSummaries.map(list => (
                        <ListItemButton
                            key={list.tasklistId}
                            className="taskListItem"
                        >
                            <ListItemIcon className="checkboxIcon">
                                <Checkbox
                                    checked={list.enabled}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCheckboxToggle(list.tasklistId);
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <div className="taskTitleContainer">
                                        <span className="taskTitle">{list.title}</span>
                                        {list.amount > 0 && (
                                            <span className="taskCount">{list.amount}</span>
                                        )}
                                    </div>
                                }
                            />
                        </ListItemButton>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default Sidebar;
