<script lang="ts">
    import * as Table from '$lib/components/ui/table/index.js';
    import { Badge } from '$lib/components/ui/badge';
    import Icon from '$lib/components/Icon.svelte';
    import type { CatFull } from '$lib/types/cat';
    import { statusLabel, focalPointClass } from '$lib/utils/catHelpers';
    import { formatAge } from '$lib/utils/age';
    import BooleanIcon from '../icons/BooleanIcon.svelte';

    const { cat, onclick, isSelected = false }: { cat: CatFull; onclick: () => void; isSelected?: boolean } = $props();

    const statusColors = {
        AVAILABLE: 'bg-emerald-100 text-emerald-800',
        ADOPTED: 'bg-rose-100 text-rose-800',
        SOCIALIZE: 'bg-sky-100 text-sky-800',
        FREE: 'bg-orange-100 text-orange-800'
    };

    const badgeClass =
        statusColors[cat.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';

    const truncateTo5 = (text: string | null | undefined) => {
        if (!text) return '—';
        return text.length > 5 ? text.slice(0, 5) : text;
    };

    // 👇 Utilise le iconMap
    const getSexIcon = (sex: string | null | undefined) => {
    switch (sex) {
        case 'MALE':
            return { icon: 'mars', color: 'text-blue-500', label: 'Mâle' };
        case 'FEMALE':
            return { icon: 'venus', color: 'text-pink-500', label: 'Femelle' };
        default:
            return { icon: 'CircleQuestionMark', color: 'text-gray-500', label: 'Inconnu' };
    }
};

    const sexIcon = getSexIcon(cat.sex);
</script>

<Table.Row 
    class={`
        cursor-pointer transition-colors
        ${isSelected 
            ? '!bg-accent' 
            : 'hover:bg-muted/50'
        }
    `}
    onclick={onclick}
>
    <Table.Cell>
        <img
            src={cat.media?.[0]?.picture ?? '/img/logo.png'}
            alt={cat.name}
            class="h-12 w-12 rounded-full object-cover {focalPointClass[cat.focalPoint ?? 'MID']}"
        />
    </Table.Cell>
    <Table.Cell class="font-medium">{cat.name}</Table.Cell>
    <Table.Cell class="text-center">
        <div title={sexIcon.label}>
            <Icon name={sexIcon.icon} class="h-5 w-5 {sexIcon.color}" />
        </div>
    </Table.Cell>
    <Table.Cell class="text-sm">{formatAge(cat.birthDate)}</Table.Cell>
    <Table.Cell>
        <Badge class={badgeClass}>{truncateTo5(statusLabel[cat.status] ?? cat.status)}</Badge>
    </Table.Cell>
    <Table.Cell class="text-center">
        <BooleanIcon value={cat.isOkDog} />
    </Table.Cell>
    <Table.Cell class="text-center">
        <BooleanIcon value={cat.isOkCat} />
    </Table.Cell>
    <Table.Cell class="text-center">
        <BooleanIcon value={cat.isOkChild} />
    </Table.Cell>
    <Table.Cell class="text-center">
        <BooleanIcon value={cat.isOutside} />
    </Table.Cell>
</Table.Row>