import './index.css';
import { setupCalculator, estimateLotTotalPln } from './calculator';

// Typings for global state
declare global {
  interface Window {
    searchData: {
      top_recommendations: any[];
      all_results: any[];
    };
    runSearch: () => void;
    changeRecommendation: (id: string, rec: string) => void;
    toggleLotInReport: (id: string) => void;
    fillCalculatorFromLot: (id: string) => void;
    approveAndGeneratePdf: () => void;
  }
}

// Initial UI
document.querySelector<HTMLDivElement>('#root')!.innerHTML = `
  <div class="min-h-screen bg-neutral-50 text-neutral-900 font-sans p-4 md:p-6 pb-24">
    <header class="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-neutral-900">AutoScout US</h1>
        <p class="text-neutral-500 mt-1 font-medium">B2B Import Intelligence</p>
      </div>
      <div>
        <button id="generateReportBtn" class="hidden bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors" onclick="window.approveAndGeneratePdf()">
          Generuj Raport PDF
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
      
      <!-- Lwa kolumna: Wyszukiwanie & Wyniki -->
      <div class="xl:col-span-8 flex flex-col gap-6">
        
        <!-- Search Form -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <h2 class="text-lg font-semibold mb-4 text-neutral-800">Parametry Wyszukiwania</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-600 mb-1">Marka</label>
              <input id="make" type="text" value="Toyota" class="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-600 mb-1">Model</label>
              <input id="model" type="text" value="Camry" class="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-600 mb-1">Rocznik (od-do)</label>
              <div class="flex gap-2">
                <input id="year_from" type="number" value="2018" class="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm" />
                <span class="contents self-center text-neutral-500">-</span>
                <input id="year_to" type="number" value="2024" class="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-600 mb-1">Budżet Max (USD)</label>
              <input id="budget_usd" type="number" value="15000" class="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm" />
            </div>
            <div class="sm:col-span-2 mt-2">
              <button onclick="window.runSearch()" id="searchBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center">
                Szukaj i Analizuj (AI)
              </button>
            </div>
          </div>
        </div>

        <!-- Wyniki -->
        <div id="resultsArea" class="hidden flex-col gap-8">
          <div>
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <span class="text-green-600">★</span> Ocenione przez AI: TOP Rekomendacje
            </h2>
            <div id="topRecommendations" class="grid grid-cols-1 gap-4"></div>
          </div>
          <div>
            <h2 class="text-lg font-semibold mb-4 text-neutral-700">Inne propozycje</h2>
            <div id="otherResults" class="grid grid-cols-1 gap-4"></div>
          </div>
        </div>

      </div>

      <!-- Prawa kolumna: Kalkulator -->
      <div class="xl:col-span-4 self-start sticky top-6">
        <div id="calculator" class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <h2 class="text-lg font-semibold mb-4 text-neutral-800 border-b pb-2">Kalkulator Importu</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-600 mb-1">Kwota licytacji (USD)</label>
              <input id="calcBid" type="number" value="0" class="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm bg-neutral-50" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-neutral-600 mb-1">Stan</label>
                <select id="calcState" class="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm bg-neutral-50">
                  <option value="FL">Florida (FL)</option>
                  <option value="NJ">New Jersey (NJ)</option>
                  <option value="CA">California (CA)</option>
                  <option value="TX">Texas (TX)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-600 mb-1">Towing (USD)</label>
                <input id="calcTowing" type="number" value="450" class="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm bg-neutral-50" />
              </div>
            </div>
            
            <div class="pt-4 mt-4 border-t border-neutral-100 pb-2">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-neutral-600 text-left w-32 md:w-auto">Osoba Prywatna <br class="md:hidden" /><span class="text-xs">(akcyza 3.1%)</span></span>
                <span id="resPrivate" class="text-lg font-bold text-neutral-900 text-right">0 PLN</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-neutral-600 text-left w-32 md:w-auto">Firma Brutto <br class="md:hidden" /><span class="text-xs">(akcyza 18.6%)</span></span>
                <span id="resCompany" class="text-lg font-bold text-neutral-900 text-right">0 PLN</span>
              </div>
            </div>

            <p class="text-xs text-neutral-400 mt-2">Zawiera cło, VAT DE/PL, odprawy, transport do PL (2500 PLN), prowizję aukcji (8%). Kurs USD zał. 4.0</p>
          </div>
        </div>
      </div>

    </main>
  </div>
`;

window.searchData = {
  top_recommendations: [],
  all_results: []
};

