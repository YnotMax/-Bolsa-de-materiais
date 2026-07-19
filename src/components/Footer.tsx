/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Landmark, ShieldCheck, Scale, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="br-footer mt-auto">
      <div className="container-lg">
        <div className="logo flex items-center gap-2">
          <Landmark className="h-5 w-5" aria-hidden="true" />
          <span className="font-bold uppercase tracking-wider text-sm">Prefeitura de Florianópolis</span>
        </div>
        <div className="br-list horizontal">
          <div className="col-4">
            <div className="br-item header">
              <div className="content text-down-01 text-bold text-uppercase">Prefeitura</div>
            </div>
            <div className="br-list">
              <div className="br-item">
                <div className="content text-down-01">
                  Secretaria Municipal de Administração (SMA)<br />
                  Diretoria de Patrimônio e Gestão de Almoxarifados Públicos.
                </div>
              </div>
              <div className="br-item">
                <span className="text-down-01 text-bold">Desafio 14 - PoC TRL3</span>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="br-item header">
              <div className="content text-down-01 text-bold text-uppercase">Marco Regulatório</div>
            </div>
            <div className="br-list">
              <div className="br-item">
                <span className="icon"><ShieldCheck className="h-4 w-4" aria-hidden="true" /></span>
                <div className="content text-down-01">Lei Federal nº 14.133/2021 (Nova Lei de Licitações)</div>
              </div>
              <div className="br-item">
                <span className="icon"><Scale className="h-4 w-4" aria-hidden="true" /></span>
                <div className="content text-down-01">Decreto Estadual nº 45.242/2009 (Estado de Conservação)</div>
              </div>
              <div className="br-item">
                <span className="icon"><Globe className="h-4 w-4" aria-hidden="true" /></span>
                <div className="content text-down-01">eMAG &amp; WCAG 2.1 AA (Acessibilidade Digital)</div>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="br-item header">
              <div className="content text-down-01 text-bold text-uppercase">Links de Transparência</div>
            </div>
            <div className="br-list">
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Acessibilidade</div>
              </a>
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Dados Abertos</div>
              </a>
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Privacidade</div>
              </a>
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Termos de Uso</div>
              </a>
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Ouvidoria</div>
              </a>
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Portal de Compras</div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <span className="br-divider my-3" />
      <div className="container-lg">
        <div className="info">
          <div className="text-down-01 text-medium pb-3">
            © 2026 Prefeitura Municipal de Florianópolis. Todos os direitos reservados.<br />
            Desenvolvido no âmbito da 1ª Jornada Incubintech de Inovação Aberta.
          </div>
        </div>
      </div>
    </footer>
  );
}
