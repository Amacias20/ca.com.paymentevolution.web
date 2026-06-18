import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserService } from '../../services/api/UserService';
import { EmployeeService } from '../../services/api/EmployeeService';
import { RoleService } from '../../services/api/RoleService';
import { toastSuccess, toastError } from '../../utils/toastUtils';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Input } from '@progress/kendo-react-inputs';

const NewUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [employees, setEmployees] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    employee: null as any,
    role: null as any,
    status: { text: t('common.active') || 'Active', value: 'ACTIVE' }
  });

  const STATUS_OPTIONS = [
    { text: t('common.active') || 'Active', value: 'ACTIVE' },
    { text: t('common.inactive') || 'Inactive', value: 'INACTIVE' },
    { text: t('common.pending') || 'Pending', value: 'PENDING' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await EmployeeService.getEmployees(1, 1000);
        const allEmployees = empRes.data?.data?.items || empRes.data?.data?.data || [];
        
        const roleRes = await RoleService.getRoles(1, 1000);
        const rolesList = roleRes.data?.data?.items || roleRes.data?.data?.data || [];
        setRoles(rolesList);

        const usersRes = await UserService.getUsers(1, 1000);
        const allUsers = usersRes.data?.data?.items || usersRes.data?.data?.data || [];
        const assignedEmployeeIds = allUsers.map((u: any) => u.employeeId);

        let currentUserData: any = null;

        if (isEdit) {
          const res = await UserService.getUserById(Number(id));
          currentUserData = res.data?.data || res.data;
        }

        const availableEmployees = allEmployees
          .filter((e: any) => e.status === 'ACTIVE')
          .filter((e: any) => {
            const empId = e.idEmployee || e.id;
            return !assignedEmployeeIds.includes(empId) || (isEdit && currentUserData?.employeeId === empId);
          })
          .map((e: any) => ({ ...e, fullName: `${e.firstName} ${e.lastName}` }));

        setEmployees(availableEmployees);

        if (isEdit && currentUserData) {
          setFormData({
            username: currentUserData.username || '',
            password: currentUserData.password || '',
            employee: availableEmployees.find((e: any) => (e.idEmployee || e.id) === currentUserData.employeeId) || null,
            role: rolesList.find((r: any) => (r.idRole || r.id) === currentUserData.roleId) || null,
            status: STATUS_OPTIONS.find(o => o.value === currentUserData.status) || STATUS_OPTIONS[0]
          });
        }
      } catch (err) {
        toastError('Error loading data');
        navigate('/users');
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || (!isEdit && !formData.password) || !formData.employee || !formData.role) {
      toastError(t('common.requiredFields', 'Please fill all required fields'));
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        username: formData.username,
        password: formData.password || '', // Backend shouldn't change password if empty on edit
        employeeId: formData.employee.idEmployee || formData.employee.id,
        roleId: formData.role.idRole || formData.role.id,
        status: formData.status.value,
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
      };
      if (isEdit) {
        await UserService.updateUser(Number(id), payload);
        toastSuccess(t('common.saveSuccess', 'User updated successfully'));
      } else {
        await UserService.createUser(payload);
        toastSuccess(t('common.saveSuccess', 'User created successfully'));
      }
      navigate('/users');
    } catch (error) {
      toastError(t('common.saveError', 'Error creating user'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header-card">
        <div className="page-header-card-top">
          <div>
            <div className="page-title">
              <div className="page-title-icon">{isEdit ? '✏️' : '➕'}</div>
              {isEdit ? t('users.edit', 'Edit User') : t('users.new', 'New User')}
            </div>
            <p className="page-subtitle">
              {isEdit ? t('users.editSubtitle', 'Update the user details below.') : t('users.newSubtitle', 'Enter the details of the new user below.')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button fillMode="outline" themeColor="base" onClick={() => navigate('/users')}>
              ← {t('common.cancel', 'Cancel')}
            </Button>
            <Button themeColor="primary" fillMode="solid" onClick={handleSubmit} disabled={loading || pageLoading}>
              {loading ? 'Saving...' : `💾 ${t('common.save', 'Save User')}`}
            </Button>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="section-card-header">
          <div className="section-card-title">User Details</div>
        </div>
        <div className="section-card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('users.columns.username', 'Username')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: String(e.value ?? '') })}
                  placeholder="e.g. jdoe"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: String(e.value ?? '') })}
                  placeholder={isEdit ? "Leave blank to keep current password" : "Enter a secure password"}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Employee <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <DropDownList
                  data={employees}
                  textField="fullName"
                  dataItemKey="idEmployee"
                  value={formData.employee}
                  onChange={(e) => setFormData({ ...formData, employee: e.value })}
                  defaultItem={{ fullName: 'Select Employee...', idEmployee: null }}
                  fillMode="outline"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Role <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <DropDownList
                  data={roles}
                  textField="name"
                  dataItemKey="idRole"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.value })}
                  defaultItem={{ name: 'Select Role...', idRole: null }}
                  fillMode="outline"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('users.columns.status', 'Status')}
                </label>
                <DropDownList
                  data={STATUS_OPTIONS}
                  textField="text"
                  dataItemKey="value"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.value })}
                  fillMode="outline"
                />
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default NewUser;
