<script lang="ts">
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
	import '../../../app.css';
</script>

<header class="flex w-full bg-accent justify-between px-5">
    <img src="/img/logo.png" alt="logo" class="w-20 h-20">
    <NavigationMenu.Root>
        <NavigationMenu.List>
        <NavigationMenu.Item>
            <NavigationMenu.Trigger>Adoptions</NavigationMenu.Trigger>
            <NavigationMenu.Content class="bg-accent">
                <ul class="grid w-75 p-2">
                    <li><NavigationMenu.Link href="##">Chats</NavigationMenu.Link></li>
                    <li><NavigationMenu.Link href="##">Formulaire d'adoption</NavigationMenu.Link></li>
                </ul>
            </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
            <NavigationMenu.Link href="##">Donation</NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
            <NavigationMenu.Link href="##"><img src="/img/logo.png" alt="logo" class="w-20 h-20"></NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
            <NavigationMenu.Trigger>Association</NavigationMenu.Trigger>
            <NavigationMenu.Content class="bg-accent">
                <ul class="grid w-75 p-2">
                    <li><NavigationMenu.Link href="##">Information</NavigationMenu.Link></li>
                    <li><NavigationMenu.Link href="##">News</NavigationMenu.Link></li>
                    <li><NavigationMenu.Link href="##">Conseils</NavigationMenu.Link></li>
                    <li><NavigationMenu.Link href="##">Boutique</NavigationMenu.Link></li>
                </ul>
            </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
            <NavigationMenu.Trigger>Contact</NavigationMenu.Trigger>
            <NavigationMenu.Content class="bg-accent">
                <ul class="grid w-75 gap-4 p-2">
                    <li><NavigationMenu.Link href="##">Signaler un SOS</NavigationMenu.Link></li>
                    <li><NavigationMenu.Link href="##">Devenir Famille d'accueil</NavigationMenu.Link></li>
                    <li><NavigationMenu.Link href="##">Devenir Bénévole</NavigationMenu.Link></li>
                </ul>
            </NavigationMenu.Content>
        </NavigationMenu.Item>
        </NavigationMenu.List>
    </NavigationMenu.Root>

    <Sheet.Root>
        <Sheet.Trigger class={buttonVariants}>
            <img src="/img/cat-sleeping.png" alt="cat-sleeping" class="w-20 h-20">
        </Sheet.Trigger>
        <Sheet.Content side="right">
            <Sheet.Header>
            <Sheet.Title>Connexion pour les bénévole</Sheet.Title>
            </Sheet.Header>
            <div class="grid flex-1 auto-rows-min gap-6 px-4">
            <div class="grid gap-3">
                <Label for="name" class="text-end">Email</Label>
                <Input id="name" value="ex@gmail.com" />
            </div>
            <div class="grid gap-3">
                <Label for="username" class="text-end">Mot de passe</Label>
                <Input id="username" value="********" />
            </div>
            </div>
            <Sheet.Footer>
            <Button type="submit">Connexion</Button>
            <Sheet.Close class={buttonVariants({ variant: "outline" })}
                >Close</Sheet.Close
            >
            </Sheet.Footer>
        </Sheet.Content>
    </Sheet.Root>
</header>