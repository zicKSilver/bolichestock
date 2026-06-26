import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(usuario, password)
      login(res.token, res.nombreUsuario, res.isAdmin)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Error de conexión con el servidor')
      } else {
        setError('Usuario o contraseña incorrectos')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute -inset-32 bg-[radial-gradient(ellipse_at_center,rgba(232,121,249,0.08)_0%,transparent_60%)]" />
      <div className="animate-fadeIn w-full max-w-sm">
        <div className="rounded-xl border border-borde/30 bg-tarjeta/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <h1 className="mb-1 text-center text-3xl font-bold tracking-wider text-primary drop-shadow-[0_0_10px_rgba(232,121,249,0.3)]">
            CACHENGUE CLUB
          </h1>
          <p className="mb-8 text-center text-sm text-gray-300">Iniciar sesión</p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoFocus
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="mb-4 text-center text-sm text-red-400">{error}</p>
            )}

            <Button type="submit" loading={loading} disabled={!usuario || !password} className="w-full">
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
