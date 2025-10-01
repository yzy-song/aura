# Aura - Your Anonymous Mood Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/--typescript?style=social&logo=typescript&color=3178C6)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/--nestjs?style=social&logo=nestjs&color=E0234E)](https://nestjs.com/)
[![Vue.js](https://img.shields.io/badge/--vue.js?style=social&logo=vue.js&color=4FC08D)](https://vuejs.org/)
[![Vercel](https://img.shields.io/badge/--vercel?style=social&logo=vercel&color=000000)](https://vercel.com/)

**Aura** is a full-stack, mobile-first Progressive Web App (PWA) designed as a safe, anonymous space for users to record, reflect upon, and gain insights into their emotional patterns. It moves beyond a simple private journal by fostering a sense of community, allowing users to see a public feed of anonymized emotions and realize they are not alone in their feelings.

This project was built as a comprehensive portfolio piece to showcase modern full-stack development practices, sophisticated architectural patterns, and the integration of advanced features like AI-powered analytics.

**Live Demo:** [aura.yzysong.com](https://aura.yzysong.com) _(Please replace with your actual Vercel URL)_

## The Vision & My Journey

As a developer with a rich background in game development and a recent Master's in Data Analytics, I built Aura to bridge these two worlds. My goal was to create a product that was not only technically robust but also genuinely helpful and empathetic. This project represents my transition into modern full-stack web development, demonstrating my ability to architect and build a complete, production-ready application from the ground up.

The core philosophy of Aura is **privacy, simplicity, and resonance**. In a world of mandatory sign-ups, Aura offers an "anonymous-first" experience. In a world of data noise, it offers clean, AI-driven insights. In a world of isolation, it offers a sense of shared, anonymous connection.

## Key Features

- **Anonymous-First Experience**: No sign-up is required to use the core features. A persistent, anonymous profile is automatically created and managed on the client-side.
- **Seamless Account Linking**: Users can optionally link their anonymous data to a permanent account using Firebase for social logins (Google, Twitter), enabling cross-device data sync.
- **Rich Mood Recording**: Users can log their emotions and associated activities with a simple, intuitive interface, including custom, user-defined tags with emojis.
- **Historical Review**: An interactive calendar view (`HistoryView`) allows users to easily navigate and review their past entries.
- **Data-Driven Insights**: A powerful `InsightsView` dashboard visualizes emotional patterns and activity correlations through charts.
  - **Personal Insights**: See your own mood distribution and trends.
  - **Community Insights**: See an aggregated view of all anonymous users' emotions.
- **AI-Powered Summaries**: Integration with the **DeepSeek LLM** to generate unique, empathetic, and insightful weekly or monthly summaries of a user's emotional journey. A caching layer is implemented on the backend to manage API costs and improve performance.
- **Profile Customization**: Logged-in users can update their display name and upload a custom avatar, which is stored and served via **Cloudinary**.
- **Progressive Web App (PWA)**: Aura is fully installable on mobile home screens for a native-app-like experience, complete with offline capabilities and an "update available" notification.

## Technical Architecture

This project is built as a **pnpm Monorepo** to ensure code sharing and maintainability.

![Aura Architecture Diagram](https://i.imgur.com/your-diagram-url.png)
_(I recommend you generate the Mermaid diagram, export it as a PNG/SVG, upload it somewhere like Imgur, and paste the link here.)_

#### **Core Components:**

- **`apps/web`**: The **Vue 3** frontend application.
  - **Framework**: Vue 3 (Composition API, `<script setup>`) & Vite.
  - **State Management**: Pinia for centralized, type-safe state management (e.g., user profile).
  - **Styling**: Tailwind CSS v4 for a utility-first, modern design system.
  - **API Layer**: A robust, reusable API client built with Axios and a custom `useApi` composable for handling reactive loading and error states.
  - **Deployment**: Hosted on **Vercel**.

- **`apps/api`**: The **NestJS** backend API.
  - **Framework**: NestJS with a modular architecture (e.g., `AuthModule`, `ProfilesModule`).
  - **Authentication**: A flexible system supporting both anonymous (`X-Profile-Id`) and authenticated (JWT) users via custom Guards and Decorators.
  - **Database ORM**: Prisma for type-safe database access.
  - **Deployment**: Hosted on **Render**.

- **`packages/database`**: A dedicated, shared package for all database-related concerns.
  - Contains the `schema.prisma`, migrations, and the generated Prisma Client.
  - Acts as the single source of truth for the database, consumed by both the `api` and `types` packages.

- **`packages/types`**: A shared TypeScript package for end-to-end type safety.
  - Exports all shared types, interfaces, and DTOs, ensuring the frontend and backend speak the same language.

#### **Third-Party Services:**

- **Database**: PostgreSQL hosted on **Railway**.
- **Authentication**: **Firebase Authentication** (for Google & Twitter social logins).
- **Image Storage**: **Cloudinary** for avatar uploads and transformations.
- **AI Summaries**: **DeepSeek API** for LLM-powered text generation.

## Key Technical Challenges & Solutions

This project involved solving several complex, real-world engineering problems:

1.  **Monorepo Deployment on Vercel/Render**: The most significant challenge was orchestrating the build process in a CI/CD environment. The frontend build (`apps/web`) depends on types generated by the `database` package. The final solution involved creating a root-level `generate:types` script and modifying the `web` app's `build` command to `pnpm --dir ../.. run generate:types && ...`, ensuring types are always generated before the frontend is type-checked and built.

2.  **End-to-End Type Safety**: Establishing a seamless type-safe bridge between the Prisma-generated backend types and the Vue 3 frontend. This was solved by creating the `@aura/database` and `@aura/types` packages, allowing the frontend to import backend types directly and safely.

3.  **Flexible Authentication**: Designing a system that supports both anonymous and authenticated users on the same endpoints. This was achieved by creating a custom `JwtOptionalGuard` in NestJS and a smart `@CurrentProfile` decorator that first checks for a JWT-authenticated user and falls back to an anonymous ID header if one is not present.

4.  **Performant AI Integration**: The AI summary feature could be slow and costly. This was solved by implementing a caching layer in the backend. The first time a summary is generated for a specific period, it's saved to the database. Subsequent requests for that same period are served instantly from the cache, dramatically improving performance and reducing API costs.

## Getting Started Locally

1.  **Clone the repository.**
2.  **Install dependencies** from the root directory:
    ```sh
    pnpm install
    ```
3.  **Set up environment variables**: Create `.env` files in `apps/api` and `packages/database` based on the `.env.example` files (if provided).
4.  **Initialize the database**:

    ```sh
    # Generate Prisma Client
    pnpm --filter @aura/database run generate

    # Run database migrations
    pnpm --filter @aura/database exec prisma migrate dev
    ```

5.  **Run the development servers**:

    ```sh
    # Start the NestJS API
    pnpm --filter api start:dev

    # Start the Vue 3 Web App
    pnpm --filter web dev
    ```

## License

This project is licensed under the MIT License.

```bash
# 检查所有代码（不自动修复）
pnpm exec eslint "apps/**/*.{ts,tsx,js,vue}"

# 检查并自动修复可修复的问题
pnpm exec eslint "apps/**/*.{ts,tsx,js,vue}" --fix

# 只检查某个子项目（如 web）
pnpm exec eslint "apps/web/**/*.{ts,tsx,js,vue}"

# 检查并输出详细报告
pnpm exec eslint "apps/**/*.{ts,tsx,js,vue}" -f table

# 检查单个文件
pnpm exec eslint apps/web/src/views/RecordView.vue

# 检查并忽略警告（只显示错误）
pnpm exec eslint "apps/**/*.{ts,tsx,js,vue}" --quiet
```
