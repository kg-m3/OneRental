import * as React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/button';
// CardHeader, CardTitle, CardDescription, CardContent are not available as separate exports, so inline them below
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface CollapsibleCardProps {
  id: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  summary?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  id,
  title,
  subtitle,
  defaultOpen = true,
  summary,
  children,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const contentId = `collapsible-card-content-${id}`;
  // Helper to avoid toggling when clicking interactive elements
  const isInteractiveElement = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    if (['button','a','input','select','textarea','label'].includes(tag)) return true;
    if (el.getAttribute('role') === 'button' || el.getAttribute('data-stop-toggle') === 'true') return true;
    return !!el.closest('button, a, input, select, textarea, label, [role="button"], [data-stop-toggle="true"]');
  };
  // State persistence: URL param and localStorage
  const getInitialOpen = () => {
    // 1. URL param
    const params = new URLSearchParams(window.location.search);
    const openParam = params.get('open');
    if (openParam) {
      const openIds = openParam.split(',');
      if (openIds.includes(id)) return true;
      return false;
    }
    // 2. localStorage
    const stored = localStorage.getItem(`dashboard:card:${id}`);
    if (stored !== null) return stored === '1';
    // 3. default
    return defaultOpen;
  };
  const [open, setOpen] = React.useState<boolean>(getInitialOpen);

  // Persist state to URL and localStorage
  React.useEffect(() => {
    // Update localStorage
    localStorage.setItem(`dashboard:card:${id}`, open ? '1' : '0');
    // Update URL param (open=csv)
    const params = new URLSearchParams(window.location.search);
    let openIds = params.get('open')?.split(',').filter(Boolean) || [];
    if (open) {
      if (!openIds.includes(id)) openIds.push(id);
    } else {
      openIds = openIds.filter((oid) => oid !== id);
    }
    if (openIds.length > 0) {
      params.set('open', openIds.join(','));
    } else {
      params.delete('open');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [open, id]);

  // Toggle handler
  const handleToggle = () => setOpen((prev) => !prev);
  const handleHeaderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };
  // Click anywhere on the card background to toggle (expand/collapse)
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (isInteractiveElement(target)) return;
    setOpen((prev) => !prev);
  };

  return (
    <Card className={`rounded-2xl shadow-sm border ${className}`} onClick={handleCardClick}>
      <div
        className="pb-2 flex items-start justify-between cursor-pointer"
        role="button"
        aria-expanded={open}
        aria-controls={contentId}
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          // Avoid double handling when clicking the toggle button
          const t = e.target as HTMLElement;
          if (isInteractiveElement(t)) return;
          handleToggle();
        }}
        onKeyDown={handleHeaderKeyDown}
      >
        <div>
          <span className="text-lg font-semibold tracking-tight">{title}</span>
          {subtitle && <span className="block text-sm text-zinc-500">{subtitle}</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={(e) => { e.stopPropagation(); handleToggle(); }}
          className="hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 focus:ring-2 focus:ring-primary-400"
        >
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </Button>
      </div>
      {/* Summary Row (visible when closed) */}
      {!open && summary && (
        <div
          className="px-6 pb-4 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        >
          {summary}
        </div>
      )}
      {/* Animated content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={contentId}
            initial={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.22 }}
            className="overflow-hidden"
            layout
          >
            <div className="pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
