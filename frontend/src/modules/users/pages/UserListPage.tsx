import { useEffect, useState } from 'react';
import { userApi } from '../api/userApi';
import type { UserResponse, CreateUserPayload, UpdateUserPayload } from '../../../shared/api/types';

export function UserListPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.list();
      setUsers(data.content);
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (payload: CreateUserPayload) => {
    await userApi.create(payload);
    setShowForm(false);
    await loadUsers();
  };

  const handleUpdate = async (id: string, payload: UpdateUserPayload) => {
    await userApi.update(id, payload);
    setEditingUser(null);
    await loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await userApi.delete(id);
    await loadUsers();
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;

  return (
    <div>
      <div className="row">
        <h2>Usuarios del Tenant</h2>
        <button onClick={() => setShowForm(true)}>Nuevo Usuario</button>
      </div>

      {showForm && (
        <UserForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingUser && (
        <UserForm
          initial={editingUser}
          onSubmit={(data) => handleUpdate(editingUser.id, data)}
          onCancel={() => setEditingUser(null)}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td><span className={u.rol === 'ADMIN' ? 'badge' : ''}>{u.rol}</span></td>
              <td>{u.activo ? 'Sí' : 'No'}</td>
              <td>
                <button onClick={() => setEditingUser(u)}>Editar</button>
                <button className="secondary" onClick={() => handleDelete(u.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: UserResponse;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState(initial?.email ?? '');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [rol, setRol] = useState<'ADMIN' | 'VENDEDOR'>(initial?.rol ?? 'VENDEDOR');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = initial
        ? { email: email || undefined, nombre: nombre || undefined, rol }
        : { email, password, nombre, rol };
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: 400, margin: '1rem 0' }}>
      <h3>{initial ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" required={!initial} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required={!initial} />
      {!initial && (
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" type="password" required />
      )}
      <select value={rol} onChange={(e) => setRol(e.target.value as 'ADMIN' | 'VENDEDOR')}>
        <option value="VENDEDOR">Vendedor</option>
        <option value="ADMIN">Administrador</option>
      </select>
      <div className="row">
        <button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
