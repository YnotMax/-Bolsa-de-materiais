/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label: string;
  id: string;
  helperText?: string;
  icon?: ReactNode;
  state?: 'success' | 'danger' | 'warning' | 'info';
  /**
   * Classes applied directly to the inner <input> element (e.g. sizing/font
   * utilities like `w-24 font-mono`). Kept separate from `className`, which
   * targets the wrapper div and would otherwise also resize the <label>/
   * helperText alongside it - mirrors Textarea's `textareaClassName` contract.
   */
  inputClassName?: string;
}

export default function Input({ label, id, helperText, icon, state, className, inputClassName, ...rest }: InputProps) {
  const classes = ['br-input', icon ? 'has-icon' : '', state ?? '', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label htmlFor={id}>{label}</label>
      <input id={id} className={inputClassName} {...rest} />
      {icon}
      {helperText && <p>{helperText}</p>}
    </div>
  );
}
