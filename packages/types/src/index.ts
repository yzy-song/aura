// 从 Prisma 生成的类型中导入最原始的模型定义
// 这是最关键的一步，保证了与数据库的绝对一致
import type {
  Tag as PrismaTag,
  MoodEntry as PrismaMoodEntry,
  Profile as PrismaProfile,
  TagType as PrismaTagType,
} from "@aura/database/prisma/client";

// 我们可以直接导出 Prisma 的类型，或者基于它创建我们自己的简化版
// 对于 MVP，直接导出是最快最高效的
export type Tag = PrismaTag;
export type MoodEntry = PrismaMoodEntry;
export type Profile = PrismaProfile;
export type TagType = PrismaTagType;

// 我们还可以定义 DTO 的类型，让前后端共享
export interface CreateMoodEntryDto {
  note?: string;
  tagIds: number[];
}

// 也可以定义 API 响应的类型
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

// 定义后端响应的标准结构
export interface BackendResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: Record<string, unknown>;
}

// 定义一个包含了 tags 关系的 MoodEntry 类型
export type MoodEntryWithTags = PrismaMoodEntry & {
  tags: PrismaTag[];
};

// 明确定义 API 返回的分页数据结构
export interface PaginatedMoodEntries
  extends PaginatedResult<MoodEntryWithTags> {}

export interface AuthResponse {
  accessToken: string;
  profile: Profile;
}
