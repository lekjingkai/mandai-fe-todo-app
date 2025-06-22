// src/types.ts
export interface Task {
    id: string;
    title: string;
    notes: string;
    completed: boolean;
    dueDate: string;
    dueTime: string;
}

export interface TaskListSummary {
    tasklistId: string;
    title:       string;
    enabled:     boolean;
    amount:      number;
}

export interface TaskListDetail {
    id:      string;
    title:   string;
    enabled: boolean;
    tasks:   Task[];
}

// src/types.ts

export interface CreateTaskPayload {
    tasklistId?: string;     // optional: null or string
    title: string;           // required
    notes?: string;          // optional
    dueDate?: string;        // optional: format "YYYY-MM-DD"
    dueTime?: string;        // optional: format "HH:mm:ss"
}
