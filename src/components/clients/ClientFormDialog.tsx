import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { useCreateClient, useUpdateClient, type Client } from '@/hooks/useClients'
import { Plus } from 'lucide-react'

const clientSchema = z.object({
  full_name: z.string().min(1, 'Requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  vehicle_plate: z.string().min(1, 'Requerido'),
  vehicle_description: z.string().optional(),
  spot_number: z.string().min(1, 'Requerido'),
  monthly_fee: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
})

type ClientFormInput = z.input<typeof clientSchema>
type ClientFormValues = z.output<typeof clientSchema>

export function ClientFormDialog({ client }: { client?: Client }) {
  const [open, setOpen] = useState(false)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const isEdit = !!client

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormInput, unknown, ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: client?.full_name ?? '',
      phone: client?.phone ?? '',
      email: client?.email ?? '',
      vehicle_plate: client?.vehicle_plate ?? '',
      vehicle_description: client?.vehicle_description ?? '',
      spot_number: client?.spot_number ?? '',
      monthly_fee: client?.monthly_fee ?? 0,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        full_name: client?.full_name ?? '',
        phone: client?.phone ?? '',
        email: client?.email ?? '',
        vehicle_plate: client?.vehicle_plate ?? '',
        vehicle_description: client?.vehicle_description ?? '',
        spot_number: client?.spot_number ?? '',
        monthly_fee: client?.monthly_fee ?? 0,
      })
    }
  }, [open, client, reset])

  async function onSubmit(values: ClientFormValues) {
    if (isEdit) {
      await updateClient.mutateAsync({ id: client.id, ...values })
    } else {
      await createClient.mutateAsync(values)
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
          <Button className="gap-1.5">
            <Plus className="size-4" />
            Nuevo cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" {...register('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="vehicle_plate">Patente</Label>
              <Input id="vehicle_plate" {...register('vehicle_plate')} />
              {errors.vehicle_plate && <p className="text-xs text-destructive">{errors.vehicle_plate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spot_number">N° de cochera</Label>
              <Input id="spot_number" {...register('spot_number')} />
              {errors.spot_number && <p className="text-xs text-destructive">{errors.spot_number.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vehicle_description">Descripción del vehículo</Label>
            <Input id="vehicle_description" placeholder="Ej. Toyota Corolla gris" {...register('vehicle_description')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="monthly_fee">Cuota mensual</Label>
            <Input id="monthly_fee" type="number" step="0.01" min="0" {...register('monthly_fee')} />
            {errors.monthly_fee && <p className="text-xs text-destructive">{errors.monthly_fee.message}</p>}
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
