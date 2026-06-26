import { useState, type FormEvent } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import type { Producto, ProductoRequest } from '../../types/producto'

interface ProductoFormProps {
  producto?: Producto | null
  onSave: (data: ProductoRequest) => Promise<void>
  onCancel: () => void
}

export default function ProductoForm({ producto, onSave, onCancel }: ProductoFormProps) {
  const [nombre, setNombre] = useState(() => producto?.nombre ?? '')
  const [precio, setPrecio] = useState(() => producto ? String(producto.precio) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) { setError('El nombre es requerido'); return }
    if (!precio || Number(precio) <= 0) { setError('El precio debe ser mayor a 0'); return }

    setSaving(true)
    try {
      await onSave({
        nombre: nombre.trim(),
        precio: Number(precio),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del producto"
        autoFocus
      />
      <Input
        label="Precio ($)"
        type="number"
        min={0.01}
        step={0.01}
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        placeholder="0.00"
      />

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {producto ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
