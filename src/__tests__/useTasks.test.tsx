import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

vi.mock('../api/taskApi');
const mockApi = vi.mocked(taskApi);

const mockTask: Task = {
	id: 1,
	title: 'Test Task',
	description: 'desc',
	completed: false,
	createdAt: '2026-01-01T00:00:00Z',
	updatedAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('useTasks', () => {
	it('loads tasks on mount and exposes them', async () => {
		mockApi.getTasks.mockResolvedValue([mockTask]);

		const { result } = renderHook(() => useTasks());

		expect(result.current.loading).toBe(true);

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.tasks).toEqual([mockTask]);
		expect(result.current.error).toBeNull();
	});

	it('sets an error message when loadTasks fails', async () => {
		mockApi.getTasks.mockRejectedValue(new Error('Network down'));

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.error).toBe('Network down');
		expect(result.current.tasks).toEqual([]);
	});

	it('addTask prepends the new task to the list', async () => {
		mockApi.getTasks.mockResolvedValue([]);
		const newTask = { ...mockTask, id: 2, title: 'New' };
		mockApi.createTask.mockResolvedValue(newTask);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'New' });
		});

		expect(mockApi.createTask).toHaveBeenCalledWith({ title: 'New' });
		expect(result.current.tasks).toEqual([newTask]);
	});

	it('editTask replaces the matching task', async () => {
		mockApi.getTasks.mockResolvedValue([mockTask]);
		const updated = { ...mockTask, title: 'Updated' };
		mockApi.updateTask.mockResolvedValue(updated);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.editTask(1, { title: 'Updated' });
		});

		expect(mockApi.updateTask).toHaveBeenCalledWith(1, { title: 'Updated' });
		expect(result.current.tasks[0].title).toBe('Updated');
	});

	it('removeTask deletes the task from the list', async () => {
		mockApi.getTasks.mockResolvedValue([mockTask]);
		mockApi.deleteTask.mockResolvedValue(undefined);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(mockApi.deleteTask).toHaveBeenCalledWith(1);
		expect(result.current.tasks).toEqual([]);
	});

	it('toggleComplete flips the completed flag of the matching task', async () => {
		mockApi.getTasks.mockResolvedValue([mockTask]);
		const toggled = { ...mockTask, completed: true };
		mockApi.updateTask.mockResolvedValue(toggled);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(mockApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
		expect(result.current.tasks[0].completed).toBe(true);
	});

	it('toggleComplete does nothing if the task id is not found', async () => {
		mockApi.getTasks.mockResolvedValue([mockTask]);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(999);
		});

		expect(mockApi.updateTask).not.toHaveBeenCalled();
	});
});