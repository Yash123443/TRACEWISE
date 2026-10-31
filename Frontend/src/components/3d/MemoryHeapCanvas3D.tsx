import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MemoryHeapCanvas3DProps {
  className?: string;
  interactive?: boolean;
}

export const MemoryHeapCanvas3D: React.FC<MemoryHeapCanvas3DProps> = ({
  className = '',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    label: string;
    address: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.6, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 2. Lights - Warm Studio Gallery Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfffef0, 2.5);
    mainLight.position.set(4, 8, 6);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.2);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);

    // 3. Grid Plane (Subtle memory address coordinate matrix)
    const gridHelper = new THREE.GridHelper(16, 32, 0xd4d4d8, 0xe4e4e7);
    gridHelper.position.y = -0.55;
    scene.add(gridHelper);

    // 4. Memory Nodes (Representing Linked List: N -> A -> B -> C)
    const nodeData = [
      { id: 'newNode', val: 'N', addr: '0x1000', next: '0x1040', x: -3.4, z: 0.6, color: 0x0f766e },
      { id: 'head', val: 'A', addr: '0x1040', next: '0x1080', x: -1.1, z: -0.1, color: 0x18181b },
      { id: 'nodeB', val: 'B', addr: '0x1080', next: '0x10C0', x: 1.1, z: 0.2, color: 0x18181b },
      { id: 'nodeC', val: 'C', addr: '0x10C0', next: 'NULL', x: 3.4, z: -0.5, color: 0x18181b },
    ];

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const interactiveMeshes: THREE.Mesh[] = [];

    // Base box geometry for physical memory cells
    const boxGeo = new THREE.BoxGeometry(1.25, 0.7, 0.95);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);

    nodeData.forEach((data) => {
      // Main node block - clean warm white porcelain / matte surface
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.35,
      });

      const mesh = new THREE.Mesh(boxGeo, mat);
      mesh.position.set(data.x, 0.2, data.z);
      mesh.userData = data;
      nodeGroup.add(mesh);
      interactiveMeshes.push(mesh);

      // Clean crisp edges
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xa1a1aa,
        linewidth: 1,
      });
      const wireframe = new THREE.LineSegments(edgesGeo, lineMat);
      mesh.add(wireframe);

      // Top indicator badge
      const indicatorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
      const indicatorMat = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.3,
      });
      const indicator = new THREE.Mesh(indicatorGeo, indicatorMat);
      indicator.position.set(0, 0.38, 0);
      mesh.add(indicator);
    });

    // 5. Clean Architectural Pointer Spline (Connecting nodes)
    const curvePoints = [
      new THREE.Vector3(-2.8, 0.2, 0.6),
      new THREE.Vector3(-2.0, 0.5, 0.25),
      new THREE.Vector3(-1.1, 0.2, -0.1),
      new THREE.Vector3(0.0, 0.5, 0.05),
      new THREE.Vector3(1.1, 0.2, 0.2),
      new THREE.Vector3(2.25, 0.5, -0.15),
      new THREE.Vector3(3.4, 0.2, -0.5),
    ];

    const spline = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(spline, 64, 0.032, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.4,
      metalness: 0.2,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tubeMesh);

    // 6. Mouse & Scroll Reactive Camera Positioning
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 3.6;
    let targetCameraZ = 8.2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    const handleScroll = () => {
      if (prefersReducedMotion) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const factor = Math.min(scrollY / 1000, 1.2);
      targetCameraZ = 8.2 - factor * 1.5;
      targetCameraY = 3.6 + factor * 0.8;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (interactive) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    // Raycaster for Hover detection
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    // 7. Animation Loop with Smooth Damping
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera lerp
      targetCameraX = mouseX * 1.4;
      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY + mouseY * 0.5 - camera.position.y) * 0.04;
      camera.position.z += (targetCameraZ - camera.position.z) * 0.04;
      camera.lookAt(0, 0.35, 0);

      // Subtle float if motion is allowed
      if (!prefersReducedMotion) {
        nodeGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.04;
        tubeMesh.position.y = Math.sin(elapsedTime * 0.8) * 0.04;
      }

      // Raycasting for interactive node inspect
      if (interactive) {
        mouseVector.x = mouseX;
        mouseVector.y = mouseY;
        raycaster.setFromCamera(mouseVector, camera);

        const intersects = raycaster.intersectObjects(interactiveMeshes);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const u = hit.userData;
          setHoveredNode({
            label: `Node '${u.val}'`,
            address: u.addr,
            status: u.id === 'newNode' ? 'Unlinked (0x1000)' : `next -> ${u.next}`,
          });
          document.body.style.cursor = 'pointer';
        } else {
          setHoveredNode(null);
          document.body.style.cursor = 'default';
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      if (interactive) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      resizeObserver.disconnect();
      document.body.style.cursor = 'default';
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div className={`relative w-full h-full min-h-[360px] sm:min-h-[420px] overflow-hidden ${className}`}>
      {/* Three.js Canvas container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating 3D Telemetry Overlay HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="px-3 py-1.5 rounded-md bg-white/90 border border-stone-300 backdrop-blur-xs font-mono text-[11px] text-stone-700 flex items-center gap-2 shadow-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>3D MEMORY HEAP PERSPECTIVE</span>
        </div>
      </div>

      {/* Interactive Hover HUD Display */}
      {hoveredNode && (
        <div className="absolute bottom-4 right-4 z-20 pointer-events-none animate-in fade-in duration-150">
          <div className="p-3 rounded-lg bg-white border border-stone-300 font-mono text-xs text-stone-900 shadow-md space-y-1">
            <div className="text-stone-900 font-bold">{hoveredNode.label}</div>
            <div className="text-[11px] text-stone-600">
              Address: <span className="text-stone-900 font-semibold">{hoveredNode.address}</span>
            </div>
            <div className="text-[11px] text-teal-800 font-medium">{hoveredNode.status}</div>
          </div>
        </div>
      )}

      {/* Parallax & Scroll Cue */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:block">
        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded border border-stone-200">
          Move Cursor to Orbit Perspective
        </span>
      </div>
    </div>
  );
};
