/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentPropsWithoutRef } from 'react';

interface CheckboxProps extends ComponentPropsWithoutRef<'input'> {
  label: string;
  id: string;
}

export default function Checkbox({ label, id, ...rest }: CheckboxProps) {
  return (
    <div className="br-checkbox">
      <input id={id} type="checkbox" {...rest} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
