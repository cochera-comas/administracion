import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { useCreateClient, useUpdateClient, type ClientWithVehicles } from '@/hooks/useClients'
import { useReplaceClientVehicles } from '@/hooks/useVehicles'
import { Plus, X } from 'lucide-react'

const clientSchema = z.object({
  full_name: z.string().min(1, 'Requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  monthly_fee: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  vehicles: z
    .array(
      z.object({
        plate: z.string().min(1, 'Requerido'),
        description: z.string().optional(),
      })
    )
    .min(1, 'Agregá al menos un vehículo'),
})

type ClientFormInput = z.input<typeof clientSchema>
type ClientFormValues = z.output<typeof clientSchema>

function defaultFormValues(client?: ClientWithVehicles): ClientFormInput {
  return {
    full_name: client?.full_name ?? '',
    phone: client?.phone ?? '',
    email: client?.email ?? '',
    monthly_fee: client?.monthly_fee ?? 0,
    vehicles: client?.vehicles?.length
      ? client.vehicles.map((v) => ({ plate: v.plate, description: v.description ?? '' }))
      : [{ plate: '', description: '' }],
  }
}

export function ClientFormDialog({ client }: { client?: ClientWithVehicles }) {
  const [open, setOpen] = useState(false)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const replaceVehicles = useReplaceClientVehicles()
  const isEdit = !!client

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormInput, unknown, ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultFormValues(client),
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'vehicles' })

  useEffect(() => {
    if (open) reset(defaultFormValues(client))
  }, [open, client, reset])

  async function onSubmit(values: ClientFormValues) {
    const { vehicles, ...clientFields } = values
    const clientId = isEdit
      ? (await updateClient.mutateAsync({ id: client.id, ...clientFields })).id
      : (await createClient.mutateAsync(clientFields)).id
    await replaceVehicles.mutateAsync({ clientId, vehicles })
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Vehículos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => append({ plate: '', description: '' })}
              >
                <Plus className="size-3.5" />
                Agregar vehículo
              </Button>
            </div>
            {errors.vehicles?.root && <p className="text-xs text-destructive">{errors.vehicles.root.message}</p>}
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-2">
                <div>
                  <Input placeholder="Patente" {...register(`vehicles.${index}.plate`)} />
                  {errors.vehicles?.[index]?.plate && (
                    <p className="text-xs text-destructive">{errors.vehicles[index]?.plate?.message}</p>
                  )}
                </div>
                <Input placeholder="Ej. Toyota Corolla gris" {...register(`vehicles.${index}.description`)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
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
