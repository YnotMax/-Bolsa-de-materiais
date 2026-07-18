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
}

export default function Input({ label, id, helperText, icon, className, ...rest }: InputProps) {
  const classes = ['br-input', icon ? 'has-icon' : '', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...rest} />
      {icon}
      {helperText && <p>{helperText}</p>}
    </div>
  );
}
