import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_BANNERS } from "../src/lib/banners";
import { CATALOG_SEED } from "../src/lib/product-catalog";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Conectemos2026!", 12);
  const demoHash = await bcrypt.hash("DemoCjc2026!", 12);

  const admin1 = await prisma.user.upsert({
    where: { email: "admin@conectemos.mx" },
    update: {},
    create: {
      email: "admin@conectemos.mx",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      firstName: "Administrador",
      lastName: "General",
      phone: "5500000001",
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: "gerencia@conectemos.mx" },
    update: { role: "MANAGER" },
    create: {
      email: "gerencia@conectemos.mx",
      passwordHash,
      role: "MANAGER",
      status: "ACTIVE",
      firstName: "Gerencia",
      lastName: "Operaciones",
      phone: "5500000002",
    },
  });

  await prisma.sequence.upsert({
    where: { key: `folio-${new Date().getFullYear()}` },
    update: {},
    create: { key: `folio-${new Date().getFullYear()}`, value: 1 },
  });

  const year = new Date().getFullYear();
  const folio = `CJC-${year}-00001`;

  const demoUser = await prisma.user.upsert({
    where: { email: "maria.demo@conectemos.mx" },
    update: { welcomeSeenAt: new Date() },
    create: {
      email: "maria.demo@conectemos.mx",
      passwordHash: demoHash,
      role: "CLIENT",
      status: "ACTIVE",
      firstName: "María",
      lastName: "González",
      phone: "5512345678",
      whatsapp: "5512345678",
      isDemo: true,
      welcomeSeenAt: new Date(),
    },
  });

  const existing = await prisma.client.findUnique({ where: { userId: demoUser.id } });
  if (!existing) {
    const client = await prisma.client.create({
      data: {
        userId: demoUser.id,
        folio,
        product: "Crédito Personal",
        requestedAmount: 150000,
        authorizedAmount: 0,
        displayedAmount: 0,
        termMonths: 24,
        purpose: "Capital de trabajo",
        isDemo: true,
      },
    });
    await prisma.application.create({
      data: {
        clientId: client.id,
        folio,
        product: "Crédito Personal",
        amount: 150000,
        termMonths: 24,
        purpose: "Capital de trabajo",
        status: "STUDY_PENDING",
      },
    });
    await prisma.socioEconomicStudy.create({
      data: { clientId: client.id, fullName: "María González" },
    });
    await prisma.auditLog.create({
      data: {
        actorId: admin1.id,
        clientId: client.id,
        action: "SEED_DEMO",
        meta: JSON.stringify({ note: "Cliente inicial." }),
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin1.id,
      action: "SEED_ADMINS",
      meta: JSON.stringify({ admins: [admin1.email, admin2.email] }),
    },
  });

  try {
    for (const banner of DEFAULT_BANNERS) {
      await prisma.banner.upsert({
        where: { id: banner.id },
        update: {
          title: banner.title,
          subtitle: banner.subtitle,
          body: banner.body,
          cta: banner.cta,
          href: banner.href,
          imageUrl: banner.imageUrl,
          active: banner.active,
          sortOrder: banner.sortOrder,
        },
        create: banner,
      });
    }
  } catch (error) {
    console.warn("Banners no sembrados (¿prisma generate?):", error);
  }

  try {
    for (const item of CATALOG_SEED) {
      await prisma.product.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          kind: item.kind,
          summary: item.summary,
          description: item.description,
          benefits: item.benefits,
          requirements: item.requirements,
          imageUrl: item.imageUrl,
          requiresBasicAccount: item.requiresBasicAccount,
          sortOrder: item.sortOrder,
          active: true,
        },
        create: item,
      });
    }
  } catch (error) {
    console.warn("Productos no sembrados:", error);
  }

  console.log("Seed listo.");
  console.log("Admins: admin@conectemos.mx / gerencia@conectemos.mx  contraseña: Conectemos2026!");
  console.log("Cliente: maria.demo@conectemos.mx  contraseña: DemoCjc2026!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
