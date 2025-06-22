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
    ListItemIcon,
    Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import {deleteTaskList, fetchTaskListDetail} from '../api/tasks';
import { TaskListDetail, TaskListSummary } from '../types';

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

export const TaskListsView: React.FC<{
    enabledTaskLists: TaskListSummary[],
    setTaskListSummaries: React.Dispatch<React.SetStateAction<TaskListSummary[]>>
}> = ({ enabledTaskLists, setTaskListSummaries }) => {

    const [details, setDetails] = useState<TaskListDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuListId, setMenuListId] = useState<string | null>(null);
    const [taskAnchorEl, setTaskAnchorEl] = useState<null | HTMLElement>(null);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);


    useEffect(() => {
        const promises = [
            fetchTaskListDetail(),
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

    const handleTaskMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
        setTaskAnchorEl(event.currentTarget);
        setActiveTaskId(taskId);
    };

    const handleTaskMenuClose = () => {
        setTaskAnchorEl(null);
        setActiveTaskId(null);
    };

    const handleRename = () => {
        console.log('Rename list:', menuListId);
        handleMenuClose();
    };

    const handleDelete = () => {
        console.log('Delete list:', menuListId);
        setConfirmDeleteOpen(true);
    };


    const confirmDeleteList = async () => {
        console.log('confirmDeleteList:', menuListId);
        if (menuListId) {
            await deleteTaskList(menuListId);
            setDetails(prev => prev.filter(d => d.id !== menuListId));
            setTaskListSummaries(prev => prev.filter(l => l.tasklistId !== menuListId)); // <-- update sidebar too
        }
        setConfirmDeleteOpen(false);
    };

    const handleUpdateTask = (taskId: string) => {
        console.log('Update task:', taskId);
        handleTaskMenuClose();
    };

    const handleDeleteTask = (taskId: string) => {
        console.log('Delete task:', taskId);
        handleTaskMenuClose();
    };

    if (loading) {
        return (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ flexGrow: 1 }}>{error}</Alert>;
    }

    return (
        <>
        <Box component="main" sx={{ flexGrow: 1, p: 2, display: 'flex', overflowX: 'auto' }}>
            {details.map(list => (
                <Box key={list.id} sx={{ minWidth: 300, mr: 2, background: "#f5f5f5", borderRadius: 5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" className="tasklist-box">
                        <Typography style={{fontWeight: 600}}>{list.title}</Typography>
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
                        {list.tasks.length === 0 ? (
                            <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    No tasks yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Add your to-dos and keep track of them here
                                </Typography>
                            </Box>
                        ) : (
                            list.tasks.map(task => (
                                <ListItem key={task.id} divider className="task-item" alignItems="flex-start">
                                    <ListItemIcon className="checkboxIcon">
                                        <Checkbox checked={task.completed} />
                                    </ListItemIcon>
                                    <ListItemText
                                        className="task-text-box"
                                        primary={
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography className="title-text">{task.title}</Typography>
                                                    {task.notes && (
                                                        <Typography className="notes-text">{task.notes}</Typography>
                                                    )}
                                                </Box>
                                                <IconButton size="small" onClick={(e) => handleTaskMenuOpen(e, task.id)}>
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                                <Menu
                                                    anchorEl={taskAnchorEl}
                                                    open={Boolean(taskAnchorEl) && activeTaskId === task.id}
                                                    onClose={handleTaskMenuClose}
                                                >
                                                    <MenuItem onClick={() => handleUpdateTask(task.id)}>Update</MenuItem>
                                                    <MenuItem onClick={() => handleDeleteTask(task.id)}>Delete</MenuItem>
                                                </Menu>
                                            </Box>
                                        }
                                        secondary={
                                            task.dueDate && (
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    color="inherit"
                                                    className="date-button"
                                                    sx={{
                                                        p: 0,
                                                        minWidth: 0,
                                                        textTransform: 'none',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#61dafb !important',
                                                        mt: 0.5
                                                    }}
                                                >
                                                    {formatDueDateLabel(task.dueDate, task.dueTime)}
                                                </Button>
                                            )
                                        }
                                    />
                                </ListItem>
                            ))
                        )}
                    </List>
                </Box>
            ))}
        </Box>


            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>Delete this list?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        All tasks in this list will be permanently deleted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDeleteList} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TaskListsView;
