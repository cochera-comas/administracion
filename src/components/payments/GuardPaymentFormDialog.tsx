import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateGuardPayment, useUpdateGuardPayment, type GuardPayment } from '@/hooks/useGuardPayments'
import type { Guard } from '@/hooks/useGuards'
import { toDateInputValue, limaToday } from '@/lib/utils'
import { Plus } from 'lucide-react'

const paymentSchema = z
  .object({
    guard_id: z.string().min(1, 'Seleccioná un guardia'),
    period_label: z.string().min(1, 'Requerido'),
    period_start: z.string().min(1, 'Requerido'),
    period_end: z.string().min(1, 'Requerido'),
    amount: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
    payment_date: z.string().min(1, 'Requerido'),
    method: z.enum(['cash', 'transfer', 'card', 'other']).optional(),
  })
  .refine((v) => v.period_end >= v.period_start, {
    message: 'La fecha de fin debe ser posterior o igual al inicio',
    path: ['period_end'],
  })

type PaymentFormInput = z.input<typeof paymentSchema>
type PaymentFormValues = z.output<typeof paymentSchema>

export function GuardPaymentFormDialog({ guards, payment }: { guards: Guard[]; payment?: GuardPayment }) {
  const [open, setOpen] = useState(false)
  const createPayment = useCreateGuardPayment()
  const updatePayment = useUpdateGuardPayment()
  const today = toDateInputValue(limaToday())
  const isEdit = !!payment

  function defaultFormValues(): PaymentFormInput {
    if (payment) {
      return {
        guard_id: payment.guard_id,
        period_label: payment.period_label,
        period_start: payment.period_start,
        period_end: payment.period_end,
        amount: payment.amount,
        payment_date: payment.payment_date,
        method: payment.method ?? 'cash',
      }
    }
    return {
      guard_id: '',
      period_label: '',
      period_start: today,
      period_end: today,
      amount: 0,
      payment_date: today,
      method: 'cash',
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: defaultFormValues(),
  })

  useEffect(() => {
    if (open) reset(defaultFormValues())
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function onSubmit(values: PaymentFormValues) {
    if (isEdit) {
      await updatePayment.mutateAsync({ id: payment.id, ...values })
    } else {
      await createPayment.mutateAsync(values)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : (
          <Button className="gap-1.5" size="sm">
            <Plus className="size-4" />
            Registrar pago
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar pago a guardia' : 'Registrar pago a guardia'}</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label>Guardia</Label>
            <Controller
              control={control}
              name="guard_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccioná un guardia" />
                  </SelectTrigger>
                  <SelectContent>
                    {guards.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.full_name} {g.shift_label ? `— ${g.shift_label}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.guard_id && <p className="text-xs text-destructive">{errors.guard_id.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="period_label">Descripción del periodo</Label>
            <Input id="period_label" placeholder="Ej. Junio 2026 - Quincena 1" {...register('period_label')} />
            {errors.period_label && <p className="text-xs text-destructive">{errors.period_label.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="period_start">Desde</Label>
              <Input id="period_start" type="date" {...register('period_start')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="period_end">Hasta</Label>
              <Input id="period_end" type="date" {...register('period_end')} />
              {errors.period_end && <p className="text-xs text-destructive">{errors.period_end.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Monto</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment_date">Fecha de pago</Label>
              <Input id="payment_date" type="date" {...register('payment_date')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Método</Label>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
