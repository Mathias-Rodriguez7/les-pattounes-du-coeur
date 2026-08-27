<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import SaveCancelButtons from '../SaveCancelButtons.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';

	interface Props {
		editData: {
			firstName: string;
			lastName: string;
			email: string;
			phone: string;
			district: string;
			address: string;
			city: string;
			postalCode: string;
			actif: string;
			role: string;
		};
		onSave?: () => void | Promise<void>;
		onCancel?: () => void;
		isSaving?: boolean;
	}

	let { editData, onSave, onCancel, isSaving = false }: Props = $props();

	const statusOptions = [
		{ value: 'ACTIVE', label: 'En activité' },
		{ value: 'BREAK', label: 'En pause' },
		{ value: 'STOP', label: 'Arrêté' }
	];

	const roleOptions = [
		{ value: 'ADMIN', label: 'Admin' },
		{ value: 'MANAGER', label: 'Manager' },
		{ value: 'COMMUNICATION', label: 'Communication' }
	];

	const getStatusLabel = (value: string) =>
		statusOptions.find((opt) => opt.value === value)?.label || 'Sélectionner';

	const getRoleLabel = (value: string) =>
		roleOptions.find((opt) => opt.value === value)?.label || 'Sélectionner';

	const getDistrictLabel = (value: string) =>
		DISTRICT_LABELS[value as keyof typeof DISTRICT_LABELS] || 'Sélectionner';
</script>

<div class="space-y-8">
	<!-- SECTION 1: IDENTITÉ -->
	<div>
		<h3 class="mb-4 text-sm font-semibold text-gray-900">Profil</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-2">
				<label for="firstname-input" class="text-sm font-medium text-gray-700">Prénom</label>
				<Input id="firstname-input" bind:value={editData.firstName} placeholder="Ex: Jean" />
			</div>
			<div class="space-y-2">
				<label for="lastname-input" class="text-sm font-medium text-gray-700">Nom</label>
				<Input id="lastname-input" bind:value={editData.lastName} placeholder="Ex: Dupont" />
			</div>

			<div class="space-y-2">
				<label for="status-select" class="text-sm font-medium text-gray-700">Statut</label>
				<Select.Root
					value={editData.actif}
					onSelectedChange={(v) => {
						if (v) editData.actif = v.value;
					}}
				>
					<Select.Trigger id="status-select">
						<span>{getStatusLabel(editData.actif)}</span>
					</Select.Trigger>
					<Select.Content>
						{#each statusOptions as option (option.value)}
							<Select.Item value={option.value}>{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-2">
				<label for="role-select" class="text-sm font-medium text-gray-700">Rôle</label>
				<Select.Root
					value={editData.role}
					onSelectedChange={(v) => {
						if (v) editData.role = v.value;
					}}
				>
					<Select.Trigger id="role-select">
						<span>{getRoleLabel(editData.role)}</span>
					</Select.Trigger>
					<Select.Content>
						{#each roleOptions as option (option.value)}
							<Select.Item value={option.value}>{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>

	<Separator />

	<!-- SECTION 2: CONTACT -->
	<div>
		<h3 class="mb-4 text-sm font-semibold text-gray-900">Contact</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-2">
				<label for="email-input" class="text-sm font-medium text-gray-700">Email</label>
				<Input
					id="email-input"
					type="email"
					bind:value={editData.email}
					placeholder="exemple@mail.com"
				/>
			</div>
			<div class="space-y-2">
				<label for="phone-input" class="text-sm font-medium text-gray-700">Téléphone</label>
				<Input
					id="phone-input"
					type="tel"
					bind:value={editData.phone}
					placeholder="+33 6 12 34 56 78"
				/>
			</div>
		</div>
	</div>

	<Separator />

	<!-- SECTION 3: LOCALISATION -->
	<div>
		<h3 class="mb-4 text-sm font-semibold text-gray-900">Localisation</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-2">
				<label for="address-input" class="text-sm font-medium text-gray-700">Adresse</label>
				<Input id="address-input" bind:value={editData.address} placeholder="123 rue de la Paix" />
			</div>

			<div class="space-y-2">
				<label for="city-input" class="text-sm font-medium text-gray-700">Ville</label>
				<Input id="city-input" bind:value={editData.city} placeholder="Paris" />
			</div>
			<div class="space-y-2">
				<label for="postalcode-input" class="text-sm font-medium text-gray-700">Code postal</label>
				<Input id="postalcode-input" bind:value={editData.postalCode} placeholder="75001" />
			</div>
			<div class="space-y-2">
				<label for="district-select" class="text-sm font-medium text-gray-700">Quartier</label>
				<Select.Root
					value={editData.district}
					onSelectedChange={(v) => {
						if (v) editData.district = v.value;
					}}
				>
					<Select.Trigger id="district-select">
						<span>{getDistrictLabel(editData.district)}</span>
					</Select.Trigger>
					<Select.Content>
						{#each Object.entries(DISTRICT_LABELS) as [key, label] (key)}
							<Select.Item value={key}>{label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>

	<Separator />

	<!-- BOUTONS -->
	<SaveCancelButtons {onSave} {onCancel} {isSaving} class="pt-4" />
</div>
