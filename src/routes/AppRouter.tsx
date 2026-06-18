import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { Loader } from '@progress/kendo-react-indicators';

import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

const LoginContainer = React.lazy(() => import('../pages/Login/LoginContainer'));
const DashboardContainer = React.lazy(() => import('../pages/Dashboard/DashboardContainer'));
const EmployeesContainer = React.lazy(() => import('../pages/Employees/EmployeesContainer'));
const NewEmployee = React.lazy(() => import('../pages/Employees/NewEmployee'));
const UsersContainer = React.lazy(() => import('../pages/Users/UsersContainer'));
const NewUser = React.lazy(() => import('../pages/Users/NewUser'));
const RolesContainer = React.lazy(() => import('../pages/Roles/RolesContainer'));
const NewRole = React.lazy(() => import('../pages/Roles/NewRole'));
const AbsenceTypesContainer = React.lazy(() => import('../pages/AbsenceTypes/AbsenceTypesContainer'));
const NewAbsenceType = React.lazy(() => import('../pages/AbsenceTypes/NewAbsenceType'));
const AbsencesContainer = React.lazy(() => import('../pages/Absences/AbsencesContainer'));
const NewAbsence = React.lazy(() => import('../pages/Absences/NewAbsence'));
const AbsenceReportContainer = React.lazy(() => import('../pages/Reports/AbsenceReportContainer'));

const SuspenseLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
    <Loader size="large" themeColor="primary" />
  </div>
);

const AppRouter = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <AuthLayout /> : <Navigate to="/dashboard" />}>
          <Route index element={<Suspense fallback={<SuspenseLoader />}><LoginContainer /></Suspense>} />
        </Route>
        
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Suspense fallback={<SuspenseLoader />}><DashboardContainer /></Suspense>} />
          
          <Route path="employees" element={<Suspense fallback={<SuspenseLoader />}><EmployeesContainer /></Suspense>} />
          <Route path="employees/new" element={<Suspense fallback={<SuspenseLoader />}><NewEmployee /></Suspense>} />
          <Route path="employees/:id/edit" element={<Suspense fallback={<SuspenseLoader />}><NewEmployee /></Suspense>} />
          
          <Route path="users" element={<Suspense fallback={<SuspenseLoader />}><UsersContainer /></Suspense>} />
          <Route path="users/new" element={<Suspense fallback={<SuspenseLoader />}><NewUser /></Suspense>} />
          <Route path="users/:id/edit" element={<Suspense fallback={<SuspenseLoader />}><NewUser /></Suspense>} />
          
          <Route path="roles" element={<Suspense fallback={<SuspenseLoader />}><RolesContainer /></Suspense>} />
          <Route path="roles/new" element={<Suspense fallback={<SuspenseLoader />}><NewRole /></Suspense>} />
          <Route path="roles/:id/edit" element={<Suspense fallback={<SuspenseLoader />}><NewRole /></Suspense>} />
          
          <Route path="absence-types" element={<Suspense fallback={<SuspenseLoader />}><AbsenceTypesContainer /></Suspense>} />
          <Route path="absence-types/new" element={<Suspense fallback={<SuspenseLoader />}><NewAbsenceType /></Suspense>} />
          <Route path="absence-types/:id/edit" element={<Suspense fallback={<SuspenseLoader />}><NewAbsenceType /></Suspense>} />
          
          <Route path="absences" element={<Suspense fallback={<SuspenseLoader />}><AbsencesContainer /></Suspense>} />
          <Route path="absences/new" element={<Suspense fallback={<SuspenseLoader />}><NewAbsence /></Suspense>} />
          <Route path="absences/:id/edit" element={<Suspense fallback={<SuspenseLoader />}><NewAbsence /></Suspense>} />
          
          <Route path="reports" element={<Suspense fallback={<SuspenseLoader />}><AbsenceReportContainer /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
