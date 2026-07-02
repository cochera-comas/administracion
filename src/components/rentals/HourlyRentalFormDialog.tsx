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
import { useCreateHourlyRental } from '@/hooks/useHourlyRentals'
import type { ParkingSpotWithClient } from '@/hooks/useParkingSpots'
import { toDateInputValue, limaToday } from '@/lib/utils'
import { Plus } from 'lucide-react'

const rentalSchema = z.object({
  spot_id: z.string().min(1, 'Seleccioná una cochera'),
  renter_name: z.string().min(1, 'Requerido'),
  vehicle_plate: z.string().optional(),
  rental_date: z.string().min(1, 'Requerido'),
  hours: z.coerce.number().min(0.5, 'Debe ser mayor a 0'),
  amount: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
})

type RentalFormInput = z.input<typeof rentalSchema>
type RentalFormValues = z.output<typeof rentalSchema>

export function HourlyRentalFormDialog({ spots }: { spots: ParkingSpotWithClient[] }) {
  const [open, setOpen] = useState(false)
  const createRental = useCreateHourlyRental()
  const today = toDateInputValue(limaToday())

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RentalFormInput, unknown, RentalFormValues>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      spot_id: '',
      renter_name: '',
      vehicle_plate: '',
      rental_date: today,
      hours: 1,
      amount: 0,
    },
  })

  async function onSubmit(values: RentalFormValues) {
    await createRental.mutateAsync(values)
    reset({ spot_id: '', renter_name: '', vehicle_plate: '', rental_date: today, hours: 1, amount: 0 })
    setOpen(false)
  }

  const freeSpots = spots.filter((s) => !s.client_id)
  const occupiedSpots = spots.filter((s) => s.client_id)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5" size="sm">
          <Plus className="size-4" />
          Registrar alquiler
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar alquiler por hora</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label>Cochera</Label>
            <Controller
              control={control}
              name="spot_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccioná una cochera" />
                  </SelectTrigger>
                  <SelectContent>
                    {freeSpots.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.gate} — {s.row_label} — {s.spot_label} (Libre)
                      </SelectItem>
                    ))}
                    {occupiedSpots.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.gate} — {s.row_label} — {s.spot_label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.spot_id && <p className="text-xs text-destructive">{errors.spot_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="renter_name">Nombre</Label>
              <Input id="renter_name" {...register('renter_name')} />
              {errors.renter_name && <p className="text-xs text-destructive">{errors.renter_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vehicle_plate">Patente</Label>
              <Input id="vehicle_plate" {...register('vehicle_plate')} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rental_date">Fecha</Label>
              <Input id="rental_date" type="date" {...register('rental_date')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hours">Horas</Label>
              <Input id="hours" type="number" step="0.5" min="0.5" {...register('hours')} />
              {errors.hours && <p className="text-xs text-destructive">{errors.hours.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Monto</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
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
