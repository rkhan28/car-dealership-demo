export type Vehicle={id:string;brand:string;model:string;year:number;price:number;mileage:number;body:string;fuel:string;drive:string;power:number;transmission:string;status:string;colour:string;images:string[];description:string;features:string[];demo:boolean};
export const demoVehicles:Vehicle[]=[
{id:'a01-strada',brand:'Atelier',model:'A01 Strada',year:2026,price:289000,mileage:1200,body:'Supercar',fuel:'Petrol',drive:'RWD',power:640,transmission:'8-speed dual clutch',status:'Available',colour:'Liquid silver',images:['/images/hero.webp'],description:'A study in proportion. A low silhouette, a focused cockpit, and a powertrain at the centre of it all.',features:['Carbon architecture','Active aerodynamics','Carbon-ceramic brakes','Adaptive suspension'],demo:true},
{id:'a02-grand-tourer',brand:'Atelier',model:'A02 Grand Tourer',year:2025,price:198000,mileage:8600,body:'Grand Tourer',fuel:'Petrol',drive:'AWD',power:550,transmission:'8-speed automatic',status:'Available',colour:'Racing green',images:['/images/gt.webp'],description:'Long journeys, made memorable. Sculpted coachwork and a considered cabin meet effortless grand touring performance.',features:['Leather interior','All-wheel drive','Adaptive dampers','Panoramic navigation'],demo:true},
{id:'a03-spider',brand:'Atelier',model:'A03 Spider',year:2024,price:174000,mileage:12400,body:'Convertible',fuel:'Petrol',drive:'RWD',power:480,transmission:'7-speed dual clutch',status:'Reserved',colour:'Oxblood',images:['/images/roadster.webp'],description:'A closer connection to the road. Open-air performance, balanced proportions, and nothing between you and the horizon.',features:['Open cockpit','Sports exhaust','Heated seats','Limited-slip differential'],demo:true}];
export const money=(n:number)=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(n);
// Ignore malformed numeric query parameters rather than hiding every vehicle.
const numericFilter = (value: string | undefined): number | undefined => {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export function filterVehicles(items: Vehicle[], q: Record<string, string>) {
  const search = q.search?.trim().replace(/\s+/g, ' ').toLowerCase();
  const min = numericFilter(q.min);
  const max = numericFilter(q.max);
  const year = numericFilter(q.year);
  const mileage = numericFilter(q.mileage);

  return items.filter(v =>
    (!search || `${v.brand} ${v.model} ${v.colour} ${v.features.join(' ')}`.toLowerCase().includes(search)) &&
    (!q.brand || v.brand === q.brand) &&
    (!q.body || v.body === q.body) &&
    (!q.fuel || v.fuel === q.fuel) &&
    (!q.drive || v.drive === q.drive) &&
    (!q.status || v.status === q.status) &&
    (max === undefined || v.price <= max) &&
    (min === undefined || v.price >= min) &&
    (year === undefined || v.year >= year) &&
    (mileage === undefined || v.mileage <= mileage)
  ).sort((a, b) =>
    q.sort === 'price-asc' ? a.price - b.price :
    q.sort === 'price-desc' ? b.price - a.price :
    q.sort === 'mileage' ? a.mileage - b.mileage :
    b.year - a.year
  );
}
