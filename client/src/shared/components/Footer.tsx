import { Link } from 'react-router-dom';
import { BRAND_NAME, BRAND_SUPPORT_EMAIL, BRAND_WEBSITE, BRAND_COMPANY } from './brand/brand';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
        <span>
          © {year}{' '}
          <span className="font-medium text-gray-500">{BRAND_NAME}</span>
          {' '}·{' '}
          <a href={`https://${BRAND_WEBSITE}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">{BRAND_COMPANY}</a>
        </span>
        <div className="flex gap-4">
          <Link to="/manual" className="hover:text-gray-600 transition-colors">מדריך</Link>
          <span aria-hidden="true">·</span>
          <a href={`mailto:${BRAND_SUPPORT_EMAIL}`} className="hover:text-gray-600 transition-colors">צור קשר</a>
        </div>
      </div>
    </footer>
  );
}
