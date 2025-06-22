// src/components/Sidebar.tsx
import React, {useEffect, useState} from 'react';
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
    TextField
} from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {fetchTaskListSummaries, updateTaskListEnabled, createTaskList} from '../api/tasks';
import '../style/Sidebar.css';
import {TaskListSummary} from '../types';

export const Sidebar: React.FC<{
    taskListSummaries: TaskListSummary[];
    setTaskListSummaries: React.Dispatch<React.SetStateAction<TaskListSummary[]>>;
}> = ({taskListSummaries, setTaskListSummaries}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [openModal, setOpenModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [selectedTab, setSelectedTab] = useState<'all' | 'starred'>('all');

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
                list.tasklistId === tasklistId ? {...list, enabled: newEnabled} : list
            )
        );

        updateTaskListEnabled(tasklistId, newEnabled).catch(() => {
            setTaskListSummaries(prev =>
                prev.map(list =>
                    list.tasklistId === tasklistId ? {...list, enabled: current.enabled} : list
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
                padding: '12px 8px 0',
            }}
        >
            <Button variant="contained" fullWidth sx={{mb: 2}}>
                CREATE
            </Button>

            <List>
                <ListItemButton
                    className="taskListItem"
                    selected={selectedTab === 'all'}
                    onClick={() => setSelectedTab('all')}
                >
                    <ListItemIcon>
                        <TaskAltIcon style={{marginRight: '5px'}}/>
                    </ListItemIcon>
                    <ListItemText primary="All tasks"/>
                </ListItemButton>

                <ListItemButton
                    className="taskListItem"
                    selected={selectedTab === 'starred'}
                    onClick={() => setSelectedTab('starred')}
                >
                    <ListItemIcon>
                        <StarBorderIcon style={{marginRight: '5px'}}/>
                    </ListItemIcon>
                    <ListItemText primary="Starred"/>
                </ListItemButton>
            </List>

            <Divider sx={{my: 2}}/>

            <Typography variant="subtitle2" gutterBottom style={{padding: '0 5px'}}>
                LISTS:
            </Typography>

            {loading ? (
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                    <CircularProgress size={24}/>
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <List>
                    {taskListSummaries.map(list => (
                        <ListItemButton key={list.tasklistId} className="taskListItem"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleCheckboxToggle(list.tasklistId);
                                        }}
                        >
                            <ListItemIcon className="checkboxIcon">
                                <Checkbox
                                    checked={list.enabled}
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

            <Button
                variant="outlined"
                fullWidth
                sx={{mt: 2}}
                onClick={() => setOpenModal(true)}
            >
                + New List
            </Button>

            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
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
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Done</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Sidebar;
