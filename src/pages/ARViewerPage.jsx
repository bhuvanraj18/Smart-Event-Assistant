import gsap from 'gsap';
import { Camera, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { MotionTracker } from '../utils/MotionTracker';

/* ====== THREE.JS DECORATION BUILDERS ====== */
function m(geo, mat, x=0, y=0, z=0, sx=1, sy=1, sz=1) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  if (sx!==1||sy!==1||sz!==1) mesh.scale.set(sx, sy, sz);
  return mesh;
}

function buildFlowerVase() {
  const g = new THREE.Group();
  g.add(m(new THREE.CylinderGeometry(0.25,0.35,0.6,16), new THREE.MeshStandardMaterial({color:0xc4a882,metalness:0.3,roughness:0.4}), 0,0.3,0));
  const cols=[0xff6b9d,0xff85a1,0xffc2d1,0xffb3c6,0xe0aaff,0xf8a4d0,0xd4a5ff];
  for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2,r=0.18+(i%3)*0.06,h=0.7+(i%2)*0.15;
    g.add(m(new THREE.SphereGeometry(0.07+(i%3)*0.02,8,8),new THREE.MeshStandardMaterial({color:cols[i]}),Math.cos(a)*r,h,Math.sin(a)*r));
    g.add(m(new THREE.CylinderGeometry(0.01,0.01,0.45,4),new THREE.MeshStandardMaterial({color:0x2d5a27}),Math.cos(a)*r,h-0.25,Math.sin(a)*r));
  }
  return g;
}
function buildChandelier() {
  const g=new THREE.Group(), gm=new THREE.MeshStandardMaterial({color:0xd4af37,metalness:0.8,roughness:0.2});
  g.add(new THREE.Mesh(new THREE.TorusGeometry(0.5,0.04,8,24),gm));
  g.add(new THREE.Mesh(new THREE.TorusGeometry(0.3,0.03,8,20),gm));
  for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2;g.add(m(new THREE.CylinderGeometry(0.015,0.015,0.8,4),new THREE.MeshStandardMaterial({color:0xb8960c,metalness:0.7}),Math.cos(a)*0.3,0.4,Math.sin(a)*0.3));}
  g.add(m(new THREE.SphereGeometry(0.08,8,8),gm,0,0.8,0));
  for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;
    g.add(m(new THREE.OctahedronGeometry(0.04),new THREE.MeshStandardMaterial({color:0xe8e8ff,transparent:true,opacity:0.7}),Math.cos(a)*0.5,-0.18,Math.sin(a)*0.5));
  }
  return g;
}
function buildBalloonArch() {
  const g=new THREE.Group(),cols=[0xff6b9d,0xffd700,0xffffff,0xff85a1,0xc4b5fd,0xfbbf24];
  for(let i=0;i<22;i++){const t=(i/21)*Math.PI;
    g.add(m(new THREE.SphereGeometry(0.08+((i*3)%4)*0.015,12,12),new THREE.MeshStandardMaterial({color:cols[i%6],metalness:0.1,roughness:0.3}),Math.cos(t)*1.2,Math.sin(t)*1.2,((i*7)%5-2)*0.06,1,1.15,1));
  }
  return g;
}
function buildDecoratedTable() {
  const g=new THREE.Group();
  g.add(m(new THREE.CylinderGeometry(0.7,0.7,0.05,24),new THREE.MeshStandardMaterial({color:0xf5f0e8}),0,0.5,0));
  g.add(m(new THREE.CylinderGeometry(0.06,0.08,0.5,8),new THREE.MeshStandardMaterial({color:0x8b7355}),0,0,0));
  g.add(m(new THREE.CylinderGeometry(0.04,0.04,0.25,8),new THREE.MeshStandardMaterial({color:0xffeedd,emissive:0xffcc66,emissiveIntensity:0.3}),0,0.65,0));
  return g;
}
function buildStageBackdrop() {
  const g=new THREE.Group();
  g.add(m(new THREE.BoxGeometry(2.5,2,0.05),new THREE.MeshStandardMaterial({color:0x1a1035}),0,1,0));
  g.add(m(new THREE.BoxGeometry(0.4,2.1,0.03),new THREE.MeshStandardMaterial({color:0x7c1a6e}),-1.1,1,0.05));
  g.add(m(new THREE.BoxGeometry(0.4,2.1,0.03),new THREE.MeshStandardMaterial({color:0x7c1a6e}),1.1,1,0.05));
  return g;
}
function buildPhotoBooth(){
  const g=new THREE.Group(), fm=new THREE.MeshStandardMaterial({color:0x2d5a27});
  const bm=new THREE.MeshStandardMaterial({color:0xf5f0e8,metalness:0.3,roughness:0.5});
  g.add(m(new THREE.BoxGeometry(1.2,2.2,0.08),bm,0,1.1,0));
  g.add(m(new THREE.BoxGeometry(1.0,2.0,0.02),new THREE.MeshStandardMaterial({color:0x222222}),0,1.1,0.06));
  for(let i=0;i<4;i++){const x=(-0.3+i*0.2),y=(0.4+Math.random()*0.4);g.add(m(new THREE.SphereGeometry(0.04,8,8),new THREE.MeshStandardMaterial({color:[0xff6b9d,0xffd700,0xffc2d1,0x9b59b6][i],emissive:[0xff6b9d,0xffd700,0xffc2d1,0x9b59b6][i],emissiveIntensity:0.4}),x,y,-0.03));}
  g.add(m(new THREE.BoxGeometry(1.4,0.08,1.2),new THREE.MeshStandardMaterial({color:0x8b6914}),0,2.3,-0.2));
  g.add(m(new THREE.BoxGeometry(0.12,0.5,0.12),fm,-0.65,0,-0.6));
  g.add(m(new THREE.BoxGeometry(0.12,0.5,0.12),fm,0.65,0,-0.6));
  return g;
}
function buildEntranceArch(){
  const g=new THREE.Group(),cm=new THREE.MeshStandardMaterial({color:0xf5f0e8,metalness:0.2,roughness:0.6});
  g.add(m(new THREE.CylinderGeometry(0.08,0.1,0.8,8),cm,-0.6,0.4,-0.1));
  g.add(m(new THREE.CylinderGeometry(0.08,0.1,0.8,8),cm,0.6,0.4,-0.1));
  const cols=[0xff6b9d,0xffc2d1,0xffb3c6,0xe0aaff,0xf8a4d0,0xd4a5ff,0xff85a1];
  for(let i=0;i<18;i++){const a=(i/18)*Math.PI+0.3,r=0.45,s=0.06+Math.random()*0.04;
    g.add(m(new THREE.SphereGeometry(s,8,8),new THREE.MeshStandardMaterial({color:cols[i%7]}),Math.cos(a)*r,-0.2+Math.sin(a)*r,-0.1));
  }
  for(let i=0;i<3;i++){g.add(m(new THREE.SphereGeometry(0.03,6,6),new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:0.5}),(-0.3+i*0.3),0.9,-0.1));}
  return g;
}

