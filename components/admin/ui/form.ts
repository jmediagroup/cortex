/**
 * Form styling for the admin editors. Inputs are 44px tall (Apple's minimum
 * touch target) and 16px on phones so iOS Safari never zooms on focus.
 */
export const inputClass =
  'w-full min-h-[44px] rounded-[10px] border-[0.5px] border-[var(--ad-sep-strong)] bg-white px-3.5 py-2.5 text-[16px] text-[var(--ad-label)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--ad-label-3)] focus:border-[var(--sky)] focus:shadow-[0_0_0_4px_rgba(78,201,245,0.22)] disabled:opacity-60 sm:text-[15px]';

/** Native <select> styled like the inputs, with an iOS up/down chevron. */
export const selectClass = `${inputClass} ad-select`;

export const labelClass = 'mb-1.5 block text-[13px] font-semibold text-[var(--ad-label-2)]';

export const helpClass = 'mt-1.5 text-[13px] leading-snug text-[var(--ad-label-3)]';

/** A white rounded group that holds a block of fields. */
export const sectionClass = 'ad-group p-4 sm:p-5';

/** Heading inside a form section. */
export const sectionTitleClass = 'mb-3 text-[17px] font-bold tracking-[-0.01em] text-[var(--ad-label)]';

/** A checkbox / radio row with a comfortable tap area. */
export const checkRowClass =
  'flex min-h-[40px] cursor-pointer items-center gap-3 rounded-[8px] text-[15px] text-[var(--ad-label-2)]';
