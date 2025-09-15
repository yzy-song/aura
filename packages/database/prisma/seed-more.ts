import { PrismaClient, TagType } from "./client";
import { subDays, format } from "date-fns";
const prisma = new PrismaClient();

// 👇 --- 请在这里填入您自己的 Profile ID --- 👇
// 您可以从前端应用的 localStorage，或者直接在数据库的 Profile 表中找到这些 ID
const YOUR_PROFILE_IDS = [
  // "cmfhcbtty0000b7hgrwdihtst",
  // "cmfhcbtu10001b7hgkjbyhtqg",
  // "cmfhn56hl0001b72wqfkti3y5",
  "cmfhnc3zf0003b72wmyzxknmr",
  "cmfi458570000b7f8jd2692iy",
  "cmfi458580001b7f88xk1yqs4",
  "cmfiin1eg0000b7hwqlcsg7pk",
];
// ---------------------------------------------

const sampleNotes = [
  "A very productive day at work.",
  "Felt a bit overwhelmed, but pushed through.",
  "Great workout session at the gym!",
  "Spent some quality time with friends.",
  "Just a quiet, calm evening at home.",
  "Studying for the new certification.",
  "Feeling excited about the weekend plans.",
  "A little bit down today for no specific reason.",
  "Finished a major project milestone!",
  "",
  "Watched a fantastic movie.",
  "Cooked a new recipe for dinner.",
  "Went for a long walk in the park.",
  "Had a deep conversation with a friend.",
  "Read a few chapters of a good book.",
  "Tried meditation for the first time.",
  "Helped someone in need today.",
  "Listened to my favorite music.",
  "Cleaned and organized my room.",
  "Had a video call with family.",
  "Learned something new at work.",
  "Enjoyed a delicious dessert.",
  "Felt grateful for the little things.",
  "Had a challenging but rewarding day.",
  "Took a break and relaxed.",
  "Played games to unwind.",
  "Went shopping and found a great deal.",
  "Had a healthy meal.",
  "Reflected on my goals.",
  "Felt inspired by a podcast.",
];

async function main() {
  console.log("Start seeding more data...");

  // --- 1. Upsert System Tags (Create if they don't exist) ---
  const tagsData = [
    { name: "Happy", type: TagType.EMOTION, emoji: "😊" },
    { name: "Calm", type: TagType.EMOTION, emoji: "😌" },
    { name: "Sad", type: TagType.EMOTION, emoji: "😢" },
    { name: "Excited", type: TagType.EMOTION, emoji: "🤩" },
    { name: "Anxious", type: TagType.EMOTION, emoji: "😟" },
    { name: "Tired", type: TagType.EMOTION, emoji: "😩" },
    { name: "Work", type: TagType.ACTIVITY, emoji: "💼" },
    { name: "Study", type: TagType.ACTIVITY, emoji: "📚" },
    { name: "Exercise", type: TagType.ACTIVITY, emoji: "🏃" },
    { name: "Entertainment", type: TagType.ACTIVITY, emoji: "🎮" },
    { name: "Social", type: TagType.ACTIVITY, emoji: "🍻" },
    { name: "Rest", type: TagType.ACTIVITY, emoji: "🛌" },
  ];

  // 👇 --- 使用 findFirst 来完美处理 null --- 👇
  for (const tagData of tagsData) {
    // findFirst 的 where 条件直接映射到模型字段，因此允许 profileId 为 null
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: tagData.name,
        profileId: null, // 这里的类型是正确的,使用 upsert或者findUnique都会报错:不能将类型“null”分配给类型“string”
      },
    });

    if (!existingTag) {
      await prisma.tag.create({ data: tagData });
      console.log(`Created system tag: ${tagData.name}`);
    }
  }

  const allSystemTags = await prisma.tag.findMany({
    where: { profileId: null },
  });
  const emotionTags = allSystemTags.filter((t: any) => t.type === "EMOTION");
  const activityTags = allSystemTags.filter((t: any) => t.type === "ACTIVITY");

  console.log("System tags are ready.");

  // --- Optional: Clean up old mood entries for the specified profiles ---
  // await prisma.moodEntry.deleteMany({
  //   where: { profileId: { in: YOUR_PROFILE_IDS } },
  // });
  // console.log('Cleaned up old entries for the specified profiles.');

  // --- 2. Generate entries for the last 120 days ---
  for (let i = 120; i >= 0; i--) {
    // For each day, there's a 60% chance of having an entry
    if (Math.random() < 0.6) {
      // Randomly pick one of the profiles to create an entry for
      const profileId =
        YOUR_PROFILE_IDS[Math.floor(Math.random() * YOUR_PROFILE_IDS.length)];

      const date = subDays(new Date(), i);

      // Randomly select 1 emotion tag
      const selectedEmotion =
        emotionTags[Math.floor(Math.random() * emotionTags.length)];

      // Randomly select 0 to 2 activity tags
      const selectedActivities = activityTags
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3));

      const allSelectedTags = [selectedEmotion, ...selectedActivities];

      await prisma.moodEntry.create({
        data: {
          profileId: profileId,
          createdAt: date,
          note: sampleNotes[Math.floor(Math.random() * sampleNotes.length)],
          tags: {
            connect: allSelectedTags.map((tag) => ({ id: tag.id })),
          },
        },
      });
      console.log(
        `Created entry for ${profileId} on ${format(date, "yyyy-MM-dd")}`
      );
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
