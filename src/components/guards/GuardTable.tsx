import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GuardFormDialog } from '@/components/guards/GuardFormDialog'
import { useUpdateGuard, type Guard } from '@/hooks/useGuards'

export function GuardTable({ guards }: { guards: Guard[] }) {
  const updateGuard = useUpdateGuard()

  if (guards.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No hay guardias para mostrar.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Turno</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {guards.map((guard) => (
          <TableRow key={guard.id}>
            <TableCell className="font-medium">{guard.full_name}</TableCell>
            <TableCell>{guard.phone || '-'}</TableCell>
            <TableCell>{guard.shift_label || '-'}</TableCell>
            <TableCell>
              <Badge variant={guard.is_active ? 'default' : 'secondary'}>
                {guard.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </TableCell>
            <TableCell className="flex justify-end gap-2">
              <GuardFormDialog guard={guard} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateGuard.mutate({ id: guard.id, is_active: !guard.is_active })
                }
              >
                {guard.is_active ? 'Desactivar' : 'Activar'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
