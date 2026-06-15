import React from 'react';

const PageHeader = ({ eyebrow, title, subtitle }) => {
  return (
    <div className="mb-8">
      <hr className="rule--heavy" />
      <div className="py-5 px-1 bg-[var(--color-bg-base)]">
        <div className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-2">
          {eyebrow}
        </div>
        <h1 className="font-serif font-bold text-[28px] text-[var(--color-parchment)] leading-tight mb-1">
          {title}
        </h1>
        {subtitle && (
          <div className="font-serif italic text-[14px] text-[var(--color-gold)]">
            {subtitle}
          </div>
        )}
      </div>
      <hr className="rule" />
    </div>
  );
};

export default PageHeader;
