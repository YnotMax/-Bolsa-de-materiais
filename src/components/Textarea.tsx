/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentPropsWithoutRef } from 'react';

interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label: string;
  id: string;
  counterText?: string;
  state?: 'success' | 'danger' | 'warning' | 'info';
  /**
   * Classes applied directly to the inner <textarea> element (e.g. sizing/resize
   * utilities like `resize-none h-16`). Kept separate from `className`, which -
   * mirroring Input's contract - targets the wrapper div and is meant for
   * layout/validation-adjacent classes, not element sizing.
   */
  textareaClassName?: string;
}

export default function Textarea({ label, id, counterText, state, className, textareaClassName, ...rest }: TextareaProps) {
  const wrapperClasses = ['br-textarea', state ?? '', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <label htmlFor={id}>{label}</label>
      <textarea id={id} className={textareaClassName} {...rest} />
      {counterText && (
        <div className="text-base mt-1">
          <span className="current" aria-live="polite" role="status">{counterText}</span>
        </div>
      )}
    </div>
  );
}
