import { useEffect, useState } from 'react';
import { clientsApi } from '../api/clientsApi';
import type { Client, CreateClientPayload, UpdateClientPayload } from '../../../shared/api/types';
import { Modal } from '../../../shared/ui/Modal';

function isValidRut(rut: string): boolean {
  return /^\d{1,2}\.?\d{3}\.?\d{3}[-]?[0-9kK]$/.test(rut);
}

function formatRut(rut: string): string {
  // Remove dots and dash, then format as XX.XXX.XXX-X
  const clean = rut.replace(/[.\-]/g, '');
  if (clean.length < 2) return clean;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formateado}-${dv}`;
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientsApi.list(0, 100);
      setClients(data.content);
    } catch {
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
  }, []);

  const handleCreate = async (payload: CreateClientPayload) => {
    await clientsApi.create(payload);
    setModalMode(null);
    await loadClients();
  };

  const handleUpdate = async (id: string, payload: UpdateClientPayload) => {
    await clientsApi.update(id, payload);
    setModalMode(null);
    setEditingClient(null);
    await loadClients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar este cliente?')) return;
    await clientsApi.delete(id);
    await loadClients();
  };

  const openCreate = () => {
    setEditingClient(null);
    setModalMode('create');
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingClient(null);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          Nuevo Cliente
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-muted)' }}>
            No hay clientes registrados. Cree su primer cliente para comenzar.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>RUT</th>
                  <th>Nombre</th>
                  <th>Giro</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>{formatRut(c.rut)}</td>
                    <td>{c.nombre}</td>
                    <td>{c.giro ?? '-'}</td>
                    <td>{c.email ?? '-'}</td>
                    <td>{c.telefono ?? '-'}</td>
                    <td>
                      {c.activo ? (
                        <span className="badge badge-success">Activo</span>
                      ) : (
                        <span className="badge badge-danger">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>
                          Editar
                        </button>
                        {c.activo && (
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Editar Cliente' : 'Nuevo Cliente'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit" form="client-form">
              Guardar
            </button>
          </>
        }
      >
        <ClientForm
          mode={modalMode ?? 'create'}
          initial={editingClient ?? undefined}
          onSubmit={async (data) => {
            if (modalMode === 'create') {
              await handleCreate(data as CreateClientPayload);
            } else if (editingClient) {
              await handleUpdate(editingClient.id, data as UpdateClientPayload);
            }
          }}
        />
      </Modal>
    </div>
  );
}

function ClientForm({
  mode,
  initial,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  initial?: Client;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [rut, setRut] = useState(initial?.rut ?? '');
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [giro, setGiro] = useState(initial?.giro ?? '');
  const [direccion, setDireccion] = useState(initial?.direccion ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [telefono, setTelefono] = useState(initial?.telefono ?? '');
  const [rutError, setRutError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRutError('');

    if (mode === 'create' && !isValidRut(rut)) {
      setRutError('RUT inválido. Formato esperado: XX.XXX.XXX-X');
      return;
    }

    setSubmitting(true);
    try {
      const payload =
        mode === 'edit'
          ? {
              ...(nombre ? { nombre } : {}),
              ...(giro ? { giro } : {}),
              ...(direccion ? { direccion } : {}),
              ...(email ? { email } : {}),
              ...(telefono ? { telefono } : {}),
            }
          : { rut, nombre, giro: giro || undefined, direccion: direccion || undefined, email: email || undefined, telefono: telefono || undefined };
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="client-form" onSubmit={handleSubmit}>
      {mode === 'create' && (
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="client-rut">RUT</label>
          <input
            id="client-rut"
            className="input"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="XX.XXX.XXX-X"
            required
          />
          {rutError && (
            <span style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{rutError}</span>
          )}
        </div>
      )}

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="client-nombre">Nombre</label>
        <input
          id="client-nombre"
          className="input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre o razón social"
          required={mode === 'create'}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="client-giro">Giro</label>
        <input
          id="client-giro"
          className="input"
          value={giro}
          onChange={(e) => setGiro(e.target.value)}
          placeholder="Giro comercial"
        />
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="client-direccion">Dirección</label>
        <input
          id="client-direccion"
          className="input"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Dirección"
        />
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="client-email">Email</label>
        <input
          id="client-email"
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.cl"
        />
      </div>

      <div className="form-group">
        <label htmlFor="client-telefono">Teléfono</label>
        <input
          id="client-telefono"
          className="input"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+56 9 XXXX XXXX"
        />
      </div>

      <button type="submit" hidden disabled={submitting} />
    </form>
  );
}
