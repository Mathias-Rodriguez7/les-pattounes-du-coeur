<script lang="ts">
	type Props = {
		label?: string;
	};

	let { label = 'NEW' }: Props = $props();
</script>

<div
	class="
from-secondary
absolute
top-6
-right-10
z-30
w-40
rotate-45
bg-linear-to-r
to-emerald-600
py-2
text-center
text-sm
font-black
tracking-widest
text-white
shadow-xl
"
>
	{label}
</div>
