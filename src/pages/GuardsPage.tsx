import { useState } from 'react'
import { useGuards } from '@/hooks/useGuards'
import { GuardFormDialog } from '@/components/guards/GuardFormDialog'
import { GuardTable } from '@/components/guards/GuardTable'
import { Button } from '@/components/ui/button'

export function GuardsPage() {
  const [showInactive, setShowInactive] = useState(false)
  const { data: guards, isLoading, isError } = useGuards(showInactive)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Guardias</h1>
          <p className="text-sm text-muted-foreground">Personal de guardia en horarios rotativos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInactive((v) => !v)}>
            {showInactive ? 'Ocultar inactivos' : 'Ver inactivos'}
          </Button>
          <GuardFormDialog />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm text-destructive">Error al cargar los guardias.</p>}
      {guards && <GuardTable guards={guards} />}
    </div>
  )
}
