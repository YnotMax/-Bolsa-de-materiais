/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { User } from '../types';
import { getLoginUsers } from '../data';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [users] = useState<User[]>(() => getLoginUsers());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-on-background">Bolsa de Materiais</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Selecione seu usuário para continuar</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onLogin(user)}
            className="br-card hover bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-primary transition-all duration-300 flex items-center gap-4 w-72"
          >
            <img src={user.image_url} alt="" className="h-14 w-14 rounded-full object-cover shrink-0" />
            <span className="text-sm font-medium text-on-background">{user.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
