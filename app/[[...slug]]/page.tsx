import Showroom from '../../components/showroom';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug?:string[]}>}){const {slug=[]}=await params;return {title:slug.length?slug[0].replace(/-/g,' ').replace(/^./,c=>c.toUpperCase()):'Machines worth meeting.',alternates:{canonical:'/'+slug.join('/')}};}
export default async function Page({params}:{params:Promise<{slug?:string[]}>}){const {slug=[]}=await params;const known=['collection','vehicle','compare','saved','sell','financing','concierge','about','contact','book','privacy','terms','credits'];if(slug.length&&(!known.includes(slug[0])||slug.length>2||(slug.length===2&&slug[0]!=='vehicle')))notFound();return <Showroom path={'/'+slug.join('/')}/>}
