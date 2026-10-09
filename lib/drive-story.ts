/** Continuous, shape-preserving camera curves. No repeated poses or reading holds. */
export type Shot={at:number;az:number;elevation:number;distance:number;focus:[number,number,number];screenX:number;screenY:number;doors:number;explode:number};
export const shots:Shot[]=[
 {at:0,az:.55,elevation:.19,distance:7.2,focus:[0,.72,0],screenX:.06,screenY:-.12,doors:0,explode:0},
 {at:.12,az:.89,elevation:.22,distance:6.35,focus:[0,.83,0],screenX:-.36,screenY:-.10,doors:.22,explode:0},
 {at:.22,az:1.18,elevation:.31,distance:6.8,focus:[0,.97,0],screenX:-.40,screenY:0,doors:1,explode:.025},
 {at:.34,az:1.64,elevation:.58,distance:4.9,focus:[-.18,.84,-.20],screenX:-.49,screenY:0,doors:1,explode:.14},
 {at:.50,az:2.86,elevation:.44,distance:6.6,focus:[0,.83,.55],screenX:-.37,screenY:0,doors:.32,explode:1},
 {at:.68,az:4.71,elevation:.18,distance:8.0,focus:[0,.68,0],screenX:-.43,screenY:0,doors:0,explode:.1},
 {at:.84,az:5.68,elevation:.16,distance:7.0,focus:[0,.67,0],screenX:-.32,screenY:-.03,doors:0,explode:0},
 {at:1,az:6.80,elevation:.21,distance:6.3,focus:[0,.72,0],screenX:-.34,screenY:-.06,doors:0,explode:0},
];
export const ease=(t:number)=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x)};
/** Harmonic tangents prevent overshoot while preserving velocity through keyframes. */
function tangent(values:number[],i:number){if(i===0)return (values[1]-values[0])/(shots[1].at-shots[0].at);if(i===values.length-1)return (values[i]-values[i-1])/(shots[i].at-shots[i-1].at);const h0=shots[i].at-shots[i-1].at,h1=shots[i+1].at-shots[i].at,d0=(values[i]-values[i-1])/h0,d1=(values[i+1]-values[i])/h1;if(d0*d1<=0)return 0;const w0=2*h1+h0,w1=h1+2*h0;return (w0+w1)/(w0/d0+w1/d1);}
const keys=['az','elevation','distance','screenX','screenY','doors','explode'] as const;
const curves=Object.fromEntries(keys.map(key=>{const values=shots.map(s=>s[key]);return [key,{values,slopes:values.map((_,i)=>tangent(values,i))}]})) as Record<typeof keys[number],{values:number[];slopes:number[]}>;
const focusCurves=[0,1,2].map(j=>{const values=shots.map(s=>s.focus[j]);return {values,slopes:values.map((_,i)=>tangent(values,i))}});
export function shotAt(progress:number):Shot{const p=Math.max(0,Math.min(1,progress));let i=0;while(i<shots.length-2&&p>shots[i+1].at)i++;const h=shots[i+1].at-shots[i].at,t=(p-shots[i].at)/h,t2=t*t,t3=t2*t;const sample=({values:v,slopes:m}:{values:number[];slopes:number[]})=>(2*t3-3*t2+1)*v[i]+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*v[i+1]+(t3-t2)*h*m[i+1];return {at:p,...Object.fromEntries(keys.map(k=>[k,sample(curves[k])])),focus:focusCurves.map(sample) as [number,number,number]} as Shot;}
export const boundaries=[.115,.265,.415,.60,.775,.92];
export const chapterAt=(p:number)=>{const i=boundaries.findIndex(x=>p<x);return i<0?6:i};
export const stops=[0,.20,.34,.50,.69,.84,.98];
export const chapters=['P1 GTR','Wings','The cockpit','Engineering','Specifications','Toronto','The collection'];
export function captionAt(p:number,i:number){const start=i===0?0:boundaries[i-1],end=i===6?1:boundaries[i];return Math.min(i===0?1:ease((p-start)/.024),i===6?1:ease((end-p)/.024));}
export function followScroll(current:number,target:number,dt:number){return current+(target-current)*(1-Math.exp(-Math.min(dt,.05)*11));}
