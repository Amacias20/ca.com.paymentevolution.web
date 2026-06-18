import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RoleService } from '../../services/api/RoleService';
import { toastSuccess, toastError } from '../../utils/toastUtils';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Input } from '@progress/kendo-react-inputs';

const NewRole = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    status: { text: t('common.active') || 'Active', value: 'ACTIVE' }
  });

  const STATUS_OPTIONS = [
    { text: t('common.active') || 'Active', value: 'ACTIVE' },
    { text: t('common.inactive') || 'Inactive', value: 'INACTIVE' },
    { text: t('common.pending') || 'Pending', value: 'PENDING' }
  ];

  useEffect(() => {
    if (isEdit) {
      const fetchRole = async () => {
        try {
          const res = await RoleService.getRoleById(Number(id));
          const data = res.data?.data || res.data;
          setFormData({
            name: data.name || '',
            status: STATUS_OPTIONS.find(o => o.value === data.status) || STATUS_OPTIONS[0]
          });
        } catch (err) {
          toastError('Error loading role details');
          navigate('/roles');
        }
      };
      fetchRole();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toastError(t('common.requiredFields', 'Please fill all required fields'));
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        status: formData.status.value,
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
      };
      if (isEdit) {
        await RoleService.updateRole(Number(id), payload);
        toastSuccess(t('common.saveSuccess', 'Role updated successfully'));
      } else {
        await RoleService.createRole(payload);
        toastSuccess(t('common.saveSuccess', 'Role created successfully'));
      }
      navigate('/roles');
    } catch (error) {
      toastError(t('common.saveError', 'Error creating role'));
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
              {isEdit ? t('roles.edit', 'Edit Role') : t('roles.new', 'New Role')}
            </div>
            <p className="page-subtitle">
              {isEdit ? t('roles.editSubtitle', 'Update the role details below.') : t('roles.newSubtitle', 'Enter the details of the new role below.')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button fillMode="outline" themeColor="base" onClick={() => navigate('/roles')}>
              ← {t('common.cancel', 'Cancel')}
            </Button>
            <Button themeColor="primary" fillMode="solid" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : `💾 ${t('common.save', 'Save Role')}`}
            </Button>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="section-card-header">
          <div className="section-card-title">Role Details</div>
        </div>
        <div className="section-card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('roles.columns.name', 'Name')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: String(e.value ?? '') })}
                  placeholder="e.g. Administrator"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('roles.columns.status', 'Status')}
                </label>
                <DropDownList
                  data={STATUS_OPTIONS}
                  textField="text"
                  dataItemKey="value"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.value })}
                />
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default NewRole;
