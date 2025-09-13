import { PrismaClient, TagType } from '@aura/database/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const emotionTags = await prisma.tag.createManyAndReturn({
    data: [
      { name: 'Happy', emoji: '😄', type: TagType.EMOTION },
      { name: 'Calm', emoji: '😌', type: TagType.EMOTION },
      { name: 'Sad', emoji: '😢', type: TagType.EMOTION },
      { name: 'Excited', emoji: '🤩', type: TagType.EMOTION },
      { name: 'Anxious', emoji: '😟', type: TagType.EMOTION },
      { name: 'Tired', emoji: '😴', type: TagType.EMOTION },
    ],
    skipDuplicates: true,
  });

  const activityTags = await prisma.tag.createManyAndReturn({
    data: [
      { name: 'Work', emoji: '💼', type: TagType.ACTIVITY },
      { name: 'Study', emoji: '📚', type: TagType.ACTIVITY },
      { name: 'Exercise', emoji: '🏋️', type: TagType.ACTIVITY },
      { name: 'Hobby', emoji: '🎨', type: TagType.ACTIVITY },
      { name: 'Social', emoji: '🎉', type: TagType.ACTIVITY },
      { name: 'Rest', emoji: '🛌', type: TagType.ACTIVITY },
    ],
    skipDuplicates: true,
  });
  console.log('Created system tags.');

  const profile1 = await prisma.profile.create({
    data: {
      anonymousName: 'Optimistic Sunflower',
      avatarId: 'sunflower-01',
    },
  });

  const profile2 = await prisma.profile.create({
    data: {
      anonymousName: 'Pondering Owl',
      avatarId: 'owl-02',
    },
  });
  console.log('Created mock profiles.');

  const customTagForProfile2 = await prisma.tag.create({
    data: {
      name: 'Brainstorming',
      emoji: '💡',
      type: TagType.ACTIVITY,
      profileId: profile2.id,
    },
  });
  console.log('Created a custom tag.');

  // --- 创建情绪记录 (关联用户和标签) ---

  // 向日葵用户的记录
  await prisma.moodEntry.create({
    data: {
      profileId: profile1.id,
      note: 'The weather is great today, and the project is going smoothly!',
      tags: {
        connect: [
          // 👇 --- 核心修正在这里 --- 👇
          { id: emotionTags.find((t) => t.name === 'Happy')?.id },
          { id: activityTags.find((t) => t.name === 'Work')?.id },
        ].filter(Boolean) as { id: number }[], // 添加 .filter(Boolean) 保证不会传入 undefined
      },
    },
  });

  await prisma.moodEntry.create({
    data: {
      profileId: profile1.id,
      note: 'Played ball with friends tonight, very relaxing.',
      tags: {
        connect: [
          { id: emotionTags.find((t) => t.name === 'Excited')?.id },
          { id: activityTags.find((t) => t.name === 'Exercise')?.id },
          { id: activityTags.find((t) => t.name === 'Social')?.id },
        ].filter(Boolean) as { id: number }[],
      },
    },
  });

  // 猫头鹰用户的记录
  await prisma.moodEntry.create({
    data: {
      profileId: profile2.id,
      note: 'Thinking about the future features of Aura, very interesting.',
      tags: {
        connect: [{ id: emotionTags.find((t) => t.name === 'Calm')?.id }, { id: customTagForProfile2.id }].filter(
          Boolean,
        ) as { id: number }[],
      },
    },
  });

  await prisma.moodEntry.create({
    data: {
      profileId: profile2.id,
      note: 'A bit tired, need to rest early.',
      tags: {
        connect: [
          { id: emotionTags.find((t) => t.name === 'Tired')?.id },
          { id: activityTags.find((t) => t.name === 'Rest')?.id },
        ].filter(Boolean) as { id: number }[],
      },
    },
  });

  console.log('Created mood entries.');
  console.log('Seeding finished.');
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
