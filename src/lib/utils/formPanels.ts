import AdoptionFormPanel from '$lib/components/forms/panels/AdoptionFormPanel.svelte';
import VolunteerFormPanel from '$lib/components/forms/panels/VolunteerFormPanel.svelte';
import HostFormPanel from '$lib/components/forms/panels/HostFormPanel.svelte';
import ColabFormPanel from '$lib/components/forms/panels/ColabFormPanel.svelte';

export const formPanelMap = {
	ADOPTION_SPECIFIC: AdoptionFormPanel,
	ADOPTION_FLEXIBLE: AdoptionFormPanel,
	VOLUNTEER: VolunteerFormPanel,
	HOST: HostFormPanel,
	COLAB: ColabFormPanel,
	OTHER: AdoptionFormPanel
} as const;

export function getFormPanelComponent(type: string) {
	return formPanelMap[type as keyof typeof formPanelMap] || AdoptionFormPanel;
}
