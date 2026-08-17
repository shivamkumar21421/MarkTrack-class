import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, ClipboardList } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Table, TableHead, TableBody } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../services/api';
import { getTests, createTest, updateTest, deleteTest } from '../../services/testService';
import { getSubjects } from '../../services/subjectService';

const emptyForm = { testName: '', month: '', subject: '', maxMarks: '', testDate: '' };

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Tests() {
  const toast = useToast();

  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testsRes, subjectsRes] = await Promise.all([getTests(), getSubjects()]);
      setTests(testsRes.data.data);
      setSubjects(subjectsRes.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchesMonth = !monthFilter || t.month === monthFilter;
      const matchesSubject = !subjectFilter || t.subject?._id === subjectFilter;
      return matchesMonth && matchesSubject;
    });
  }, [tests, monthFilter, subjectFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (test) => {
    setEditingId(test._id);
    setForm({
      testName: test.testName,
      month: test.month,
      subject: test.subject?._id || '',
      maxMarks: String(test.maxMarks),
      testDate: test.testDate ? test.testDate.slice(0, 10) : '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.testName.trim()) errors.testName = 'Test name is required';
    if (!form.month) errors.month = 'Month is required';
    if (!form.subject) errors.subject = 'Subject is required';
    if (!form.maxMarks || Number(form.maxMarks) <= 0) errors.maxMarks = 'Enter a valid max marks';
    if (!form.testDate) errors.testDate = 'Test date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = { ...form, maxMarks: Number(form.maxMarks) };
      if (editingId) {
        await updateTest(editingId, payload);
        toast.success('Test updated successfully');
      } else {
        await createTest(payload);
        toast.success('Test created successfully');
      }
      setModalOpen(false);
      fetchData();
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
      await deleteTest(deleteTarget._id);
      toast.success('Test deleted successfully');
      setDeleteTarget(null);
      fetchData();
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
          <div className="page-title">Tests</div>
          <div className="page-subtitle">Manage monthly tests</div>
        </div>
        <Button icon={Plus} onClick={openCreateModal} disabled={subjects.length === 0}>
          Create Test
        </Button>
      </div>

      <div className="toolbar">
        <select className="select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option value="">All Months</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner" />
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Add a subject first"
            description="You need at least one subject before creating a test."
          />
        ) : filteredTests.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tests found"
            description="Create a test to start recording marks."
            action={
              <Button icon={Plus} onClick={openCreateModal}>
                Create Test
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHead columns={['Test Name', 'Subject', 'Month', 'Max Marks', 'Date', 'Actions']} />
            <TableBody>
              {filteredTests.map((t) => (
                <tr key={t._id}>
                  <td>{t.testName}</td>
                  <td>{t.subject?.name || '—'}</td>
                  <td>{t.month}</td>
                  <td>{t.maxMarks}</td>
                  <td>{new Date(t.testDate).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <Button variant="secondary" size="sm" onClick={() => openEditModal(t)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(t)}>
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
        title={editingId ? 'Edit Test' : 'Create Test'}
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
          label="Test Name"
          value={form.testName}
          onChange={(e) => setForm({ ...form, testName: e.target.value })}
          error={formErrors.testName}
        />
        <div className="form-row">
          <Select
            label="Month"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            error={formErrors.month}
          >
            <option value="">Select month</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select
            label="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            error={formErrors.subject}
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="form-row">
          <Input
            label="Maximum Marks"
            type="number"
            min="1"
            value={form.maxMarks}
            onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
            error={formErrors.maxMarks}
          />
          <Input
            label="Test Date"
            type="date"
            value={form.testDate}
            onChange={(e) => setForm({ ...form, testDate: e.target.value })}
            error={formErrors.testDate}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Test"
        message={`Are you sure you want to delete "${deleteTarget?.testName}"? Related marks will remain but reference a deleted test.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
