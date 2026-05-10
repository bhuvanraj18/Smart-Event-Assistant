import { Download, Grid3x3, RotateCw, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import './ARDecorationBuilder.css';

const ARDecorationBuilder = () => {
  // ─── STATE ───
  const [imageB64, setImageB64] = useState(null);
  const [sampleMode, setSampleMode] = useState(null);
  const [objects, setObjects] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', msg: 'Ready to generate 3D scenes', spin: false });
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(1.2);
  const [styleSelect, setStyleSelect] = useState('realistic');
  const [countSelect, setCountSelect] = useState('8-12');
  const [generateLoading, setGenerateLoading] = useState(false);

  // ─── THREE.JS REFS ───
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneGroupRef = useRef(null);
  const materialsRef = useRef([]);
  const clockRef = useRef(new THREE.Clock());

  // ─── CAMERA CONTROL ───
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ theta: 0, phi: Math.PI / 3, radius: 6 });
  const targetRef = useRef({ theta: 0, phi: Math.PI / 3 });

  // ─── SAMPLE SCENES ───
  const sampleScenes = {
    balloon_arch: [
      {shape:'sphere',color:'pink',width:0.22,height:0.22,depth:0.22,x:-1.1,y:0.11,z:0},{shape:'sphere',color:'gold',width:0.28,height:0.28,depth:0.28,x:-0.85,y:0.14,z:0,metalness:0.7,roughness:0.2},
      {shape:'sphere',color:'white',width:0.18,height:0.18,depth:0.18,x:-1.2,y:0.34,z:0.05},{shape:'sphere',color:'rose',width:0.24,height:0.24,depth:0.24,x:-0.95,y:0.45,z:-0.05},
      {shape:'sphere',color:'gold',width:0.2,height:0.2,depth:0.2,x:-0.68,y:0.7,z:0,metalness:0.7,roughness:0.2},{shape:'sphere',color:'pink',width:0.26,height:0.26,depth:0.26,x:-0.45,y:0.95,z:0.04},
      {shape:'sphere',color:'white',width:0.2,height:0.2,depth:0.2,x:-0.2,y:1.15,z:-0.04},{shape:'sphere',color:'lavender',width:0.22,height:0.22,depth:0.22,x:0,y:1.25,z:0},
      {shape:'sphere',color:'pink',width:0.26,height:0.26,depth:0.26,x:0.2,y:1.15,z:0.04},{shape:'sphere',color:'gold',width:0.2,height:0.2,depth:0.2,x:0.45,y:0.95,z:-0.04,metalness:0.7,roughness:0.2},
      {shape:'sphere',color:'rose',width:0.24,height:0.24,depth:0.24,x:0.68,y:0.7,z:0},{shape:'sphere',color:'white',width:0.18,height:0.18,depth:0.18,x:0.95,y:0.45,z:0.05},
      {shape:'sphere',color:'pink',width:0.22,height:0.22,depth:0.22,x:1.1,y:0.11,z:0},{shape:'sphere',color:'gold',width:0.28,height:0.28,depth:0.28,x:0.85,y:0.14,z:0,metalness:0.7,roughness:0.2},
      {shape:'box',color:'white',width:2.5,height:0.04,depth:1.2,x:0,y:0,z:0},{shape:'cylinder',color:'silver',width:0.03,height:2.0,depth:0.03,x:-1.15,y:1.0,z:0,metalness:0.8,roughness:0.2},
      {shape:'cylinder',color:'silver',width:0.03,height:2.0,depth:0.03,x:1.15,y:1.0,z:0,metalness:0.8,roughness:0.2}
    ],
    floral_wall: [
      {shape:'box',color:'white',width:3.0,height:2.2,depth:0.1,x:0,y:1.1,z:-0.5},
      {shape:'sphere',color:'rose',width:0.22,height:0.22,depth:0.22,x:-0.9,y:1.8,z:0},{shape:'sphere',color:'pink',width:0.18,height:0.18,depth:0.18,x:-0.65,y:1.65,z:0.05},
      {shape:'sphere',color:'red',width:0.2,height:0.2,depth:0.2,x:-0.4,y:1.85,z:0},{shape:'sphere',color:'cream',width:0.15,height:0.15,depth:0.15,x:-0.15,y:1.7,z:0.04},
      {shape:'sphere',color:'magenta',width:0.22,height:0.22,depth:0.22,x:0.1,y:1.9,z:0},{shape:'sphere',color:'pink',width:0.19,height:0.19,depth:0.19,x:0.38,y:1.72,z:0.05},
      {shape:'sphere',color:'rose',width:0.24,height:0.24,depth:0.24,x:0.65,y:1.85,z:0},{shape:'sphere',color:'red',width:0.18,height:0.18,depth:0.18,x:0.9,y:1.68,z:0.04},
      {shape:'sphere',color:'pink',width:0.2,height:0.2,depth:0.2,x:-0.55,y:1.35,z:0.02},{shape:'sphere',color:'rose',width:0.22,height:0.22,depth:0.22,x:0,y:1.25,z:0.02},
      {shape:'sphere',color:'magenta',width:0.19,height:0.19,depth:0.19,x:0.55,y:1.38,z:0.02},
      {shape:'cylinder',color:'sage',width:0.04,height:0.35,depth:0.04,x:-0.7,y:1.0,z:0,rotateX:0.2},{shape:'cylinder',color:'green',width:0.04,height:0.4,depth:0.04,x:0,y:1.0,z:0},
      {shape:'cylinder',color:'sage',width:0.04,height:0.35,depth:0.04,x:0.7,y:1.0,z:0,rotateX:-0.15},
      {shape:'box',color:'white',width:3.0,height:0.08,depth:0.9,x:0,y:0,z:0}
    ],
    wedding_table: [
      {shape:'cylinder',color:'white',width:1.8,height:0.06,depth:1.8,x:0,y:0.75,z:0},{shape:'cylinder',color:'beige',width:0.12,height:0.75,depth:0.12,x:0,y:0.375,z:0},
      {shape:'cylinder',color:'white',width:0.12,height:0.06,depth:0.12,x:-0.35,y:0.88,z:0},{shape:'cylinder',color:'gold',width:0.04,height:0.22,depth:0.04,x:-0.35,y:1.0,z:0,metalness:0.8,roughness:0.2},
      {shape:'sphere',color:'yellow',width:0.045,height:0.045,depth:0.045,x:-0.35,y:1.12,z:0,metalness:0.2,roughness:0.4},
      {shape:'cylinder',color:'white',width:0.12,height:0.06,depth:0.12,x:0.35,y:0.88,z:0},{shape:'cylinder',color:'gold',width:0.04,height:0.22,depth:0.04,x:0.35,y:1.0,z:0,metalness:0.8,roughness:0.2},
      {shape:'sphere',color:'yellow',width:0.045,height:0.045,depth:0.045,x:0.35,y:1.12,z:0,metalness:0.2,roughness:0.4},
      {shape:'sphere',color:'rose',width:0.12,height:0.12,depth:0.12,x:0,y:0.94,z:0},{shape:'sphere',color:'white',width:0.08,height:0.08,depth:0.08,x:0.12,y:0.91,z:0.08},
      {shape:'sphere',color:'pink',width:0.09,height:0.09,depth:0.09,x:-0.1,y:0.92,z:-0.09},{shape:'cylinder',color:'sage',width:0.015,height:0.2,depth:0.015,x:0.08,y:0.86,z:0.06},
      {shape:'cylinder',color:'sage',width:0.015,height:0.18,depth:0.015,x:-0.07,y:0.87,z:-0.07},
      {shape:'box',color:'ivory',width:2.4,height:0.01,depth:1.8,x:0,y:0.79,z:0}
    ],
    stage_setup: [
      {shape:'box',color:'navy',width:3.2,height:2.4,depth:0.08,x:0,y:1.2,z:-1},{shape:'box',color:'purple',width:0.35,height:2.4,depth:0.12,x:-1.4,y:1.2,z:-0.95},
      {shape:'box',color:'purple',width:0.35,height:2.4,depth:0.12,x:1.4,y:1.2,z:-0.95},
      {shape:'sphere',color:'yellow',width:0.18,height:0.18,depth:0.18,x:-0.9,y:2.2,z:-0.3,metalness:0.1,roughness:0.2},{shape:'sphere',color:'gold',width:0.18,height:0.18,depth:0.18,x:0,y:2.3,z:-0.3,metalness:0.1,roughness:0.2},
      {shape:'sphere',color:'yellow',width:0.18,height:0.18,depth:0.18,x:0.9,y:2.2,z:-0.3,metalness:0.1,roughness:0.2},
      {shape:'cylinder',color:'charcoal',width:0.07,height:1.6,depth:0.07,x:-0.9,y:0.8,z:-0.3},{shape:'cylinder',color:'charcoal',width:0.07,height:1.6,depth:0.07,x:0,y:0.9,z:-0.3},
      {shape:'cylinder',color:'charcoal',width:0.07,height:1.6,depth:0.07,x:0.9,y:0.8,z:-0.3},
      {shape:'box',color:'charcoal',width:3.2,height:0.18,depth:1.4,x:0,y:0.09,z:-0.3},{shape:'box',color:'black',width:3.6,height:0.04,depth:2.0,x:0,y:0,z:0},
      {shape:'cylinder',color:'silver',width:0.06,height:1.8,depth:0.06,x:-1.55,y:0.9,z:0.1,metalness:0.8,roughness:0.2},{shape:'cylinder',color:'silver',width:0.06,height:1.8,depth:0.06,x:1.55,y:0.9,z:0.1,metalness:0.8,roughness:0.2}
    ]
  };

  // ─── COLOR MAP ───
  const colorMap = {
    red:0xe74c3c, crimson:0xdc143c, pink:0xff85a1, rose:0xff6b9d, hotpink:0xff69b4, magenta:0xff00ff,
    orange:0xe67e22, coral:0xff7f7f, salmon:0xfa8072,
    yellow:0xf1c40f, gold:0xffd700, amber:0xffa500, cream:0xfff8e7, ivory:0xfffff0, beige:0xf5f0e8,
    green:0x2ecc71, lime:0x7fff00, mint:0x98ff98, teal:0x1abc9c, sage:0x87ae73, olive:0x808000,
    blue:0x3498db, navy:0x001f5b, sky:0x87ceeb, cyan:0x00ffff, aqua:0x00ffff, cobalt:0x0047ab,
    purple:0x9b59b6, violet:0xee82ee, lavender:0xe6e6fa, lilac:0xc8a2c8, mauve:0xe0b0ff, indigo:0x4b0082,
    white:0xf8f8f8, snow:0xfffafa, silver:0xc0c0c0, gray:0x95a5a6, grey:0x95a5a6,
    brown:0x8b6914, chocolate:0x7b3f00, tan:0xd2b48c, caramel:0xc68642,
    black:0x1a1a2e, charcoal:0x2f4f4f, ebony:0x1a1a1a,
  };

  const resolveColor = (name = '') => {
    const lo = name.toLowerCase().replace(/[^a-z]/g, '');
    if (colorMap[lo]) return colorMap[lo];
    for (const [k, v] of Object.entries(colorMap)) {
      if (lo.includes(k)) return v;
    }
    return 0xcccccc;
  };

  const colorSwatch = (name) => {
    try {
      const hex = resolveColor(name);
      const r = (hex >> 16) & 0xff, g = (hex >> 8) & 0xff, b = hex & 0xff;
      return `rgb(${r},${g},${b})`;
    } catch { return '#888'; }
  };

  // ─── BUILD MESH ───
  const buildMesh = (obj) => {
    const c = resolveColor(obj.color);
    const metalness = obj.metalness ?? (obj.color?.toLowerCase().includes('gold') || obj.color?.toLowerCase().includes('silver') || obj.color?.toLowerCase().includes('chrome') ? 0.7 : 0.1);
    const roughness = obj.roughness ?? 0.6;
    const mat = new THREE.MeshStandardMaterial({ color: c, metalness, roughness });
    materialsRef.current.push(mat);

    const w = Math.max(0.05, obj.width ?? 0.4);
    const h = Math.max(0.05, obj.height ?? 0.4);
    const d = Math.max(0.05, obj.depth ?? w);

    let geo;
    const s = (obj.shape || 'box').toLowerCase();
    if (s === 'sphere') geo = new THREE.SphereGeometry(w / 2, 20, 16);
    else if (s === 'cylinder') geo = new THREE.CylinderGeometry(w / 2, w / 2 * 1.05, h, 20);
    else if (s === 'cone') geo = new THREE.ConeGeometry(w / 2, h, 16);
    else if (s === 'torus') geo = new THREE.TorusGeometry(w / 2, Math.min(w / 6, 0.08), 10, 28);
    else if (s === 'capsule') geo = new THREE.CylinderGeometry(w / 2, w / 2, h - w, 12, 1, false);
    else if (s === 'octahedron') geo = new THREE.OctahedronGeometry(w / 2);
    else if (s === 'tetrahedron') geo = new THREE.TetrahedronGeometry(w / 2);
    else geo = new THREE.BoxGeometry(w, h, d, 1, 1, 1);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(obj.x ?? 0, obj.y ?? h / 2, obj.z ?? 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (obj.rotateY) mesh.rotation.y = obj.rotateY;
    if (obj.rotateX) mesh.rotation.x = obj.rotateX;
    return mesh;
  };

  // ─── THREE.JS SETUP ───
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 12, 25);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(6, 10, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.camera.left = dirLight.shadow.camera.bottom = -8;
    dirLight.shadow.camera.right = dirLight.shadow.camera.top = 8;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xc084fc, 0.3);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.2);
    rimLight.position.set(0, -2, -6);
    scene.add(rimLight);

    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    function resize() {
      const pane = document.getElementById('viewerPane');
      if (!pane) return;
      const w = pane.clientWidth, h = pane.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    const clock = new THREE.Clock();
    clockRef.current = clock;

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (autoRotate) {
        targetRef.current.theta += 0.003;
      }
      sphericalRef.current.theta += (targetRef.current.theta - sphericalRef.current.theta) * 0.08;
      sphericalRef.current.phi += (targetRef.current.phi - sphericalRef.current.phi) * 0.08;

      const s = sphericalRef.current;
      camera.position.x = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.y = s.radius * Math.cos(s.phi) + 1;
      camera.position.z = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.lookAt(0, 1, 0);

      if (sceneGroupRef.current) {
        sceneGroupRef.current.children.forEach((c, i) => {
          c.position.y += Math.sin(t * 0.8 + i * 0.4) * 0.0008;
        });
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [autoRotate]);

  // ─── MOUSE EVENTS ───
  const handleMouseDown = useCallback((e) => {
    setIsMouseDown(true);
    setAutoRotate(false);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isMouseDown) return;
    const dx = (e.clientX - lastMouseRef.current.x) * 0.008;
    const dy = (e.clientY - lastMouseRef.current.y) * 0.008;
    targetRef.current.theta -= dx;
    targetRef.current.phi = Math.max(0.1, Math.min(Math.PI * 0.9, targetRef.current.phi + dy));
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, [isMouseDown]);

  const handleWheel = useCallback((e) => {
    sphericalRef.current.radius = Math.max(1.5, Math.min(15, sphericalRef.current.radius + e.deltaY * 0.01));
  }, []);

  // ─── FILE UPLOAD ───
  const handleFile = (file) => {
    if (!file) return;
    setSampleMode(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result.split(',')[1];
      setImageB64(b64);
      setStatus({ type: 'idle', msg: '✓ Image loaded — click Build 3D Scene', spin: false });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFile(e.dataTransfer.files[0]);
  };

  // ─── SAMPLES ───
  const applySample = (key) => {
    setSampleMode(key);
    setImageB64(null);
    const names = { balloon_arch: 'Balloon Arch', floral_wall: 'Floral Wall', wedding_table: 'Wedding Table', stage_setup: 'Stage Setup' };
    setStatus({ type: 'idle', msg: `✓ "${names[key]}" preset selected — click Build 3D Scene`, spin: false });
  };

  // ─── GENERATE ───
  const generate = async () => {
    setGenerateLoading(true);
    setStatus({ type: 'loading', msg: 'Analysing image with Claude…', spin: true });

    let generatedObjects;

    if (sampleMode && sampleScenes[sampleMode]) {
      generatedObjects = sampleScenes[sampleMode];
      setStatus({ type: 'loading', msg: 'Building 3D scene…', spin: true });
    } else if (imageB64) {
      try {
        const styleNote = styleSelect === 'stylized' ? 'Use bright saturated colors and exaggerated proportions.' : styleSelect === 'minimal' ? 'Use muted colors and simple geometric approximations.' : 'Be as accurate to the image as possible.';
        const prompt = `You are a 3D scene builder. Analyse this decoration image and return ONLY a JSON array of ${countSelect} objects representing the 3D scene.

Each object must have:
- shape: one of "box", "sphere", "cylinder", "cone", "torus", "capsule", "octahedron"
- color: descriptive English color name (e.g. "dusty rose", "chrome silver", "forest green")
- width: metres 0.05-2.5 (X axis)
- height: metres 0.05-3.0 (Y axis, vertical)
- depth: metres 0.05-1.5 (Z axis)  
- x: horizontal position metres, -2.0 to 2.0
- y: vertical position metres, 0.0 to 3.5 (base of object, not centre)
- z: depth position metres, -1.5 to 0.5 (background = negative)
- metalness: 0.0-1.0
- roughness: 0.0-1.0

Rules:
- Ground/floor objects should have y=0
- Stack objects correctly (a vase on a table = table y=0, vase y=table_height)
- Spread decorations naturally in the scene
- Include a ground or backdrop element
- ${styleNote}
- Return ONLY the raw JSON array, no markdown, no explanation.`;

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageB64 } },
                { type: 'text', text: prompt },
              ],
            }],
          }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        const text = data.content?.find(b => b.type === 'text')?.text ?? '[]';
        const clean = text.replace(/```json|```/g, '').trim();
        generatedObjects = JSON.parse(clean);
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', msg: '✗ Claude API error — using fallback', spin: false });
        generatedObjects = sampleScenes['balloon_arch'];
      }
    } else {
      setStatus({ type: 'error', msg: 'No image or sample selected', spin: false });
      setGenerateLoading(false);
      return;
    }

    setStatus({ type: 'loading', msg: `Building ${generatedObjects.length} 3D objects…`, spin: true });
    buildScene(generatedObjects);
    setGenerateLoading(false);
  };

  const buildScene = (newObjects) => {
    if (sceneGroupRef.current) {
      sceneRef.current.remove(sceneGroupRef.current);
      sceneGroupRef.current = null;
      materialsRef.current = [];
    }

    const group = new THREE.Group();
    newObjects.forEach((obj) => {
      try {
        const mesh = buildMesh(obj);
        group.add(mesh);
      } catch (e) {
        console.warn('Mesh error', e);
      }
    });

    sceneGroupRef.current = group;
    sceneRef.current.add(group);

    setObjects(newObjects);
    setAutoRotate(true);
    targetRef.current.theta = 0;
    targetRef.current.phi = Math.PI / 3;
    sphericalRef.current.radius = 6;

    setStatus({ type: 'success', msg: `✓ Scene built with ${newObjects.length} 3D objects`, spin: false });
  };

  const downloadScene = async () => {
    if (!sceneGroupRef.current) return;
    try {
      const exporter = new GLTFExporter();
      exporter.parse(
        sceneGroupRef.current,
        (glb) => {
          const url = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
          const link = document.createElement('a');
          link.href = url;
          link.download = 'scene.glb';
          link.click();
        },
        (err) => console.error('Export error:', err),
        { binary: true }
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="ar-decoration-builder">
      <header className="builder-header">
        <div className="builder-logo">🎪</div>
        <div>
          <h1>AR Decoration Preview</h1>
          <p className="builder-subtitle">Upload any 2D decoration image → AI builds a real 3D scene → AR ready</p>
        </div>
      </header>

      <div className="builder-main">
        {/* ─── SIDEBAR ─── */}
        <div className="builder-sidebar">
          {/* Upload */}
          <div className="builder-panel">
            <div className="builder-panel-title">1 · Upload image</div>
            <div
              className="builder-upload-zone"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                style={{ display: 'none' }}
              />
              <div className="builder-upload-icon">🖼️</div>
              <div className="builder-upload-label">
                <strong>Choose file</strong> or drag & drop
              </div>
              <div className="builder-upload-label-small">balloons · flowers · stage · table setups · anything</div>
              {imageB64 && <div className="builder-preview-indicator">✓ Image uploaded</div>}
            </div>
          </div>

          {/* Samples */}
          <div className="builder-panel">
            <div className="builder-panel-title">Or try a preset description</div>
            <div className="builder-samples">
              <button
                className="builder-sample-btn"
                onClick={() => applySample('balloon_arch')}
              >
                <span className="builder-s-icon">🎈</span>
                Balloon arch<br />
                <span className="builder-sample-desc">pink & gold</span>
              </button>
              <button
                className="builder-sample-btn"
                onClick={() => applySample('floral_wall')}
              >
                <span className="builder-s-icon">🌸</span>
                Floral wall<br />
                <span className="builder-sample-desc">rose backdrop</span>
              </button>
              <button
                className="builder-sample-btn"
                onClick={() => applySample('wedding_table')}
              >
                <span className="builder-s-icon">🕯️</span>
                Wedding table<br />
                <span className="builder-sample-desc">candles & flowers</span>
              </button>
              <button
                className="builder-sample-btn"
                onClick={() => applySample('stage_setup')}
              >
                <span className="builder-s-icon">🎭</span>
                Stage setup<br />
                <span className="builder-sample-desc">lights & backdrop</span>
              </button>
            </div>
          </div>

          {/* Generate */}
          <div className="builder-panel">
            <div className="builder-panel-title">2 · Generate 3D scene</div>
            <div className="builder-flex-row" style={{ marginBottom: '0.75rem' }}>
              <div>
                <label className="builder-label-small">Style</label>
                <select value={styleSelect} onChange={(e) => setStyleSelect(e.target.value)}>
                  <option value="realistic">Realistic</option>
                  <option value="stylized">Stylized</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <div>
                <label className="builder-label-small">Count</label>
                <select value={countSelect} onChange={(e) => setCountSelect(e.target.value)}>
                  <option value="5-8">5-8 objects</option>
                  <option value="8-12">8-12 objects</option>
                  <option value="12-16">12-16 objects</option>
                </select>
              </div>
            </div>
            <button
              className={`builder-btn builder-btn-primary ${generateLoading || (!imageB64 && !sampleMode) ? 'disabled' : ''}`}
              onClick={generate}
              disabled={generateLoading || (!imageB64 && !sampleMode)}
            >
              <Zap size={16} /> Build 3D Scene
            </button>
            <div className={`builder-status-bar status-${status.type}`}>
              {status.spin && <div className="builder-spinner" />}
              <span>{status.msg}</span>
            </div>
          </div>

          {/* Objects list */}
          {objects.length > 0 && (
            <div className="builder-panel">
              <div className="builder-panel-title">
                <span>{objects.length} items</span>
              </div>
              <div className="builder-object-list">
                {objects.slice(0, 8).map((obj, i) => (
                  <div key={i} className="builder-obj-item">
                    <div className="builder-obj-swatch" style={{ background: colorSwatch(obj.color) }} />
                    <span className="builder-obj-name">{obj.color} {obj.shape}</span>
                    <span className="builder-obj-shape">{(obj.width ?? 0).toFixed(2)}m</span>
                  </div>
                ))}
              </div>
              <div className="builder-scene-info">{objects.length} meshes · drag to orbit · scroll to zoom</div>
            </div>
          )}

          {/* Scene controls */}
          {objects.length > 0 && (
            <div className="builder-panel">
              <div className="builder-panel-title">Scene controls</div>
              <div className="builder-flex-row">
                <button
                  className="builder-ctrl-btn"
                  onClick={() => setAutoRotate(!autoRotate)}
                  title="Toggle auto-rotate"
                >
                  <RotateCw size={14} /> {autoRotate ? 'Pause' : 'Resume'}
                </button>
                <button
                  className="builder-ctrl-btn"
                  onClick={() => setWireframe(!wireframe)}
                  title="Toggle wireframe"
                >
                  <Grid3x3 size={14} /> {wireframe ? 'Solid' : 'Wire'}
                </button>
                <button
                  className="builder-ctrl-btn"
                  onClick={downloadScene}
                  title="Download as GLB"
                >
                  <Download size={14} /> GLB
                </button>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label className="builder-label-small">Light</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                  className="builder-slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── VIEWER ─── */}
        <div className="builder-viewer" id="viewerPane">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
            style={{ display: 'block', width: '100%', height: '100%' }}
          />
          {objects.length === 0 && (
            <div className="builder-empty-state">
              <div className="builder-empty-icon">🎨</div>
              <p>Upload an image or select a preset to generate</p>
            </div>
          )}
          {objects.length > 0 && <div className="builder-info-badge">Drag to orbit · Scroll to zoom</div>}
        </div>
      </div>
    </div>
  );
};

export default ARDecorationBuilder;
