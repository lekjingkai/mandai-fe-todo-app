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
    CircularProgress,
    ListItemIcon,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl, useMediaQuery, useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { fetchTaskListSummaries, updateTaskListEnabled, createTaskList } from '../api/tasks';
import { createTask } from '../api/tasks';
import '../style/Sidebar.css';
import { TaskListSummary } from '../types';

export const Sidebar: React.FC<{
    taskListSummaries: TaskListSummary[];
    setTaskListSummaries: React.Dispatch<React.SetStateAction<TaskListSummary[]>>;
}> = ({ taskListSummaries, setTaskListSummaries }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [openModal, setOpenModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [selectedTab, setSelectedTab] = useState<'all' | 'starred'>('all');

    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskNotes, setTaskNotes] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [taskDueTime, setTaskDueTime] = useState('');
    // const [taskListId, setTaskListId] = useState<string | null>(null);
    const [taskListId, setTaskListId] = useState<string | null>('default');


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
            setTaskListSummaries(prev =>
                prev.map(list =>
                    list.tasklistId === tasklistId ? { ...list, enabled: current.enabled } : list
                )
            );
        });
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        try {
            await createTaskList(newTitle.trim());
            const updatedLists = await fetchTaskListSummaries();
            setTaskListSummaries(updatedLists);
            setOpenModal(false);
            setNewTitle('');
        } catch (err) {
            console.error('Failed to create task list:', err);
        }
    };

    const handleSaveTask = async () => {
        if (!taskTitle.trim()) return;
        try {
            const actualTaskListId = taskListId === 'default' ? null : taskListId;
            await createTask({
                tasklistId: actualTaskListId || undefined,
                title: taskTitle,
                notes: taskNotes || undefined,
                dueDate: taskDueDate || undefined,
                dueTime: taskDueTime || undefined
            });
            setTaskModalOpen(false);
            setTaskTitle('');
            setTaskNotes('');
            setTaskDueDate('');
            setTaskDueTime('');
            setTaskListId(null);
            const updatedLists = await fetchTaskListSummaries();
            setTaskListSummaries(updatedLists);
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    return (
        <Box
            component="nav"
            sx={{
                width: { xs: '100%', sm: 240 },
                flexShrink: 0,
                position: { xs: 'absolute', sm: 'relative' },
                top: { xs: 0, sm: 'auto' },
                left: 0,
                zIndex: { xs: theme.zIndex.drawer + 1, sm: 'auto' },
                backgroundColor: '#faf5e8',
                height: '100vh',
                p: 2,
                padding: '12px 8px 0',
            }}
        >
            <Button variant="contained" fullWidth sx={{ mb: 2, backgroundColor: "#063200", color: "#faf5e8" }} onClick={() => setTaskModalOpen(true)}>
                Create
            </Button>

            <List>
                <ListItemButton
                    className="taskListItem"
                    selected={selectedTab === 'all'}
                    onClick={() => setSelectedTab('all')}
                >
                    <ListItemIcon><TaskAltIcon style={{marginRight: '5px'}}/></ListItemIcon>
                    <ListItemText primary="All tasks" />
                </ListItemButton>

                <ListItemButton
                    className="taskListItem"
                    selected={selectedTab === 'starred'}
                    onClick={() => setSelectedTab('starred')}
                >
                    <ListItemIcon><StarBorderIcon style={{marginRight: '5px'}}/></ListItemIcon>
                    <ListItemText primary="Starred" />
                </ListItemButton>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom style={{ padding: '0 5px' }}>
                LISTS:
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress size={24} /></Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <List>
                    {taskListSummaries.map(list => (
                        <ListItemButton
                            key={list.tasklistId}
                            className="taskListItem"
                            onClick={e => {
                                e.stopPropagation();
                                handleCheckboxToggle(list.tasklistId);
                            }}
                        >
                            <ListItemIcon className="checkboxIcon">
                                <Checkbox  checked={list.enabled}
                                           sx={{
                                               '&.Mui-checked': {
                                                   color: '#000',      // make the check‐icon black
                                               },
                                           }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={<div className="taskTitleContainer">
                                    <span className="taskTitle">{list.title}</span>
                                    {list.amount > 0 && <span className="taskCount">{list.amount}</span>}
                                </div>}
                            />
                        </ListItemButton>
                    ))}
                </List>
            )}

            <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2, color: "#063200", borderColor: '#063200' }}
                onClick={() => setOpenModal(true)}
            >
                Create new list
            </Button>

            <Dialog open={openModal} onClose={() => setOpenModal(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: '#faf5e8', // your desired background
                            }
                        }
                    }}
            >
                <DialogTitle>Create a new list</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        autoFocus
                        margin="dense"
                        label="List Name"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)} sx={{ color: "#063200" }}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained" sx={{ backgroundColor: "#063200", color: "#faf5e8" }}>Done</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={taskModalOpen} onClose={() => setTaskModalOpen(false)}
                    slotProps={{
                paper: {
                    sx: {
                        bgcolor: '#faf5e8', // your desired background
                    }
                }
            }}>
                <DialogTitle>Create a new task</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        autoFocus
                        margin="dense"
                        label="Title"
                        value={taskTitle}
                        onChange={e => setTaskTitle(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Notes"
                        value={taskNotes}
                        onChange={e => setTaskNotes(e.target.value)}
                    />
                    <Grid container spacing={2}>
                            <Box component="div">
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    type="date"
                                    label="Due Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={taskDueDate}
                                    onChange={e => setTaskDueDate(e.target.value)}
                                />
                            </Box>
                            <Box component="div">
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    type="time"
                                    label="Due Time"
                                    InputLabelProps={{ shrink: true }}
                                    value={taskDueTime}
                                    onChange={e => setTaskDueTime(e.target.value)}
                                />
                            </Box>
                        </Grid>
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="tasklist-select-label">Task List</InputLabel>
                        <Select
                            labelId="tasklist-select-label"
                            value={taskListId ?? ''}
                            onChange={e => setTaskListId(e.target.value || null)}
                            label="Task List"
                            renderValue={(selected) => {
                                if (!selected || selected === 'default') return 'My Tasks';
                                const list = taskListSummaries.find(l => l.tasklistId === selected);
                                return list ? list.title : 'Unknown';
                            }}
                        >
                            <MenuItem value="default">My Tasks</MenuItem>
                            {taskListSummaries.map(list => (
                                <MenuItem key={list.tasklistId} value={list.tasklistId}>{list.title}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTaskModalOpen(false)} sx={{ color: "#063200" }}>Cancel</Button>
                    <Button onClick={handleSaveTask} variant="contained" sx={{ backgroundColor: "#063200", color: "#faf5e8" }}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Sidebar;
