/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentPropsWithoutRef } from 'react';

interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label: string;
  id: string;
  counterText?: string;
}

export default function Textarea({ label, id, counterText, ...rest }: TextareaProps) {
  return (
    <div className="br-textarea">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} {...rest} />
      {counterText && (
        <div className="text-base mt-1">
          <span className="current" aria-live="polite" role="status">{counterText}</span>
        </div>
      )}
    </div>
  );
}
