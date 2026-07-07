import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Printer } from 'lucide-react'
import { useExecutiveSummary } from '@/hooks/useExecutiveSummary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export function ExecutiveSummaryPage() {
  const { data, isLoading, isError } = useExecutiveSummary()

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>
  if (isError) return <p className="text-sm text-destructive">Error al cargar el resumen.</p>
  if (!data) return null

  const totalConEstado = data.alDia + data.dentroDePlazo + data.enMora
  const pct = (n: number) => (totalConEstado > 0 ? (n / totalConEstado) * 100 : 0)

  return (
    <div className="mx-auto max-w-3xl space-y-6 print:max-w-none">
      <div className="flex items-start justify-between print:hidden">
        <div>
          <h1 className="text-xl font-semibold">Resumen ejecutivo</h1>
          <p className="text-sm text-muted-foreground">
            Balance histórico para compartir con la junta / vecinos.
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => window.print()}>
          <Printer className="size-4" />
          Imprimir / Guardar PDF
        </Button>
      </div>

      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-semibold">Administración de Cochera</h2>
        <p className="text-sm text-muted-foreground">Resumen ejecutivo — balance histórico acumulado</p>
        <p className="text-xs text-muted-foreground">
          Generado el {format(data.generatedAt, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-6 py-6 text-center sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Ingresos totales</p>
            <p className="text-2xl font-semibold text-green-600">{formatCurrency(data.totalIngresos)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Egresos totales</p>
            <p className="text-2xl font-semibold text-red-600">{formatCurrency(data.totalEgresos)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Balance neto</p>
            <p className="text-3xl font-bold">{formatCurrency(data.balance)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Detalle de ingresos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cuotas de clientes</span>
              <span className="font-medium">{formatCurrency(data.totalClientIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alquiler por horas</span>
              <span className="font-medium">{formatCurrency(data.totalHourlyIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Otros ingresos</span>
              <span className="font-medium">{formatCurrency(data.totalOtherIncome)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Detalle de egresos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagos a guardias</span>
              <span className="font-medium">{formatCurrency(data.totalGuardExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Otros egresos</span>
              <span className="font-medium">{formatCurrency(data.totalOtherExpenses)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Estado de pago del mes — {data.totalClientesActivos} cocheras con cliente activo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
            {data.alDia > 0 && (
              <div className="bg-green-600" style={{ width: `${pct(data.alDia)}%` }} />
            )}
            {data.dentroDePlazo > 0 && (
              <div className="bg-yellow-500" style={{ width: `${pct(data.dentroDePlazo)}%` }} />
            )}
            {data.enMora > 0 && <div className="bg-red-600" style={{ width: `${pct(data.enMora)}%` }} />}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-green-600" /> Al día: <strong>{data.alDia}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-yellow-500" /> Dentro del plazo:{' '}
              <strong>{data.dentroDePlazo}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-600" /> En mora: <strong>{data.enMora}</strong>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Ocupación: {data.ocupadas} cocheras ocupadas y {data.libres} libres, de {data.totalCocheras} totales.
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Documento generado automáticamente para uso interno de la junta. No incluye el detalle individual de cada
        propietario/inquilino.
      </p>
    </div>
  )
}
