import { useLocation } from 'react-router-dom';
import { ChevronRight, Save, Download, MoreHorizontal } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { cn } from '../../lib/utils';

const ROUTE_LABELS: Record<string, string> = {
  '/': '仪表盘',
  '/themes': '主题库',
  '/settings': '设置',
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; path: string }[] = [];

  if (segments.length === 0) {
    return [{ label: '仪表盘', path: '/' }];
  }

  // Base route label
  const baseRoute = `/${segments[0]}`;
  if (ROUTE_LABELS[baseRoute]) {
    breadcrumbs.push({ label: ROUTE_LABELS[baseRoute], path: baseRoute });
  } else {
    breadcrumbs.push({ label: segments[0], path: baseRoute });
  }

  // Feature pages with projectId
  if (segments.length >= 2) {
    const featureLabels: Record<string, string> = {
      'brainstorm': '脑暴构思',
      'references': '参考搜集',
      'script': '脚本分镜',
      'shotlist': '拍摄清单',
    };
    breadcrumbs.push({
      label: featureLabels[segments[0]] || segments[0],
      path: `/${segments[0]}/${segments[1]}`,
    });

    // Sub-pages (e.g., /script/:id/scene/:sceneId)
    if (segments.length >= 3) {
      breadcrumbs.push({
        label: segments[2] === 'scene' ? '场景详情' : segments[2],
        path: pathname,
      });
    }
    if (segments.length >= 4) {
      breadcrumbs.push({
        label: segments[3],
        path: pathname,
      });
    }
  }

  return breadcrumbs;
}

export function TopBar() {
  const location = useLocation();
  const { isDirty } = useEditorStore();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="h-12 border-b border-border-primary bg-bg-secondary flex items-center justify-between px-4 flex-shrink-0">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-text-disabled" />}
            <span
              className={cn(
                i === breadcrumbs.length - 1
                  ? 'text-text-primary font-medium'
                  : 'text-text-tertiary'
              )}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isDirty && (
          <span className="text-xs text-warning flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            未保存
          </span>
        )}
        <button
          className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title="保存"
        >
          <Save size={16} />
        </button>
        <button
          className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title="导出"
        >
          <Download size={16} />
        </button>
        <button
          className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title="更多"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </header>
  );
}
