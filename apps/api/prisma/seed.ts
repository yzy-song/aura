import { PrismaClient, TagType } from '@prisma/client';

// 初始化 Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- 1. 创建系统预设标签 ---
  const emotionTags = await prisma.tag.createManyAndReturn({
    data: [
      { name: '开心', type: TagType.EMOTION },
      { name: '平静', type: TagType.EMOTION },
      { name: '难过', type: TagType.EMOTION },
      { name: '激动', type: TagType.EMOTION },
      { name: '焦虑', type: TagType.EMOTION },
      { name: '疲惫', type: TagType.EMOTION },
    ],
    skipDuplicates: true, // 如果标签已存在则跳过
  });

  const activityTags = await prisma.tag.createManyAndReturn({
    data: [
      { name: '工作', type: TagType.ACTIVITY },
      { name: '学习', type: TagType.ACTIVITY },
      { name: '运动', type: TagType.ACTIVITY },
      { name: '娱乐', type: TagType.ACTIVITY },
      { name: '社交', type: TagType.ACTIVITY },
      { name: '休息', type: TagType.ACTIVITY },
    ],
    skipDuplicates: true,
  });

  console.log('Created system tags.');

  // --- 2. 创建模拟的匿名用户 Profile ---
  const profile1 = await prisma.profile.create({
    data: {
      anonymousName: '乐观的向日葵',
      avatarId: 'sunflower-01',
    },
  });

  const profile2 = await prisma.profile.create({
    data: {
      anonymousName: '沉思的猫头鹰',
      avatarId: 'owl-02',
    },
  });

  console.log('Created mock profiles.');

  // --- 3. 创建用户自定义标签 ---
  const customTagForProfile2 = await prisma.tag.create({
    data: {
      name: '头脑风暴', // 猫头鹰用户给自己创建了一个专属标签
      type: TagType.ACTIVITY,
      profileId: profile2.id, // 关键：关联到特定用户
    },
  });
  console.log('Created a custom tag.');

  // --- 4. 创建情绪记录 (关联用户和标签) ---

  // 向日葵用户的记录
  await prisma.moodEntry.create({
    data: {
      profileId: profile1.id,
      note: '今天天气真好，项目进展也很顺利！',
      tags: {
        connect: [
          { id: emotionTags.find((t) => t.name === '开心')?.id },
          { id: activityTags.find((t) => t.name === '工作')?.id },
        ],
      },
    },
  });

  await prisma.moodEntry.create({
    data: {
      profileId: profile1.id,
      note: '晚上和朋友们一起打了球，很放松。',
      tags: {
        connect: [
          { id: emotionTags.find((t) => t.name === '激动')?.id },
          { id: activityTags.find((t) => t.name === '运动')?.id },
          { id: activityTags.find((t) => t.name === '社交')?.id },
        ],
      },
    },
  });

  // 猫头鹰用户的记录
  await prisma.moodEntry.create({
    data: {
      profileId: profile2.id,
      note: '思考了一下 Aura 的未来功能，很有趣。',
      tags: {
        connect: [
          { id: emotionTags.find((t) => t.name === '平静')?.id },
          { id: customTagForProfile2.id }, // 使用了Ta自己的自定义标签
        ],
      },
    },
  });

  await prisma.moodEntry.create({
    data: {
      profileId: profile2.id,
      note: '有点累，需要早点休息。',
      tags: {
        connect: [
          { id: emotionTags.find((t) => t.name === '疲惫')?.id },
          { id: activityTags.find((t) => t.name === '休息')?.id },
        ],
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
