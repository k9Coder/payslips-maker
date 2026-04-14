import { Link } from 'react-router-dom';
import { PayslipRowsIcon } from './brand/PayslipRowsIcon';
import { BRAND_NAME, BRAND_TAGLINE, BRAND_LEGAL_NOTE } from './brand/brand';

function FooterBrand() {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-2">
        <PayslipRowsIcon
          size={22}
          primaryColor="#3b82f6"
          accentColor="#93c5fd"
          valueOpacity={0.5}
        />
        <span className="text-[#f1f5f9] font-bold text-base">{BRAND_NAME}</span>
      </div>
      <p className="text-sm text-[#64748b] max-w-[260px] leading-relaxed">{BRAND_TAGLINE}</p>
    </div>
  );
}

function FooterLegalNote() {
  return (
    <div className="border-r-[3px] border-[#3b82f6] pr-3 text-xs text-[#64748b] leading-relaxed max-w-sm bg-[#1e293b] rounded-sm p-3">
      <span className="font-semibold text-[#94a3b8]">⚖️ עמידה בדרישות החוק: </span>
      {BRAND_LEGAL_NOTE}
    </div>
  );
}

function FooterBottom() {
  const year = new Date().getFullYear();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[#475569]">
      <span>© {year} {BRAND_NAME}. כל הזכויות שמורות.</span>
      <div className="flex gap-4">
        <Link to="/manual" className="hover:text-[#94a3b8] transition-colors">מדריך</Link>
        <span aria-hidden="true">·</span>
        <a
          href="mailto:support@pashot-tlush.co.il"
          className="hover:text-[#94a3b8] transition-colors"
        >
          צור קשר
        </a>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0f172a] text-[#94a3b8] mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-6">
          <FooterBrand />
          <FooterLegalNote />
        </div>
        <hr className="border-[#1e293b] mb-4" />
        <FooterBottom />
      </div>
    </footer>
  );
}
