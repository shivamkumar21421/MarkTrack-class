import { useEffect, useState, useMemo } from 'react';
import { Save, PencilLine } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../services/api';
import { getTests } from '../../services/testService';
import { getStudents } from '../../services/studentService';
import { getMarks, createMark, updateMark } from '../../services/markService';

export default function MarksEntry() {
  const toast = useToast();

  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [loading, setLoading] = useState(true);
  const [marksLoading, setMarksLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // map of studentId -> { value: string, markId: string|null }
  const [markValues, setMarkValues] = useState({});

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [testsRes, studentsRes] = await Promise.all([getTests(), getStudents()]);
        setTests(testsRes.data.data);
        setStudents(studentsRes.data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTest = useMemo(
    () => tests.find((t) => t._id === selectedTestId) || null,
    [tests, selectedTestId]
  );

  useEffect(() => {
    if (!selectedTestId) {
      setMarkValues({});
      return;
    }

    const loadMarks = async () => {
      setMarksLoading(true);
      try {
        const res = await getMarks({ test: selectedTestId });
        const existing = res.data.data;
        const map = {};
        existing.forEach((m) => {
          map[m.student._id] = { value: String(m.marks), markId: m._id };
        });
        setMarkValues(map);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setMarksLoading(false);
      }
    };
    loadMarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTestId]);

  const handleMarkChange = (studentId, value) => {
    setMarkValues((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { markId: null }), value },
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedTest) return;
    setSaving(true);

    const entries = Object.entries(markValues).filter(([, v]) => v.value !== '' && v.value !== undefined);

    if (entries.length === 0) {
      toast.warning('Enter at least one mark before saving.');
      setSaving(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const [studentId, data] of entries) {
      const numericMarks = Number(data.value);

      if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > selectedTest.maxMarks) {
        errorCount += 1;
        continue;
      }

      try {
        if (data.markId) {
          await updateMark(data.markId, { marks: numericMarks });
        } else {
          const res = await createMark({ student: studentId, test: selectedTestId, marks: numericMarks });
          setMarkValues((prev) => ({
            ...prev,
            [studentId]: { value: data.value, markId: res.data.data._id },
          }));
        }
        successCount += 1;
      } catch (err) {
        errorCount += 1;
      }
    }

    setSaving(false);

    if (successCount > 0) {
      toast.success(`Saved marks for ${successCount} student(s).`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to save ${errorCount} entr${errorCount === 1 ? 'y' : 'ies'}. Check values and try again.`);
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Marks Entry</div>
          <div className="page-subtitle">Select a test and enter marks for each student</div>
        </div>
      </div>

      <Card>
        <CardBody>
          <div style={{ maxWidth: 360 }}>
            <Select
              label="Select Test"
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
            >
              <option value="">Choose a test</option>
              {tests.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.testName} — {t.subject?.name} ({t.month})
                </option>
              ))}
            </Select>
          </div>

          {!selectedTestId ? (
            <EmptyState
              icon={PencilLine}
              title="No test selected"
              description="Choose a test above to start entering marks."
            />
          ) : marksLoading ? (
            <div className="loading-wrapper">
              <div className="spinner" />
            </div>
          ) : students.length === 0 ? (
            <EmptyState title="No students found" description="Add students before entering marks." />
          ) : (
            <>
              <div
                style={{
                  fontSize: 13,
                  color: '#64748b',
                  marginBottom: 12,
                  marginTop: 8,
                }}
              >
                Maximum marks: <strong>{selectedTest?.maxMarks}</strong>
              </div>

              <div>
                {students.map((s) => {
                  const entry = markValues[s._id] || { value: '' };
                  const numeric = Number(entry.value);
                  const validMark =
                    entry.value !== '' && !Number.isNaN(numeric) && selectedTest
                      ? numeric
                      : null;
                  const percentage =
                    validMark !== null && selectedTest
                      ? ((validMark / selectedTest.maxMarks) * 100).toFixed(1)
                      : null;

                  return (
                    <div className="marks-entry-row" key={s._id}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          Roll {s.rollNumber} · {s.className}-{s.section}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                          type="number"
                          className="input marks-entry-input"
                          min="0"
                          max={selectedTest?.maxMarks}
                          placeholder="—"
                          value={entry.value}
                          onChange={(e) => handleMarkChange(s._id, e.target.value)}
                        />
                        <span className="percentage-pill">
                          {percentage !== null ? `${percentage}%` : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <Button icon={Save} onClick={handleSaveAll} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Marks'}
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
