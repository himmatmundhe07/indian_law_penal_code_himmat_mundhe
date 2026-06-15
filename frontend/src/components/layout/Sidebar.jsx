import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

const AshokaChakra = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-maroon-bright">
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

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user } = useSelector((state) => state.auth);

  const sections = [
    {
      title: 'NAVIGATION',
      items: [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Laws & Acts', path: '/laws' },
        { name: 'Analytics', path: '/analytics' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Profile', path: '/profile' },
        { name: 'Settings', path: '/settings' },
      ]
    }
  ];

  if (user?.role === 'admin') {
    sections.push({
      title: 'ADMIN',
      items: [
        { name: 'User Management', path: '/admin/users' },
        { name: 'System Admin', path: '/admin/system' },
      ]
    });
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--color-bg-base)] border-r border-[var(--color-rule)]">
      {/* Logo Area */}
      <div className="flex items-center h-[64px] px-6 border-b border-[var(--color-rule)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <AshokaChakra />
          <span className="font-serif font-medium text-[20px] text-[var(--color-parchment)] tracking-tight">
            Nyayakosha
          </span>
        </div>
        {/* Mobile close button */}
        <button 
          className="md:hidden ml-auto text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment)]"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Areas */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h3 className="font-sans font-medium text-[9px] uppercase tracking-[0.12em] text-[var(--color-ink-secondary)] mb-3 px-2">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center h-[36px] px-3 font-sans text-[13px] rounded transition-colors ${
                      isActive
                        ? 'bg-[var(--color-maroon-muted)] text-[var(--color-gold-bright)] border-l-[3px] border-[var(--color-maroon-bright)] -ml-[3px]'
                        : 'text-[var(--color-ink)] border-l-[3px] border-transparent -ml-[3px] hover:bg-[rgba(139,26,46,0.12)]'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Pinned User Area */}
      {user && (
        <div className="p-4 border-t border-[var(--color-rule)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-maroon-muted)] border border-[var(--color-maroon)] flex items-center justify-center text-[var(--color-gold)] font-sans font-medium text-xs">
              {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-[14px] text-[var(--color-parchment)] truncate">
                {user.name}
              </p>
              <p className="font-sans text-[10px] uppercase tracking-wider text-[var(--color-ink-secondary)] truncate">
                {user.role || 'User'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-[240px]">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div 
            className="fixed inset-0 bg-[rgba(13,11,14,0.88)] transition-opacity"
            onClick={() => setMobileOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-[240px] w-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
