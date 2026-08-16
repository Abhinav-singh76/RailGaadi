import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Train, Map, BarChart3, Compass, Search } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  // Detect current trainId from URL if available, otherwise default to latest active train (e.g. 20901)
  const pathParts = location.pathname.split('/');
  const activeTrainId = ['journey', 'analytics', 'explore'].includes(pathParts[1]) && pathParts[2]
    ? pathParts[2]
    : '20901';

  const navItems = [
    { label: 'Search', path: '/', icon: Search },
    { label: 'Live Map', path: `/journey/${activeTrainId}`, icon: Map },
    { label: 'Analytics', path: `/analytics/${activeTrainId}`, icon: BarChart3 },
    { label: 'Explore', path: `/explore/${activeTrainId}`, icon: Compass },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '0 20px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0071e3 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0, 113, 227, 0.3)',
          }}
        >
          <Train size={22} />
        </div>
        <div>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
            }}
          >
            Rail<span style={{ color: 'var(--accent-primary)' }}>Gaadi</span>
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginTop: '-2px',
            }}
          >
            Live Railway Companion
          </span>
        </div>
      </Link>

      <nav style={{ display: 'flex', gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(`/${item.path.split('/')[1]}`);

          return (
            <Link
              key={item.label}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                transition: 'var(--transition-fast)',
                textDecoration: 'none',
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
