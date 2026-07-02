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
import {
  useCreateClientPayment,
  useUpdateClientPayment,
  useUploadVoucher,
  getVoucherSignedUrl,
  type ClientPayment,
} from '@/hooks/useClientPayments'
import type { ClientWithVehicles } from '@/hooks/useClients'
import { toDateInputValue, formatPlates, computeLateFee, limaToday } from '@/lib/utils'
import { Plus } from 'lucide-react'

const paymentSchema = z.object({
  client_id: z.string().min(1, 'Seleccioná un cliente'),
  period: z.string().min(1, 'Requerido'),
  amount: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  payment_date: z.string().optional(),
  method: z.enum(['cash', 'transfer', 'card', 'other']).optional(),
  status: z.enum(['paid', 'pending', 'late']),
})

type PaymentFormInput = z.input<typeof paymentSchema>
type PaymentFormValues = z.output<typeof paymentSchema>

function toPeriodMonthValue(dateOrPeriodStr: Date | string) {
  if (typeof dateOrPeriodStr === 'string') return dateOrPeriodStr.slice(0, 7)
  return toDateInputValue(dateOrPeriodStr).slice(0, 7)
}

export function ClientPaymentFormDialog({
  clients,
  period,
  defaultClientId,
  payment,
}: {
  clients: ClientWithVehicles[]
  period: Date
  defaultClientId?: string
  payment?: ClientPayment
}) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [voucherFile, setVoucherFile] = useState<File | null>(null)
  const [openingVoucher, setOpeningVoucher] = useState(false)
  const createPayment = useCreateClientPayment()
  const updatePayment = useUpdateClientPayment()
  const uploadVoucher = useUploadVoucher()
  const isEdit = !!payment

  function defaultFormValues(): PaymentFormInput {
    if (payment) {
      return {
        client_id: payment.client_id,
        period: toPeriodMonthValue(payment.period),
        amount: payment.amount,
        payment_date: payment.payment_date ?? toDateInputValue(limaToday()),
        method: payment.method ?? 'cash',
        status: payment.status,
      }
    }
    const initialClientId = defaultClientId ?? ''
    const initialClient = clients.find((c) => c.id === initialClientId)
    const periodMonth = toPeriodMonthValue(period)
    const fee = initialClient ? initialClient.monthly_fee + computeLateFee(`${periodMonth}-01`, limaToday()) : 0
    return {
      client_id: initialClientId,
      period: periodMonth,
      amount: fee,
      payment_date: toDateInputValue(limaToday()),
      method: 'cash',
      status: 'paid',
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: defaultFormValues(),
  })

  const clientId = watch('client_id')
  const periodMonth = watch('period')
  const lateFee = periodMonth ? computeLateFee(`${periodMonth}-01`, limaToday()) : 0

  useEffect(() => {
    if (open) {
      reset(defaultFormValues())
      setVoucherFile(null)
      setFormError(null)
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function suggestAmount(id: string, month: string) {
    if (dirtyFields.amount) return
    const client = clients.find((c) => c.id === id)
    if (client) setValue('amount', client.monthly_fee + computeLateFee(`${month}-01`, limaToday()))
  }

  function handleClientChange(id: string) {
    setValue('client_id', id)
    suggestAmount(id, periodMonth)
  }

  function handlePeriodChange(month: string) {
    setValue('period', month)
    suggestAmount(clientId, month)
  }

  async function openVoucher() {
    if (!payment?.voucher_path) return
    setOpeningVoucher(true)
    try {
      const url = await getVoucherSignedUrl(payment.voucher_path)
      window.open(url, '_blank')
    } finally {
      setOpeningVoucher(false)
    }
  }

  async function onSubmit(values: PaymentFormValues) {
    setFormError(null)
    const periodStr = `${values.period}-01`
    try {
      const savedPayment = isEdit
        ? await updatePayment.mutateAsync({
            id: payment.id,
            period: periodStr,
            amount: values.amount,
            payment_date: values.status === 'paid' ? values.payment_date || null : null,
            method: values.method,
            status: values.status,
          })
        : await createPayment.mutateAsync({
            client_id: values.client_id,
            period: periodStr,
            amount: values.amount,
            payment_date: values.status === 'paid' ? values.payment_date || null : null,
            method: values.method,
            status: values.status,
          })
      if (voucherFile) {
        await uploadVoucher.mutateAsync({
          paymentId: savedPayment.id,
          clientId: values.client_id,
          file: voucherFile,
        })
      }
      setOpen(false)
    } catch (err: unknown) {
      const pgError = err as { code?: string; message?: string }
      setFormError(
        pgError.code === '23505'
          ? 'Ya existe un pago registrado para ese cliente en ese periodo.'
          : pgError.message ?? 'Error al registrar el pago'
      )
    }
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
          <DialogTitle>{isEdit ? 'Editar pago de cliente' : 'Registrar pago de cliente'}</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={handleClientChange} disabled={isEdit}>
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
              <Label htmlFor="payment_period">Periodo</Label>
              <Input
                id="payment_period"
                type="month"
                {...register('period')}
                onChange={(e) => handlePeriodChange(e.target.value)}
              />
              {errors.period && <p className="text-xs text-destructive">{errors.period.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Monto</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
              {errors.amount ? (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              ) : (
                lateFee > 0 && (
                  <p className="text-xs text-muted-foreground">Incluye S/ {lateFee} de mora sugerida</p>
                )
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          <div className="space-y-1.5">
            <Label htmlFor="voucher">{isEdit ? 'Reemplazar voucher' : 'Voucher (opcional)'}</Label>
            {isEdit && payment?.voucher_path && (
              <button
                type="button"
                className="block text-xs font-medium text-primary hover:underline disabled:opacity-50"
                disabled={openingVoucher}
                onClick={openVoucher}
              >
                Ver voucher actual
              </button>
            )}
            <Input
              id="voucher"
              type="file"
              accept="image/*"
              onChange={(e) => setVoucherFile(e.target.files?.[0] ?? null)}
            />
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
