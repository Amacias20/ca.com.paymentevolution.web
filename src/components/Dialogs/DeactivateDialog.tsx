import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { useTranslation } from 'react-i18next';

interface DeactivateDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const DeactivateDialog = ({ onClose, onConfirm, title, message }: DeactivateDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog title={title || t('common.confirmDeleteTitle', 'Confirm Action')} onClose={onClose}>
      <div style={{ padding: '25px', textAlign: 'center', minWidth: '300px' }}>
        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
          {message || t('common.confirmDelete', 'Are you sure you want to perform this action?')}
        </p>
      </div>
      <DialogActionsBar layout="end">
        <Button onClick={onClose} fillMode="outline" themeColor="base">
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button onClick={onConfirm} themeColor="error" fillMode="solid">
          {t('common.confirm', 'Confirm')}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
};

export default DeactivateDialog;
