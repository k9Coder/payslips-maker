import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { EmployeeCard } from './components/EmployeeCard';
import { useEmployees } from './hooks/useEmployees';

export function EmployeeCardsPage() {
  const navigate = useNavigate();
  const { data: employees, isLoading } = useEmployees();

  useEffect(() => {
    if (employees && employees.length === 1) {
      navigate(`/employees/${employees[0]._id}`, { replace: true });
    }
  }, [employees, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400">
        טוען...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-[#1B2A4A]" />
          <h1 className="text-2xl font-bold text-[#1B2A4A]">כרטיסי עובדים</h1>
        </div>
        <Button onClick={() => navigate('/employees/new')}>
          <Plus className="h-4 w-4 ms-2" />
          עובד חדש
        </Button>
      </div>

      {employees?.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-4">אין עובדים עדיין</p>
          <Button onClick={() => navigate('/employees/new')}>הוסף עובד ראשון</Button>
        </div>
      )}

      {employees && employees.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((emp) => (
            <EmployeeCard key={emp._id} employee={emp} />
          ))}
        </div>
      )}
    </div>
  );
}
