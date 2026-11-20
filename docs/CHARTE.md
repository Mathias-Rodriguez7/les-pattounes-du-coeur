# Charte — Les Pattounes du Cœur

Une page pour que tout le site garde le même ton et le même style. À compléter au fil du projet.

## Le ton

| Support                                                | Pronom                            | Exemple                                 |
| ------------------------------------------------------ | --------------------------------- | --------------------------------------- |
| Site public (visiteurs, adoptants, familles d'accueil) | **vous**                          | « Remplissez le formulaire d'adoption » |
| Dashboard (bénévoles)                                  | **vous**, phrases courtes         | « Chat mis à jour »                     |
| Réseaux sociaux, visuels Instagram                     | **tu** (ton familier des réseaux) | « Tu vends ou achètes un bien ? »       |

Quand un texte des réseaux est repris sur le site (ex : le partenariat SAFTI), on le remet au **vous**.

## Les messages (toasts)

- Succès : le fait, sans « avec succès » ni « ! » : « Chat mis à jour », « Document ajouté ».
- Erreur : ce qui se passe, puis quoi faire : « Une erreur est survenue. Réessayez. »
- Pas de « Veuillez » : « Corrigez les champs signalés en rouge ».
- Emoji : seulement dans les messages aux visiteurs (« Demande envoyée 🎉 »), jamais dans le dashboard.

## Les titres de page

Toujours `PageHeader` (`src/lib/components/layout/PageHeader.svelte`) : un seul `<h1>` par page,
`text-2xl sm:text-3xl`, une phrase dessous si utile, les boutons à droite.

## Les boutons

| Taille      | Usage                                                          |
| ----------- | -------------------------------------------------------------- |
| `size="sm"` | Barres d'outils, filtres, actions dans un tableau              |
| par défaut  | Formulaires, fenêtres (Enregistrer / Annuler)                  |
| `size="lg"` | Appel principal d'une page publique (« Faire un signalement ») |

- Un seul bouton plein (couleur principale) par zone ; les autres en `variant="outline"`.
- Un lien qui ressemble à un bouton : `<a class={buttonVariants()}>`, jamais un `<Button>` dans un `<a>`.

## Les arrondis

- `rounded-2xl` : cartes, panneaux, barres d'outils, boutons.
- `rounded-full` : pastilles, badges, avatars, onglets.

## Les formulaires

- Champ obligatoire : `required` sur le champ (étoile rouge) + `<RequiredLegend />` en tête du formulaire.
- Longue fenêtre : `<SaveCancelButtons sticky />` pour garder les boutons visibles.

## Les icônes

- Lucide partout (`@lucide/svelte`).
- Réseaux sociaux : `SocialIcon` (`src/lib/components/icons/SocialIcon.svelte`), pas d'images PNG.
