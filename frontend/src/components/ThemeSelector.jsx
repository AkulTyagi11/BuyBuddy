import { useEffect, useRef, useState } from 'react';
import { Palette, ChevronDown } from 'lucide-react';
import Button from './Button';
import useThemeStore from '../stores/themeStore';
import { THEME_OPTIONS } from '../utils/themeOptions';

export default function ThemeSelector({ align = 'right' }) {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, []);

  const activeTheme = THEME_OPTIONS.find((option) => option.id === theme) || THEME_OPTIONS[0];
  const menuAlign = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        size="sm"
        className="gap-2"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">{activeTheme.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open ? (
        <div
          className={`dropdown-enter absolute top-11 z-50 w-72 rounded-2xl border border-border-default bg-surface p-3 shadow-[0_20px_50px_rgba(43,36,28,0.18)] ${menuAlign}`}
          role="menu"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Color themes</p>
          <div className="space-y-2">
            {THEME_OPTIONS.map((option) => {
              const isActive = option.id === theme;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setTheme(option.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                    isActive
                      ? 'border-brand-primary/60 bg-brand-primary-light/60'
                      : 'border-border-default hover:border-brand-primary-light hover:bg-surface-muted'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {option.swatches.map((swatch) => (
                      <span
                        key={swatch}
                        className="h-3 w-3 rounded-full border border-border-default"
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-neutral-dark">{option.label}</span>
                    <span className="block text-xs text-text-muted">{option.description}</span>
                  </span>
                  {isActive ? (
                    <span className="rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Active
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
