import { useEffect, useState, useMemo } from 'react';
import { ListChecks } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Table, TableHead, TableBody } from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { getStudents } from '../../services/studentService';
import { getMarks } from '../../services/markService';

export default function StudentMarks() {
  const { user } = useAuth();
  const toast = useToast();

  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('');
  const [noStudentRecord, setNoStudentRecord] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const studentsRes = await getStudents({ search: user.email });
        const studentRecord = studentsRes.data.data.find(
          (s) => s.email.toLowerCase() === user.email.toLowerCase()
        );

        if (!studentRecord) {
          setNoStudentRecord(true);
          setLoading(false);
          return;
        }

        const marksRes = await getMarks({ student: studentRecord._id });
        setMarks(marksRes.data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthOptions = useMemo(
    () => [...new Set(marks.map((m) => m.test?.month).filter(Boolean))],
    [marks]
  );

  const filteredMarks = useMemo(() => {
    if (!monthFilter) return marks;
    return marks.filter((m) => m.test?.month === monthFilter);
  }, [marks, monthFilter]);

  const getBadgeVariant = (pct) => {
    if (pct >= 75) return 'success';
    if (pct >= 40) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
      </div>
    );
  }

  if (noStudentRecord) {
    return (
      <EmptyState
        title="No student record linked"
        description="Your account isn't linked to a student record yet. Contact your teacher."
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Marks</div>
          <div className="page-subtitle">All your recorded test results</div>
        </div>
      </div>

      <div className="toolbar">
        <select className="select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option value="">All Months</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <Card>
        {filteredMarks.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No marks found"
            description="No test results match the selected filter."
          />
        ) : (
          <Table>
            <TableHead columns={['Test', 'Subject', 'Month', 'Marks', 'Max Marks', 'Percentage']} />
            <TableBody>
              {filteredMarks.map((m) => {
                const pct = m.test ? (m.marks / m.test.maxMarks) * 100 : 0;
                return (
                  <tr key={m._id}>
                    <td>{m.test?.testName}</td>
                    <td>{m.test?.subject?.name || '—'}</td>
                    <td>{m.test?.month}</td>
                    <td>{m.marks}</td>
                    <td>{m.test?.maxMarks}</td>
                    <td>
                      <Badge variant={getBadgeVariant(pct)}>{pct.toFixed(1)}%</Badge>
                    </td>
                  </tr>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
