/**
 * Sticky left-side section navigator. Lists all visible sections with
 * a click-to-jump anchor and a small toolbar to expand or collapse
 * everything at once. Uses CSS-only behavior to expand/collapse via
 * a custom event the Section components listen for.
 *
 * Lives in a column layout: <SectionNav /> on the left, <main> on the
 * right. On mobile collapses to a top button row.
 */

export default function SectionNav({ items }) {
  const expandAll = () => window.dispatchEvent(new CustomEvent('op:expandAll'));
  const collapseAll = () => window.dispatchEvent(new CustomEvent('op:collapseAll'));
  const jump = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Open the section after a tick.
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('op:openSection', { detail: { id } }));
    });
  };

  return (
    <aside className="hidden lg:block sticky top-20 self-start w-56 flex-shrink-0 no-print">
      <div className="bg-white border border-[var(--color-op-line)] rounded-lg p-3">
        <p className="op-section-num !text-[10px] mb-2 px-1">Sections</p>
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => jump(item.id)}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-[var(--color-op-ink)] hover:bg-[var(--color-op-cream)] hover:text-[var(--color-op-red)] transition-colors flex items-baseline gap-2"
              >
                <span className="font-mono text-[10px] text-[var(--color-op-muted)] w-5 flex-shrink-0">
                  {item.label}
                </span>
                <span className="truncate">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-[var(--color-op-line)] flex items-center gap-1.5">
          <button
            type="button"
            onClick={expandAll}
            className="flex-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 rounded bg-[var(--color-op-cream)] text-[var(--color-op-ink)] hover:bg-[var(--color-op-line)] transition-colors"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="flex-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 rounded bg-[var(--color-op-cream)] text-[var(--color-op-ink)] hover:bg-[var(--color-op-line)] transition-colors"
          >
            Collapse
          </button>
        </div>
      </div>
    </aside>
  );
}
