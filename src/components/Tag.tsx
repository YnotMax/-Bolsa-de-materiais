/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type TagProps =
  | { variant: 'count'; tone: 'danger' | 'success' | 'warning'; count: number; label: string }
  | { variant: 'status'; tone: 'danger' | 'success' | 'warning'; label: string };

export default function Tag(props: TagProps) {
  if (props.variant === 'count') {
    return (
      <span className={`br-tag count bg-${props.tone}`} title={props.label} aria-label={props.label}>
        <span aria-hidden="true">{props.count}</span>
      </span>
    );
  }
  return <span className={`br-tag status bg-${props.tone}`} title={props.label} />;
}
