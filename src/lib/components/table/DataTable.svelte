<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Button } from '$lib/components/ui/button';

	interface Tab {
		value: string;
		label: string;
	}

	interface Column {
		key: string;
		label: string;
		render?: (value: any, row: any) => any;
		class?: string;
	}

	interface Props {
		title: string;
		data: any[];
		columns: Column[];
		tabs?: Tab[];
		onTabChange?: (tab: string) => void;
		onRowClick?: (row: any) => void;
		selectedRowId?: string | null;
		primaryKey?: string;
		pageSize?: number;
		actionButton?: {
			label: string;
			icon: any;
			onClick: () => void;
		};
		filterFn?: (data: any[], tab: string) => any[];
	}

	const {
		title,
		data,
		columns,
		tabs = [],
		onTabChange,
		onRowClick,
		selectedRowId = null,
		primaryKey = 'id',
		pageSize = 10,
		actionButton,
		filterFn
	} = $props();

	let currentPage = $state(1);
	let currentTab = $state(tabs.length > 0 ? tabs[0].value : 'all');

	const filteredData = $derived(() => {
		if (filterFn) {
			return filterFn(data, currentTab);
		}
		return data;
	});

	const paginatedData = $derived(
		filteredData().slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	function handleTabChange(tab: string) {
		currentTab = tab;
		currentPage = 1;
		onTabChange?.(tab);
	}
</script>

<Card.Root class={$$props.class ?? 'col-span-2'}>
	<Card.Header class="flex flex-row items-center justify-between">
		<Card.Title class="text-2xl font-bold">{title}</Card.Title>
		{#if actionButton}
			<Button size="sm" onclick={actionButton.onClick}>
				<svelte:component this={actionButton.icon} class="mr-2 h-4 w-4" />
				{actionButton.label}
			</Button>
		{/if}
	</Card.Header>

	<Card.Content>
		{#if tabs.length > 0}
			<Tabs.Root value={currentTab} onValueChange={handleTabChange} class="w-full">
				<Tabs.List
					class="bg-muted grid w-full gap-2 p-1"
					style="grid-template-columns: repeat({tabs.length}, minmax(0, 1fr))"
				>
					{#each tabs as tab (tab.value)}
						<Tabs.Trigger value={tab.value} class="relative">
							{tab.label}
							{#if currentTab === tab.value}
								<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-t-sm"></div>
							{/if}
						</Tabs.Trigger>
					{/each}
				</Tabs.List>

				<div class="mt-4">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								{#each columns as column (column.key)}
									<Table.Head class={column.class}>
										{column.label}
									</Table.Head>
								{/each}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each paginatedData as row (row[primaryKey])}
								<Table.Row
									class="hover:bg-muted/50 cursor-pointer transition-colors"
									class:bg-muted={selectedRowId === row[primaryKey]}
									onclick={() => onRowClick?.(row)}
								>
									{#each columns as column (column.key)}
										<Table.Cell class={column.class}>
											{#if column.render}
												<svelte:component
													this={{ render: column.render }}
													value={row[column.key]}
													{row}
												/>
											{:else}
												{row[column.key]}
											{/if}
										</Table.Cell>
									{/each}
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				<!-- Pagination -->
				<div class="mt-4 flex justify-center">
					<Pagination.Root count={filteredData().length} perPage={pageSize} bind:page={currentPage}>
						{#snippet children({ pages, currentPage: cp })}
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.Previous />
								</Pagination.Item>
								{#each pages as page (page.key)}
									{#if page.type === 'ellipsis'}
										<Pagination.Item>
											<Pagination.Ellipsis />
										</Pagination.Item>
									{:else}
										<Pagination.Item>
											<Pagination.Link {page} isActive={cp === page.value}>
												{page.value}
											</Pagination.Link>
										</Pagination.Item>
									{/if}
								{/each}
								<Pagination.Item>
									<Pagination.Next />
								</Pagination.Item>
							</Pagination.Content>
						{/snippet}
					</Pagination.Root>
				</div>
			</Tabs.Root>
		{:else}
			<!-- Sans tabs -->
			<Table.Root>
				<Table.Header>
					<Table.Row>
						{#each columns as column (column.key)}
							<Table.Head class={column.class}>
								{column.label}
							</Table.Head>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each paginatedData as row (row[primaryKey])}
						<Table.Row
							class="hover:bg-muted/50 cursor-pointer transition-colors"
							class:bg-muted={selectedRowId === row[primaryKey]}
							onclick={() => onRowClick?.(row)}
						>
							{#each columns as column (column.key)}
								<Table.Cell class={column.class}>
									{#if column.render}
										<svelte:component
											this={{ render: column.render }}
											value={row[column.key]}
											{row}
										/>
									{:else}
										{row[column.key]}
									{/if}
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>

			<!-- Pagination -->
			<div class="mt-4 flex justify-center">
				<Pagination.Root count={filteredData().length} perPage={pageSize} bind:page={currentPage}>
					{#snippet children({ pages, currentPage: cp })}
						<Pagination.Content>
							<Pagination.Item>
								<Pagination.Previous />
							</Pagination.Item>
							{#each pages as page (page.key)}
								{#if page.type === 'ellipsis'}
									<Pagination.Item>
										<Pagination.Ellipsis />
									</Pagination.Item>
								{:else}
									<Pagination.Item>
										<Pagination.Link {page} isActive={cp === page.value}>
											{page.value}
										</Pagination.Link>
									</Pagination.Item>
								{/if}
							{/each}
							<Pagination.Item>
								<Pagination.Next />
							</Pagination.Item>
						</Pagination.Content>
					{/snippet}
				</Pagination.Root>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
