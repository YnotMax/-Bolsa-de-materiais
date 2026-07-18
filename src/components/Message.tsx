/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X } from 'lucide-react';

interface MessageProps {
  variant: 'danger' | 'success' | 'info' | 'warning';
  title: string;
  body: string;
  onDismiss?: () => void;
}

export default function Message({ variant, title, body, onDismiss }: MessageProps) {
  return (
    <div className={`br-message ${variant}`}>
      <div className="icon" aria-hidden="true" />
      <div className="content" aria-label={`${title} ${body}`} role="alert">
        <span className="message-title">{title}</span>
        <span className="message-body"> {body}</span>
      </div>
      {onDismiss && (
        <div className="close">
          <button
            className="br-button circle small"
            type="button"
            aria-label="Fechar a mensagem de alerta"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
