import { invalidateAll } from '$app/navigation';
import { toast } from 'svelte-sonner';

/**
 * Reprendre tout de suite une tâche mise de côté (bouton « Reprendre », ou « Annuler » du message).
 * Appelle l'action ?/resumeTask de la page (le dashboard), puis recharge les données.
 */
export async function resumeTask(taskId: string) {
	const body = new FormData();
	body.set('taskId', taskId);
	const response = await fetch('?/resumeTask', {
		method: 'POST',
		body,
		headers: { 'x-sveltekit-action': 'true' }
	});
	if (!response.ok) {
		toast.error('Impossible de reprendre la tâche');
		return;
	}
	await invalidateAll();
}
