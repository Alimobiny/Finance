const MAX_DIMENSION = 800
const JPEG_QUALITY = 0.55

/**
 * فایل تصویر را می‌خواند، حداکثر تا ۸۰۰ پیکسل کوچک و با کیفیت پایین JPEG
 * فشرده می‌کند و دیتا-یو‌آر‌ال برمی‌گرداند. چون کل وضعیت اپ در یک بلاک JSON
 * روی Google Drive آپلود می‌شود، عکس‌های بزرگ حجم هر سینک را غیرضروری بالا می‌برند.
 */
export function resizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('تصویر نامعتبر است'))
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas در دسترس نیست'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
