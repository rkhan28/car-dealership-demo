import type {Metadata} from 'next';
import './globals.css';
import './revamp.css';
import './spotlight.css';
import './smooth.css';
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://autobot.vercel.app'),title:{default:'Autobot — Toronto Car Showroom Demo',template:'%s | Autobot Showroom Demo'},description:'A Toronto car showroom demo by Rahmat Khan. Explore a cinematic 3D car, a concept collection and simulated viewing enquiries.',openGraph:{title:'Autobot — Car Showroom Demo',description:'Machines worth meeting.',images:['/images/hero.webp']},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-CA"><body>{children}</body></html>}
