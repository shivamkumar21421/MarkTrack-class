import { useEffect, useState } from 'react';
import { Percent, ClipboardList, Trophy, ListChecks } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Table, TableHead, TableBody } from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { getStudents } from '../../services/studentService';
import { getMarks, getStudentPerformance } from '../../services/markService';

export default function StudentDashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState(null);
  const [recentMarks, setRecentMarks] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // Find the Student record linked to this logged-in user
        const studentsRes = await getStudents({ search: user.email });
        const studentRecord = studentsRes.data.data.find(
          (s) => s.email.toLowerCase() === user.email.toLowerCase()
        );

        if (!studentRecord) {
          setLoading(false);
          return;
        }

        const [perfRes, marksRes] = await Promise.all([
          getStudentPerformance(studentRecord._id),
          getMarks({ student: studentRecord._id }),
        ]);

        setPerformance(perfRes.data.data);
        setRecentMarks(marksRes.data.data.slice(0, 5));
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
      </div>
    );
  }

  if (!performance) {
    return (
      <EmptyState
        title="No student record linked"
        description="Your account isn't linked to a student record yet. Contact your teacher."
      />
    );
  }

  const statCards = [
    {
      label: 'Average Marks',
      value: `${performance.averagePercentage}%`,
      icon: Percent,
      bg: '#dbeafe',
      color: '#2563eb',
    },
    {
      label: 'Tests Taken',
      value: performance.testsTaken,
      icon: ClipboardList,
      bg: '#dcfce7',
      color: '#16a34a',
    },
    {
      label: 'Highest Score',
      value: `${performance.highestScore}%`,
      icon: Trophy,
      bg: '#fef3c7',
      color: '#b45309',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Dashboard</div>
          <div className="page-subtitle">Welcome back, {user?.name}</div>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {statCards.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ backgroundColor: s.bg, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="Recent Results" />
        <CardBody style={{ padding: recentMarks.length ? 0 : undefined }}>
          {recentMarks.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No results yet"
              description="Your test results will show up here once available."
            />
          ) : (
            <Table>
              <TableHead columns={['Test', 'Subject', 'Month', 'Marks', 'Percentage']} />
              <TableBody>
                {recentMarks.map((m) => (
                  <tr key={m._id}>
                    <td>{m.test?.testName}</td>
                    <td>{m.test?.subject?.name || '—'}</td>
                    <td>{m.test?.month}</td>
                    <td>
                      {m.marks} / {m.test?.maxMarks}
                    </td>
                    <td>{((m.marks / m.test?.maxMarks) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
