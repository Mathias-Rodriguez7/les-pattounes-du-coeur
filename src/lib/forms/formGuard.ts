// Deux aides pour TOUS les formulaires du site, sans rien changer dans chacun :
//
// 1. Modifications non enregistrées : dès qu'on tape dans un formulaire, il est « modifié ».
//    Quitter la page (lien, bouton Retour, fermer l'onglet) demande alors confirmation.
//    Envoyer le formulaire le remet à zéro. Un formulaire fermé (fenêtre refermée) ne compte plus.
//    Pour exclure un formulaire (ex : la connexion) : <form data-guard="off">.
//
// 2. Erreurs après envoi : quand le serveur signale des champs en erreur (aria-invalid),
//    on fait défiler jusqu'au PREMIER et on y place le curseur.

const dirtyForms = new Set<HTMLFormElement>();

export const LEAVE_MESSAGE =
	'Vous avez des modifications non enregistrées. Quitter la page sans les enregistrer ?';

/** Un formulaire encore affiché a-t-il des modifications non enregistrées ? */
export function hasDirtyForms(): boolean {
	for (const form of dirtyForms) if (!form.isConnected) dirtyForms.delete(form);
	return dirtyForms.size > 0;
}

/** Après confirmation de départ : on oublie les modifications */
export function clearDirtyForms() {
	dirtyForms.clear();
}

function guardedForm(target: EventTarget | null): HTMLFormElement | null {
	const form = target instanceof Element ? target.closest('form') : null;
	return form && form.dataset.guard !== 'off' ? form : null;
}

function focusFirstInvalid(form: HTMLFormElement): boolean {
	const field = form.querySelector<HTMLElement>('[aria-invalid="true"]');
	if (!field) return false;
	field.scrollIntoView({ behavior: 'smooth', block: 'center' });
	field.focus({ preventScroll: true });
	return true;
}

/** Après un envoi : guette l'apparition des erreurs (3 s au plus) et va à la première */
function watchErrorsAfterSubmit(form: HTMLFormElement) {
	let done = false;
	const observer = new MutationObserver(() => {
		if (!done && focusFirstInvalid(form)) stop();
	});
	const stop = () => {
		done = true;
		observer.disconnect();
		clearTimeout(timeout);
	};
	observer.observe(form, { subtree: true, attributes: true, attributeFilter: ['aria-invalid'] });
	const timeout = setTimeout(stop, 3000);
}

/** À lancer une fois (layout). Renvoie la fonction qui arrête tout. */
export function startFormGuard(): () => void {
	const onInput = (e: Event) => {
		const form = guardedForm(e.target);
		if (form) dirtyForms.add(form);
	};
	const onSubmit = (e: Event) => {
		const form = guardedForm(e.target);
		if (!form) return;
		dirtyForms.delete(form);
		watchErrorsAfterSubmit(form);
	};
	const onBeforeUnload = (e: BeforeUnloadEvent) => {
		if (!hasDirtyForms()) return;
		e.preventDefault();
		e.returnValue = '';
	};

	document.addEventListener('input', onInput, true);
	document.addEventListener('change', onInput, true);
	document.addEventListener('submit', onSubmit, true);
	window.addEventListener('beforeunload', onBeforeUnload);

	return () => {
		document.removeEventListener('input', onInput, true);
		document.removeEventListener('change', onInput, true);
		document.removeEventListener('submit', onSubmit, true);
		window.removeEventListener('beforeunload', onBeforeUnload);
	};
}
