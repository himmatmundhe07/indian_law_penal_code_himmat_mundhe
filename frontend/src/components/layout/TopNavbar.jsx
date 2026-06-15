import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { toggleTheme } from '../../store/uiSlice';
import { logout } from '../../store/authSlice';
import { 
  Menu as MuiMenu, 
  MenuItem, 
  ListItemIcon, 
  Divider
} from '@mui/material';

const TopNavbar = ({ setMobileOpen }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
  };

  const getPageTitle = (pathname) => {
    if (pathname.includes('/laws/')) return 'Law Details';
    if (pathname.includes('/laws')) return 'Laws Directory';
    if (pathname.includes('/analytics')) return 'Analytics Dashboard';
    if (pathname.includes('/profile')) return 'User Profile';
    if (pathname.includes('/settings')) return 'Settings';
    if (pathname.includes('/admin/users')) return 'User Registry';
    if (pathname.includes('/admin/system')) return 'System Administration';
    if (pathname.includes('/dashboard')) return 'Statistics Overview';
    return 'Nyayakosha Dashboard';
  };

  return (
    <div className="flex-shrink-0 h-[60px] bg-[var(--color-bg-base)] border-b border-[var(--color-rule)] flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment)] focus:outline-none"
          onClick={() => setMobileOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      
      {/* Center: Dynamic Page Title */}
      <div className="flex-1 flex justify-center">
        <h1 className="font-serif italic font-semibold text-[18px] text-[var(--color-parchment)]">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button 
          onClick={() => dispatch(toggleTheme())} 
          className="text-[var(--color-parchment-dim)] hover:text-[var(--color-gold-bright)] transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={handleClick}
            className="w-[28px] h-[28px] rounded-full bg-[var(--color-maroon)] text-[var(--color-parchment)] font-sans font-medium text-[11px] flex items-center justify-center border border-[var(--color-maroon-bright)] hover:opacity-90 transition-opacity"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </button>
          
          <MuiMenu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              className: "bg-[var(--color-bg-elevated)] border border-[var(--color-rule)] rounded-[4px]",
              elevation: 0,
              sx: {
                mt: 1,
                minWidth: '200px',
                '& .MuiMenuItem-root': {
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--color-ink)',
                }
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <div className="px-4 py-3 outline-none">
              <p className="font-serif text-[15px] text-[var(--color-parchment)]">{user?.name}</p>
              <p className="font-sans text-[11px] text-[var(--color-ink-secondary)]">{user?.email}</p>
            </div>
            <Divider sx={{ borderColor: 'var(--color-rule)' }} />
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              <ListItemIcon>
                <UserIcon size={16} color="var(--color-parchment-dim)" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogOut size={16} color="#E57373" />
              </ListItemIcon>
              <span className="text-[#E57373]">Logout</span>
            </MenuItem>
          </MuiMenu>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
