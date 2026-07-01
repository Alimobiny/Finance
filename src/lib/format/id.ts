import { v4 as uuidv4 } from 'uuid'

/** شناسهٔ یکتا برای آیتم‌های لیست (وضعیت‌ها، دارایی‌ها، معاملات و ...) */
export function newId(): string {
  return uuidv4()
}
