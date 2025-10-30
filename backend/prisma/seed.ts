import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  // reset
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.experience.deleteMany();

  // experiences to mirror your home grid
  const experiences = [
    {
      title: "Kayaking",
      location: "Udupi",
      price: 999,
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      description: "Curated small-group experience. Certified guide.",
    },
    {
      title: "Nandi Hills Sunrise",
      location: "Bangalore",
      price: 899,
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      description: "Sunrise viewpoint with guide.",
    },
    {
      title: "Coffee Trail",
      location: "Coorg",
      price: 1299,
      imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      description: "Plantation walk and tasting.",
    },
    {
      title: "Boat Cruise",
      location: "Sundarban",
      price: 999,
      imageUrl: "https://images.unsplash.com/photo-1520975922198-3d8b6a2430d3",
      description: "Slow cruise with snacks.",
    },
    {
      title: "Bungee Jumping",
      location: "Manali",
      price: 1999,
      imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
      description: "Thrill jump with safety gear.",
    },
    // add more if you like…
  ];

  // create experiences + future slots
  for (const e of experiences) {
    const exp = await prisma.experience.create({ data: e });
    const today = new Date();
    for (let i = 1; i <= 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      await prisma.slot.create({
        data: {
          experienceId: exp.id,
          date: d,
          capacity: 8 - (i % 3), // 8/7/6 cycling
        },
      });
    }
  }
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
