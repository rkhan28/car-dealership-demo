'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowUpRight,RotateCcw} from 'lucide-react';
import type {MeshPhysicalMaterial} from 'three';
import {shotAt,chapterAt,captionAt,stops,chapters,followScroll,ease} from '../lib/drive-story';
const finishes=[['Copper','#9c6546'],['Glacier','#71848e'],['Graphite','#30343a']] as const;
const factory='https://cars.mclaren.com/gl_en/ultimate-models/mclaren-p1-gtr';
function Title({lines}:{lines:string[]}){return <h2>{lines.map((line,i)=><span className="motion-line" key={line}><span style={{'--line':i} as React.CSSProperties}>{line}</span></span>)}</h2>}
export default function Engineering(){
 const section=useRef<HTMLElement>(null),canvas=useRef<HTMLDivElement>(null),panels=useRef<HTMLDivElement>(null),target=useRef(0),progress=useRef(0),active=useRef(-1),paint=useRef<MeshPhysicalMaterial|null>(null),renderRef=useRef<(()=>void)|null>(null);
 const [chapter,setChapter]=useState(0),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[reduce,setReduce]=useState(false),[finish,setFinish]=useState(0);
 useEffect(()=>{
  let cancelled=false,dispose=()=>{};const media=matchMedia('(prefers-reduced-motion: reduce)');setReduce(media.matches);
  async function init(){
   const T=await import('three');let renderer:InstanceType<typeof T.WebGLRenderer>|undefined;
   try{
    const [{GLTFLoader},{HDRLoader},{RoomEnvironment}]=await Promise.all([import('three/examples/jsm/loaders/GLTFLoader.js'),import('three/examples/jsm/loaders/HDRLoader.js'),import('three/examples/jsm/environments/RoomEnvironment.js')]);
    if(cancelled||!canvas.current)return;const mount=canvas.current;
    renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.5:2));renderer.setClearColor(0x090a0c,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;mount.appendChild(renderer.domElement);
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(31,1,.1,60),car=new T.Group();scene.add(car);
    const [loaded,hdr,bodyNormal,carbonNormal]=await Promise.all([
     new GLTFLoader().loadAsync('/models/p1-gtr.glb'),
     new HDRLoader().loadAsync('/environments/studio-small-09.hdr').catch(()=>null),
     new T.TextureLoader().loadAsync('/textures/main_body-normal.png').catch(()=>null),
     new T.TextureLoader().loadAsync('/textures/Carbon-normal.png').catch(()=>null),
    ]);
    const pmrem=new T.PMREMGenerator(renderer);let env:InstanceType<typeof T.WebGLRenderTarget>;
    if(hdr){hdr.mapping=T.EquirectangularReflectionMapping;env=pmrem.fromEquirectangular(hdr);hdr.dispose();}
    else{const room=new RoomEnvironment();env=pmrem.fromScene(room,.035);room.dispose();}
    scene.environment=Array.isArray(env.texture)?env.texture[0]:env.texture;scene.environmentIntensity=.82;scene.environmentRotation.y=.55;pmrem.dispose();
    for(const texture of [bodyNormal,carbonNormal])if(texture){texture.flipY=false;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
    if(cancelled){loaded.scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}});env.dispose();renderer.dispose();renderer.domElement.remove();return;}
    const body=new T.MeshPhysicalMaterial({color:finishes[0][1],metalness:.88,roughness:.20,clearcoat:1,clearcoatRoughness:.08,normalMap:bodyNormal,normalScale:new T.Vector2(.85,.85)});paint.current=body;
    const glazing=new T.MeshPhysicalMaterial({color:0xb4c1c7,metalness:0,roughness:.045,transmission:.72,thickness:.035,ior:1.52,clearcoat:1,clearcoatRoughness:.03,attenuationColor:new T.Color(0x899fa7),attenuationDistance:.6,side:T.DoubleSide});
    const doorLeft=new T.Group(),doorRight=new T.Group();doorLeft.position.set(-.67,.89,-.72);doorRight.position.set(.67,.89,-.72);car.add(doorLeft,doorRight);
    const parts:{group:InstanceType<typeof T.Group>;base:InstanceType<typeof T.Vector3>;offset:InstanceType<typeof T.Vector3>}[]=[];
    loaded.scene.updateMatrixWorld(true);
    const meshes:InstanceType<typeof T.Mesh>[]=[];loaded.scene.traverse(o=>{if(o instanceof T.Mesh)meshes.push(o)});
    for(const mesh of meshes){
     mesh.castShadow=true;mesh.receiveShadow=true;mesh.geometry.applyMatrix4(mesh.matrixWorld);mesh.position.set(0,0,0);mesh.rotation.set(0,0,0);mesh.scale.set(1,1,1);
     const assembly=String(mesh.userData.assembly||mesh.name.split('__')[0]),material=Array.isArray(mesh.material)?mesh.material[0]:mesh.material;
     if(material.name==='main_body'){mesh.material=body;}
     else if(material instanceof T.MeshStandardMaterial){
      if(material.name==='rims'){material.color.set('#83878b');material.metalness=1;material.roughness=.26;}
      if(material.name==='windshieldwindows'){mesh.material=glazing;mesh.castShadow=false;}
      if(material.name==='Carbon'){material.normalMap=carbonNormal||material.normalMap;material.normalScale.set(.6,.6);material.roughness=.34;material.metalness=.3;}
      if(material.name==='tires'){material.color.set('#656565');material.roughness=.9;material.metalness=0;}
      if(material.name==='brake'){material.color.set('#b96a39');}
     }
     if(assembly.startsWith('door-')){const hinge=assembly==='door-left'?doorLeft:doorRight;mesh.geometry.translate(-hinge.position.x,-hinge.position.y,-hinge.position.z);hinge.add(mesh);}
     else{const group=new T.Group(),offset=new T.Vector3();group.add(mesh);car.add(group);
      if(assembly==='engine-cover')offset.set(0,.66,.10);
      else if(assembly==='bonnet')offset.set(0,.28,-.13);
      else if(assembly==='roof')offset.set(0,.24,0);
      else if(assembly==='rear-wing')offset.set(0,.15,.12);
      else if(assembly.startsWith('wheel-'))offset.set(assembly.includes('left')?-.22:.22,0,0);
      if(offset.lengthSq())parts.push({group,base:group.position.clone(),offset});
     }
    }
    const ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({color:0x000000,opacity:.32}));ground.rotation.x=-Math.PI/2;ground.position.y=-.015;ground.receiveShadow=true;scene.add(ground);
    const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=128;const cx=contactCanvas.getContext('2d')!,gradient=cx.createRadialGradient(64,64,4,64,64,63);gradient.addColorStop(0,'rgba(0,0,0,.55)');gradient.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=gradient;cx.fillRect(0,0,128,128);
    const contact=new T.Mesh(new T.PlaneGeometry(2.7,5.6),new T.MeshBasicMaterial({map:new T.CanvasTexture(contactCanvas),transparent:true,depthWrite:false,opacity:.6}));contact.rotation.x=-Math.PI/2;contact.position.y=-.009;scene.add(contact);
    scene.add(new T.HemisphereLight(0xe5edff,0x242421,.3));const key=new T.DirectionalLight(0xfff3e6,2.1);key.position.set(-3,7,-4);key.castShadow=true;key.shadow.mapSize.set(innerWidth<760?1024:2048,innerWidth<760?1024:2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.camera.near=.1;key.shadow.camera.far=20;key.shadow.normalBias=.015;key.shadow.bias=-.0001;key.shadow.radius=3;scene.add(key);
    const rim=new T.DirectionalLight(0xd9e8ff,.9);rim.position.set(4,4,4);scene.add(rim);
    const focus=new T.Vector3(),direction=new T.Vector3();
    let visible=true,raf=0,previous=0,dirty=true,lastW=0,lastH=0;
    const updateCaptions=()=>{const p=progress.current;panels.current?.querySelectorAll<HTMLElement>('.story-panel').forEach((panel,i)=>{const opacity=media.matches?(i===chapterAt(p)?1:0):captionAt(p,i);panel.style.setProperty('--reveal',String(opacity));panel.style.visibility=opacity<.001?'hidden':'visible';});const next=chapterAt(p);if(active.current!==next){active.current=next;setChapter(next)}section.current?.style.setProperty('--journey-progress',String(p));};
    function draw(){
     const shot=shotAt(progress.current),mobile=innerWidth<760;
     // Hinge at the A-pillar. Both complete door assemblies rotate upward and outward.
     doorLeft.rotation.set(-shot.doors*1.02,shot.doors*.18,-shot.doors*.48,'XYZ');doorRight.rotation.set(-shot.doors*1.02,-shot.doors*.18,shot.doors*.48,'XYZ');
     for(const part of parts)part.group.position.copy(part.base).addScaledVector(part.offset,shot.explode);
     focus.set(...shot.focus);const distance=shot.distance*Math.max(1,(mobile?1.35:1.5+.4*Math.min(1,progress.current/.12))/camera.aspect);
     direction.set(Math.sin(shot.az)*Math.cos(shot.elevation),Math.sin(shot.elevation),-Math.cos(shot.az)*Math.cos(shot.elevation));camera.position.copy(focus).addScaledVector(direction,distance);camera.lookAt(focus);camera.updateMatrixWorld();
     // Shift the projection, never crop or move the model into an opaque text column.
     const screenX=mobile?shot.screenX*.08:shot.screenX,screenY=mobile?.16+.16*ease(progress.current/.22):shot.screenY;
     camera.setViewOffset(lastW,lastH,-screenX*lastW/2,screenY*lastH/2,lastW,lastH);camera.updateMatrixWorld();
     car.updateMatrixWorld(true);
     updateCaptions();renderer!.render(scene,camera);dirty=false;
    }
    const measure=()=>{const w=mount.clientWidth,h=mount.clientHeight;if(w!==lastW||h!==lastH){lastW=w;lastH=h;renderer!.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;}};
    const scroll=()=>{if(!section.current||media.matches)return;const r=section.current.getBoundingClientRect(),stage=mount.parentElement!.clientHeight;target.current=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-stage)));};
    const ro=new ResizeObserver(()=>{measure();scroll()});ro.observe(mount);const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)dirty=true});observer.observe(mount);
    const onMotion=()=>{setReduce(media.matches);target.current=progress.current;dirty=true;scroll()};media.addEventListener('change',onMotion);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll,{passive:true});
    measure();scroll();progress.current=target.current;draw();setReady(true);renderRef.current=()=>{dirty=true;draw()};
    function animate(now:number){raf=requestAnimationFrame(animate);const dt=previous?(now-previous)/1000:1/60;previous=now;if(!visible||document.hidden)return;if(!media.matches&&Math.abs(target.current-progress.current)>.000001){progress.current=followScroll(progress.current,target.current,dt);dirty=true;}if(dirty)draw();}
    raf=requestAnimationFrame(animate);
    dispose=()=>{cancelAnimationFrame(raf);ro.disconnect();observer.disconnect();media.removeEventListener('change',onMotion);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);const materials=new Set<InstanceType<typeof T.Material>>(),textures=new Set<InstanceType<typeof T.Texture>>();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))}});materials.forEach(m=>{Object.values(m).forEach(v=>{if(v instanceof T.Texture)textures.add(v)});m.dispose()});textures.forEach(t=>t.dispose());env.dispose();renderer!.dispose();renderer!.domElement.remove();paint.current=null;renderRef.current=null;};
   }catch{renderer?.domElement.remove();renderer?.dispose();if(!cancelled)setFailed(true)}
  }
  init().catch(()=>{if(!cancelled)setFailed(true)});return()=>{cancelled=true;dispose()};
 },[]);
 function jump(i:number){if(reduce||failed){progress.current=stops[i];target.current=stops[i];setChapter(i);renderRef.current?.();return}if(!section.current)return;const r=section.current.getBoundingClientRect(),height=section.current.firstElementChild!.clientHeight;window.scrollTo({top:scrollY+r.top+stops[i]*(r.height-height),behavior:'smooth'});}
 const contents=[
  <div key="arrival" className="arrival-caption"><div className="hero-title"><span>McLaren</span><h1>P1 GTR.</h1></div><div className="hero-invitation"><p>Toronto. Meet extraordinary.</p><a href="#collection" className="text-link">The collection <ArrowUpRight size={16}/></a></div></div>,
  <div key="wings" className="detail-caption"><Title lines={['An entrance.','With wings.']}/><p>Doors rise. Everything else can wait.</p></div>,
  <div key="seat" className="detail-caption"><Title lines={['Your seat.','Centre stage.']}/><p>A cockpit built around the driver.</p></div>,
  <div key="engine" className="detail-caption"><Title lines={['Every part.','A purpose.']}/><p>A closer look beneath the bodywork.</p><div className="single-stat"><strong>1,000</strong><span>PS / HYBRID POWER</span></div></div>,
  <div key="specs" className="engineering-sheet"><Title lines={['Nothing','held back.']}/><dl><div><dt>Combined power</dt><dd>1,000 <small>PS</small></dd></div><div><dt>Powertrain</dt><dd>V8 <small>hybrid</small></dd></div><div><dt>Rear wing</dt><dd><small>Active DRS</small></dd></div><div><dt>Purpose</dt><dd><small>Track only</small></dd></div></dl><a href={factory} target="_blank" rel="noreferrer">McLaren specifications <ArrowUpRight size={12}/></a></div>,
  <div key="city" className="detail-caption"><Title lines={['Toronto.','A different','kind of rush.']}/><a href="/book" className="text-link">Let’s meet <ArrowUpRight size={16}/></a></div>,
  <div key="end" className="detail-caption"><Title lines={['Find your','next obsession.']}/><a href="#collection" className="button light">The collection <ArrowDown size={16}/></a></div>
 ];
 return <section ref={section} id="engineering" className={'spotlight-story smooth-story '+(reduce||failed?'spotlight-static':'')} aria-label="McLaren P1 GTR scroll experience"><div className="spotlight-stage">
  <div className="studio-pool"/>
  <div className={'vehicle-viewport '+(ready?'is-ready':'')} ref={canvas} role="img" aria-label="Copper McLaren P1 GTR with upward-opening doors and a gradual exploded engineering view"/>
  {!ready&&<div className="spotlight-poster">{failed&&<img src="/images/p1-poster.webp" alt="Copper McLaren P1 GTR studio study"/>}<span role="status">{failed?'Interactive view unavailable':'Loading the P1…'}</span></div>}
  <div className="story-overlay" ref={panels}>{contents.map((content,i)=><div className="story-panel" key={i} aria-hidden={chapter!==i} inert={chapter!==i} style={{'--reveal':i===chapter?1:0,visibility:i===chapter?'visible':'hidden'} as React.CSSProperties}>{content}</div>)}</div>
  <nav className="story-dial" aria-label="Car story chapters">{chapters.map((name,i)=><button key={name} aria-label={name} aria-current={i===chapter?'step':undefined} onClick={()=>jump(i)}><i/></button>)}</nav>
  <div className="story-bottom"><button onClick={()=>jump(chapter===6?0:chapter+1)}>{chapter===6?<RotateCcw size={13}/>:<ArrowDown size={13}/>}<span>{chapter===6?'Replay':reduce||failed?'Next view':'Keep scrolling'}</span></button><div className="story-finishes">{finishes.map(([name,colour],i)=><button key={name} title={name} aria-label={`${name} paint`} aria-pressed={finish===i} style={{background:colour}} disabled={!ready} onClick={()=>{setFinish(i);paint.current?.color.set(colour);renderRef.current?.()}}/>)}</div><a href="#collection">Skip to cars <ArrowUpRight size={12}/></a></div>
  <div className="journey-track"><div/></div>
 </div></section>;
}
