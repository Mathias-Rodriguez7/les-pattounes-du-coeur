<script lang="ts">
	import type { VolunteerEditData } from '$lib/types/volunteer';

	let { editData }: { editData: VolunteerEditData } = $props();
</script>

<!-- 🔑 INPUTS CACHÉS POUR ENVOYER LES DONNÉES -->
<!-- Profil -->
<input type="hidden" name="firstName" value={editData.firstName} />
<input type="hidden" name="lastName" value={editData.lastName} />
<input type="hidden" name="email" value={editData.email} />
<input type="hidden" name="phone" value={editData.phone} />
<input type="hidden" name="address" value={editData.address} />
<input type="hidden" name="city" value={editData.city} />
<input type="hidden" name="postalCode" value={editData.postalCode} />
<input type="hidden" name="district" value={editData.district} />

<!-- volunteer spécifiques -->
<input type="hidden" name="role" value={editData.role} />
<input type="hidden" name="actif" value={editData.actif} />
