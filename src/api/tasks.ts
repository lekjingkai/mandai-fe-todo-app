import api from './client';
import {CreateTaskPayload, Task, TaskListDetail, TaskListSummary} from '../types';

export const fetchTaskListSummaries = (): Promise<TaskListSummary[]> =>
    api
        .get<TaskListSummary[]>('/todo')
        .then(res => res.data);

// 2️⃣ Single list detail (from http://localhost:4000/todo/tasklists?id=…)
export const fetchTaskListDetail = (
    tasklistId?: string // now optional
): Promise<TaskListDetail> =>
    api
        .get<TaskListDetail>('/todo/tasklists', {
            params: tasklistId ? { id: tasklistId } : {},
        })
        .then(r => r.data);


// 3️⃣ Helper: fetch *all* details in order
export const fetchAllTaskListDetails = (): Promise<TaskListDetail[]> =>
    fetchTaskListSummaries().then(summaries =>
        Promise.all(summaries.map(s => fetchTaskListDetail(s.tasklistId)))
    );

export const updateTaskListEnabled = (id: string, enabled: boolean) =>
    api.put('/todo/tasklists', { id, enabled });

export const updateTaskListName = (id: string, title: string) =>
    api.put('/todo/tasklists', { id, title }).then(res => res.data);

export const createTaskList = (title: string): Promise<TaskListSummary> =>
    api.post('/todo/tasklists', { title }).then(res => res.data);

export const createTask = (task: CreateTaskPayload): Promise<void> => {
    return api.post('/todo/task', task);
};

export const deleteTaskList = (id: string): Promise<void> => {
    return api.delete(`/todo/tasklists/${id}`);
};

// export const updateTask = (task: Task): Promise<void> => {
//     return api.put('/todo/task', task).then(res => res.data);
// };

export const updateTaskCompleted = (id: string, completed: boolean) =>
    api.put('/todo/task', { id, completed });

export const updateTaskDatetime = (id: string, dueDate: string, dueTime: string) =>
    api.put('/todo/task', { id, dueDate, dueTime });

export const updateTask = (id: string, title: string, notes: string, dueDate: string, dueTime: string) =>
    api.put('/todo/task', { id, title, notes, dueDate, dueTime });

export const updateTaskTasklist = (id: string, tasklistId: string) =>
    api.put('/todo/task', { id, tasklistId });