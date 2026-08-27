(function () {
  const canvas = document.getElementById("phone3dCanvas");
  const stage = document.getElementById("phoneTilt");
  const heroSection = document.getElementById("hero");
  if (!canvas || !stage || !heroSection || typeof THREE === "undefined") return;

  // ---------- scene ----------
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // ---------- lights (key + fill + rim, to react to rotation like the photo reference) ----------
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xfff3e6, 1.1);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb4ff, 0.6);
  rim.position.set(-4, -2, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(-3, 2, 4);
  scene.add(fill);

  // ---------- iPhone group: front/back photos as flat, undistorted planes
  // (matches the real photo aspect ratio, no UV stretching) + a solid metal
  // frame slab between them for genuine 3D depth/edges/shading. ----------
  const W = 2.6;
  const H = W * (707 / 344);
  const DEPTH = 0.22;

  const group = new THREE.Group();
  scene.add(group);

  // Manual image loading (not THREE.TextureLoader): the loader sets
  // img.crossOrigin, which silently fails to fetch local files opened via
  // file:// — the texture never loads and only the solid frame mesh shows
  // (the "orange brick" bug). Plain Image() with no crossOrigin works locally.
  function loadTexture(src) {
    const texture = new THREE.Texture();
    texture.anisotropy = 4;
    const img = new Image();
    img.onload = () => {
      texture.image = img;
      texture.needsUpdate = true;
    };
    img.src = src;
    return texture;
  }
  const frontTex = loadTexture("iphone17-front.png");
  const backTex = loadTexture("iphone17-back.png");

  const faceGeo = new THREE.PlaneGeometry(W, H);

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    transparent: true,
    roughness: 0.25,
    metalness: 0.1,
  });
  const frontMesh = new THREE.Mesh(faceGeo, frontMat);
  frontMesh.position.z = DEPTH / 2 + 0.001;
  group.add(frontMesh);

  const backMat = new THREE.MeshStandardMaterial({
    map: backTex,
    transparent: true,
    roughness: 0.4,
    metalness: 0.15,
  });
  const backMesh = new THREE.Mesh(faceGeo, backMat);
  backMesh.position.z = -DEPTH / 2 - 0.001;
  backMesh.rotation.y = Math.PI;
  group.add(backMesh);

  // Rounded-rect frame slab, slightly inset from the photo edges, brushed-metal
  // orange titanium to match the iPhone 17 colorway.
  const rr = (w, h, r) => {
    const s = new THREE.Shape();
    const x = -w / 2,
      y = -h / 2;
    s.moveTo(x, y + r);
    s.lineTo(x, y + h - r);
    s.quadraticCurveTo(x, y + h, x + r, y + h);
    s.lineTo(x + w - r, y + h);
    s.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
    s.lineTo(x + w, y + r);
    s.quadraticCurveTo(x + w, y, x + w - r, y);
    s.lineTo(x + r, y);
    s.quadraticCurveTo(x, y, x, y + r);
    return s;
  };
  const frameShape = rr(W * 0.965, H * 0.965, 0.34);
  const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 3,
    curveSegments: 12,
  });
  frameGeo.translate(0, 0, -DEPTH / 2);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xd9773f,
    roughness: 0.3,
    metalness: 0.75,
  });
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  group.add(frameMesh);

  // ---------- interaction: mouse parallax + scroll tilt drive real rotation/lighting ----------
  const baseX = 0.1;
  const baseY = -0.38;
  let mouseX = 0,
    mouseY = 0,
    scrollTiltY = 0,
    autoSpin = 0;

  window.addEventListener(
    "pointermove",
    (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  function onScroll() {
    const rect = heroSection.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);
    scrollTiltY = progress * 0.7;
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  function resize() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  let floatT = 0;
  function tick() {
    floatT += 0.012;
    autoSpin += 0.0035;
    group.rotation.x = baseX - mouseY * 0.18;
    group.rotation.y = baseY + mouseX * 0.3 + scrollTiltY + autoSpin;
    group.position.y = Math.sin(floatT) * 0.18;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
