import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { MoodEntryWithTags } from '@aura/types';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly apiEndpoint = 'https://api.deepseek.com/chat/completions';
  private readonly logger = new Logger(AiService.name);
  public DEFAULT_SUMMARY =
    "Keep recording your moments to unlock personalized insights. I'm here to listen whenever you're ready.";
  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not set in the environment variables.');
    }
  }

  async generateSummary(entries: MoodEntryWithTags[]): Promise<string> {
    this.logger.log(`Generating summary for ${entries.length} mood entries.`, AiService.name);

    if (entries.length < 3) {
      // 增加一个判断，数据太少时提供固定回复
      return this.DEFAULT_SUMMARY;
    }

    const { systemPrompt, userPrompt } = this.buildAdvancedPrompt(entries);

    try {
      const response = await axios.post(
        this.apiEndpoint,
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 200, // 稍微增加 token 限制
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const summary = response.data.choices[0].message.content;
      return summary.trim();
    } catch (error) {
      console.error('DeepSeek API call failed:', error.response?.data || error.message);
      return "I'm having a little trouble summarizing your thoughts right now, but I'm here for you. Keep recording your moments!";
    }
  }

  private buildAdvancedPrompt(entries: MoodEntryWithTags[]) {
    // 1. 更精细的角色和规则定义
    const systemPrompt = `You are Aura, an emotional wellness companion. Your persona is caring, observant, positive, and strictly non-judgmental.
      Your task is to analyze a user's mood entries and provide a short, 2-4 sentence summary.
      Your summary MUST follow this structure:
      1.  Start with a sentence of validation or empathy.
      2.  Point out ONE specific, interesting pattern or connection you noticed between their emotions and activities.
      3.  End with a gentle, forward-looking encouragement or a reflective question.
      RULES:
      - NEVER give medical advice.
      - NEVER be critical or negative.
      - ALWAYS speak in the second person ("you", "your").
      - Keep the tone warm and friendly, like a supportive friend.`;

    // 2. 格式化数据 + "Few-Shot" 示例
    const formattedEntries = entries
      .map((entry) => {
        const tags = entry.tags.map((tag) => `${tag.emoji || ''}${tag.name}`).join(', ');
        const note = entry.note ? ` Note: "${entry.note}"` : '';
        return `- On ${new Date(entry.createdAt).toDateString()}, mood/activity was [${tags}].${note}`;
      })
      .join('\n');

    const userPrompt = `
      Here are some examples of how to respond.

      ---
      EXAMPLE 1
      User Data:
      - On Sun Sep 07 2025, mood/activity was [😊Happy, 🏃Exercise]. Note: "Went for a morning run."
      - On Mon Sep 08 2025, mood/activity was [😩Tired, 💼Work].
      - On Tue Sep 09 2025, mood/activity was [😊Happy, 🍻Social].
      Your Summary:
      It seems like you had a mix of feelings this period, which is completely normal. I noticed that moments of happiness for you were often connected to activities like exercising and being with friends. It's wonderful that you're finding joy in staying active and connected!

      ---
      EXAMPLE 2
      User Data:
      - On Wed Sep 10 2025, mood/activity was [😟Anxious, 💼Work]. Note: "Big presentation tomorrow."
      - On Thu Sep 11 2025, mood/activity was [😌Calm, 🧘Meditation].
      - On Fri Sep 12 2025, mood/activity was [😩Tired].
      Your Summary:
      It looks like there were some challenging moments recently, and that's okay. It's really insightful how you seem to have used meditation to find a sense of calm after feeling anxious about work. What's one small thing you could do for yourself this weekend to recharge?
      ---

      Now, please analyze the following real user data and provide a summary in the same style.

      REAL USER DATA:
      ${formattedEntries}
    `;

    return { systemPrompt, userPrompt };
  }
}
