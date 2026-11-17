<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import { LocateFixed, LoaderCircle, MapPin, X } from '@lucide/svelte';
	import { formatCoordinates, mapsUrl, parseCoordinates } from '#lib/utils/geo.ts';

	// La position GPS d'un SOS : « Ma position » (la bénévole sur place, avec son téléphone),
	// ou un lien Google Maps / des coordonnées collés. Envoie `latitude` et `longitude`.
	interface Props {
		latitude: number | null;
		longitude: number | null;
		disabled?: boolean;
		error?: string;
	}

	let {
		latitude = $bindable(null),
		longitude = $bindable(null),
		disabled = false,
		error
	}: Props = $props();

	let pasted = $state('');
	let message = $state<string | null>(null);
	let locating = $state(false);

	const point = $derived(latitude !== null && longitude !== null ? { latitude, longitude } : null);

	function setPoint(lat: number, lng: number) {
		latitude = Math.round(lat * 1e6) / 1e6;
		longitude = Math.round(lng * 1e6) / 1e6;
	}

	// Ce qui est collé est lu tout de suite : on voit si c'est compris
	function onPaste(text: string) {
		pasted = text;
		if (!text.trim()) {
			message = null;
			return;
		}
		const found = parseCoordinates(text);
		if (found) {
			setPoint(found.latitude, found.longitude);
			message = null;
			pasted = '';
		} else {
			message =
				'Position introuvable dans ce texte. Collez des coordonnées (43.56, 3.90) ou un lien Google Maps complet (pas un lien court « maps.app.goo.gl »).';
		}
	}

	function locate() {
		if (!navigator.geolocation) {
			message = 'Ce navigateur ne donne pas la position.';
			return;
		}
		locating = true;
		message = null;
		navigator.geolocation.getCurrentPosition(
			(position) => {
				locating = false;
				setPoint(position.coords.latitude, position.coords.longitude);
			},
			() => {
				locating = false;
				message =
					'Position refusée ou indisponible : autorisez la localisation, ou collez un lien.';
			},
			{ enableHighAccuracy: true, timeout: 15000 }
		);
	}

	function clear() {
		latitude = null;
		longitude = null;
	}
</script>

<div class="grid gap-2">
	<span class="text-xs font-medium text-gray-700">Position GPS</span>

	{#if point}
		<div class="flex flex-wrap items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
			<MapPin class="size-4 text-primary" />
			<span class="font-mono text-xs">{formatCoordinates(point)}</span>
			<!-- Un site externe (Google Maps) : pas une route de l'appli -->
			<!-- eslint-disable svelte/no-navigation-without-resolve -->
			<a
				href={mapsUrl(point)}
				target="_blank"
				rel="noopener noreferrer"
				class="text-blue-600 underline hover:text-primary">Ouvrir dans Maps</a
			>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				class="ml-auto"
				onclick={clear}
				{disabled}
				aria-label="Effacer la position"
			>
				<X class="size-4" />
			</Button>
		</div>
	{/if}

	<div class="flex flex-wrap gap-2">
		<Button
			type="button"
			variant="outline"
			size="sm"
			onclick={locate}
			disabled={disabled || locating}
		>
			{#if locating}<LoaderCircle class="size-4 animate-spin" />{:else}<LocateFixed
					class="size-4"
				/>{/if}
			Ma position
		</Button>
		<Input
			value={pasted}
			oninput={(e) => onPaste(e.currentTarget.value)}
			placeholder="Coller un lien Google Maps ou 43.56, 3.90"
			class="h-8 min-w-48 flex-1 text-xs"
			{disabled}
			aria-label="Coller une position"
		/>
	</div>

	{#if message || error}
		<p class="text-xs text-red-500">{message ?? error}</p>
	{/if}

	<input type="hidden" name="latitude" value={latitude ?? ''} />
	<input type="hidden" name="longitude" value={longitude ?? ''} />
</div>
