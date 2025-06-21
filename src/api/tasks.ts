import api from './client';
import {Task, TaskListDetail, TaskListSummary} from '../types';

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

export const createTaskList = (title: string): Promise<TaskListSummary> =>
    api.post('/todo/tasklists', { title }).then(res => res.data);