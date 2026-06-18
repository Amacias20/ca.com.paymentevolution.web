import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EmployeeService } from '../../services/api/EmployeeService';
import { toastSuccess, toastError } from '../../utils/toastUtils';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { Input } from '@progress/kendo-react-inputs';

const NewEmployee = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    hireDate: new Date(),
    status: { text: t('common.active') || 'Active', value: 'ACTIVE' }
  });

  const STATUS_OPTIONS = [
    { text: t('common.active') || 'Active', value: 'ACTIVE' },
    { text: t('common.inactive') || 'Inactive', value: 'INACTIVE' },
    { text: t('common.pending') || 'Pending', value: 'PENDING' }
  ];

  useEffect(() => {
    if (isEdit) {
      const fetchEmployee = async () => {
        try {
          const res = await EmployeeService.getEmployeeById(Number(id));
          const data = res.data?.data || res.data;
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
            status: STATUS_OPTIONS.find(o => o.value === data.status) || STATUS_OPTIONS[0]
          });
        } catch (err) {
          toastError('Error loading employee details');
          navigate('/employees');
        }
      };
      fetchEmployee();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.hireDate) {
      toastError(t('common.requiredFields', 'Please fill all required fields'));
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        hireDate: formData.hireDate.toISOString(),
        status: formData.status.value,
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
      };
      if (isEdit) {
        await EmployeeService.updateEmployee(Number(id), payload);
        toastSuccess(t('common.saveSuccess', 'Employee updated successfully'));
      } else {
        await EmployeeService.createEmployee(payload);
        toastSuccess(t('common.saveSuccess', 'Employee created successfully'));
      }
      navigate('/employees');
    } catch (error) {
      toastError(t('common.saveError', 'Error creating employee'));
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
              {isEdit ? t('employees.edit', 'Edit Employee') : t('employees.new', 'New Employee')}
            </div>
            <p className="page-subtitle">
              {isEdit ? t('employees.editSubtitle', 'Update the employee details below.') : t('employees.newSubtitle', 'Enter the details of the new employee below.')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button fillMode="outline" themeColor="base" onClick={() => navigate('/employees')}>
              ← {t('common.cancel', 'Cancel')}
            </Button>
            <Button themeColor="primary" fillMode="solid" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : `💾 ${t('common.save', 'Save Employee')}`}
            </Button>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="section-card-header">
          <div className="section-card-title">Employee Details</div>
        </div>
        <div className="section-card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('employees.columns.firstName', 'First Name')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: String(e.value ?? '') })}
                  placeholder={t('employees.placeholders.firstName', 'e.g. John')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('employees.columns.lastName', 'Last Name')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: String(e.value ?? '') })}
                  placeholder={t('employees.placeholders.lastName', 'e.g. Doe')}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('employees.columns.hireDate', 'Hire Date')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <DatePicker
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.value as Date })}
                  format="MMM d, yyyy"
                  fillMode="outline"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('employees.columns.status', 'Status')}
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

export default NewEmployee;
