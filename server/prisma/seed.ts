import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  // Reverse the order for deletion to handle foreign key constraints
  const reversedFileNames = [...orderedFileNames].reverse();
  
  for (const fileName of reversedFileNames) {
    const modelName = path.basename(fileName, path.extname(fileName));
    // Convert to camelCase for Prisma's API
    const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    
    const model: any = prisma[prismaModelName as keyof typeof prisma];
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${prismaModelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${prismaModelName}:`, error);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");
  
  // Order matters due to foreign key relationships
  const orderedFileNames = [
    "role.json",
    "user.json",
    "lab.json",
    "labRole.json",
    "labMember.json",
    "contact.json",
    "memberStatus.json",
    "item.json",
    "labInventoryItem.json",
    "itemTag.json",
    "inventoryLog.json",
    "discussion.json",
    "discussionPost.json",
    "discussionReply.json",
    "discussionPostTag.json",
    "discussionReaction.json",
    "instrument.json",
    "instrumentIssue.json",
    "issuePost.json",
    "event.json",
    "eventAssignment.json",
    "clockInLog.json",
  ];

  // First delete all existing data
  await deleteAllData(orderedFileNames);

  // Then seed with new data
  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    
    // Check if the file exists before trying to read it
    if (!fs.existsSync(filePath)) {
      console.log(`File ${fileName} doesn't exist, skipping`);
      continue;
    }
    
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    // Convert to camelCase for Prisma's API
    const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    
    const model: any = prisma[prismaModelName as keyof typeof prisma];
    try {
      for (const data of jsonData) {
        await model.create({ data });
      }
      console.log(`Seeded ${prismaModelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding data for ${prismaModelName}:`, error);
      console.error(error);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());