/* ── Color mapping helper ── */
function colorHex(name = '') {
  const map = {
    red: 0xe74c3c, pink: 0xff6b9d, rose: 0xff6b9d,
    orange: 0xe67e22, yellow: 0xf1c40f, gold: 0xffd700,
    green: 0x2ecc71, teal: 0x1abc9c, blue: 0x3498db,
    purple: 0x9b59b6, white: 0xf5f5f5, cream: 0xfff8e7,
    brown: 0x8b6914, black: 0x222222, gray: 0x95a5a6,
    silver: 0xc0c0c0, beige: 0xf5f0e8, violet: 0x9b59b6,
  };
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k)) return v;
  }
  return 0xcccccc;
}

/* ── Build primitive from description ── */
function primitiveFor(obj) {
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex(obj.color),
    metalness: obj.metalness ?? 0.1,
    roughness: obj.roughness ?? 0.7,
  });
  const w = obj.width ?? 0.4;
  const h = obj.height ?? 0.4;
  const d = obj.depth ?? 0.4;
  let geo;
  switch (obj.shape) {
    case 'sphere':    geo = new THREE.SphereGeometry(w / 2, 16, 12); break;
    case 'cylinder':  geo = new THREE.CylinderGeometry(w / 2, w / 2, h, 16); break;
    case 'cone':      geo = new THREE.ConeGeometry(w / 2, h, 16); break;
    case 'torus':     geo = new THREE.TorusGeometry(w / 2, w / 8, 8, 24); break;
    default:          geo = new THREE.BoxGeometry(w, h, d); break;
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(obj.x ?? 0, obj.y ?? 0, obj.z ?? 0);
  return mesh;
}

