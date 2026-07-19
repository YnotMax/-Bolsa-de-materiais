/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'medium' | 'small';
  circle?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function Button({
  variant = 'tertiary',
  size = 'medium',
  circle = false,
  icon,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const variantClass = variant === 'tertiary' ? '' : variant;
  const sizeClass = size === 'small' ? 'small' : '';
  const classes = ['br-button', variantClass, sizeClass, circle ? 'circle' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
