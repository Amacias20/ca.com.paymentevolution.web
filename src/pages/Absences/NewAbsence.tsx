import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AbsenceService } from '../../services/api/AbsenceService';
import { EmployeeService } from '../../services/api/EmployeeService';
import { AbsenceTypeService } from '../../services/api/AbsenceTypeService';
import { toastSuccess, toastError } from '../../utils/toastUtils';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { NumericTextBox } from '@progress/kendo-react-inputs';
import { Loader } from '@progress/kendo-react-indicators';

const NewAbsence = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    employee: null as any,
    absenceType: null as any,
    startDate: new Date(),
    endDate: new Date(),
    totalDays: 1,
    status: { text: t('common.approved') || 'Approved', value: 'ACTIVE' }
  });

  const STATUS_OPTIONS = [
    { text: t('common.approved') || 'Approved', value: 'ACTIVE' },
    { text: t('common.pending') || 'Pending', value: 'PENDING' },
    { text: t('common.rejected') || 'Rejected', value: 'REJECTED' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await EmployeeService.getEmployees(1, 1000);
        const empList = empRes.data?.data?.items || empRes.data?.data?.data || [];
        const employeesMapped = empList.map((e: any) => ({ ...e, fullName: `${e.firstName} ${e.lastName}` }));
        setEmployees(employeesMapped);
        
        const typeRes = await AbsenceTypeService.getAbsenceTypes(1, 1000);
        const typesList = typeRes.data?.data?.items || typeRes.data?.data?.data || [];
        setAbsenceTypes(typesList);

        if (isEdit) {
          const absRes = await AbsenceService.getAbsenceById(Number(id));
          const data = absRes.data?.data || absRes.data;
          setFormData({
            employee: employeesMapped.find((e: any) => (e.idEmployee || e.id) === data.employeeId) || null,
            absenceType: typesList.find((t: any) => (t.idAbsenceType || t.id) === data.absenceTypeId) || null,
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : new Date(),
            totalDays: data.totalDays || 1,
            status: STATUS_OPTIONS.find(o => o.value === data.status) || STATUS_OPTIONS[0]
          });
        }
      } catch (err) {
        toastError('Error loading data');
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee || !formData.absenceType || !formData.startDate || !formData.endDate) {
      toastError(t('common.requiredFields', 'Please fill all required fields'));
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        employeeId: formData.employee.idEmployee || formData.employee.id,
        absenceTypeId: formData.absenceType.idAbsenceType || formData.absenceType.id,
        totalDays: formData.totalDays,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        status: formData.status.value
      };
      if (isEdit) {
        await AbsenceService.updateAbsence(Number(id), payload);
        toastSuccess(t('common.saveSuccess', 'Absence updated successfully'));
      } else {
        await AbsenceService.createAbsence(payload);
        toastSuccess(t('common.saveSuccess', 'Absence created successfully'));
      }
      navigate('/absences');
    } catch (error) {
      toastError(t('common.saveError', 'Error creating absence'));
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
              {isEdit ? t('absences.edit', 'Edit Absence') : t('absences.new', 'New Absence')}
            </div>
            <p className="page-subtitle">
              {isEdit ? t('absences.editSubtitle', 'Update the absence details below.') : t('absences.newSubtitle', 'Enter the details of the new absence below.')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button fillMode="outline" themeColor="base" onClick={() => navigate('/absences')}>
              ← {t('common.cancel', 'Cancel')}
            </Button>
            <Button themeColor="primary" fillMode="solid" onClick={handleSubmit} disabled={loading || pageLoading}>
              {loading ? 'Saving...' : `💾 ${t('common.save', 'Save Absence')}`}
            </Button>
          </div>
        </div>
      </div>
      <div className="section-card" style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
        <div className="section-card-header">
          <div className="section-card-title">Absence Details</div>
        </div>
        <div className="section-card-body" style={{ position: 'relative' }}>
          {pageLoading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', opacity: 0.75, zIndex: 10, borderRadius: 12 }}>
              <Loader size="large" themeColor="primary" />
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('absences.columns.employee', 'Employee')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <DropDownList
                  data={employees}
                  textField="fullName"
                  dataItemKey="idEmployee"
                  value={formData.employee}
                  onChange={(e) => setFormData({ ...formData, employee: e.value })}
                  defaultItem={{ text: t('common.select', 'Select Employee...'), value: null }}
                  fillMode="outline"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('absences.columns.type', 'Absence Type')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <DropDownList
                  data={absenceTypes}
                  textField="name"
                  dataItemKey="idAbsenceType"
                  value={formData.absenceType}
                  onChange={(e) => setFormData({ ...formData, absenceType: e.value })}
                  defaultItem={{ text: t('common.select', 'Select...'), value: null }}
                  fillMode="outline"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('absences.columns.startDate', 'Start Date')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <DatePicker
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.value as Date })}
                  format="MMM d, yyyy"
                  fillMode="outline"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('absences.columns.endDate', 'End Date')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <DatePicker
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.value as Date })}
                  format="MMM d, yyyy"
                  fillMode="outline"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('absences.columns.totalDays', 'Total Days')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <NumericTextBox
                  value={formData.totalDays}
                  onChange={(e) => setFormData({ ...formData, totalDays: e.value ?? 1 })}
                  min={1}
                  format="n0"
                  fillMode="outline"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('absences.columns.status', 'Status')}
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

export default NewAbsence;
