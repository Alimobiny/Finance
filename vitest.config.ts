import { defineConfig } from 'vitest/config'

// پیکربندی مستقلِ تست‌ها — جدا از vite.config.ts نگه داشته شده تا از build
// اپ کاملاً جدا باشد. توابعِ زیرِ تست همه خالص‌اند، پس محیط node کافی و سریع‌تر
// از jsdom است. فایل‌های تست کنار ماژول‌ها با پسوند *.test.ts قرار می‌گیرند.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
})
