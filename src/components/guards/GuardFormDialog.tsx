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
import { useCreateGuard, useUpdateGuard, type Guard } from '@/hooks/useGuards'
import { Plus } from 'lucide-react'

const guardSchema = z.object({
  full_name: z.string().min(1, 'Requerido'),
  phone: z.string().optional(),
  shift_label: z.string().optional(),
})

type GuardFormValues = z.infer<typeof guardSchema>

export function GuardFormDialog({ guard }: { guard?: Guard }) {
  const [open, setOpen] = useState(false)
  const createGuard = useCreateGuard()
  const updateGuard = useUpdateGuard()
  const isEdit = !!guard

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuardFormValues>({
    resolver: zodResolver(guardSchema),
    defaultValues: {
      full_name: guard?.full_name ?? '',
      phone: guard?.phone ?? '',
      shift_label: guard?.shift_label ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        full_name: guard?.full_name ?? '',
        phone: guard?.phone ?? '',
        shift_label: guard?.shift_label ?? '',
      })
    }
  }, [open, guard, reset])

  async function onSubmit(values: GuardFormValues) {
    if (isEdit) {
      await updateGuard.mutateAsync({ id: guard.id, ...values })
    } else {
      await createGuard.mutateAsync(values)
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
            Nuevo guardia
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar guardia' : 'Nuevo guardia'}</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shift_label">Turno</Label>
            <Input id="shift_label" placeholder="Ej. Mañana, Noche, Rotativo" {...register('shift_label')} />
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
