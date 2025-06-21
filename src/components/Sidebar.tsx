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
    CircularProgress
} from '@mui/material';
import api from '../api/client';
import {fetchTaskListSummaries} from "../api/tasks";  // your axios instance

// match your API shape
interface TaskList {
    tasklistId: string;
    title: string;
    enabled: boolean;
    amount: number;
}

export const Sidebar: React.FC = () => {
    const [lists, setLists] = useState<TaskList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    useEffect(() => {
        fetchTaskListSummaries()
            .then(data => setLists(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

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
                    {lists.map(list => (
                        <ListItemButton
                            key={list.tasklistId}
                            disabled={!list.enabled}
                        >
                            <ListItemText
                                primary={list.title}
                                secondary={list.amount > 0 ? `${list.amount} items` : undefined}
                            />
                        </ListItemButton>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default Sidebar;
