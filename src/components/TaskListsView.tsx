// src/components/TaskListsView.tsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    Alert,
    Typography,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { fetchAllTaskListDetails, fetchTaskListDetail } from '../api/tasks';
import { TaskListDetail, TaskListSummary } from '../types';

export const TaskListsView: React.FC<{ enabledTaskLists: TaskListSummary[] }> = ({ enabledTaskLists }) => {
    const [details, setDetails] = useState<TaskListDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuListId, setMenuListId] = useState<string | null>(null);

    useEffect(() => {
        const promises = [
            fetchTaskListDetail(), // fetch default list (no id)
            ...enabledTaskLists.map(list => fetchTaskListDetail(list.tasklistId))
        ];

        Promise.all(promises)
            .then(setDetails)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [enabledTaskLists]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, listId: string) => {
        setAnchorEl(event.currentTarget);
        setMenuListId(listId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuListId(null);
    };

    const handleRename = () => {
        console.log('Rename:', menuListId);
        handleMenuClose();
    };

    const handleDelete = () => {
        console.log('Delete:', menuListId);
        handleMenuClose();
    };

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
                <Box key={list.id} sx={{ minWidth: 300, mr: 2 }} style={{ background: "#f5f5f5", borderRadius: 8, padding: 12 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" >{list.title}</Typography>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, list.id)}>
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && menuListId === list.id}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleRename}>Rename</MenuItem>
                            <MenuItem onClick={handleDelete}>Delete</MenuItem>
                        </Menu>
                    </Box>
                    <List disablePadding>
                        {list.tasks.map(task => (
                            <ListItem key={task.id} divider className="last-task-item">
                                <ListItemIcon className="checkboxIcon">
                                <Checkbox checked={task.completed} />
                                </ListItemIcon>
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
