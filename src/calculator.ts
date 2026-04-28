// src/calculator.ts

export function setupCalculator() {
  const calcBid = document.getElementById('calcBid') as HTMLInputElement;
  const calcTowing = document.getElementById('calcTowing') as HTMLInputElement;
  const resPrivate = document.getElementById('resPrivate') as HTMLSpanElement;
  const resCompany = document.getElementById('resCompany') as HTMLSpanElement;

  if(!calcBid || !calcTowing || !resPrivate || !resCompany) return;

  const update = () => {
    const bidUsd = parseFloat(calcBid.value) || 0;
    const towingUsd = parseFloat(calcTowing.value) || 0;

    const usdRate = 4.0;
    const additionalCostsUsd = 300;
    const loadingUsd = 560;
    const freightUsd = 1050;
    
    const auctionFeeUsd = bidUsd * 0.08;
    const usaTotalUsd = additionalCostsUsd + bidUsd + auctionFeeUsd + towingUsd + loadingUsd + freightUsd;
    const usaTotalPln = usaTotalUsd * usdRate;

    // Private
    const privateCustomsBasePln = (usaTotalPln * 0.4) + (550 * usdRate);
    const privateDutyPln = privateCustomsBasePln * 0.1;
    const privateVatDePln = (privateCustomsBasePln + privateDutyPln) * 0.21;
    const privateDeFeesPln = 3000 + privateDutyPln + privateVatDePln + 2500;
    const privateBeforeExcisePln = usaTotalPln + privateDeFeesPln;
    const privateExcisePln = (privateBeforeExcisePln * 0.5) * 0.031;
    const privateTotalPln = privateBeforeExcisePln + privateExcisePln;

    // Company
    const companyDutyPln = usaTotalPln * 0.1;
    const companyDeFeesPln = 3000 + companyDutyPln;
    const companyExcisePln = ((bidUsd + 550) * usdRate) * 0.186;
    const companyNetPln = usaTotalPln + companyDeFeesPln + companyExcisePln;
    const companyGrossPln = (companyNetPln * 1.23) + 2100;

    resPrivate.innerText = `${Math.round(privateTotalPln).toLocaleString('pl-PL')} PLN`;
    resCompany.innerText = `${Math.round(companyGrossPln).toLocaleString('pl-PL')} PLN`;
  };

  calcBid.addEventListener('input', update);
  calcTowing.addEventListener('input', update);
  
  update();
}

export function estimateLotTotalPln(lot: any, analysis: any) {
  return '';
}
