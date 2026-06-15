import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector }  from 'react-redux';
import { Helmet }    from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup      from 'yup';
import { toast }     from 'react-toastify';
import api           from '../../services/api';
import { API_ROUTES } from '../../utils/constants';
import { fetchProfile } from '../../store/authSlice';
import PageHeader from '../../components/common/PageHeader';

const profileSchema = Yup.object({
  name:  Yup.string().min(2, 'Too short'),
  email: Yup.string().email('Invalid email'),
  phone: Yup.string(),
  bio:   Yup.string().max(200),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required('Required'),
  newPassword:     Yup.string().min(6, 'Min 6 chars').required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Required'),
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [sessions, setSessions] = useState([]);
  const [tab, setTab]           = useState('profile');

  useEffect(() => {
    dispatch(fetchProfile());
    api.get(API_ROUTES.SESSIONS)
      .then(r => setSessions(r.data.data || r.data.sessions || []))
      .catch(() => {});
  }, [dispatch]);

  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name:  user?.name  || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio:   user?.bio   || '',
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      try {
        await api.patch(API_ROUTES.PROFILE, values);
        toast.success('Profile updated');
        dispatch(fetchProfile());
      } catch { toast.error('Update failed'); }
    },
  });

  const passwordFormik = useFormik({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: passwordSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await api.post(API_ROUTES.CHANGE_PASSWORD, {
          currentPassword: values.currentPassword,
          newPassword:     values.newPassword,
        });
        toast.success('Password changed');
        resetForm();
      } catch { toast.error('Password change failed'); }
    },
  });

  const TABS = ['profile', 'password', 'sessions'];

  return (
    <div className="max-w-[760px] mx-auto pb-16">
      <Helmet>
        <title>Profile Settings — Nyayakosha</title>
      </Helmet>

      <PageHeader 
        eyebrow="ACCOUNT"
        title="Profile Settings"
        subtitle="Manage your personal information and security"
      />

      <div className="space-y-8">
        {/* Tab switcher */}
        <div className="flex border-b border-[var(--color-rule)]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 font-sans font-medium uppercase tracking-[0.06em] text-[12px] transition-colors border-b-[2px] ${
                tab === t
                  ? 'border-[var(--color-maroon)] text-[var(--color-parchment)]'
                  : 'border-transparent text-[var(--color-ink-secondary)] hover:text-[var(--color-parchment-dim)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <form onSubmit={profileFormik.handleSubmit} className="space-y-6 max-w-[480px]">
            {[
              ['name',  'Full Name',  'text'],
              ['email', 'Email Address', 'email'],
              ['phone', 'Phone Number',  'tel'],
            ].map(([name, label, type]) => (
              <div key={name}>
                <label className="block font-sans text-[12px] text-[var(--color-parchment-dim)] mb-2 uppercase tracking-[0.05em]">{label}</label>
                <input
                  type={type}
                  name={name}
                  {...profileFormik.getFieldProps(name)}
                  className={`w-full ${profileFormik.touched[name] && profileFormik.errors[name] ? 'border-[#E57373]' : ''}`}
                />
                {profileFormik.touched[name] && profileFormik.errors[name] && (
                  <p className="text-[#E57373] text-[11px] mt-1 font-sans">{profileFormik.errors[name]}</p>
                )}
              </div>
            ))}
            <div>
              <label className="block font-sans text-[12px] text-[var(--color-parchment-dim)] mb-2 uppercase tracking-[0.05em]">Biography</label>
              <textarea
                name="bio"
                rows={4}
                {...profileFormik.getFieldProps('bio')}
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-rule)] text-[var(--color-parchment)] font-serif text-[15px] p-3 focus:outline-none focus:border-l-[3px] focus:border-l-[var(--color-maroon)] focus:pl-[9px] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={profileFormik.isSubmitting}
              className="btn-primary"
            >
              Save Profile Changes
            </button>
          </form>
        )}

        {/* Password tab */}
        {tab === 'password' && (
          <form onSubmit={passwordFormik.handleSubmit} className="space-y-6 max-w-[480px]">
            {[
              ['currentPassword', 'Current Password'],
              ['newPassword',     'New Password'],
              ['confirmPassword', 'Confirm New Password'],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block font-sans text-[12px] text-[var(--color-parchment-dim)] mb-2 uppercase tracking-[0.05em]">{label}</label>
                <input
                  type="password"
                  name={name}
                  {...passwordFormik.getFieldProps(name)}
                  className={`w-full ${passwordFormik.touched[name] && passwordFormik.errors[name] ? 'border-[#E57373]' : ''}`}
                />
                {passwordFormik.touched[name] && passwordFormik.errors[name] && (
                  <p className="text-[#E57373] text-[11px] mt-1 font-sans">{passwordFormik.errors[name]}</p>
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={passwordFormik.isSubmitting}
              className="btn-primary"
            >
              Update Password
            </button>
          </form>
        )}

        {/* Sessions tab */}
        {tab === 'sessions' && (
          <div className="space-y-4">
            <h3 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-4">
              ACTIVE SESSIONS
            </h3>
            {sessions.length === 0 ? (
              <p className="font-sans text-[13px] text-[var(--color-ink-secondary)] italic">No active sessions data available.</p>
            ) : sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[var(--color-bg-surface)] border border-[var(--color-rule)] rounded-[4px]">
                <div>
                  <p className="font-sans font-medium text-[13px] text-[var(--color-parchment)] mb-1">
                    {s.device || s.userAgent || 'Unknown device'}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--color-ink-secondary)]">
                    {s.ip || 'Unknown IP'} · {s.createdAt ? new Date(s.createdAt).toLocaleString('en-IN') : 'Unknown Date'}
                  </p>
                </div>
                <div className="flex items-center gap-2 font-sans text-[11px] text-[#4ADE80] uppercase tracking-[0.05em]">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80]"></span>
                  Active
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
