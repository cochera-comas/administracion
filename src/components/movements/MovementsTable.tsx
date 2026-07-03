import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Movement } from '@/hooks/useMovements'
import { useDeleteManualMovement } from '@/hooks/useManualMovements'
import { formatCurrency } from '@/lib/utils'

export function MovementsTable({ movements }: { movements: Movement[] }) {
  const deleteManualMovement = useDeleteManualMovement()

  if (movements.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No hay movimientos en este rango.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Método</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((m) => (
          <TableRow key={m.id}>
            <TableCell>{m.date}</TableCell>
            <TableCell>
              <Badge variant={m.type === 'ingreso' ? 'default' : 'destructive'}>
                {m.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
              </Badge>
            </TableCell>
            <TableCell>{m.category}</TableCell>
            <TableCell>{m.description}</TableCell>
            <TableCell>{m.method ?? '-'}</TableCell>
            <TableCell className={`text-right font-medium ${m.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
              {m.type === 'ingreso' ? '+' : '-'} {formatCurrency(m.amount)}
            </TableCell>
            <TableCell className="text-right">
              {m.manualMovementId && (
                <button
                  className="text-xs font-medium text-destructive hover:underline"
                  onClick={() => deleteManualMovement.mutate(m.manualMovementId!)}
                >
                  Eliminar
                </button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
