import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { loginSuccess } from '../../store/authSlice';

const AshokaChakra = () => (
  <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-maroon)] opacity-60">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2v20"></path>
    <path d="M2 12h20"></path>
    <path d="m4.93 4.93 14.14 14.14"></path>
    <path d="m19.07 4.93-14.14 14.14"></path>
    <path d="M12 12 5.5 8.5"></path>
    <path d="M12 12 18.5 8.5"></path>
    <path d="M12 12 5.5 15.5"></path>
    <path d="M12 12 18.5 15.5"></path>
  </svg>
);

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await api.post('/auth/login', values);
        if (response.data.success) {
          dispatch(loginSuccess({
            token: response.data.token,
            user: response.data.user
          }));
          toast.success('Logged in successfully!');
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to login');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-bg-base)]">
      {/* Left Panel */}
      <div 
        className="w-full md:w-1/2 flex flex-col items-center justify-center p-12 bg-[var(--color-bg-surface)]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, var(--color-rule) 31px, var(--color-rule) 32px)'
        }}
      >
        <div className="max-w-[400px] text-center flex flex-col items-center gap-8 bg-[var(--color-bg-surface)] p-6">
          <AshokaChakra />
          <p className="font-serif italic text-[16px] leading-[1.6] text-[var(--color-parchment-dim)]">
            "We, the People of India, having solemnly resolved to constitute India into a Sovereign Socialist Secular Democratic Republic..."
          </p>
          <div className="font-sans uppercase text-[12px] tracking-[0.06em] text-[var(--color-ink-secondary)]">
            NYAYAKOSHA — Indian Legal Reference System
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-[64px_56px] bg-[var(--color-bg-base)]">
        <div className="w-full max-w-[400px]">
          <div className="border-t-2 border-[var(--color-maroon)] pt-4 mb-8">
            <h2 className="font-sans font-medium uppercase text-[9px] tracking-[0.06em] text-[var(--color-ink-secondary)]">
              SIGN IN
            </h2>
          </div>
          
          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            <div>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.email && formik.errors.email ? 'border-[#E57373]' : ''}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-[#E57373] text-[11px] mt-1 font-sans">{formik.errors.email}</div>
              )}
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.password && formik.errors.password ? 'border-[#E57373]' : ''}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-[#E57373] text-[11px] mt-1 font-sans">{formik.errors.password}</div>
              )}
            </div>

            <div className="flex justify-end">
              <Link to="#" className="font-sans text-[11px] text-[var(--color-maroon-bright)] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
            
            <div className="text-center mt-6">
              <span className="font-sans text-[12px] text-[var(--color-ink-secondary)]">
                New to Nyayakosha?{' '}
                <Link to="/register" className="text-[var(--color-gold)] hover:underline">
                  Register
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
