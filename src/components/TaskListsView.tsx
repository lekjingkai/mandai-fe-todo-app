// src/components/TaskListsView.tsx
import React, {useEffect, useState} from 'react';
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
    MenuItem, ListItemIcon, Button
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

import {fetchAllTaskListDetails, fetchTaskListDetail} from '../api/tasks';
import {TaskListDetail, TaskListSummary} from '../types';

const formatDueDateLabel = (dateString: string, timeString?: string): string => {
    const date = parseISO(dateString);
    let label = '';

    if (isToday(date)) {
        label = 'Today';
    } else if (isTomorrow(date)) {
        label = 'Tomorrow';
    } else {
        label = format(date, 'EEE, d MMM');
    }

    if (timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const time = new Date();
        time.setHours(hours, minutes);
        label += `, ${format(time, 'hh:mm a')}`;
    }

    return label;
};

export const TaskListsView: React.FC<{ enabledTaskLists: TaskListSummary[] }> = ({enabledTaskLists}) => {
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
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{flexGrow: 1}}>{error}</Alert>;
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
                <Box key={list.id} sx={{minWidth: 300, mr: 2}}
                     style={{background: "#f5f5f5", borderRadius: 8}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" className={"tasklist-box"}>
                        <Typography>{list.title}</Typography>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, list.id)}>
                            <MoreVertIcon fontSize="small"/>
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
                            <ListItem key={task.id} divider className="task-item">
                                <ListItemIcon className="checkboxIcon">
                                    <Checkbox checked={task.completed}/>
                                </ListItemIcon>
                                <ListItemText
                                    className={"task-text-box"}
                                    primary={
                                        <>
                                            <Typography className={"title-text"}>{task.title}</Typography>
                                            {task.notes && (
                                                <Typography className={"notes-text"}>
                                                    {task.notes}
                                                </Typography>
                                            )}
                                        </>
                                    }
                                    secondary={
                                        <>
                                            {task.dueDate && (
                                                <Button variant="text" size="small" color="inherit"   sx={{ p: 0, minWidth: 0, textTransform: 'none' }}
                                                className={"date-button"}>
                                                    {formatDueDateLabel(task.dueDate, task.dueTime)}
                                                </Button>
                                            )}
                                        </>
                                    }
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
