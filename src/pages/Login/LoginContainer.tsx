import { toastSuccess, toastError } from '../../utils/toastUtils';
import { AuthService } from '../../services/api/AuthService';
import { Loader } from '@progress/kendo-react-indicators';
import { Button } from '@progress/kendo-react-buttons';
import { loginSuccess } from '../../slices/authSlice';
import { Input } from '@progress/kendo-react-inputs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

const LoginContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(t('login.errors.usernameRequired')),
    password: Yup.string().required(t('login.errors.passwordRequired')),
  });

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await AuthService.login(values);
      if (response.data.code === 200 && response.data.data?.token) {
        toastSuccess(t('login.errors.loginSuccess'));
        dispatch(loginSuccess(response.data.data.token));
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        toastError(response.data.message || t('login.errors.invalidCredentials'));
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        toastError(error.response.data.message);
      } else if (error.response && error.response.data && error.response.data.title) {
        toastError(error.response.data.title);
      } else {
        toastError(t('login.errors.connectionError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-form-title">
        <h2>{t('login.title')}</h2>
        <p>{t('login.subtitle')}</p>
      </div>

      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
        enableReinitialize
      >
        {({ errors, touched, handleChange, values }) => (
          <Form>
            <div className="auth-form-field">
              <Input
                id="login-username"
                name="username"
                label={t('login.username')}
                value={values.username}
                onChange={handleChange}
                valid={!errors.username || !touched.username}
                style={{ width: '100%' }}
                disabled={loading}
              />
              {errors.username && touched.username && (
                <div className="auth-error">⚠ {errors.username}</div>
              )}
            </div>

            <div className="auth-form-field" style={{ position: 'relative' }}>
              <Input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label={t('login.password')}
                value={values.password}
                onChange={handleChange}
                valid={!errors.password || !touched.password}
                style={{ width: '100%', paddingRight: '40px' }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: 'var(--text-muted)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
              {errors.password && touched.password && (
                <div className="auth-error">⚠ {errors.password}</div>
              )}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Button
                id="login-submit"
                type="submit"
                themeColor="primary"
                size="large"
                disabled={loading}
                style={{ width: '100%', height: '44px', fontSize: '0.9375rem', fontWeight: 600 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <Loader size="small" themeColor="base" />
                    {t('login.submitting')}
                  </span>
                ) : (
                  `→ ${t('login.submit')}`
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🔒 {t('login.security')}
        </span>
      </div>
    </>
  );
};

export default LoginContainer;