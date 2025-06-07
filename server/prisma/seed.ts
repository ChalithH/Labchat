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
  let dataDirectory: string;
  let orderedFileNames: string[];

  if (process.env.NODE_ENV === "production") {
    console.log("Running in production mode");
    dataDirectory = path.join(__dirname, "prodSeedData");
    orderedFileNames = [
    "role.json",          // First seed roles
    "user.json",          // Then users (depends on roles)
    "status.json",        // Independent table
    "instrument.json",    // Independent table
    "labRole.json",       // independent table
    "contact.json",       // Depends on user
    "itemTag.json",       // Independent table
    "postReaction.json",  // Independent table
    "replyReaction.json",  // Independent table
    "postTag.json",       // Independent table
    "eventType.json",       // Independent table
    "eventStatus.json",    // Independent table

    ]
  } else {
    dataDirectory = path.join(__dirname, "devSeedData");
    orderedFileNames = [
    "role.json",          // First seed roles
    "user.json",          // Then users (depends on roles)
    "status.json",        // Independent table
    "lab.json",           // Independent table
    "labRole.json",       // Depends on role
    "labMember.json",     // Depends on user, lab, and labRole
    "contact.json",       // Depends on user
    "memberStatus.json",  // Depends on contact, labMember, and status
    "itemTag.json",       // Independent table
    "item.json",          // Independent table but fix field name
    "labInventoryItem.json", // Depends on lab and item
    "labItemTag.json", // Depends on labInventoryItem and itemTag
    "instrument.json",    // Depends on lab
    "postReaction.json",  // Independent table
    "replyReaction.json",  // Independent table
    "postTag.json",       // Independent table
    "discussion.json",    // Depends on lab
    "discussionPost.json", // Depends on discussion and labMember
    "discussionReply.json", // Depends on discussionPost and labMember
    "discussionPostReaction.json", // Depends on discussionPost, labMember, and postReaction
    "discussionPostTag.json", // Depends on discussionPost and postTag
    "eventType.json",       // Independent table
    "eventStatus.json",    // Independent table
    "event.json",          // Depends on lab, labMember, and instrument and eventType
    "eventAssignment.json", // Depends on event and labMember
  ];

  }
  console.log(`Using data directory: ${dataDirectory}`);

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