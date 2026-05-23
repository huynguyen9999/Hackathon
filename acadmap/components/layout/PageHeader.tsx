import Link from "next/link";

export type Breadcrumb = {
  label: string;
  href?: string;
};

export type PageHeaderProps = {
  breadcrumbs?: Breadcrumb[];
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-10">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-900 dark:text-slate-500"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="transition hover:text-indigo-700 dark:text-indigo-300"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-600 dark:text-slate-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    </header>
  );
}
