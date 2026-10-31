import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { MemorySnapshot } from '../../types/workbenchTrace'

interface MemoryHeapCanvas3DProps {
  className?: string
  interactive?: boolean
  snapshot?: MemorySnapshot
  showGrid?: boolean
}

interface VisualNode {
  id: string
  val: string
  address?: string
  nextId: string | null
  unreachable: boolean
  head: boolean
  isNew: boolean
}

const makeLabel = (node: VisualNode) => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 176
  const context = canvas.getContext('2d')
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#292524'
    context.font = 'bold 38px ui-monospace, monospace'
    context.fillText(node.head ? `HEAD · ${node.val}` : `NODE · ${node.val}`, 14, 52)
    context.fillStyle = '#57534e'
    context.font = '30px ui-monospace, monospace'
    context.fillText(`next → ${node.nextId ?? 'NULL'}`, 14, 104)
    context.fillText(node.address ?? (node.unreachable ? 'UNREACHABLE' : ''), 14, 150)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(2.05, 0.7, 1)
  return sprite
}

export const MemoryHeapCanvas3D: React.FC<MemoryHeapCanvas3DProps> = ({
  className = '',
  interactive = true,
  snapshot,
  showGrid = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [hoveredNode, setHoveredNode] = useState<VisualNode | null>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = new THREE.Scene()
    const width = container.clientWidth || 800
    const height = container.clientHeight || 500
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 3.6, Math.max(8.2, (snapshot?.nodes.length ?? 4) * 1.8))
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1
    container.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 2))
    const mainLight = new THREE.DirectionalLight(0xfffef0, 2.5)
    mainLight.position.set(4, 8, 6)
    scene.add(mainLight)
    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.2)
    fillLight.position.set(-5, 4, -3)
    scene.add(fillLight)
    const grid = new THREE.GridHelper(Math.max(16, (snapshot?.nodes.length ?? 4) * 4), 32, 0xd4d4d8, 0xe4e4e7)
    grid.position.y = -0.55
    grid.visible = showGrid
    scene.add(grid)

    const newNodeTarget = snapshot?.pointers.find((pointer) => pointer.name === 'newNode')?.targetNodeId
    const visualNodes: VisualNode[] = snapshot
      ? snapshot.nodes.map((node) => ({
          id: node.id,
          val: node.val,
          address: node.memoryAddress,
          nextId: node.nextId ? snapshot.nodes.find((target) => target.id === node.nextId)?.val ?? null : null,
          unreachable: snapshot.unreachableNodeIds.includes(node.id),
          head: snapshot.headTargetId === node.id,
          isNew: newNodeTarget === node.id,
        }))
      : [
          { id: 'newNode', val: 'N', address: '0x1000', nextId: 'A', unreachable: false, head: false, isNew: true },
          { id: 'head', val: 'A', address: '0x1040', nextId: 'B', unreachable: false, head: true, isNew: false },
          { id: 'nodeB', val: 'B', address: '0x1080', nextId: 'C', unreachable: false, head: false, isNew: false },
          { id: 'nodeC', val: 'C', address: '0x10C0', nextId: null, unreachable: false, head: false, isNew: false },
        ]

    const nodeGroup = new THREE.Group()
    scene.add(nodeGroup)
    const interactiveMeshes: THREE.Mesh[] = []
    const positions = new Map<string, THREE.Vector3>()
    const gap = 2.35
    const startX = -((visualNodes.length - 1) * gap) / 2
    const boxGeo = new THREE.BoxGeometry(1.45, 0.78, 1.05)
    const edgeGeo = new THREE.EdgesGeometry(boxGeo)

    visualNodes.forEach((node, index) => {
      const position = new THREE.Vector3(startX + index * gap, 0.12, index % 2 === 0 ? 0.12 : -0.12)
      positions.set(node.id, position)
      const material = new THREE.MeshStandardMaterial({
        color: node.unreachable ? 0xffe4e6 : node.isNew ? 0xccfbf1 : 0xffffff,
        metalness: 0.08,
        roughness: 0.38,
      })
      const mesh = new THREE.Mesh(boxGeo, material)
      mesh.position.copy(position)
      mesh.userData.visualNode = node
      nodeGroup.add(mesh)
      interactiveMeshes.push(mesh)

      const lineMaterial = new THREE.LineBasicMaterial({ color: node.unreachable ? 0xe11d48 : node.head ? 0x292524 : 0xa1a1aa })
      mesh.add(new THREE.LineSegments(edgeGeo, lineMaterial))
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: node.unreachable ? 0xe11d48 : node.head ? 0x292524 : node.isNew ? 0x0f766e : 0x64748b }),
      )
      marker.position.y = 0.43
      mesh.add(marker)
      const label = makeLabel(node)
      label.position.set(position.x, 0.98, position.z)
      nodeGroup.add(label)
    })

    visualNodes.forEach((node) => {
      if (!node.nextId) return
      const source = positions.get(node.id)
      const targetNode = snapshot?.nodes.find((item) => item.val === node.nextId)
      const target = targetNode ? positions.get(targetNode.id) : positions.get(visualNodes.find((item) => item.val === node.nextId)?.id ?? '')
      if (!source || !target) return
      const midpoint = source.clone().add(target).multiplyScalar(0.5)
      midpoint.y += 0.55
      const curve = new THREE.CatmullRomCurve3([source.clone().add(new THREE.Vector3(0.72, 0.12, 0)), midpoint, target.clone().add(new THREE.Vector3(-0.72, 0.12, 0))])
      const color = snapshot?.hasCycle && node.unreachable ? 0xe11d48 : 0x292524
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.035, 8, false), new THREE.MeshStandardMaterial({ color }))
      scene.add(tube)
      const tangent = curve.getTangentAt(0.92).normalize()
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 12), new THREE.MeshStandardMaterial({ color }))
      arrow.position.copy(curve.getPointAt(0.96))
      arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent)
      scene.add(arrow)
    })

    const head = snapshot?.pointers.find((pointer) => pointer.name === 'head')
    if (head?.targetNodeId) {
      const headPosition = positions.get(head.targetNodeId)
      if (headPosition) {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x0f766e }))
        stem.position.set(headPosition.x, 1.25, headPosition.z)
        scene.add(stem)
        const pointerLabel = makeLabel({ id: 'head-pointer', val: 'HEAD', nextId: null, unreachable: false, head: true, isNew: false })
        pointerLabel.scale.set(1.3, 0.44, 1)
        pointerLabel.position.set(headPosition.x, 1.65, headPosition.z)
        scene.add(pointerLabel)
      }
    }

    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    }
    if (interactive) container.addEventListener('mousemove', handleMouseMove)
    const raycaster = new THREE.Raycaster()
    const mouseVector = new THREE.Vector2()
    let animationFrameId = 0
    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate)
      camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.04
      camera.position.y += (3.6 + mouseY * 0.5 - camera.position.y) * 0.04
      camera.lookAt(0, 0.35, 0)
      if (!prefersReducedMotion) nodeGroup.position.y = Math.sin(time / 1000 * 0.8) * 0.035
      if (interactive) {
        mouseVector.set(mouseX, mouseY)
        raycaster.setFromCamera(mouseVector, camera)
        const hit = raycaster.intersectObjects(interactiveMeshes)[0]?.object.userData.visualNode as VisualNode | undefined
        setHoveredNode((previous) => previous?.id === hit?.id ? previous : hit ?? null)
        container.style.cursor = hit ? 'pointer' : 'grab'
      }
      renderer.render(scene, camera)
    }
    animate(0)

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = container.clientWidth
      const nextHeight = container.clientHeight
      if (!nextWidth || !nextHeight) return
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(nextWidth, nextHeight)
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationFrameId)
      container.removeEventListener('mousemove', handleMouseMove)
      container.style.cursor = ''
      resizeObserver.disconnect()
      setHoveredNode(null)
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh
        mesh.geometry?.dispose?.()
        if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose())
        else mesh.material?.dispose?.()
        const sprite = object as THREE.Sprite
        if (sprite.material instanceof THREE.SpriteMaterial) sprite.material.map?.dispose()
      })
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [interactive, snapshot, showGrid])

  return (
    <div className={`relative h-full min-h-[360px] w-full overflow-hidden ${className}`}>
      <div ref={mountRef} className="h-full w-full" aria-label={snapshot ? '3D memory replay from current trace' : 'Illustrative 3D memory visualization'} />
      <div className="pointer-events-none absolute left-4 top-4 z-20">
        <div className="flex items-center gap-2 rounded-md border border-stone-300 bg-white/90 px-3 py-1.5 font-mono text-[11px] font-medium text-stone-700 shadow-xs backdrop-blur-xs">
          <span className={`h-2 w-2 rounded-full ${snapshot ? 'bg-teal-700' : 'bg-emerald-600'}`} />
          <span>{snapshot ? 'LIVE REPLAY · CURRENT FRAME' : 'ILLUSTRATIVE 3D MEMORY VIEW'}</span>
        </div>
      </div>
      {hoveredNode && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-20 max-w-xs rounded-lg border border-stone-300 bg-white p-3 text-xs text-stone-700 shadow-md">
          {snapshot ? `Node ${hoveredNode.val}; next points to ${hoveredNode.nextId ?? 'NULL'}${hoveredNode.unreachable ? ' · unreachable from head' : ''}` : 'Illustration only. Open the Memory Workbench to run a real replay.'}
        </div>
      )}
      {!snapshot && <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden sm:block"><span className="rounded border border-stone-200 bg-white/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-stone-500">Move cursor to orbit perspective</span></div>}
    </div>
  )
}
