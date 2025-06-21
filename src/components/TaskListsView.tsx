// src/components/TaskListsView.tsx
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Typography, List, ListItem, ListItemText, Checkbox } from '@mui/material';
import {fetchAllTaskListDetails, fetchTaskListDetail} from '../api/tasks';
import {TaskListDetail, TaskListSummary} from '../types';

export const TaskListsView: React.FC<{ enabledTaskLists: TaskListSummary[] }> = ({ enabledTaskLists }) => {
    const [details, setDetails] = useState<TaskListDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    useEffect(() => {
        Promise.all(
            enabledTaskLists.map(list =>
                fetchTaskListDetail(list.tasklistId)
            )
        )
            .then(setDetails)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [enabledTaskLists]);

    if (loading) {
        return (
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ flexGrow: 1 }}>{error}</Alert>;
    }

    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                p: 2,
                display: 'flex',
                overflowX: 'auto',
            }}
        >
            {details.map(list => (
                <Box key={list.id} sx={{ minWidth: 300, mr: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        {list.title}
                    </Typography>
                    <List disablePadding>
                        {list.tasks.map(task => (
                            <ListItem key={task.id} divider>
                                <Checkbox checked={task.completed} disabled />
                                <ListItemText
                                    primary={task.title}
                                    secondary={`${task.notes} • Due ${task.dueDate} @ ${task.dueTime}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            ))}
        </Box>
    );
};

export default TaskListsView;
