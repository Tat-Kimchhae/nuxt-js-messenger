import prisma from "../server/utils/prisma";
import { faker } from "@faker-js/faker";
import crypto from "node:crypto";

async function main() {
  const users = [];

  for (let i = 0; i < 100; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    users.push({
      id: crypto.randomUUID(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      firstName,
      lastName,
      username: faker.internet.username({ firstName, lastName }),
      avatarUrl: faker.image.avatar(),
      hashedPassword:
        "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    });
  }

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`Created ${users.length} users`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
