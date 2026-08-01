import { useEffect, useState } from 'react';
import { userApi } from '../api/userApi';
import type { UserResponse, CreateUserPayload, UpdateUserPayload } from '../../../shared/api/types';
import { Modal } from '../../../shared/ui/Modal';

export function UserListPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [activo, setActivo] = useState(true);

  const loadUsers = async (onlyActivos = activo) => {
    setLoading(true);
    try {
      const data = await userApi.list(0, 20, onlyActivos);
      setUsers(data.content);
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (payload: CreateUserPayload) => {
    await userApi.create(payload);
    setModalMode(null);
    await loadUsers();
  };

  const handleUpdate = async (id: string, payload: UpdateUserPayload) => {
    await userApi.update(id, payload);
    setModalMode(null);
    setEditingUser(null);
    await loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await userApi.delete(id);
    await loadUsers();
  };

  const handleActivoToggle = (value: boolean) => {
    setActivo(value);
    void loadUsers(value);
  };

  const openCreate = () => {
    setEditingUser(null);
    setModalMode('create');
  };

  const openEdit = (user: UserResponse) => {
    setEditingUser(user);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingUser(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Usuarios del Tenant</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          Nuevo Usuario
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => handleActivoToggle(e.target.checked)}
          />
          Mostrar solo activos
        </label>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.rol === 'ADMIN' ? 'badge-info' : u.rol === 'CONTADOR' ? 'badge-warning' : 'badge-secondary'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    {u.activo ? (
                      <span className="badge badge-success">Activo</span>
                    ) : (
                      <span className="badge badge-danger">Inactivo</span>
                    )}
                  </td>
                  <td>{formatDate(u.creadoEn)}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>
                        Editar
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(u.id)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit" form="user-form">
              Guardar
            </button>
          </>
        }
      >
        <UserForm
          mode={modalMode ?? 'create'}
          initial={editingUser ?? undefined}
          onSubmit={async (data) => {
            if (modalMode === 'create') {
              await handleCreate(data as CreateUserPayload);
            } else if (editingUser) {
              await handleUpdate(editingUser.id, data as UpdateUserPayload);
            }
          }}
        />
      </Modal>
    </div>
  );
}

function UserForm({
  mode,
  initial,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  initial?: UserResponse;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'ADMIN' | 'VENDEDOR'>((initial?.rol as 'ADMIN' | 'VENDEDOR') ?? 'VENDEDOR');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload =
        mode === 'edit'
          ? {
              email: email || undefined,
              nombre: nombre || undefined,
              rol,
              ...(password ? { password } : {}),
            }
          : { email, password, nombre, rol };
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="user-form" onSubmit={handleSubmit}>
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="user-nombre">Nombre</label>
        <input
          id="user-nombre"
          className="input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre completo"
          required={mode === 'create'}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="user-email">Email</label>
        <input
          id="user-email"
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.cl"
          required={mode === 'create'}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="user-password">
          {mode === 'create' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
        </label>
        <input
          id="user-password"
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'create' ? 'Contraseña' : 'Dejar en blanco para mantener'}
          required={mode === 'create'}
        />
      </div>

      <div className="form-group">
        <label htmlFor="user-rol">Rol</label>
        <select
          id="user-rol"
          className="select"
          value={rol}
          onChange={(e) => setRol(e.target.value as 'ADMIN' | 'VENDEDOR')}
        >
          <option value="VENDEDOR">Vendedor</option>
          <option value="BODEGUERO">Bodeguero</option>
          <option value="CONTADOR">Contador</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      {/* Hidden submit to allow Enter key */}
      <button type="submit" hidden disabled={submitting} />
    </form>
  );
}
