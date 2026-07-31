(function flickerTitle() {
  var baseTitle = document.title;
  var symbols = ['🜂', '🜃', '🜁', '🜄', '🜚', '☿', '🜛', '᛫', 'ᛊ', 'ᛟ', '𓀂', '𓅆', '𓋒'];
  var flickerDuration = 140;
  var minDelay = 1400;
  var maxDelay = 3600;
  var timer = null;

  function randomIndex(str) {
    var candidates = [];
    for (var i = 0; i < str.length; i++) {
      if (str[i].trim() !== '') candidates.push(i);
    }
    return candidates.length
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : -1;
  }

  function tick() {
    var idx = randomIndex(baseTitle);
    if (idx !== -1) {
      var symbol = symbols[Math.floor(Math.random() * symbols.length)];
      document.title =
        baseTitle.slice(0, idx) +
        symbol +
        baseTitle.slice(idx + 1);
      setTimeout(function () {
        document.title = baseTitle;
      }, flickerDuration);
    }
    schedule();
  }

  function schedule() {
    timer = setTimeout(tick, minDelay + Math.random() * (maxDelay - minDelay));
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearTimeout(timer);
      document.title = baseTitle;
    } else {
      schedule();
    }
  });

  schedule();
})();

(function () {
  var ring = document.querySelector('.cursor-ring');
  if (!ring) return;

  var mouseX = 0, mouseY = 0;
  var started = false;
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var SEGMENT_COUNT = 48;
  var RING_RADIUS = 14;
  var GAP_DEGREES = 6;
  var COLOR_RED = '#c31a28';
  var COLOR_ACTIVE = '#ff4444';
  var COLOR_BLACK = '#0a0a0a';

  ring.setAttribute('viewBox', '-15 -15 30 30');

  var segments = [];
  var stepDeg = 360 / SEGMENT_COUNT;

  for (var i = 0; i < SEGMENT_COUNT; i++) {
    var startDeg = i * stepDeg + GAP_DEGREES / 2;
    var endDeg = (i + 1) * stepDeg - GAP_DEGREES / 2;
    var startRad = startDeg * Math.PI / 180;
    var endRad = endDeg * Math.PI / 180;

    var x0 = RING_RADIUS * Math.cos(startRad);
    var y0 = RING_RADIUS * Math.sin(startRad);
    var x1 = RING_RADIUS * Math.cos(endRad);
    var y1 = RING_RADIUS * Math.sin(endRad);

    var path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M ' + x0.toFixed(2) + ' ' + y0.toFixed(2) +
      ' A ' + RING_RADIUS + ' ' + RING_RADIUS + ' 0 0 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', COLOR_RED);
    path.setAttribute('stroke-width', '2.4');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('class', 'cursor-segment');
    ring.appendChild(path);

    var midRad = ((startDeg + endDeg) / 2) * Math.PI / 180;
    segments.push({ 
      el: path, 
      cos: Math.cos(midRad), 
      sin: Math.sin(midRad) 
    });
  }

  function positionRing(x, y) {
    ring.style.translate = 'calc(' + x + 'px - 50%) calc(' + y + 'px - 50%)';
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    positionRing(mouseX, mouseY);
    
    if (!started) {
      started = true;
      document.documentElement.classList.add('has-custom-cursor');
    }
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchstart', function () {
    started = false;
    document.documentElement.classList.remove('has-custom-cursor');
  }, { passive: true });

  // Expanded hover targets - all interactive elements
  var hoverTargets = 'a, button, [role="button"], input, textarea, select, [contenteditable], .clickable, [onclick], label';

  function setActiveState(isActive) {
    if (isActive) {
      ring.classList.add('is-active');
      segments.forEach(function(seg) {
        seg.el.setAttribute('stroke', COLOR_ACTIVE);
      });
    } else {
      ring.classList.remove('is-active');
      segments.forEach(function(seg) {
        seg.el.setAttribute('stroke', COLOR_RED);
      });
    }
  }

  document.addEventListener('mouseover', function (e) {
    var target = e.target;
    if (target.closest && target.closest(hoverTargets)) {
      setActiveState(true);
    }
  });

  document.addEventListener('mouseout', function (e) {
    var target = e.target;
    if (target.closest && target.closest(hoverTargets)) {
      setActiveState(false);
    }
  });

  // Handle focus events for keyboard navigation
  document.addEventListener('focusin', function (e) {
    if (e.target.closest && e.target.closest(hoverTargets)) {
      setActiveState(true);
    }
  });

  document.addEventListener('focusout', function (e) {
    setActiveState(false);
  });

  var samplers = [];

  function buildSampler(img) {
    try {
      var w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) return;
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      ctx.getImageData(0, 0, 1, 1);
      samplers.push({ img: img, canvas: canvas, ctx: ctx, w: w, h: h });
    } catch (err) {
    }
  }

  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete && img.naturalWidth) {
      buildSampler(img);
    } else {
      img.addEventListener('load', function () { buildSampler(img); }, { once: true });
    }
  });

  function mapToNaturalPixel(sampler, rect, px, py) {
    var style = getComputedStyle(sampler.img);
    var fit = style.objectFit || 'fill';
    var posParts = (style.objectPosition || '50% 50%').split(' ');
    var posXfrac = parseFloat(posParts[0]) / 100;
    var posYfrac = parseFloat(posParts[1]) / 100;
    if (isNaN(posXfrac)) posXfrac = 0.5;
    if (isNaN(posYfrac)) posYfrac = 0.5;

    var scale;
    if (fit === 'cover') {
      scale = Math.max(rect.width / sampler.w, rect.height / sampler.h);
    } else if (fit === 'contain') {
      scale = Math.min(rect.width / sampler.w, rect.height / sampler.h);
    } else {
      return {
        x: Math.min(sampler.w - 1, Math.floor((px / rect.width) * sampler.w)),
        y: Math.min(sampler.h - 1, Math.floor((py / rect.height) * sampler.h))
      };
    }

    var displayedW = sampler.w * scale;
    var displayedH = sampler.h * scale;
    var excessX = displayedW - rect.width;
    var excessY = displayedH - rect.height;
    var naturalX = (px + excessX * posXfrac) / scale;
    var naturalY = (py + excessY * posYfrac) / scale;

    return {
      x: Math.max(0, Math.min(sampler.w - 1, Math.floor(naturalX))),
      y: Math.max(0, Math.min(sampler.h - 1, Math.floor(naturalY)))
    };
  }

  function luminanceUnderCursor(x, y) {
    for (var i = 0; i < samplers.length; i++) {
      var s = samplers[i];
      var rect = s.img.getBoundingClientRect();
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;

      var px = mapToNaturalPixel(s, rect, x - rect.left, y - rect.top);
      try {
        var data = s.ctx.getImageData(px.x, px.y, 1, 1).data;
        if (data[3] < 32) continue;
        return (0.2126 * data[0] + 0.7152 * data[1] + 0.0722 * data[2]) / 255;
      } catch (err) {
        continue;
      }
    }
    return null;
  }

  var frameCount = 0;
  function loop() {
    frameCount++;
    if (frameCount % 2 === 0) {
      for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        var sx = mouseX + RING_RADIUS * seg.cos;
        var sy = mouseY + RING_RADIUS * seg.sin;
        var lum = luminanceUnderCursor(sx, sy);
        var isLight = lum !== null && lum > 0.6;
        seg.el.setAttribute('stroke', isLight ? COLOR_BLACK : COLOR_RED);
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(function () {
  var modal = document.getElementById('project-modal');
  if (!modal) return;

  var tagEl = document.getElementById('modal-tag');
  var titleEl = document.getElementById('modal-title-text');
  var descEl = document.getElementById('modal-desc');
  var madeForEl = document.getElementById('modal-made-for');
  var gameEl = document.getElementById('modal-game');
  var statusEl = document.getElementById('modal-viewport-status');
  var slotEl = document.getElementById('modal-viewport-slot');
  var fallbackImg = document.getElementById('modal-img');
  var closeBtn = modal.querySelector('.project-modal-close');
  var lastFocused = null;

  var renderer = null, scene = null, camera = null, controls = null, currentMesh = null;
  var rafId = null;
  var loader = new GLTFLoader();

  function supportsWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (err) {
      return false;
    }
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function initViewport() {
    if (renderer) return true;
    if (!supportsWebGL()) return false;

    var width = slotEl.clientWidth || 1;
    var height = slotEl.clientHeight || 1;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    slotEl.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.1, 5.4);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 5);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xb3121f, 0.9);
    rim.position.set(-4, 2, -5);
    scene.add(rim);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.6, 0);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.4;
    var fixedPolar = Math.acos(camera.position.y / camera.position.length());
    controls.minPolarAngle = fixedPolar;
    controls.maxPolarAngle = fixedPolar;
    controls.addEventListener('start', function () { controls.autoRotate = false; });
    controls.update();

    window.addEventListener('resize', onViewportResize);
    animate();
    return true;
  }

  function onViewportResize() {
    if (!renderer || !camera) return;
    var width = slotEl.clientWidth || 1;
    var height = slotEl.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    rafId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  function frameObject(object) {
    var box = new THREE.Box3().setFromObject(object);
    var size = box.getSize(new THREE.Vector3());
    var maxDim = Math.max(size.x, size.y, size.z) || 1;
    var scaleFactor = 1.6 / maxDim;
    object.scale.setScalar(scaleFactor);

    box.setFromObject(object);
    var center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);
    object.position.y += size.y * scaleFactor * 0.5;
  }

  function disposeMaterial(material) {
    for (var key in material) {
      if (material[key] && material[key].isTexture) material[key].dispose();
    }
    material.dispose();
  }

  function clearMesh() {
    if (!currentMesh) return;
    scene.remove(currentMesh);
    currentMesh.traverse(function (child) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        var mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(disposeMaterial);
      }
    });
    currentMesh = null;
  }

  function buildPlaceholder() {
    var group = new THREE.Group();
    var geo = new THREE.IcosahedronGeometry(0.9, 0);
    var mat = new THREE.MeshStandardMaterial({
      color: 0x1c1e24,
      wireframe: true,
      emissive: 0xb3121f,
      emissiveIntensity: 0.25
    });
    group.add(new THREE.Mesh(geo, mat));
    return group;
  }

  function loadModel(url) {
    clearMesh();
    if (!url) {
      currentMesh = buildPlaceholder();
      scene.add(currentMesh);
      frameObject(currentMesh);
      setStatus('No 3D preview linked for this asset yet');
      return;
    }
    setStatus('Loading model…');
    loader.load(
      url,
      function (gltf) {
        currentMesh = gltf.scene;
        scene.add(currentMesh);
        frameObject(currentMesh);
        setStatus('Drag to rotate');
      },
      undefined,
      function () {
        currentMesh = buildPlaceholder();
        scene.add(currentMesh);
        frameObject(currentMesh);
        setStatus('Preview unavailable — showing placeholder');
      }
    );
  }

  function teardownViewport() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    window.removeEventListener('resize', onViewportResize);
    clearMesh();
    if (controls) controls.dispose();
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
    renderer = null; scene = null; camera = null; controls = null;
  }

  function openFromCard(card) {
    var cardImg = card.querySelector('img');
    var cardTag = card.querySelector('.project-tag');
    var cardTitle = card.querySelector('h1');
    var cardDesc = card.querySelector('p');

    tagEl.textContent = cardTag ? cardTag.textContent : '';
    titleEl.textContent = cardTitle ? cardTitle.textContent : '';
    descEl.textContent = cardDesc ? cardDesc.textContent : '';
    madeForEl.textContent = card.dataset.madeFor || '—';
    gameEl.textContent = card.dataset.game || '—';

    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();

    requestAnimationFrame(function () {
      var ok = initViewport();
      if (ok) {
        if (fallbackImg) fallbackImg.style.display = 'none';
        if (slotEl) slotEl.style.display = 'block';
        loadModel(card.dataset.model || '');
      } else if (cardImg && fallbackImg) {
        if (slotEl) slotEl.style.display = 'none';
        fallbackImg.src = cardImg.src;
        fallbackImg.alt = cardImg.alt;
        fallbackImg.style.display = 'block';
        setStatus('3D preview unavailable in this browser');
      }
    });
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    teardownViewport();
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.querySelectorAll('.project').forEach(function (card) {
    card.addEventListener('click', function () { openFromCard(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFromCard(card);
      }
    });
  });

  modal.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();

/* ============================================================
   DYNABOT CHAT — UPDATED
   ============================================================ */

const chatIcon        = document.getElementById("chatIcon");
const chatBox         = document.getElementById("chatBox");
const chatCloseBtn    = document.getElementById("chatCloseBtn");

const userInfo        = document.getElementById("userInfo");
const userEmail       = document.getElementById("userEmail");
const userName        = document.getElementById("userName");
const startChatBtn    = document.getElementById("startChatBtn");

const chatMessages    = document.getElementById("chatMessages");
const chatInputArea   = document.getElementById("chatInputArea");
const chatInput       = document.getElementById("chatInput");
const sendChatBtn     = document.getElementById("sendChatBtn");

/* Open / Close Chat */
chatIcon.onclick = () => {
  chatBox.classList.add("visible");
  chatInput.focus();
};

chatCloseBtn.onclick = () => {
  chatBox.classList.remove("visible");
  userInfo.style.display = "flex";
  chatInputArea.style.display = "none";
  chatMessages.innerHTML = "";
};

/* Start Chat */
startChatBtn.onclick = () => {
  const email = userEmail.value.trim();
  const name  = userName.value.trim();

  if (!email || !name) {
    alert("Please enter both email and name.");
    return;
  }

  userInfo.style.display = "none";
  chatInputArea.style.display = "flex";
  
  addMessage("Dynabot", `Hello ${name}. How can I assist you today?`);
  chatInput.focus();
};

/* Send Message Function */
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  const msgEl = addMessage("You", text);
  chatInput.value = "";

  try {
    const apiUrl = `${window.location.origin}/api/contact`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail.value.trim(),
        name: userName.value.trim(),
        message: text
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      msgEl.innerHTML += ' <span style="color: var(--accent); font-size: 0.8rem; margin-left: 6px;">✓ delivered</span>';
    } else {
      addMessage("Dynabot", `❌ ${data.error || 'Failed to send message'}`);
    }

  } catch (err) {
    console.error('Error:', err);
    addMessage("Dynabot", `❌ Error: ${err.message}`);
  }
}

/* Send Button Click */
sendChatBtn.onclick = sendMessage;

/* Enter Key to Send */
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

/* Add Message to Chat */
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = "chat-msg";
  msg.innerHTML = `<b>${sender}</b> ${text}`;
  chatMessages.appendChild(msg);
  
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 0);
  
  return msg;
}
