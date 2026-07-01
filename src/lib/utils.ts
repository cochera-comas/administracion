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
