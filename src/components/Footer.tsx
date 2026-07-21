/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { Landmark, ShieldCheck, Scale, Globe, ChevronDown } from 'lucide-react';
import BRFooter from '@govbr-ds/core/dist/components/footer/footer.js';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const dsInitialized = useRef(false);

  useEffect(() => {
    if (dsInitialized.current) return;
    if (!footerRef.current) return;
    dsInitialized.current = true;
    // Wires up BRFooter's built-in mobile accordion: below 992px each column's
    // .br-item.header collapses its sibling .br-list until tapped, so the footer
    // doesn't dump all three columns' content on the page at once on small screens.
    new BRFooter('footer', footerRef.current);
  }, []);

  return (
    <footer ref={footerRef} className="br-footer mt-auto">
      <div className="container-lg">
        <div className="logo flex items-center gap-2">
          <Landmark className="h-5 w-5" aria-hidden="true" />
          <span className="font-bold uppercase tracking-wider text-sm">Prefeitura de Florianópolis</span>
        </div>
        <div className="br-list horizontal">
          <div className="col-4">
            <div className="br-item header justify-between cursor-pointer lg:cursor-auto lg:pointer-events-none" role="button" tabIndex={0} aria-expanded={false}>
              <div className="content text-down-01 text-bold text-uppercase">Prefeitura</div>
              <ChevronDown className="h-4 w-4 lg:hidden" aria-hidden="true" />
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
            <div className="br-item header justify-between cursor-pointer lg:cursor-auto lg:pointer-events-none" role="button" tabIndex={0} aria-expanded={false}>
              <div className="content text-down-01 text-bold text-uppercase">Marco Regulatório</div>
              <ChevronDown className="h-4 w-4 lg:hidden" aria-hidden="true" />
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
            <div className="br-item header justify-between cursor-pointer lg:cursor-auto lg:pointer-events-none" role="button" tabIndex={0} aria-expanded={false}>
              <div className="content text-down-01 text-bold text-uppercase">Links de Transparência</div>
              <ChevronDown className="h-4 w-4 lg:hidden" aria-hidden="true" />
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
