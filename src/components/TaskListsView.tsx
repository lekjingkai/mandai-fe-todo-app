// src/components/TaskListsView.tsx
import React, {useEffect, useState} from 'react';
import {
    Box,
    CircularProgress,
    Alert,
    Typography,
    List,
    ListItemText,
    Checkbox,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    ListItem,
    Popper,
    ClickAwayListener, Paper, Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import pandaLogo from '../assets/no-task-panda.svg';

import {format, isToday, isTomorrow, parseISO} from 'date-fns';
import {
    deleteTask,
    deleteTaskList,
    fetchTaskListDetail, fetchTaskListSummaries, updateTask,
    updateTaskCompleted,
    updateTaskDatetime,
    updateTaskListName, updateTaskTasklist
} from '../api/tasks';
import {TaskListDetail, TaskListSummary} from '../types';
import logoUrl from "../assets/Logo-Mandai-EquaGreen.svg";

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
}> = ({enabledTaskLists, setTaskListSummaries}) => {

    const [details, setDetails] = useState<TaskListDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuListId, setMenuListId] = useState<string | null>(null);
    const [taskAnchorEl, setTaskAnchorEl] = useState<null | HTMLElement>(null);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [anchorElEdit, setAnchorElEdit] = useState<null | HTMLElement>(null);
    const [editingTask, setEditingTask] = useState<{
        id: string;
        title: string;
        notes?: string;
        dueDate?: string;
        dueTime?: string
    } | null>(null);
    const handleEditTaskClick = (
        event: React.MouseEvent<HTMLElement>,
        task: { id: string; title: string; notes?: string; dueDate?: string; dueTime?: string }
    ) => {
        event.stopPropagation();
        setAnchorElEdit(event.currentTarget);
        setEditingTask({...task});
    };


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

    const [anchorElDate, setAnchorElDate] = useState<null | HTMLElement>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [taskDueTime, setTaskDueTime] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');


    const handleDueDateClick = (event: React.MouseEvent<HTMLElement>, task: {
        id: string,
        dueDate?: string,
        dueTime?: string
    }) => {
        event.stopPropagation();
        setAnchorElDate(anchorEl ? null : event.currentTarget);
        setEditingTaskId(task.id);
        setTaskDueDate(task.dueDate || '');
        setTaskDueTime(task.dueTime || '');
    };

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
        const currentList = details.find(d => d.id === menuListId);
        setRenameValue(currentList?.title || '');
        setRenameDialogOpen(true);
    };

    const confirmRename = async () => {
        if (!menuListId || !renameValue.trim()) return;

        try {
            const updated = await updateTaskListName(menuListId, renameValue.trim());

            // Update task list title in view
            setDetails(prev =>
                prev.map(d =>
                    d.id === menuListId ? {...d, title: updated.title} : d
                )
            );

            // Update sidebar summaries
            setTaskListSummaries(prev =>
                prev.map(s =>
                    s.tasklistId === menuListId ? {...s, title: updated.title} : s
                )
            );
        } catch (err) {
            console.error('Rename failed', err);
        } finally {
            setRenameDialogOpen(false);
            handleMenuClose();
        }
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

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId);

            setDetails(prev =>
                prev.map(list => ({
                    ...list,
                    tasks: list.tasks.filter(task => task.id !== taskId),
                }))
            );

            const updatedSummaries = await fetchTaskListSummaries();
            setTaskListSummaries(updatedSummaries);
        } catch (err) {
            console.error('Failed to delete task:', err);
        } finally {
            handleTaskMenuClose();
        }
    };

    const handleMoveTaskToAnotherList = async (
        taskId: string,
        fromListId: string,
        toListId: string
    ) => {
        if (fromListId === toListId) return;

        try {
            await updateTaskTasklist(taskId, toListId);

            // Remove task from old list
            setDetails(prev =>
                prev.map(list =>
                    list.id === fromListId
                        ? {
                            ...list,
                            tasks: list.tasks.filter(task => task.id !== taskId)
                        }
                        : list
                )
            );

            // Refresh sidebar counts
            const updatedSummaries = await fetchTaskListSummaries();
            setTaskListSummaries(updatedSummaries);
        } catch (err) {
            console.error('Failed to move task:', err);
        } finally {
            handleTaskMenuClose();
        }
    };


    const handleTaskClick = (taskId: string) => {
        console.log('Task clicked:', taskId);
    };

    const handleTaskCheckboxToggle = (tasklistId: string, taskId: string, currentCompleted: boolean) => {
        // Optimistically update UI
        setDetails(prev =>
            prev.map(list =>
                list.id !== tasklistId
                    ? list
                    : {
                        ...list,
                        tasks: list.tasks.map(task =>
                            task.id === taskId ? {...task, completed: !currentCompleted} : task
                        ),
                    }
            )
        );

        // Call API
        updateTaskCompleted(taskId, !currentCompleted).catch(() => {
            // Revert on failure
            setDetails(prev =>
                prev.map(list =>
                    list.id !== tasklistId
                        ? list
                        : {
                            ...list,
                            tasks: list.tasks.map(task =>
                                task.id === taskId ? {...task, completed: currentCompleted} : task
                            ),
                        }
                )
            );
        });
    };


    const handleSaveDueDate = async () => {
        if (!editingTaskId) return;

        try {
            await updateTaskDatetime(editingTaskId, taskDueDate, taskDueTime);
            console.log(`Updated task ${editingTaskId} due:`, taskDueDate, taskDueTime);

            setDetails(prev =>
                prev.map(list => ({
                    ...list,
                    tasks: list.tasks.map(task =>
                        task.id === editingTaskId
                            ? {...task, dueDate: taskDueDate, dueTime: taskDueTime}
                            : task
                    )
                }))
            );
        } catch (err) {
            console.error('Failed to update task due date/time:', err);
            // Optionally show an error UI
        } finally {
            setAnchorElDate(null);
        }
    };

    const handleSaveTaskEdit = async () => {
        if (!editingTask) return;
        try {
            await updateTask(editingTask.id, editingTask.title || '', editingTask.notes || '', editingTask.dueDate || '', editingTask.dueTime || '');

            setDetails(prev =>
                prev.map(list => ({
                    ...list,
                    tasks: list.tasks.map(task =>
                        task.id === editingTask.id
                            ? {...task, ...editingTask}
                            : task
                    )
                }))
            );
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setAnchorElEdit(null);
        }
    };

    if (loading) {
        return (
            <Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{flexGrow: 1}}>{error}</Alert>;
    }

    return (
        <>
            <Box component="main" sx={{
                flexGrow: 1,
                p: 2,
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch', // smooth scrolling on iOS
            }}>
                {details.map(list => (
                    <Box key={list.id} sx={{
                        // snap each section to the left edge
                        scrollSnapAlign: 'center',   // snap each box to center
                        // avoid shrinking & set width responsively:
                        flex: '0 0 auto',
                        width: {xs: '100%', sm: 300},
                        mr: 2,
                        background: '#faf5e8',
                        borderRadius: 5,
                    }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" className="tasklist-box">
                            <Typography style={{fontWeight: 600}}>{list.title}</Typography>
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, list.id)}>
                                <MoreVertIcon fontSize="small"/>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && menuListId === list.id}
                                onClose={handleMenuClose}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            bgcolor: '#faf5e8', // your desired background
                                        }
                                    }
                                }}
                            >
                                <MenuItem onClick={handleRename} disabled={!list.id}>Rename</MenuItem>
                                <MenuItem onClick={handleDelete} disabled={!list.id}>Delete</MenuItem>
                            </Menu>
                        </Box>
                        <List disablePadding>
                            {list.tasks.length === 0 ? (
                                <Box sx={{px: 2, py: 4, textAlign: 'center'}}>
                                    <img
                                        src={pandaLogo}
                                        alt="logo"
                                        width={150}
                                        height={150}
                                    />
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        No tasks yet
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Add your to-dos and keep track of them here
                                    </Typography>
                                </Box>
                            ) : (
                                list.tasks.map(task => (
                                    <Box
                                        key={task.id}
                                        onClick={() => handleTaskClick(task.id)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            borderBottom: '1px solid #e0e0e0',
                                            padding: '8px 16px',
                                            cursor: 'pointer',
                                            '&:hover': {backgroundColor: '#e1ddd1'},
                                        }}
                                        className="task-item"
                                    >
                                        <ListItemIcon className="checkboxIcon">
                                            <Checkbox
                                                checked={task.completed}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleTaskCheckboxToggle(list.id, task.id, task.completed);
                                                }}
                                                sx={{
                                                    '&.Mui-checked': {
                                                        color: '#000',      // make the check‐icon black
                                                    },
                                                }}
                                            />
                                        </ListItemIcon>

                                        <Box sx={{flexGrow: 1}} className="task-text-box">
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box onClick={(e) => handleEditTaskClick(e, task)}
                                                     sx={{cursor: 'pointer'}}>
                                                    <Typography className="title-text">{task.title}</Typography>
                                                    {task.notes && (
                                                        <Typography className="notes-text">{task.notes}</Typography>
                                                    )}
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTaskMenuOpen(e, task.id);
                                                    }}
                                                >
                                                    <MoreVertIcon fontSize="small"/>
                                                </IconButton>
                                                <Menu
                                                    anchorEl={taskAnchorEl}
                                                    open={Boolean(taskAnchorEl) && activeTaskId === task.id}
                                                    onClose={handleTaskMenuClose}
                                                    slotProps={{
                                                        paper: {
                                                            sx: {
                                                                bgcolor: '#faf5e8', // your desired background
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <MenuItem onClick={() => handleDeleteTask(task.id)}>
                                                        <DeleteIcon/>
                                                        <span style={{paddingLeft: '6px'}}>Delete</span>
                                                    </MenuItem>
                                                    <Divider/>
                                                    {details.map((dropdownList) => (
                                                        <MenuItem
                                                            key={dropdownList.id}
                                                            onClick={() => handleMoveTaskToAnotherList(task.id, list.id, dropdownList.id)}
                                                        >
                                                            {dropdownList.title === list.title && (
                                                                <ListItemIcon>
                                                                    <CheckIcon fontSize="small"/>
                                                                </ListItemIcon>
                                                            )}
                                                            {dropdownList.title !== list.title && (
                                                                <ListItemIcon sx={{width: 24}}/>
                                                            )}
                                                            <span
                                                                style={{paddingLeft: '6px'}}>{dropdownList.title}</span>
                                                        </MenuItem>
                                                    ))}
                                                </Menu>
                                            </Box>

                                            {task.dueDate && (
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
                                                        mt: 0.5
                                                    }}
                                                    onClick={(e) => handleDueDateClick(e, task)}
                                                >
                                                    {formatDueDateLabel(task.dueDate, task.dueTime)}
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>

                                ))
                            )}
                        </List>
                    </Box>
                ))}
            </Box>


            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: '#faf5e8', // your desired background
                            }
                        }
                    }}
            >
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

            <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: '#faf5e8', // your desired background
                            }
                        }
                    }}
            >
                <DialogTitle>Rename List</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        fullWidth
                        label="New Name"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameDialogOpen(false)} sx={{color: "#063200"}}>Cancel</Button>
                    <Button onClick={confirmRename} variant="contained"
                            sx={{backgroundColor: "#063200", color: "#faf5e8"}}>Rename</Button>
                </DialogActions>
            </Dialog>

            <Popper open={Boolean(anchorElDate)} anchorEl={anchorElDate} placement="bottom-start" disablePortal>
                <ClickAwayListener onClickAway={() => setAnchorElDate(null)}>
                    <Paper sx={{p: 2, mt: 1, zIndex: 10, minWidth: 250, backgroundColor: '#fbf6ea'}}>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Box>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Due Date"
                                    InputLabelProps={{shrink: true}}
                                    value={taskDueDate}
                                    onChange={(e) => setTaskDueDate(e.target.value)}
                                />
                            </Box>
                            <Box>
                                <TextField
                                    fullWidth
                                    type="time"
                                    label="Due Time"
                                    InputLabelProps={{shrink: true}}
                                    value={taskDueTime}
                                    onChange={(e) => setTaskDueTime(e.target.value)}
                                />
                            </Box>
                            <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                                <Button onClick={() => setAnchorElDate(null)} size="small"
                                        color="inherit">Cancel</Button>
                                <Button
                                    onClick={handleSaveDueDate}
                                    size="small"
                                    variant="contained"
                                >
                                    Done
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>

            <Popper open={Boolean(anchorElEdit)} anchorEl={anchorElEdit} placement="bottom-start" disablePortal>
                <ClickAwayListener onClickAway={() => setAnchorElEdit(null)}>
                    <Paper variant="outlined" sx={{p: 2, mt: 1, zIndex: 10, minWidth: 250, backgroundColor: '#fbf6ea'}}>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <TextField
                                label="Title"
                                value={editingTask?.title || ''}
                                onChange={(e) => setEditingTask(prev => prev ? {...prev, title: e.target.value} : prev)}
                                fullWidth
                            />
                            <TextField
                                label="Notes"
                                value={editingTask?.notes || ''}
                                onChange={(e) => setEditingTask(prev => prev ? {...prev, notes: e.target.value} : prev)}
                                fullWidth
                                multiline
                            />
                            <TextField
                                label="Due Date"
                                type="date"
                                InputLabelProps={{shrink: true}}
                                value={editingTask?.dueDate || ''}
                                onChange={(e) => setEditingTask(prev => prev ? {
                                    ...prev,
                                    dueDate: e.target.value
                                } : prev)}
                                fullWidth
                            />
                            <TextField
                                label="Due Time"
                                type="time"
                                InputLabelProps={{shrink: true}}
                                value={editingTask?.dueTime || ''}
                                onChange={(e) => setEditingTask(prev => prev ? {
                                    ...prev,
                                    dueTime: e.target.value
                                } : prev)}
                                fullWidth
                            />
                            <Box display="flex" justifyContent="flex-end" gap={1}>
                                <Button onClick={() => setAnchorElEdit(null)} size="small"
                                        color="inherit">Cancel</Button>
                                <Button
                                    onClick={handleSaveTaskEdit}
                                    size="small"
                                    variant="contained"
                                >
                                    Save
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>


        </>
    );
};

export default TaskListsView;
