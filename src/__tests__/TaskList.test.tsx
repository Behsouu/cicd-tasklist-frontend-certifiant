import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from '../components/TaskList';
import type { Task } from '../types/task';

const mockTasks: Task[] = [
	{
		id: 1,
		title: 'Première tâche',
		description: 'Description 1',
		completed: false,
		createdAt: '2026-01-15T10:00:00Z',
		updatedAt: '2026-01-15T10:00:00Z',
	},
	{
		id: 2,
		title: 'Deuxième tâche',
		description: null,
		completed: true,
		createdAt: '2026-01-16T10:00:00Z',
		updatedAt: '2026-01-16T10:00:00Z',
	},
];

describe('TaskList', () => {
	it('shows loading state', () => {
		render(
			<TaskList
				tasks={[]}
				loading={true}
				error={null}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByTestId('loading')).toBeInTheDocument();
		expect(screen.getByText('Chargement des tâches...')).toBeInTheDocument();
	});

	it('renders list of tasks', () => {
		render(
			<TaskList
				tasks={mockTasks}
				loading={false}
				error={null}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByTestId('task-list')).toBeInTheDocument();
		expect(screen.getByText('Première tâche')).toBeInTheDocument();
		expect(screen.getByText('Deuxième tâche')).toBeInTheDocument();
		expect(screen.getByText('2 tâches')).toBeInTheDocument();
	});

	it('shows error state', () => {
		render(
			<TaskList
				tasks={[]}
				loading={false}
				error="Erreur réseau"
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByTestId('error')).toBeInTheDocument();
		expect(screen.getByText('Erreur : Erreur réseau')).toBeInTheDocument();
	});

	it('shows empty state when there are no tasks', () => {
		render(
			<TaskList
				tasks={[]}
				loading={false}
				error={null}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByTestId('empty')).toBeInTheDocument();
		expect(screen.getByText('Aucune tâche')).toBeInTheDocument();
	});

	it('uses singular form for a single task', () => {
		render(
			<TaskList
				tasks={[mockTasks[0]]}
				loading={false}
				error={null}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByText('1 tâche')).toBeInTheDocument();
	});

	it('calls onToggle when a task checkbox is clicked', () => {
		const onToggle = vi.fn();
		render(
			<TaskList
				tasks={mockTasks}
				loading={false}
				error={null}
				onToggle={onToggle}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		const checkboxes = screen.getAllByRole('checkbox');
		fireEvent.click(checkboxes[0]);
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('requires a delete confirmation click before calling onDelete', () => {
		const onDelete = vi.fn();
		render(
			<TaskList
				tasks={[mockTasks[0]]}
				loading={false}
				error={null}
				onToggle={vi.fn()}
				onDelete={onDelete}
				onEdit={vi.fn()}
			/>
		);
		const deleteButton = screen.getByLabelText('Supprimer');

		fireEvent.click(deleteButton);
		expect(onDelete).not.toHaveBeenCalled();

		fireEvent.click(deleteButton);
		expect(onDelete).toHaveBeenCalledWith(1);
	});

	it('switches a task into edit mode and calls onEdit on save', () => {
		const onEdit = vi.fn();
		render(
			<TaskList
				tasks={[mockTasks[0]]}
				loading={false}
				error={null}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={onEdit}
			/>
		);
		fireEvent.click(screen.getByLabelText('Modifier'));

		const titleInput = screen.getByLabelText('Modifier le titre');
		fireEvent.change(titleInput, { target: { value: 'Titre modifié' } });
		fireEvent.click(screen.getByText('Enregistrer'));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Titre modifié',
			description: 'Description 1',
		});
	});
});