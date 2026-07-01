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
import { useCreateClientPayment } from '@/hooks/useClientPayments'
import type { ClientWithVehicles } from '@/hooks/useClients'
import { toDateInputValue, formatPlates } from '@/lib/utils'
import { Plus } from 'lucide-react'

const paymentSchema = z.object({
  client_id: z.string().min(1, 'Seleccioná un cliente'),
  amount: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  payment_date: z.string().optional(),
  method: z.enum(['cash', 'transfer', 'card', 'other']).optional(),
  status: z.enum(['paid', 'pending', 'late']),
})

type PaymentFormInput = z.input<typeof paymentSchema>
type PaymentFormValues = z.output<typeof paymentSchema>

export function ClientPaymentFormDialog({
  clients,
  period,
  defaultClientId,
}: {
  clients: ClientWithVehicles[]
  period: Date
  defaultClientId?: string
}) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const createPayment = useCreateClientPayment()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      client_id: defaultClientId ?? '',
      amount: 0,
      payment_date: toDateInputValue(new Date()),
      method: 'cash',
      status: 'paid',
    },
  })

  const clientId = watch('client_id')

  useEffect(() => {
    if (open) {
      const initialClientId = defaultClientId ?? ''
      reset({
        client_id: initialClientId,
        amount: clients.find((c) => c.id === initialClientId)?.monthly_fee ?? 0,
        payment_date: toDateInputValue(new Date()),
        method: 'cash',
        status: 'paid',
      })
      setFormError(null)
    }
  }, [open, defaultClientId, clients, reset])

  function handleClientChange(id: string) {
    setValue('client_id', id)
    const client = clients.find((c) => c.id === id)
    if (client) setValue('amount', client.monthly_fee)
  }

  async function onSubmit(values: PaymentFormValues) {
    setFormError(null)
    try {
      await createPayment.mutateAsync({
        client_id: values.client_id,
        period: toDateInputValue(new Date(period.getFullYear(), period.getMonth(), 1)),
        amount: values.amount,
        payment_date: values.status === 'paid' ? values.payment_date || null : null,
        method: values.method,
        status: values.status,
      })
      setOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar el pago'
      setFormError(
        message.includes('client_payments_client_period_unique')
          ? 'Ya existe un pago registrado para ese cliente en este mes.'
          : message
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5" size="sm">
          <Plus className="size-4" />
          Registrar pago
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pago de cliente</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={handleClientChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccioná un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name} — {formatPlates(c.vehicles)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client_id && <p className="text-xs text-destructive">{errors.client_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Monto</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Pagado</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="late">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="payment_date">Fecha de pago</Label>
              <Input id="payment_date" type="date" {...register('payment_date')} />
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
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
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
