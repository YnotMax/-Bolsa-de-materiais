/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Landmark, ShieldCheck, Scale, Globe, ChevronDown } from 'lucide-react';

export default function Footer() {
  // BRFooter's built-in accordion (@govbr-ds/core/dist/components/footer/footer.js)
  // finds its column wrapper by climbing ancestors for a literal `col-2` class match,
  // which only exists in the library's own 6-column reference markup. This footer uses
  // a 3-column `col-4` layout, so that check always fails and the library ends up
  // toggling display on the wrong ancestor (sometimes the whole .br-list.horizontal
  // wrapper), hiding the entire footer nav. Managing collapse state in React instead
  // sidesteps that vendor DOM-climbing bug entirely.
  const [openColumn, setOpenColumn] = useState<number | null>(null);

  const toggleColumn = (idx: number) => setOpenColumn((prev) => (prev === idx ? null : idx));
  const handleHeaderKeyDown = (idx: number) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleColumn(idx);
    }
  };

  return (
    <footer className="br-footer mt-auto">
      <div className="container-lg">
        <div className="logo flex items-center gap-2">
          <Landmark className="h-5 w-5" aria-hidden="true" />
          <span className="font-bold uppercase tracking-wider text-sm">Prefeitura de Florianópolis</span>
        </div>
        <div className="br-list horizontal">
          <div className="col-4">
            <div
              className="br-item header justify-between cursor-pointer lg:cursor-auto lg:pointer-events-none"
              role="button"
              tabIndex={0}
              aria-expanded={openColumn === 0}
              onClick={() => toggleColumn(0)}
              onKeyDown={handleHeaderKeyDown(0)}
            >
              <div className="content text-down-01 text-bold text-uppercase">Prefeitura</div>
              <ChevronDown
                className={`h-4 w-4 lg:hidden transition-transform ${openColumn === 0 ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </div>
            <div className={`br-list ${openColumn === 0 ? 'block' : 'hidden'} lg:block`}>
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
            <div
              className="br-item header justify-between cursor-pointer lg:cursor-auto lg:pointer-events-none"
              role="button"
              tabIndex={0}
              aria-expanded={openColumn === 1}
              onClick={() => toggleColumn(1)}
              onKeyDown={handleHeaderKeyDown(1)}
            >
              <div className="content text-down-01 text-bold text-uppercase">Marco Regulatório</div>
              <ChevronDown
                className={`h-4 w-4 lg:hidden transition-transform ${openColumn === 1 ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </div>
            <div className={`br-list ${openColumn === 1 ? 'block' : 'hidden'} lg:block`}>
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
            <div
              className="br-item header justify-between cursor-pointer lg:cursor-auto lg:pointer-events-none"
              role="button"
              tabIndex={0}
              aria-expanded={openColumn === 2}
              onClick={() => toggleColumn(2)}
              onKeyDown={handleHeaderKeyDown(2)}
            >
              <div className="content text-down-01 text-bold text-uppercase">Links de Transparência</div>
              <ChevronDown
                className={`h-4 w-4 lg:hidden transition-transform ${openColumn === 2 ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </div>
            <div className={`br-list ${openColumn === 2 ? 'block' : 'hidden'} lg:block`}>
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
