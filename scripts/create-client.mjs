import { PrismaClient } from "../node_modules/.prisma/client/index.js";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

const password = "client123";
const hash = await bcrypt.hash(password, 10);
const slug = "demo-client";
const token = nanoid(32);

try {
  const client = await prisma.client.create({
    data: {
      slug,
      businessName: "Demo Business SRL",
      contactName: "Ion Popescu",
      email: "client@demo.ro",
      phone: "0721000000",
      passwordHash: hash,
      mustSetPassword: false,
      intakeToken: token,
      status: "live",
    },
  });

  console.log("✅ Client creat cu succes!");
  console.log("  Slug:   ", client.slug);
  console.log("  Email:  ", client.email);
  console.log("  Parola: ", password);
  console.log("  Login:   http://localhost:3000/login");
} catch (e) {
  if (e.code === "P2002") {
    console.log("⚠️  Clientul demo-client există deja.");
    console.log("  Email:   client@demo.ro");
    console.log("  Parola:  client123");
    console.log("  Login:   http://localhost:3000/login");
  } else {
    console.error(e);
  }
} finally {
  await prisma.$disconnect();
}
