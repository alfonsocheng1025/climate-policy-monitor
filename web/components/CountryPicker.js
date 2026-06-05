'use client';
import { ALL, cname } from '../lib/iso';
import { useT } from '../lib/i18n';

export default function CountryPicker({ value = [], onChange, max = 8 }) {
  const { t, lang } = useT();
  const sel = value;
  const add = (iso) => { if (iso && !sel.includes(iso) && sel.length < max) onChange([...sel, iso]); };
  const remove = (iso) => onChange(sel.filter((x) => x !== iso));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', margin: '8px 0' }}>
      {sel.map((iso) => (
        <span key={iso} className="chip chip--active" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {cname(iso, lang)}
          <button onClick={() => remove(iso)} style={{ color: 'inherit', fontWeight: 700, lineHeight: 1 }}>×</button>
        </span>
      ))}
      <select value="" onChange={(e) => add(e.target.value)} style={{ minWidth: 180 }} disabled={sel.length >= max}>
        <option value="">{t('cp_add')}</option>
        {ALL.filter((c) => !sel.includes(c.iso)).map((c) => (
          <option key={c.iso} value={c.iso}>{(lang === 'zh' ? c.zh : c.en)} ({c.iso})</option>
        ))}
      </select>
    </div>
  );
}
