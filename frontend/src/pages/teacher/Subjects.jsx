import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Table, TableHead, TableBody } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../services/api';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../services/subjectService';

const emptyForm = { name: '', code: '' };

export default function Subjects() {
  const toast = useToast();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await getSubjects();
      setSubjects(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingId(subject._id);
    setForm({ name: subject.name, code: subject.code });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Subject name is required';
    if (!form.code.trim()) errors.code = 'Subject code is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateSubject(editingId, form);
        toast.success('Subject updated successfully');
      } else {
        await createSubject(form);
        toast.success('Subject added successfully');
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSubject(deleteTarget._id);
      toast.success('Subject deleted successfully');
      setDeleteTarget(null);
      fetchSubjects();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Subjects</div>
          <div className="page-subtitle">Manage subject list</div>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>
          Add Subject
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner" />
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            description="Add a subject to start creating tests."
            action={
              <Button icon={Plus} onClick={openCreateModal}>
                Add Subject
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHead columns={['Subject Name', 'Code', 'Actions']} />
            <TableBody>
              {subjects.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.code}</td>
                  <td>
                    <div className="table-actions">
                      <Button variant="secondary" size="sm" onClick={() => openEditModal(s)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(s)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        title={editingId ? 'Edit Subject' : 'Add Subject'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <Input
          label="Subject Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={formErrors.name}
        />
        <Input
          label="Subject Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          error={formErrors.code}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Subject"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
