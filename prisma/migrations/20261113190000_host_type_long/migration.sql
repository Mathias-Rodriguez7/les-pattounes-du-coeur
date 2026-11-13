-- Nouveau type de FA « Accueil Long ». CLASSIC reste la valeur des FA existantes
-- (c'est le cas le plus fréquent) : aucune donnée n'est modifiée.
ALTER TYPE "HostType" ADD VALUE 'LONG' AFTER 'CLASSIC';
