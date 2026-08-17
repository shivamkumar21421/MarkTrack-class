import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, ClipboardList, Percent, UserPlus, FilePlus, PencilLine } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Table, TableHead, TableBody } from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../services/api';
import { getStudents } from '../../services/studentService';
import { getSubjects } from '../../services/subjectService';
import { getTests } from '../../services/testService';
import { getMarks } from '../../services/markService';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTests: 0,
    totalSubjects: 0,
    averageMarks: 0,
  });
  const [recentTests, setRecentTests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, subjectsRes, testsRes, marksRes] = await Promise.all([
          getStudents(),
          getSubjects(),
          getTests(),
          getMarks(),
        ]);

        const students = studentsRes.data.data;
        const subjects = subjectsRes.data.data;
        const tests = testsRes.data.data;
        const marks = marksRes.data.data;

        let averageMarks = 0;
        if (marks.length > 0) {
          const totalPct = marks.reduce((sum, m) => {
            const maxMarks = m.test?.maxMarks || 1;
            return sum + (m.marks / maxMarks) * 100;
          }, 0);
          averageMarks = Number((totalPct / marks.length).toFixed(1));
        }

        setStats({
          totalStudents: students.length,
          totalTests: tests.length,
          totalSubjects: subjects.length,
          averageMarks,
        });

        setRecentTests(tests.slice(0, 5));
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      bg: '#dbeafe',
      color: '#2563eb',
    },
    {
      label: 'Total Tests',
      value: stats.totalTests,
      icon: ClipboardList,
      bg: '#dcfce7',
      color: '#16a34a',
    },
    {
      label: 'Total Subjects',
      value: stats.totalSubjects,
      icon: BookOpen,
      bg: '#fef3c7',
      color: '#b45309',
    },
    {
      label: 'Average Marks',
      value: `${stats.averageMarks}%`,
      icon: Percent,
      bg: '#fee2e2',
      color: '#dc2626',
    },
  ];

  const quickActions = [
    { label: 'Add Student', icon: UserPlus, to: '/teacher/students' },
    { label: 'Create Test', icon: FilePlus, to: '/teacher/tests' },
    { label: 'Enter Marks', icon: PencilLine, to: '/teacher/marks' },
  ];

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
          <div className="page-title">Teacher Dashboard</div>
          <div className="page-subtitle">Overview of students, tests and performance</div>
        </div>
      </div>

      <div className="stat-grid">
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

      <div className="dashboard-grid">
        <Card>
          <CardHeader title="Recent Tests" />
          <CardBody className={recentTests.length === 0 ? '' : 'no-padding'} style={{ padding: recentTests.length ? 0 : undefined }}>
            {recentTests.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No tests yet"
                description="Create your first test to start tracking marks."
              />
            ) : (
              <Table>
                <TableHead columns={['Test Name', 'Subject', 'Month', 'Max Marks', 'Date']} />
                <TableBody>
                  {recentTests.map((t) => (
                    <tr key={t._id}>
                      <td>{t.testName}</td>
                      <td>{t.subject?.name || '—'}</td>
                      <td>{t.month}</td>
                      <td>{t.maxMarks}</td>
                      <td>{new Date(t.testDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <CardBody>
            <div className="quick-actions">
              {quickActions.map((a) => (
                <button key={a.label} className="quick-action-btn" onClick={() => navigate(a.to)}>
                  <a.icon size={17} />
                  {a.label}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
