<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Cat } from 'lucide-svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
</script>

<main class="flex flex-col gap-4 p-4">
	<section class="grid grid-cols-3 gap-4">
		<Card.Root class="col-span-2">
			<Card.Header>
				<Card.Title>chats</Card.Title>
				<Card.Description>Card Description</Card.Description>
			</Card.Header>
			<Card.Content class="grid grid-cols-5">
				<div>
					<p>Card Content</p>
				</div>

				<div>
					<p>Card Content</p>
				</div>

				<div>
					<p>Card Content</p>
				</div>

				<div>
					<p>Card Content</p>
				</div>

				<Cat />
			</Card.Content>
		</Card.Root>

		<Card.Root class="col-span-1">
			<Card.Header>
				<Card.Title>Card Title</Card.Title>
				<Card.Description>Card Description</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Card Content</p>
			</Card.Content>
		</Card.Root>
	</section>

	<section class="grid grid-cols-3 gap-4">
		<Card.Root class="col-span-2">
			<Card.Content>
				<Tabs.Root value="account" class="w-full">
					<Tabs.List>
						<Tabs.Trigger value="account">Account</Tabs.Trigger>
						<Tabs.Trigger value="password">Password</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="account">
						<Table.Root class="w-full">
							<Table.Header>
								<Table.Row>
									<Table.Head>name</Table.Head>
									<Table.Head>sex</Table.Head>
									<Table.Head>age</Table.Head>
									<Table.Head>isVisible</Table.Head>
									<Table.Head>status</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								<Table.Row>
									<Table.Cell>INV001</Table.Cell>
									<Table.Cell>Paid</Table.Cell>
									<Table.Cell>Credit Card</Table.Cell>
									<Table.Cell>$250.00</Table.Cell>
								</Table.Row>
							</Table.Body>
						</Table.Root>
					</Tabs.Content>

					<Tabs.Content value="password"
						><Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Invoice</Table.Head>
									<Table.Head>Status</Table.Head>
									<Table.Head>Method</Table.Head>
									<Table.Head>Amount</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								<Table.Row>
									<Table.Cell class="font-medium">INV001</Table.Cell>
									<Table.Cell>Paid</Table.Cell>
									<Table.Cell>Credit Card</Table.Cell>
									<Table.Cell class="text-end">$250.00</Table.Cell>
								</Table.Row>
							</Table.Body>
						</Table.Root></Tabs.Content
					>
				</Tabs.Root>
			</Card.Content>
		</Card.Root>

		<Card.Root class="col-span-1">
			<Card.Header>
				<Card.Title>Card Title</Card.Title>
				<Card.Description>Card Description</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Card Content</p>
			</Card.Content>
		</Card.Root>
	</section>
</main>
