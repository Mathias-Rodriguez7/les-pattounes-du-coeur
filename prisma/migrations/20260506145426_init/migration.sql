-- CreateEnum
CREATE TYPE "VolunteerRole" AS ENUM ('ADMIN', 'MANAGER', 'COMMUNICATION');

-- CreateEnum
CREATE TYPE "HostType" AS ENUM ('CLASSIC', 'RELAY');

-- CreateEnum
CREATE TYPE "Space" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "Heal" AS ENUM ('NO', 'LIGHT', 'HEAVY', 'HEAVY_STING');

-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('FREE', 'CAT_PLACE', 'WAITING', 'WAITING_VALIDATION');

-- CreateEnum
CREATE TYPE "Socialize" AS ENUM ('NO', 'FEARFUL', 'WITHOUT_EX', 'EXPERIENCED');

-- CreateEnum
CREATE TYPE "BabyFeeding" AS ENUM ('NO', 'WITHOUT_EX', 'EXPERIENCED', 'RELAY');

-- CreateEnum
CREATE TYPE "SexCat" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CatStatus" AS ENUM ('AVAILABLE', 'SOCIALIZE', 'ADOPTED', 'FREE');

-- CreateEnum
CREATE TYPE "HairLength" AS ENUM ('SHORT', 'MEDIUM', 'LONG');

-- CreateEnum
CREATE TYPE "Vaccinate" AS ENUM ('YES', 'NO', 'PARTIAL');

-- CreateEnum
CREATE TYPE "CareType" AS ENUM ('VACCINE', 'TREATMENT', 'SURGERY', 'OTHER', 'CONTROL', 'STERILIZE');

-- CreateEnum
CREATE TYPE "NewsType" AS ENUM ('NEWS', 'NEWSLETTER', 'HISTORY', 'NEWSCATS', 'EVENT');

-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('ADOPTION', 'VOLUNTEER', 'HOST', 'COLAB', 'ALERT', 'OTHER');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Profil" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(60) NOT NULL,
    "last_name" VARCHAR(60) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" UUID NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "VolunteerRole" NOT NULL,
    "actif" VARCHAR(255) NOT NULL,
    "profilId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" UUID NOT NULL,
    "profilId" UUID NOT NULL,
    "age" INTEGER NOT NULL,
    "type" "HostType",
    "is_actif" BOOLEAN NOT NULL,
    "job" VARCHAR(255) NOT NULL,
    "status" "HostStatus" NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "reception_capacity" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "is_animals-at-home" BOOLEAN NOT NULL,
    "space" "Space" NOT NULL,
    "presence" VARCHAR(255) NOT NULL,
    "outside" BOOLEAN NOT NULL,
    "outside_desciption" TEXT,
    "isStockFeed" BOOLEAN NOT NULL,
    "heal" "Heal" NOT NULL,
    "socialize" "Socialize" NOT NULL,
    "car" BOOLEAN NOT NULL,
    "baby_feeding" "BabyFeeding" NOT NULL,
    "stopActivity" TEXT NOT NULL,
    "home_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlacklistHistoric" (
    "id" UUID NOT NULL,
    "profilId" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlacklistHistoric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cat" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255),
    "sex" "SexCat" NOT NULL,
    "age" INTEGER,
    "isVisible" BOOLEAN NOT NULL,
    "status" "CatStatus" NOT NULL,
    "hairLength" "HairLength",
    "color" VARCHAR(255),
    "origin" VARCHAR(255),
    "isSterilize" BOOLEAN NOT NULL DEFAULT false,
    "isAlreadySterilized" BOOLEAN NOT NULL DEFAULT false,
    "sickness" TEXT,
    "treatment" TEXT,
    "vaccinate" "Vaccinate",
    "isFivTest" BOOLEAN NOT NULL DEFAULT false,
    "isDeworming" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "isOkCat" BOOLEAN NOT NULL DEFAULT false,
    "isOkDog" BOOLEAN NOT NULL DEFAULT false,
    "isOkChild" BOOLEAN NOT NULL DEFAULT false,
    "isOutside" BOOLEAN NOT NULL DEFAULT false,
    "isIdentify" BOOLEAN NOT NULL DEFAULT false,
    "chipId" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaCat" (
    "id" UUID NOT NULL,
    "catId" UUID NOT NULL,
    "picture" VARCHAR(255),
    "fille" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaCat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" "NewsType" NOT NULL,
    "content" TEXT,
    "mediaUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsCat" (
    "newsId" UUID NOT NULL,
    "catId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsCat_pkey" PRIMARY KEY ("newsId","catId")
);

-- CreateTable
CREATE TABLE "CatVolunteer" (
    "catId" UUID NOT NULL,
    "volunteerId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatVolunteer_pkey" PRIMARY KEY ("catId","volunteerId")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" UUID NOT NULL,
    "catId" UUID NOT NULL,
    "hostId" UUID NOT NULL,
    "started" DATE,
    "ended" DATE,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adoption" (
    "id" TEXT NOT NULL,
    "catId" UUID NOT NULL,
    "profilId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Adoption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" UUID NOT NULL,
    "type" "FormType" NOT NULL,
    "status" "FormStatus" NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Care" (
    "id" UUID NOT NULL,
    "catId" UUID NOT NULL,
    "type" "CareType" NOT NULL,
    "veterinary" VARCHAR(255),
    "description" TEXT,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Care_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profil_phone_key" ON "Profil"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Profil_email_key" ON "Profil"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_profilId_key" ON "Volunteer"("profilId");

-- CreateIndex
CREATE UNIQUE INDEX "Host_profilId_key" ON "Host"("profilId");

-- CreateIndex
CREATE UNIQUE INDEX "Adoption_catId_key" ON "Adoption"("catId");

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "Profil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "Profil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlacklistHistoric" ADD CONSTRAINT "BlacklistHistoric_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "Profil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaCat" ADD CONSTRAINT "MediaCat_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsCat" ADD CONSTRAINT "NewsCat_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsCat" ADD CONSTRAINT "NewsCat_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatVolunteer" ADD CONSTRAINT "CatVolunteer_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatVolunteer" ADD CONSTRAINT "CatVolunteer_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adoption" ADD CONSTRAINT "Adoption_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adoption" ADD CONSTRAINT "Adoption_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "Profil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Care" ADD CONSTRAINT "Care_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
