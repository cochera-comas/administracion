import { useState } from 'react'
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
import { useCreateManualMovement } from '@/hooks/useManualMovements'
import { toDateInputValue, limaToday } from '@/lib/utils'
import { Plus } from 'lucide-react'

const movementSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Requerido'),
  description: z.string().optional(),
  amount: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  movement_date: z.string().min(1, 'Requerido'),
})

type MovementFormInput = z.input<typeof movementSchema>
type MovementFormValues = z.output<typeof movementSchema>

const incomeCategorySuggestions = ['Depósito saldo gestión anterior', 'Donación', 'Otro ingreso']
const expenseCategorySuggestions = ['Compra de materiales', 'Pago de servicios a terceros', 'Otro egreso']

export function ManualMovementFormDialog() {
  const [open, setOpen] = useState(false)
  const createMovement = useCreateManualMovement()
  const today = toDateInputValue(limaToday())

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MovementFormInput, unknown, MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: 'income',
      category: '',
      description: '',
      amount: 0,
      movement_date: today,
    },
  })

  const type = watch('type')
  const suggestions = type === 'income' ? incomeCategorySuggestions : expenseCategorySuggestions

  async function onSubmit(values: MovementFormValues) {
    await createMovement.mutateAsync(values)
    reset({ type: 'income', category: '', description: '', amount: 0, movement_date: today })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5" size="sm">
          <Plus className="size-4" />
          Registrar movimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar ingreso o egreso</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Categoría</Label>
            <Input id="category" list="category-suggestions" {...register('category')} />
            <datalist id="category-suggestions">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input id="description" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Monto</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="movement_date">Fecha</Label>
              <Input id="movement_date" type="date" {...register('movement_date')} />
            </div>
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