const BUILDERS={flower:buildFlowerVase,chandelier:buildChandelier,balloons:buildBalloonArch,table:buildDecoratedTable,stage:buildStageBackdrop,photobooth:buildPhotoBooth,entrance:buildEntranceArch};

async function generateGLB(type){
  const scene=new THREE.Scene();scene.add(BUILDERS[type]());scene.add(new THREE.AmbientLight(0xffffff,0.8));
  const d=new THREE.DirectionalLight(0xffffff,1.2);d.position.set(5,8,5);scene.add(d);
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(scene, (glb) => {
      resolve(URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' })));
    }, (err) => { console.error('GLB export error:', err); reject(err); }, { binary: true });
  });
}

async function imageToGLB(src){
  const prompt = `Analyse this decoration/event image and return ONLY a JSON array of objects.
Each object must have these fields:
  shape   — one of: box, sphere, cylinder, cone, torus
  color   — descriptive color name (e.g. "gold", "pink", "white")
  width   — width in metres (0.05 – 2.0)
  height  — height in metres (0.05 – 2.0)
  depth   — depth in metres (0.05 – 1.0)
  x       — horizontal centre position in metres (-2 to 2)
  y       — vertical centre position in metres (0 to 3)
  z       — depth position in metres (-1 to 1, background items negative)
  metalness — 0.0 to 1.0 (shiny = high)
  roughness — 0.0 to 1.0 (matte = high)

Describe 6–14 objects that together represent what is in the image in 3D.
Reply with the raw JSON array only — no markdown, no explanation.`;

  let objects;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: src.split(',')[1] } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });
    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text ?? '[]';
    objects = JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (err) {
    console.error('Claude scene analysis failed, using fallback', err);
    objects = [
      { shape: 'box',    color: 'pink',  width: 1.2, height: 0.05, depth: 1.2, x: 0, y: 0,    z: 0 },
      { shape: 'sphere', color: 'gold',  width: 0.4, height: 0.4,  depth: 0.4, x: 0, y: 0.45, z: 0, metalness: 0.7, roughness: 0.2 },
      { shape: 'box',    color: 'white', width: 0.8, height: 0.8,  depth: 0.05, x: 0, y: 0.7,  z: -0.5 },
    ];
  }

  const scene = new THREE.Scene();
  objects.forEach(o => scene.add(primitiveFor(o)));
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(5, 8, 5);
  scene.add(dir);

  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      glb => resolve(URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }))),
      err => { console.error('GLB export error:', err); reject(err); },
      { binary: true }
    );
  });
}

const MODELS=[
  {id:'flower',name:'Flower Vase',emoji:'💐'},{id:'chandelier',name:'Chandelier',emoji:'🪔'},
  {id:'balloons',name:'Balloon Arch',emoji:'🎈'},{id:'table',name:'Table Setup',emoji:'🍽️'},
  {id:'stage',name:'Stage',emoji:'🎭'},{id:'photobooth',name:'Photo Booth',emoji:'📸'},
  {id:'entrance',name:'Entrance Arch',emoji:'🌸'},
];

