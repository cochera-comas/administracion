import { useState } from 'react'
import { useClients } from '@/hooks/useClients'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { ClientTable } from '@/components/clients/ClientTable'
import { Button } from '@/components/ui/button'

export function ClientsPage() {
  const [showInactive, setShowInactive] = useState(false)
  const { data: clients, isLoading, isError } = useClients(showInactive)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">Clientes de la cochera y su cuota mensual.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInactive((v) => !v)}>
            {showInactive ? 'Ocultar inactivos' : 'Ver inactivos'}
          </Button>
          <ClientFormDialog />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm text-destructive">Error al cargar los clientes.</p>}
      {clients && <ClientTable clients={clients} />}
    </div>
  )
}
