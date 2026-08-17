import { useEffect, useState } from 'react';
import { Percent, ClipboardList, Trophy, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { getStudents } from '../../services/studentService';
import { getStudentPerformance } from '../../services/markService';

export default function StudentPerformance() {
  const { user } = useAuth();
  const toast = useToast();

  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
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

        const res = await getStudentPerformance(studentRecord._id);
        setPerformance(res.data.data);
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

  if (noStudentRecord) {
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
      label: 'Highest Score',
      value: `${performance.highestScore}%`,
      icon: Trophy,
      bg: '#fef3c7',
      color: '#b45309',
    },
    {
      label: 'Tests Taken',
      value: performance.testsTaken,
      icon: ClipboardList,
      bg: '#dcfce7',
      color: '#16a34a',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Performance</div>
          <div className="page-subtitle">Subject-wise breakdown of your results</div>
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
        <CardHeader title="Subject-wise Performance" />
        <CardBody>
          {performance.subjectWisePerformance.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No performance data yet"
              description="Once marks are recorded, your subject-wise performance will appear here."
            />
          ) : (
            <div className="bar-chart">
              {performance.subjectWisePerformance.map((sp) => (
                <div className="bar-chart-row" key={sp.subjectId}>
                  <div className="bar-chart-label">{sp.subjectName}</div>
                  <div className="bar-chart-track">
                    <div
                      className="bar-chart-fill"
                      style={{ width: `${Math.min(sp.averagePercentage, 100)}%` }}
                    />
                  </div>
                  <div className="bar-chart-value">{sp.averagePercentage}%</div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
