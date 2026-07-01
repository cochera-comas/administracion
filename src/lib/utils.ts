import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const numberFormatter = new Intl.NumberFormat('es', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// Formato genérico "$ 1.234,56" sin fijar una moneda/región específica.
export function formatCurrency(amount: number) {
  return `$ ${numberFormatter.format(amount)}`
}

export function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function formatPlates(vehicles: { plate: string }[] | null | undefined) {
  if (!vehicles || vehicles.length === 0) return 'Sin vehículo'
  return vehicles.map((v) => v.plate).join(', ')
}

export const PAYMENT_DUE_DAY = 5
export const LATE_FEE_PER_DAY = 1
export const OWNER_DEFAULT_FEE = 125
export const TENANT_DEFAULT_FEE = 150

// period: 'YYYY-MM-DD' (siempre día 1 del mes). Mora de LATE_FEE_PER_DAY por
// cada día corrido después del PAYMENT_DUE_DAY de ese mes.
export function computeLateFee(period: string, referenceDate: Date): number {
  const [year, month] = period.split('-').map(Number)
  const dueDate = new Date(year, month - 1, PAYMENT_DUE_DAY)
  const diffDays = Math.floor((referenceDate.getTime() - dueDate.getTime()) / 86_400_000)
  return diffDays > 0 ? diffDays * LATE_FEE_PER_DAY : 0
}

export type SpotPaymentColor = 'paid' | 'grace' | 'overdue'

// Estado visual de la cochera para el mes actual: verde si ya pagó, amarillo
// si todavía está dentro del plazo (hasta el PAYMENT_DUE_DAY inclusive), rojo
// si ya venció el plazo y sigue sin pagar.
export function getSpotPaymentColor(
  paymentStatus: 'paid' | 'pending' | 'late' | undefined,
  referenceDate: Date = new Date()
): SpotPaymentColor {
  if (paymentStatus === 'paid') return 'paid'
  return referenceDate.getDate() > PAYMENT_DUE_DAY ? 'overdue' : 'grace'
}
