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