window.runSearch = async () => {
  const btn = document.getElementById('searchBtn') as HTMLButtonElement;
  btn.disabled = true;
  btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Wyszukiwanie & Analiza...`;
  
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        criteria: {
          make: (document.getElementById('make') as HTMLInputElement).value,
          model: (document.getElementById('model') as HTMLInputElement).value,
          year_from: parseInt((document.getElementById('year_from') as HTMLInputElement).value),
          year_to: parseInt((document.getElementById('year_to') as HTMLInputElement).value),
          budget_usd: parseInt((document.getElementById('budget_usd') as HTMLInputElement).value),
        }
      })
    });
    
    const data = await res.json();
    window.searchData = data;
    renderApprovalScreen();
    
    document.getElementById('resultsArea')!.classList.remove('hidden');
    document.getElementById('generateReportBtn')!.classList.remove('hidden');
  } catch (err) {
    alert('Błąd wyszukiwania: ' + String(err));
  } finally {
    btn.disabled = false;
    btn.innerHTML = `Szukaj i Analizuj (AI)`;
  }
};

function renderApprovalScreen() {
  const { top_recommendations, all_results } = window.searchData;
  const topHtml = top_recommendations.map(lot => renderLotCard(lot, true)).join('');
  const othersHtml = all_results
    .filter(lot => !lot.is_top_recommendation)
    .slice(0, 5)
    .map(lot => renderLotCard(lot, false))
    .join('');
  
  document.getElementById('topRecommendations')!.innerHTML = topHtml || '<p class="text-neutral-500 italic">Brak rekomendacji.</p>';
  document.getElementById('otherResults')!.innerHTML = othersHtml || '<p class="text-neutral-500 italic">Brak dodatkowych wyników.</p>';
}

function renderLotCard(analyzedLot: any, isTop: boolean) {
  const { lot, analysis, included_in_report } = analyzedLot;
  
  const borderClass = isTop ? 'border-green-500 ring-1 ring-green-500' : 'border-neutral-200';
  let badgeClass = 'bg-neutral-100 text-neutral-800';
  if (analysis.recommendation === 'POLECAM') badgeClass = 'bg-green-100 text-green-800 border-green-200';
  if (analysis.recommendation === 'RYZYKO') badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (analysis.recommendation === 'ODRZUĆ') badgeClass = 'bg-red-100 text-red-800 border-red-200';

  const formatUsd = (val: any) => val ? `$${val.toLocaleString()}` : '-';
  
  return `
    <div class="bg-white rounded-xl shadow-sm border ${borderClass} overflow-hidden transition-all hover:shadow-md" data-lot-id="${lot.lot_id}">
      <div class="p-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-wrap justify-between items-center gap-3">
        <div class="flex items-center flex-wrap gap-3">
          <h3 class="font-bold text-lg text-neutral-900">${lot.year} ${lot.make} ${lot.model}</h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}">
            ${analysis.recommendation}
          </span>
          <span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold tracking-wider uppercase">${lot.source}</span>
        </div>
        <div class="text-xl font-bold ${analysis.score >= 8 ? 'text-green-600' : analysis.score >= 6 ? 'text-yellow-600' : 'text-neutral-500'}">
          ${analysis.score.toFixed(1)}<span class="text-sm font-normal text-neutral-400">/10</span>
        </div>
      </div>
      
      <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="grid grid-cols-2 gap-y-2 text-sm mb-4">
            <span class="text-neutral-500">Lot ID:</span> <a href="${lot.url}" target="_blank" class="text-blue-600 hover:underline font-medium">${lot.lot_id}</a>
            <span class="text-neutral-500">Przebieg:</span> <span class="font-medium">${lot.odometer_mi?.toLocaleString() || '-'} mi</span>
            <span class="text-neutral-500">Uszkodzenie:</span> <span class="font-medium">${lot.damage_primary || '-'}</span>
            <span class="text-neutral-500">Tytuł:</span> <span class="font-medium">${lot.title_type || '-'}</span>
            <span class="text-neutral-500">Lokalizacja:</span> <span class="font-medium">${lot.location_city}, ${lot.location_state}</span>
          </div>
          
          <div class="flex flex-wrap gap-2 mb-4">
            ${(analysis.red_flags || []).map((f: string) => `<span class="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-100">${f}</span>`).join('')}
          </div>
        </div>
        
        <div>
          <div class="bg-neutral-50 rounded-lg p-3 mb-4 text-sm text-neutral-700 leading-relaxed border border-neutral-100">
            ${analysis.client_description_pl}
          </div>
          
          <div class="flex flex-wrap sm:flex-nowrap gap-4 mb-4">
            <div class="flex-1 min-w-[120px] bg-blue-50/50 border border-blue-100 p-3 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Naprawa</div>
              <div class="text-base sm:text-lg font-bold text-neutral-900">${formatUsd(analysis.estimated_repair_usd)}</div>
            </div>
            <div class="flex-1 min-w-[120px] bg-green-50/50 border border-green-100 p-3 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-green-700 font-semibold uppercase tracking-wider mb-1 leading-tight">Łączny <br class="sm:hidden"/>(Bid+Napr)</div>
              <div class="text-base sm:text-lg font-bold text-neutral-900">${formatUsd(analysis.estimated_total_cost_usd)}</div>
            </div>
            <div class="flex-1 min-w-[120px] bg-neutral-50 border border-neutral-200 p-3 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-neutral-600 font-semibold uppercase tracking-wider mb-1">Aktualna Oferta</div>
              <div class="text-base sm:text-lg font-bold text-neutral-900">${formatUsd(lot.current_bid_usd)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="p-4 bg-neutral-50 border-t border-neutral-100 flex flex-wrap gap-3 items-center justify-between">
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <select class="flex-1 sm:flex-none text-sm border-neutral-300 rounded-md shadow-sm py-1.5 pl-3 pr-8" onchange="window.changeRecommendation('${lot.lot_id}', this.value)">
            <option value="POLECAM" ${analysis.recommendation === 'POLECAM' ? 'selected' : ''}>POLECAM</option>
            <option value="RYZYKO" ${analysis.recommendation === 'RYZYKO' ? 'selected' : ''}>RYZYKO</option>
            <option value="ODRZUĆ" ${analysis.recommendation === 'ODRZUĆ' ? 'selected' : ''}>ODRZUĆ</option>
          </select>
          <button onclick="window.toggleLotInReport('${lot.lot_id}')" class="flex-1 sm:flex-none text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${included_in_report ? 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'}">
            ${included_in_report ? 'Usuń z raportu' : 'Dodaj do raportu'}
          </button>
        </div>
        <button onclick="window.fillCalculatorFromLot('${lot.lot_id}')" class="w-full sm:w-auto text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 bg-white sm:bg-transparent border border-blue-200 sm:border-transparent rounded-lg py-2 sm:py-0">
          Przelicz w kalkulatorze 
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  `;
}

window.changeRecommendation = (lotId: string, rec: string) => {
  const lot = [...window.searchData.top_recommendations, ...window.searchData.all_results].find(l => l.lot.lot_id === lotId);
  if (lot) lot.analysis.recommendation = rec;
  renderApprovalScreen();
};

window.toggleLotInReport = (lotId: string) => {
  const lot = [...window.searchData.top_recommendations, ...window.searchData.all_results].find(l => l.lot.lot_id === lotId);
  if (lot) lot.included_in_report = !lot.included_in_report;
  renderApprovalScreen();
};

window.fillCalculatorFromLot = (lotId: string) => {
  const item = [...window.searchData.top_recommendations, ...window.searchData.all_results].find(l => l.lot.lot_id === lotId);
  if (!item) return;
  
  (document.getElementById('calcBid') as HTMLInputElement).value = item.lot.current_bid_usd?.toString() || '0';
  
  const stateSelect = document.getElementById('calcState') as HTMLSelectElement;
  const state = item.lot.location_state || 'FL';
  let found = Array.from(stateSelect.options).some(o => o.value === state);
  if (!found) {
    stateSelect.add(new Option(state, state));
  }
  stateSelect.value = state;
  
  // Update towing roughly based on location
  let towing = 450;
  if(state === 'CA') towing = 650;
  if(state === 'NY') towing = 300;
  (document.getElementById('calcTowing') as HTMLInputElement).value = towing.toString();
  
  setupCalculator();
  
  // Scroll
  document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
};

window.approveAndGeneratePdf = async () => {
  const items = [...window.searchData.top_recommendations, ...window.searchData.all_results.filter(l => !l.is_top_recommendation)];
  const approved = items.filter(l => l.included_in_report);
  
  if(approved.length === 0) {
    alert('Wybierz przynajmniej jeden pojazd by wygenerować raport!');
    return;
  }
  
  const btn = document.getElementById('generateReportBtn') as HTMLButtonElement;
  const oldText = btn.innerText;
  btn.innerText = 'Generowanie PDF...';
  
  try {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ approved_lots: approved })
    });
    
    if (!res.ok) throw new Error('Błąd generowania');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raport_autoscout_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch(e) {
    alert("Błąd: " + String(e));
  } finally {
    btn.innerText = oldText;
  }
};

// Initialize
setupCalculator();
