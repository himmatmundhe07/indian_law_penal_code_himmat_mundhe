import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

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

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const { confirmPassword, ...registerData } = values;
        const response = await api.post('/auth/register', registerData);
        if (response.data.success) {
          toast.success('Registration successful! Please login.');
          navigate('/login');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed');
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
              CREATE ACCOUNT
            </h2>
          </div>
          
          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            <div>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.name && formik.errors.name ? 'border-[#E57373]' : ''}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-[#E57373] text-[11px] mt-1 font-sans">{formik.errors.name}</div>
              )}
            </div>

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

            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-[#E57373]' : ''}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="text-[#E57373] text-[11px] mt-1 font-sans">{formik.errors.confirmPassword}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
            
            <div className="text-center mt-6">
              <span className="font-sans text-[12px] text-[var(--color-ink-secondary)]">
                Already registered?{' '}
                <Link to="/login" className="text-[var(--color-gold)] hover:underline">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