/* ====== COMPONENT ====== */
const ARViewerPage = ({ externalImage, onClearExternal }) => {
  const [selectedModel, setSelectedModel] = useState('flower');
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [arPhase, setArPhase] = useState('scan');
  const [scanProgress, setScanProgress] = useState(0);
  const [modelPos, setModelPos] = useState({ x: 0, y: 0 });
  const [modelSize, setModelSize] = useState(320);

  const sectionRef = useRef(null);
  const modelViewerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const trackerRef = useRef(null);
  const rafRef = useRef(null);
  const baseScreenPos = useRef({ x: 0, y: 0 });
  const lastMotion = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        gsap.fromTo(sectionRef.current?.querySelector('.ar-intro'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Load default model on mount
  useEffect(() => {
    if (uploadedImage || externalImage) return;
    let cancel = false;
    generateGLB('flower').then(u => {
      if (!cancel) { setModelUrl(u); setLoading(false); }
    }).catch(() => setLoading(false));
    return () => { cancel = true; };
  }, []);

  // Handle model selection change
  useEffect(() => {
    if (uploadedImage || externalImage) return;
    let cancel = false;
    const loadingTimer = window.setTimeout(() => setLoading(true), 0);
    generateGLB(selectedModel).then(u => {
      if (!cancel) { setModelUrl(u); setLoading(false); }
    }).catch(() => setLoading(false));
    return () => { cancel = true; window.clearTimeout(loadingTimer); };
  }, [selectedModel, uploadedImage, externalImage]);

  useEffect(() => {
    if (!externalImage) return;
    let cancel = false;
    const loadingTimer = window.setTimeout(() => setLoading(true), 0);
    imageToGLB(externalImage).then(u => { if (!cancel) { setModelUrl(u); setLoading(false); setUploadedImage(null); } }).catch(() => setLoading(false));
    return () => { cancel = true; window.clearTimeout(loadingTimer); };
  }, [externalImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => { setLoading(true); setUploadedImage(ev.target.result); setModelUrl(await imageToGLB(ev.target.result)); setLoading(false); };
    reader.readAsDataURL(file); e.target.value = '';
  };

  const clearUpload = () => { setUploadedImage(null); onClearExternal?.(); setLoading(true); generateGLB(selectedModel).then(u=>{setModelUrl(u);setLoading(false);}); };
  const launchNativeAR = useCallback(() => { modelViewerRef.current?.activateAR?.(); }, []);

  const startCamera = async () => {
    setCameraError('');
    setArPhase('scan');
    setScanProgress(0);
    const tries = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment' } },
      { video: true },
    ];
    let stream = null;
    for (const c of tries) { try { stream = await navigator.mediaDevices.getUserMedia(c); break; } catch (e) { console.warn(e.message); } }
    if (stream) { streamRef.current = stream; setCameraActive(true); }
    else { setCameraError('Could not access camera.'); }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      try {
        videoRef.current.srcObject = streamRef.current;
        setTimeout(() => {
          videoRef.current?.play().catch(err => {
            console.error('Video play error:', err);
            setCameraError('Could not start video playback');
          });
        }, 100);
      } catch (err) {
        console.error('Error setting video stream:', err);
        setCameraError('Error initializing camera stream');
      }
    }
  }, [cameraActive]);

  useEffect(() => {
    if (!cameraActive || arPhase !== 'scan') return;
    let p = 0;
    const id = setInterval(() => { p += 2; setScanProgress(Math.min(p, 100)); if (p >= 100) clearInterval(id); }, 60);
    return () => clearInterval(id);
  }, [cameraActive, arPhase]);

  useEffect(() => {
    if (arPhase !== 'placed' || !cameraActive) return;
    trackerRef.current = new MotionTracker();
    const video = videoRef.current;
    const scaleX = window.innerWidth / 64;
    const scaleY = window.innerHeight / 48;
    const loop = () => {
      if (!video || video.readyState < 2) { rafRef.current = requestAnimationFrame(loop); return; }
      const motion = trackerRef.current.track(video);
      if (motion.x !== lastMotion.current.x || motion.y !== lastMotion.current.y) {
        lastMotion.current = { x: motion.x, y: motion.y };
        setModelPos({ x: baseScreenPos.current.x - motion.x * scaleX, y: baseScreenPos.current.y - motion.y * scaleY });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); trackerRef.current = null; };
  }, [arPhase, cameraActive]);

  const handlePlace = (e) => {
    if (scanProgress < 100) return;
    e.stopPropagation();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.5;
    baseScreenPos.current = { x: cx, y: cy };
    lastMotion.current = { x: 0, y: 0 };
    setModelPos({ x: cx, y: cy });
    setArPhase('placed');
  };

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null; trackerRef.current = null;
    setCameraActive(false); setArPhase('scan'); setScanProgress(0);
  };

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <>
      <section id="ar-preview" className="section section-cream" ref={sectionRef}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Augmented Reality</div>
            <h2>Live AR Decoration<br />Preview</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem', maxWidth: '500px', margin: '1rem auto 0' }}>
              View 3D decorations and place them in your real space.
              {!uploadedImage && !externalImage && selectedModel && (
                <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: 500 }}>
                  ✨ Previewing: {MODELS.find(m => m.id === selectedModel)?.name}
                </span>
              )}
            </p>
          </div>

          <div className="ar-intro" style={{ width: '100%', maxWidth: '750px' }}>
            {/* Featured decoration info */}
            {!uploadedImage && !externalImage && selectedModel && (
              <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(192,132,252,0.1), rgba(129,143,248,0.1))', borderRadius: '12px', border: '1px solid rgba(192,132,252,0.3)', marginBottom: '1.5rem', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Featured Decoration</p>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {MODELS.find(m => m.id === selectedModel)?.emoji} {MODELS.find(m => m.id === selectedModel)?.name}
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Ready to place in AR →</p>
              </div>
            )}
            {/* 3D Viewer */}
            <div className="ar-viewer-box">
              {loading && (
                <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:5,color:'var(--text-muted)' }}>
                  <div style={{textAlign:'center'}}>
                    <div style={{width:40,height:40,border:'3px solid rgba(139,105,20,0.3)',borderTopColor:'var(--accent-gold)',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 1rem'}}/>
                    <p>Generating 3D model...</p>
                  </div>
                </div>
              )}
              {modelUrl && (
                <model-viewer ref={modelViewerRef} src={modelUrl} ar ar-modes="webxr scene-viewer quick-look" ar-scale="auto" camera-controls touch-action="pan-y" auto-rotate shadow-intensity="1.2" shadow-softness="1" environment-image="neutral" exposure="1.2" camera-orbit="30deg 65deg auto" style={{width:'100%',height:'100%',background:'transparent'}}>
                  <button slot="ar-button" style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',padding:'0.85rem 2.2rem',border:'none',cursor:'pointer',background:'var(--bg-dark)',color:'white',fontWeight:700,fontSize:'0.85rem',fontFamily:'Inter,sans-serif',letterSpacing:'0.05em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:'0.6rem',zIndex:10}}>
                    <Camera size={16}/> View in Your Space
                  </button>
                </model-viewer>
              )}
            </div>

            {/* Buttons */}
            <div style={{ padding: '1.25rem 0', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={launchNativeAR} disabled={!modelUrl||loading}>
                📱 Mobile AR
              </button>
              <button className="btn btn-outline" onClick={startCamera} disabled={!modelUrl||loading}>
                <Camera size={14}/> Desktop Camera
              </button>
              {cameraError && <p style={{color:'var(--accent-rose)',fontSize:'0.8rem',width:'100%',textAlign:'center'}}>{cameraError}</p>}
            </div>

            {/* Controls */}
            <div className="card" style={{ padding: '1.5rem' }}>
              {!uploadedImage && !externalImage && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{color:'var(--text-muted)',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.75rem'}}>🎨 Quick Select (tap to preview)</p>
                  <div className="ar-model-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    {MODELS.map(mod=>(
                      <button key={mod.id} onClick={()=>{setSelectedModel(mod.id);setUploadedImage(null);onClearExternal?.();}} className={`btn ${selectedModel===mod.id?'btn-primary':'btn-outline'}`} style={{padding:'0.75rem 1rem',fontSize:'0.85rem',textTransform:'none',letterSpacing:'0',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.4rem',transition:'all 0.2s'}}>
                        <span style={{fontSize:'1.5rem'}}>{mod.emoji}</span>
                        <span style={{fontSize:'0.75rem',fontWeight:600}}>{mod.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {(uploadedImage||externalImage) && (
                <div style={{marginBottom:'1rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
                  <p style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>{uploadedImage?'📷 Uploaded → 3D':'🎨 AI suggestion → 3D'}</p>
                  <button className="btn btn-outline" onClick={clearUpload} style={{padding:'0.4rem 0.8rem',fontSize:'0.75rem',textTransform:'none'}}><Trash2 size={13}/> Back to presets</button>
                </div>
              )}
              <div style={{display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap'}}>
                <label className="btn btn-outline" style={{cursor:'pointer',textTransform:'none',letterSpacing:'0'}}>
                  <Upload size={14}/> Upload 2D Image → 3D
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}}/>
                </label>
              </div>
              <div className="ar-info-box">
                <p>
                  <strong style={{color:'var(--text-dark)',fontSize:'1rem'}}>💡 How it works:</strong><br/>
                  <span style={{fontSize:'0.9rem',lineHeight:'1.6',display:'block',marginTop:'0.5rem'}}>
                    • <strong>Mobile AR:</strong> Uses your phone's AR to place & lock the decoration in your real room<br/>
                    • <strong>Desktop Camera:</strong> Opens webcam with motion tracking — the decoration stays fixed as you move the camera in the AR visualization
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FULLSCREEN CAMERA AR ====== */}
      {cameraActive && (
        <div className="ar-fullscreen">
          <video ref={videoRef} autoPlay playsInline muted webkit-playsinline style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:0,display:'block',background:'#000'}}/>

          {arPhase === 'scan' && (
            <div style={{position:'absolute',inset:0,zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <div style={{position:'relative',width:180,height:180}}>
                <div style={{position:'absolute',inset:0,border:'3px solid rgba(139,105,20,0.6)',borderRadius:'50%',animation:'arPulse 2s ease-in-out infinite'}}/>
                <div style={{position:'absolute',top:'15%',left:'15%',width:'70%',height:'70%',border:'2px dashed rgba(139,105,20,0.4)',borderRadius:'50%',animation:'arSpin 8s linear infinite'}}/>
                <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:12,height:12,background:'var(--accent-gold)',borderRadius:'50%',boxShadow:'0 0 20px rgba(139,105,20,0.8)'}}/>
              </div>
              <div style={{marginTop:'2rem',width:200,height:4,background:'rgba(255,255,255,0.15)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',background:'linear-gradient(90deg,#8b6914,#a0784c)',borderRadius:2,width:`${scanProgress}%`,transition:'width 0.3s ease'}}/>
              </div>
              <p style={{marginTop:'1.5rem',color:'white',fontSize:'1rem',fontWeight:500,textShadow:'0 2px 8px rgba(0,0,0,0.7)'}}>
                {scanProgress<100?'Scanning your space...':'Surface detected!'}
              </p>
              {scanProgress>=100 && (
                <button onClick={handlePlace} style={{marginTop:'1.5rem',padding:'0.85rem 2.5rem',border:'none',cursor:'pointer',background:'var(--bg-dark)',color:'white',fontWeight:600,fontSize:'0.85rem',fontFamily:'Inter,sans-serif',letterSpacing:'0.05em',textTransform:'uppercase',animation:'arFadeIn 0.5s ease'}}>
                  ✓ Place Decoration Here
                </button>
              )}
            </div>
          )}

          {arPhase === 'placed' && modelUrl && (
            <div style={{position:'absolute',left:modelPos.x,top:modelPos.y,transform:'translate(-50%,-50%)',width:modelSize,height:modelSize,zIndex:3,pointerEvents:'none',transition:'left 0.05s linear,top 0.05s linear'}}>
              <model-viewer src={modelUrl} interaction-prompt="none" shadow-intensity="0.8" exposure="1.5" environment-image="neutral" auto-rotate rotation-per-second="15deg" camera-orbit="0deg 65deg auto" disable-tap disable-zoom style={{width:'100%',height:'100%',background:'transparent','--poster-color':'transparent',pointerEvents:'none'}}/>
              <div style={{position:'absolute',bottom:'5%',left:'50%',transform:'translateX(-50%)',width:'60%',height:12,background:'radial-gradient(ellipse,rgba(0,0,0,0.35) 0%,transparent 70%)',borderRadius:'50%',filter:'blur(4px)'}}/>
            </div>
          )}

          <div className="ar-top-bar">
            <span style={{color:'white',fontWeight:700,fontSize:'1.1rem',display:'flex',alignItems:'center',gap:'0.5rem',textShadow:'0 2px 4px rgba(0,0,0,0.5)'}}>
              <Camera size={18}/> {arPhase==='scan'?'Scanning...':'Decoration Placed ✓'}
            </span>
            <button className="btn-danger" onClick={stopCamera}>✕ Exit</button>
          </div>

          {arPhase === 'placed' && (
            <div style={{position:'absolute',bottom:'1.5rem',left:'50%',transform:'translateX(-50%)',zIndex:10,display:'flex',gap:'0.75rem',alignItems:'center'}}>
              <button onClick={(e)=>{e.stopPropagation();setModelSize(s=>Math.max(150,s-40));}} style={{width:44,height:44,borderRadius:'50%',border:'none',background:'rgba(0,0,0,0.6)',backdropFilter:'blur(10px)',color:'white',fontSize:'1.3rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
              <div style={{background:'rgba(0,0,0,0.6)',backdropFilter:'blur(10px)',padding:'0.65rem 1.2rem',borderRadius:30,color:'white',fontSize:'0.8rem',textAlign:'center'}}>
                Locked in place • Move camera to see from different angles
              </div>
              <button onClick={(e)=>{e.stopPropagation();setModelSize(s=>Math.min(600,s+40));}} style={{width:44,height:44,borderRadius:'50%',border:'none',background:'rgba(0,0,0,0.6)',backdropFilter:'blur(10px)',color:'white',fontSize:'1.3rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
            </div>
          )}

          <style>{`
            @keyframes arPulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.08);opacity:1}}
            @keyframes arSpin{100%{transform:rotate(360deg)}}
            @keyframes arFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
          `}</style>
        </div>
      )}
    </>
  );
};

export default ARViewerPage;
