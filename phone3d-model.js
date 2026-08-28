/* Modelo 3D real do iPhone 17 Pro Max (.glb), renderizado com Three.js + GLTFLoader.
   Flutua sobre o design atual da hero, com fundo transparente. Se o WebGL ou o
   modelo não carregar por qualquer motivo, o fallback CSS (phone3d.js + imagens)
   continua visível — nada do design existente é removido. */
(function () {
  const stage = document.querySelector(".phone3d-stage");
  const wrap = document.getElementById("phone3dCanvasWrap");
  const canvas = document.getElementById("phone3dCanvas");
  if (!stage || !wrap || !canvas) return;
  if (typeof THREE === "undefined" || !THREE.GLTFLoader) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch (e) {
    return; // sem WebGL disponível: mantém o fallback CSS
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Iluminação de estúdio suave + ambiente para reflexos realistas no metal/vidro
  if (THREE.RoomEnvironment) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 4, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xbcd2ff, 0.45);
  fill.position.set(-4, -1, 3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffd9a8, 0.55);
  rim.position.set(-2, 3, -4);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  // Luz sutil que acompanha o mouse: só desloca de posição, sem aumentar o brilho geral,
  // criando pequenos reflexos móveis no vidro e nas bordas metálicas.
  const mouseLight = new THREE.PointLight(0xffffff, 0.35, 9, 2);
  mouseLight.position.set(0, 0.4, 3.4);
  scene.add(mouseLight);

  // Sombra difusa atrás/abaixo do iPhone, para reforçar que ele está flutuando
  // (sem tocar em nenhuma superfície) — um blob desfocado, nunca um contato nítido.
  function makeShadowTexture() {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(0.55, "rgba(0,0,0,0.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }
  const shadowMat = new THREE.MeshBasicMaterial({
    map: makeShadowTexture(),
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    toneMapped: false,
  });
  const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), shadowMat);
  shadowMesh.position.set(0, -1.15, -0.9);
  scene.add(shadowMesh);

  let model = null;
  let raf = null;
  const clock = new THREE.Clock();
  let mouseX = 0;
  let mouseY = 0;

  function resize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (model) {
      model.rotation.y = t * (reduceMotion ? 0.05 : 0.28); // rotação lenta e contínua no eixo Y
      model.position.y = Math.sin(t * 0.6) * 0.12; // flutuação vertical suave
      model.rotation.x = 0.08 + Math.sin(t * 0.35) * 0.035 + mouseY * 0.05; // inclinação dinâmica
      model.rotation.z = 0.03 + Math.cos(t * 0.28) * 0.02 + mouseX * 0.04;

      // sombra acompanha a flutuação: quanto mais alto o iPhone, mais fraca/afastada a sombra
      shadowMesh.position.y = -1.15 - model.position.y * 0.18;
      shadowMat.opacity = 0.16 - Math.max(0, model.position.y) * 0.05;
    }

    // luz sutil seguindo o mouse, com leve suavização
    mouseLight.position.x += (mouseX * 1.3 - mouseLight.position.x) * 0.06;
    mouseLight.position.y += (0.4 - mouseY * 1.1 - mouseLight.position.y) * 0.06;

    renderer.render(scene, camera);
  }

  function startLoop() {
    if (!raf) animate();
  }
  function stopLoop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  // Pausa o render fora da tela para não pesar o site
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startLoop();
          else stopLoop();
        });
      },
      { threshold: 0 }
    );
    io.observe(stage);
  }

  const loader = new THREE.GLTFLoader();
  loader.load(
    "iphone17-pro-max.glb",
    (gltf) => {
      model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      model.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      model.scale.setScalar(2.1 / maxDim);
      model.rotation.set(0.08, 0, 0.03);

      // Escurece um pouco o laranja da carcaça, sem mexer em vidro/tela (mantém brilho e reflexo do display)
      model.traverse((node) => {
        if (!node.isMesh || !node.material) return;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((mat) => {
          if (!mat.color) return;
          const isGlassOrScreen =
            (mat.transparent && mat.opacity < 0.95) ||
            (mat.emissive && mat.emissiveIntensity > 0.05);
          if (isGlassOrScreen) return;
          mat.color.multiplyScalar(0.78);
        });
      });

      scene.add(model);
      resize();

      wrap.classList.add("is-ready");
      stage.classList.add("model-ready");
      startLoop();
    },
    undefined,
    (err) => {
      console.warn("Modelo 3D do iPhone não carregado (mantendo design atual):", err);
    }
  );

  resize();
})();
