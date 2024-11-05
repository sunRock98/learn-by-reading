import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const languages = [
    { name: "English", code: "en" },
    { name: "Spanish", code: "es" },
    { name: "French", code: "fr" },
    { name: "German", code: "de" },
    { name: "Chinese", code: "zh" },
    { name: "Japanese", code: "ja" },
    { name: "Portuguese", code: "pt" },
    { name: "Russian", code: "ru" },
    { name: "Korean", code: "ko" },
    { name: "Italian", code: "it" },
  ];

  await prisma.language.createMany({
    data: languages,
    skipDuplicates: true, // avoid inserting if already exists
  });

  console.log("Languages table populated");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
