import { useEffect, useState, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Users } from "lucide-react";
import { Card, CardBody } from "../../components/ui/Card";
import { Table, TableHead, TableBody } from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../services/api";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../services/studentService";

const emptyForm = {
  name: "",
  rollNumber: "",
  className: "",
  section: "",
  email: "",
  password: "",
};

export default function Students() {
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudents();
      setStudents(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classOptions = useMemo(
    () => [...new Set(students.map((s) => s.className))].sort(),
    [students],
  );
  const sectionOptions = useMemo(
    () => [...new Set(students.map((s) => s.section))].sort(),
    [students],
  );

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesClass = !classFilter || s.className === classFilter;
      const matchesSection = !sectionFilter || s.section === sectionFilter;
      return matchesSearch && matchesClass && matchesSection;
    });
  }, [students, search, classFilter, sectionFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingId(student._id);
    setForm({
      name: student.name,
      rollNumber: student.rollNumber,
      className: student.className,
      section: student.section,
      email: student.email,
      password: "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.rollNumber.trim()) errors.rollNumber = "Roll number is required";
    if (!form.className.trim()) errors.className = "Class is required";
    if (!form.section.trim()) errors.section = "Section is required";
    if (!form.email.trim()) errors.email = "Email is required";

    if (!editingId && !form.password.trim()) {
      errors.password = "Password is required";
    }

    if (!editingId && form.password && form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateStudent(editingId, form);
        toast.success("Student updated successfully");
      } else {
        await createStudent(form);
        toast.success("Student added successfully");
      }
      setModalOpen(false);
      fetchStudents();
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
      await deleteStudent(deleteTarget._id);
      toast.success("Student deleted successfully");
      setDeleteTarget(null);
      fetchStudents();
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
          <div className="page-title">Students</div>
          <div className="page-subtitle">Manage student records</div>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>
          Add Student
        </Button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            className="input"
            placeholder="Search by name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All Classes</option>
          {classOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}>
          <option value="">All Sections</option>
          {sectionOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description="Try adjusting your filters, or add a new student to get started."
            action={
              <Button icon={Plus} onClick={openCreateModal}>
                Add Student
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHead
              columns={[
                "Name",
                "Roll No.",
                "Class",
                "Section",
                "Email",
                "Actions",
              ]}
            />
            <TableBody>
              {filteredStudents.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.rollNumber}</td>
                  <td>{s.className}</td>
                  <td>{s.section}</td>
                  <td>{s.email}</td>
                  <td>
                    <div className="table-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditModal(s)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(s)}>
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
        title={editingId ? "Edit Student" : "Add Student"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </>
        }>
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={formErrors.name}
        />
        <Input
          label="Roll Number"
          value={form.rollNumber}
          onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
          error={formErrors.rollNumber}
        />
        <div className="form-row">
          <Input
            label="Class"
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
            error={formErrors.className}
          />
          <Input
            label="Section"
            value={form.section}
            onChange={(e) => setForm({ ...form, section: e.target.value })}
            error={formErrors.section}
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={formErrors.email}
        />
        {!editingId && (
          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={formErrors.password}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
