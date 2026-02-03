"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Box,
  Users,
  Gamepad2,
  Footprints,
  Lightbulb,
  Wrench,
  GraduationCap,
  Layers,
  Move3D,
  Sun,
  Code,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  HelpCircle,
} from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface DocSubsection {
  title: string;
  content: string;
  code?: string;
  tips?: string[];
  quiz?: QuizQuestion[];
}

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  subsections: DocSubsection[];
}

const docSections: DocSection[] = [
  {
    id: "intro",
    title: "Pengenalan Dasar 3D",
    icon: <GraduationCap size={18} />,
    subsections: [
      {
        title: "Apa itu Grafis 3D?",
        content: `Grafis 3D adalah representasi visual dari objek tiga dimensi di layar dua dimensi. Berbeda dengan grafis 2D yang hanya memiliki lebar dan tinggi, grafis 3D menambahkan kedalaman (depth) sehingga objek terlihat lebih realistis.

Dalam pengembangan web, kita menggunakan WebGL (Web Graphics Library) untuk merender grafis 3D langsung di browser. WebGL adalah API JavaScript yang memungkinkan GPU (Graphics Processing Unit) memproses perhitungan grafis kompleks.

Three.js adalah library JavaScript populer yang menyederhanakan penggunaan WebGL. React Three Fiber (R3F) adalah wrapper React untuk Three.js yang memungkinkan kita menulis scene 3D menggunakan komponen React.`,
        tips: [
          "WebGL didukung oleh semua browser modern",
          "GPU handling membuat rendering 3D sangat cepat",
          "R3F menggunakan paradigma deklaratif seperti React biasa",
        ],
        quiz: [
          {
            question: "Apa yang dimaksud dengan WebGL?",
            options: [
              "Library CSS untuk animasi",
              "API JavaScript untuk rendering grafis 3D di browser",
              "Framework backend untuk game",
              "Database untuk menyimpan model 3D",
            ],
            correctIndex: 1,
            explanation:
              "WebGL adalah Web Graphics Library, sebuah API JavaScript yang memungkinkan rendering grafis 3D langsung di browser menggunakan GPU.",
          },
          {
            question: "Apa hubungan antara Three.js dan React Three Fiber?",
            options: [
              "Three.js adalah versi lama dari R3F",
              "R3F adalah wrapper React untuk Three.js",
              "Keduanya tidak berhubungan",
              "Three.js menggunakan R3F sebagai dependency",
            ],
            correctIndex: 1,
            explanation:
              "React Three Fiber (R3F) adalah wrapper React yang memungkinkan kita menggunakan Three.js dengan sintaks komponen React yang deklaratif.",
          },
        ],
      },
      {
        title: "Sistem Koordinat 3D",
        content: `Dunia 3D menggunakan sistem koordinat Cartesian dengan tiga sumbu:

X-Axis (Horizontal): Positif ke kanan, negatif ke kiri
Y-Axis (Vertikal): Positif ke atas, negatif ke bawah  
Z-Axis (Kedalaman): Positif ke arah kamera, negatif menjauhi kamera

Setiap objek di scene 3D memiliki properti transform:
- Position: Lokasi objek dalam ruang (x, y, z)
- Rotation: Sudut putaran dalam radian
- Scale: Ukuran relatif objek

Penting untuk memahami bahwa rotasi dalam 3D menggunakan radian, bukan derajat. Untuk mengkonversi: radian = derajat × (π / 180)`,
        code: `// Contoh posisi dan rotasi
<mesh 
  position={[2, 1, -3]}        // x=2, y=1, z=-3
  rotation={[0, Math.PI/4, 0]} // rotasi 45° di sumbu Y
  scale={[1.5, 1.5, 1.5]}      // 1.5x lebih besar
>
  <boxGeometry />
</mesh>`,
        tips: [
          "Math.PI = 180 derajat",
          "Math.PI / 2 = 90 derajat",
          "Rotasi mengikuti aturan tangan kanan",
        ],
        quiz: [
          {
            question: "Sumbu mana yang menentukan posisi vertikal objek?",
            options: ["X-Axis", "Y-Axis", "Z-Axis", "W-Axis"],
            correctIndex: 1,
            explanation:
              "Y-Axis adalah sumbu vertikal. Nilai Y positif berarti objek lebih tinggi, negatif berarti lebih rendah.",
          },
          {
            question: "Berapa nilai radian untuk rotasi 90 derajat?",
            options: ["Math.PI", "Math.PI / 2", "Math.PI / 4", "Math.PI * 2"],
            correctIndex: 1,
            explanation:
              "90 derajat = π/2 radian. Karena 180 derajat = π, maka 90 derajat = π/2.",
          },
          {
            question: "Jika position={[0, 5, -10]}, di mana objek berada?",
            options: [
              "Di tengah, 5 unit ke atas, 10 unit ke belakang kamera",
              "Di kanan, 5 unit ke bawah, 10 unit ke depan",
              "Di tengah, 5 unit ke bawah, 10 unit ke belakang",
              "Di kiri, 5 unit ke atas, 10 unit ke depan",
            ],
            correctIndex: 0,
            explanation:
              "X=0 berarti di tengah, Y=5 berarti 5 unit ke atas, Z=-10 berarti 10 unit menjauhi kamera (ke belakang).",
          },
        ],
      },
      {
        title: "Mesh, Geometry, dan Material",
        content: `Setiap objek 3D yang terlihat terdiri dari tiga komponen utama:

1. MESH
Mesh adalah container yang menggabungkan geometry dan material. Ini adalah objek yang sebenarnya dirender di scene.

2. GEOMETRY
Geometry mendefinisikan bentuk objek - titik-titik (vertices) dan bagaimana mereka terhubung membentuk permukaan (faces). Three.js menyediakan geometry built-in seperti BoxGeometry, SphereGeometry, PlaneGeometry, dll.

3. MATERIAL
Material menentukan tampilan permukaan objek - warna, tekstur, bagaimana cahaya memantul, transparansi, dll. Beberapa material umum:
- MeshBasicMaterial: Tidak terpengaruh cahaya
- MeshStandardMaterial: Realistis dengan PBR (Physically Based Rendering)
- MeshPhongMaterial: Shiny/glossy surface`,
        code: `// Struktur dasar mesh
<mesh>
  <boxGeometry args={[width, height, depth]} />
  <meshStandardMaterial 
    color="#ff6600"
    metalness={0.5}
    roughness={0.2}
  />
</mesh>`,
        quiz: [
          {
            question: "Apa fungsi dari Geometry dalam objek 3D?",
            options: [
              "Menentukan warna objek",
              "Mendefinisikan bentuk objek",
              "Mengatur pencahayaan",
              "Menangani animasi",
            ],
            correctIndex: 1,
            explanation:
              "Geometry mendefinisikan bentuk objek - vertices (titik-titik) dan faces (permukaan) yang membentuk shape 3D.",
          },
          {
            question:
              "Material mana yang TIDAK terpengaruh oleh pencahayaan scene?",
            options: [
              "MeshStandardMaterial",
              "MeshPhongMaterial",
              "MeshBasicMaterial",
              "MeshLambertMaterial",
            ],
            correctIndex: 2,
            explanation:
              "MeshBasicMaterial tidak terpengaruh cahaya. Objek akan terlihat flat dengan warna solid, tidak peduli ada lampu atau tidak.",
          },
        ],
      },
    ],
  },
  {
    id: "scene",
    title: "Komponen BasicsScene",
    icon: <Layers size={18} />,
    subsections: [
      {
        title: "Canvas - Wadah Scene 3D",
        content: `Canvas dari @react-three/fiber adalah komponen utama yang membuat context WebGL dan mengelola seluruh scene 3D.

Canvas secara otomatis:
- Membuat WebGL renderer
- Menangani resize window
- Setup animation loop (requestAnimationFrame)
- Mengelola raycasting untuk interaksi

Properti penting Canvas:
- camera: Konfigurasi kamera (posisi, FOV)
- shadows: Mengaktifkan shadow mapping
- gl: Opsi WebGL renderer
- dpr: Device pixel ratio untuk retina display`,
        code: `<Canvas
  camera={{ 
    position: [0, 2, 8],  // Posisi kamera
    fov: 50,              // Field of View
    near: 0.1,            // Near clipping plane
    far: 1000             // Far clipping plane
  }}
  shadows                  // Aktifkan bayangan
  gl={{ 
    antialias: true,       // Smoothing edges
    alpha: true            // Transparent background
  }}
>
  {/* Scene content */}
</Canvas>`,
        tips: [
          "FOV yang lebih kecil = zoom in, lebih besar = wide angle",
          "Near/far plane membatasi jarak render",
          "Antialias membuat edge lebih smooth tapi lebih berat",
        ],
        quiz: [
          {
            question: "Apa yang dilakukan properti 'shadows' pada Canvas?",
            options: [
              "Membuat background gelap",
              "Mengaktifkan shadow mapping untuk bayangan",
              "Menambahkan efek blur",
              "Mengatur warna shadow",
            ],
            correctIndex: 1,
            explanation:
              "Properti shadows={true} mengaktifkan sistem shadow mapping sehingga objek bisa menghasilkan dan menerima bayangan.",
          },
          {
            question: "FOV (Field of View) 30 akan menghasilkan efek seperti?",
            options: [
              "Wide angle / fisheye",
              "Telephoto lens / zoom in",
              "Normal perspective",
              "Orthographic view",
            ],
            correctIndex: 1,
            explanation:
              "FOV kecil (30) seperti telephoto lens - objek terlihat lebih dekat/zoom in. FOV besar (90+) seperti wide angle.",
          },
        ],
      },
      {
        title: "Kamera dan Perspektif",
        content: `Kamera menentukan dari sudut mana kita melihat scene. Ada dua jenis kamera utama:

1. PerspectiveCamera (default)
Mensimulasikan penglihatan manusia - objek jauh terlihat lebih kecil. Digunakan untuk game dan visualisasi realistis.

2. OrthographicCamera  
Tidak ada perspektif - objek tetap ukurannya terlepas dari jarak. Cocok untuk game 2.5D, UI, atau diagram teknis.

Field of View (FOV) mengontrol seberapa "lebar" pandangan kamera. FOV 50-75 terasa natural, di bawah 30 seperti telephoto lens, di atas 90 seperti fisheye.`,
        code: `// Mengatur kamera di Canvas
camera={{ 
  position: [0, 2, 8], // x, y, z
  fov: 50,
}}

// Mengakses kamera di dalam scene
import { useThree } from '@react-three/fiber'

function CameraController() {
  const { camera } = useThree()
  // camera.position.set(x, y, z)
}`,
        quiz: [
          {
            question: "Kapan sebaiknya menggunakan OrthographicCamera?",
            options: [
              "Untuk game FPS realistis",
              "Untuk diagram teknis atau game 2.5D",
              "Untuk VR experience",
              "Untuk semua jenis game",
            ],
            correctIndex: 1,
            explanation:
              "OrthographicCamera cocok untuk diagram teknis, game 2.5D (isometric), atau UI karena objek tidak berubah ukuran berdasarkan jarak.",
          },
        ],
      },
      {
        title: "Ground Plane dan Grid",
        content: `Ground plane memberikan referensi visual dan tempat bagi objek untuk "berdiri". Ini juga penting untuk menerima bayangan.

Implementasi ground plane:
1. Buat mesh dengan PlaneGeometry
2. Rotasi -90 derajat di sumbu X (agar horizontal)
3. Posisikan di Y negatif sesuai kebutuhan
4. Set receiveShadow={true} untuk menerima bayangan

GridHelper menambahkan garis-garis grid untuk membantu orientasi visual.`,
        code: `function GroundPlane() {
  return (
    <group>
      {/* Lantai */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Grid */}
      <gridHelper
        args={[1000, 1000, '#e0e0e0', '#e0e0e0']}
        position={[0, -1.49, 0]}
      />
    </group>
  );
}`,
        tips: [
          "Plane perlu dirotasi karena default-nya menghadap ke kamera",
          "receiveShadow harus true untuk menerima bayangan",
          "Grid sedikit di atas plane untuk menghindari z-fighting",
        ],
        quiz: [
          {
            question: "Mengapa PlaneGeometry perlu dirotasi -Math.PI / 2?",
            options: [
              "Agar terlihat lebih bagus",
              "Karena default plane menghadap kamera, perlu dirotasi agar horizontal",
              "Untuk menghemat memory",
              "Karena bug di Three.js",
            ],
            correctIndex: 1,
            explanation:
              "PlaneGeometry secara default menghadap sumbu Z (ke kamera). Rotasi -90 derajat di sumbu X membuatnya horizontal seperti lantai.",
          },
        ],
      },
    ],
  },
  {
    id: "lighting",
    title: "Sistem Pencahayaan",
    icon: <Sun size={18} />,
    subsections: [
      {
        title: "Jenis-jenis Cahaya",
        content: `Pencahayaan adalah kunci untuk scene 3D yang realistis. Three.js menyediakan beberapa jenis cahaya:

1. AmbientLight
Cahaya merata ke semua arah tanpa sumber spesifik. Tidak menghasilkan bayangan.

2. DirectionalLight
Cahaya paralel dari arah tertentu, seperti matahari. Menghasilkan bayangan tajam.

3. PointLight
Cahaya dari satu titik ke segala arah, seperti lampu bohlam.

4. SpotLight
Cahaya kerucut dari satu titik, seperti lampu sorot.

5. HemisphereLight
Cahaya gradien dari langit ke tanah.`,
        code: `<>
  {/* Cahaya ambient untuk base illumination */}
  <ambientLight intensity={0.5} />

  {/* Cahaya utama dengan bayangan */}
  <directionalLight
    position={[5, 10, 5]}
    intensity={1.5}
    castShadow
    shadow-mapSize={[2048, 2048]}
  />

  {/* Fill light */}
  <directionalLight 
    position={[-5, 5, -5]} 
    intensity={0.3} 
  />
</>`,
        quiz: [
          {
            question: "Jenis cahaya mana yang TIDAK menghasilkan bayangan?",
            options: [
              "DirectionalLight",
              "SpotLight",
              "AmbientLight",
              "PointLight",
            ],
            correctIndex: 2,
            explanation:
              "AmbientLight menerangi semua objek secara merata dari segala arah, sehingga tidak bisa menghasilkan bayangan.",
          },
          {
            question:
              "Untuk mensimulasikan cahaya matahari, cahaya mana yang paling cocok?",
            options: [
              "PointLight",
              "SpotLight",
              "DirectionalLight",
              "AmbientLight",
            ],
            correctIndex: 2,
            explanation:
              "DirectionalLight menghasilkan cahaya paralel dari satu arah, mirip dengan bagaimana matahari menerangi bumi karena jaraknya yang sangat jauh.",
          },
        ],
      },
      {
        title: "Shadow Mapping",
        content: `Bayangan menambah kedalaman dan realisme pada scene. Three.js menggunakan teknik shadow mapping.

Cara kerja shadow mapping:
1. Render scene dari sudut pandang cahaya
2. Simpan kedalaman setiap pixel ke texture (shadow map)
3. Saat render dari kamera, bandingkan kedalaman dengan shadow map
4. Jika pixel lebih jauh dari shadow map, pixel dalam bayangan

Untuk mengaktifkan bayangan:
- Canvas: shadows={true}
- Light: castShadow={true}
- Object penghasil: castShadow={true}
- Object penerima: receiveShadow={true}`,
        code: `<directionalLight
  castShadow
  shadow-mapSize={[2048, 2048]}    // Resolusi shadow map
  shadow-camera-far={50}           // Jarak maksimum
  shadow-camera-left={-10}
  shadow-camera-right={10}
  shadow-camera-top={10}
  shadow-camera-bottom={-10}
  shadow-bias={-0.0001}            // Mengurangi shadow acne
/>`,
        tips: [
          "Shadow map 1024 cukup untuk kebanyakan kasus",
          "2048 atau 4096 untuk bayangan detail",
          "shadow-bias mengatasi artifak bayangan",
        ],
        quiz: [
          {
            question:
              "Properti mana yang harus diset true pada objek agar MENERIMA bayangan?",
            options: [
              "castShadow",
              "receiveShadow",
              "shadowEnabled",
              "acceptShadow",
            ],
            correctIndex: 1,
            explanation:
              "receiveShadow={true} membuat objek bisa menerima bayangan dari objek lain. castShadow untuk menghasilkan bayangan.",
          },
        ],
      },
    ],
  },
  {
    id: "character",
    title: "Komponen MovablePerson",
    icon: <Users size={18} />,
    subsections: [
      {
        title: "Loading Model 3D (GLTF/GLB)",
        content: `GLTF (GL Transmission Format) adalah format standar untuk model 3D di web. GLB adalah versi binary yang lebih compact.

GLTF bisa berisi:
- Geometry (mesh)
- Materials dan textures
- Skeleton/armature untuk animasi
- Pre-baked animations
- Scene hierarchy

React Three Drei menyediakan useGLTF hook untuk loading model dengan mudah.`,
        code: `import { useGLTF } from '@react-three/drei'

function Character() {
  const { scene, nodes, materials } = useGLTF('/person.glb')
  
  return <primitive object={scene} scale={0.6} />
}

// Preload untuk loading lebih cepat
useGLTF.preload('/person.glb')`,
        tips: [
          "Gunakan gltf.report untuk inspect dan optimize model",
          "Compress texture untuk file size lebih kecil",
          "Preload model yang akan segera digunakan",
        ],
        quiz: [
          {
            question: "Apa perbedaan antara GLTF dan GLB?",
            options: [
              "GLB lebih lambat",
              "GLB adalah versi binary/compact dari GLTF",
              "GLTF tidak support animasi",
              "GLB hanya untuk game",
            ],
            correctIndex: 1,
            explanation:
              "GLB adalah versi binary dari GLTF yang menggabungkan semua data dalam satu file, membuatnya lebih compact dan cepat untuk loading.",
          },
        ],
      },
      {
        title: "Skeleton dan Bone Animation",
        content: `Skeleton animation (rigging) adalah teknik menganimasikan model dengan memanipulasi "tulang" (bones).

Hierarchy bone:
- Root bone (biasanya di hip/pelvis)
- Parent-child relationship
- Rotasi parent mempengaruhi semua child

Dalam model GLTF, bone bisa diakses sebagai THREE.Bone objects.`,
        code: `// Mengakses dan memanipulasi bones
useEffect(() => {
  scene.traverse((child) => {
    if (child instanceof THREE.Bone) {
      bones[child.name] = {
        bone: child,
        initialRotation: child.rotation.clone()
      }
    }
  })
}, [scene])

// Animasi bone di useFrame
useFrame(() => {
  if (bones['arm_L']) {
    bones['arm_L'].bone.rotation.x = 
      initialRotation.x + Math.sin(time) * 0.5
  }
})`,
        quiz: [
          {
            question: "Dalam skeleton hierarchy, jika parent bone dirotasi...",
            options: [
              "Hanya parent yang bergerak",
              "Semua child bones ikut terpengaruh",
              "Child bones bergerak berlawanan",
              "Tidak ada efek",
            ],
            correctIndex: 1,
            explanation:
              "Dalam parent-child relationship, rotasi/transform pada parent akan mempengaruhi semua child-nya. Ini seperti mengangkat lengan - forearm dan hand ikut bergerak.",
          },
        ],
      },
      {
        title: "Cloning Scene",
        content: `Ketika menggunakan useGLTF, scene yang di-return adalah referensi yang sama. Untuk menghindari konflik antar instance:
- Clone scene menggunakan SkeletonUtils.clone()
- SkeletonUtils memastikan skeleton dan skinning terduplikasi dengan benar`,
        code: `import { SkeletonUtils } from 'three-stdlib'

function Character() {
  const { scene } = useGLTF('/person.glb')
  
  // Clone scene untuk instance ini
  const clonedScene = useMemo(
    () => SkeletonUtils.clone(scene), 
    [scene]
  )
  
  return <primitive object={clonedScene} />
}`,
        tips: [
          "Selalu clone jika akan memodifikasi scene",
          "useMemo mencegah re-clone setiap render",
        ],
        quiz: [
          {
            question: "Mengapa perlu clone scene dengan SkeletonUtils?",
            options: [
              "Untuk animasi lebih cepat",
              "Agar modifikasi pada satu instance tidak mempengaruhi instance lain",
              "Karena useGLTF tidak bekerja tanpa clone",
              "Untuk mengurangi memory usage",
            ],
            correctIndex: 1,
            explanation:
              "useGLTF mengembalikan referensi yang sama. Tanpa clone, perubahan pada satu karakter akan mempengaruhi semua karakter yang menggunakan model tersebut.",
          },
        ],
      },
    ],
  },
  {
    id: "input",
    title: "Sistem Input dan Kontrol",
    icon: <Gamepad2 size={18} />,
    subsections: [
      {
        title: "Keyboard Event Handling",
        content: `Untuk menggerakkan karakter, kita mendengarkan keyboard events:

keydown: Dipicu saat tombol ditekan
keyup: Dipicu saat tombol dilepas

Gunakan Set untuk tracking tombol yang sedang ditekan karena multiple keys bisa aktif bersamaan (untuk diagonal movement).`,
        code: `const keysPressed = useRef<Set<string>>(new Set())

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
        .includes(e.key)) {
      e.preventDefault() // Cegah scroll halaman
    }
    keysPressed.current.add(e.key)
    updateMovement()
  }
  
  const handleKeyUp = (e: KeyboardEvent) => {
    keysPressed.current.delete(e.key)
    updateMovement()
  }
  
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }
}, [])`,
        quiz: [
          {
            question: "Mengapa kita perlu e.preventDefault() untuk arrow keys?",
            options: [
              "Untuk membuat animasi lebih smooth",
              "Untuk mencegah browser scroll halaman saat bermain",
              "Karena arrow keys tidak bisa dideteksi tanpa itu",
              "Untuk menghemat memory",
            ],
            correctIndex: 1,
            explanation:
              "Arrow keys secara default memicu scroll halaman di browser. preventDefault() mencegah behavior default ini sehingga hanya karakter yang bergerak.",
          },
        ],
      },
      {
        title: "Movement Vector dan Rotasi",
        content: `Dari keys yang ditekan, kita menghitung movement vector dan rotasi karakter.

Movement vector (x, z):
- W / ArrowUp: z = -1 (maju)
- S / ArrowDown: z = 1 (mundur)
- A / ArrowLeft: x = -1 (kiri)
- D / ArrowRight: x = 1 (kanan)

Untuk rotasi menghadap arah gerakan, gunakan Math.atan2(x, z).`,
        code: `const updateMovement = () => {
  let x = 0, z = 0
  
  if (keysPressed.current.has('w')) z = -1
  if (keysPressed.current.has('s')) z = 1
  if (keysPressed.current.has('a')) x = -1
  if (keysPressed.current.has('d')) x = 1
  
  setMovement({ x, z })
  
  if (x !== 0 || z !== 0) {
    const angle = Math.atan2(x, z)
    setTargetRotation(angle)
  }
}`,
        quiz: [
          {
            question:
              "Jika player menekan W dan D bersamaan, gerakan apa yang terjadi?",
            options: [
              "Hanya maju",
              "Hanya ke kanan",
              "Diagonal maju-kanan",
              "Diam di tempat",
            ],
            correctIndex: 2,
            explanation:
              "W menghasilkan z=-1 dan D menghasilkan x=1. Kombinasi ini membuat vector diagonal maju-kanan.",
          },
          {
            question: "Fungsi Math.atan2(x, z) digunakan untuk apa?",
            options: [
              "Menghitung kecepatan",
              "Menghitung sudut rotasi agar karakter menghadap arah gerakan",
              "Menghitung jarak tempuh",
              "Menghitung posisi kamera",
            ],
            correctIndex: 1,
            explanation:
              "Math.atan2 menghitung sudut (dalam radian) dari origin ke titik (x, z), yang kita gunakan untuk merotasi karakter menghadap arah gerakan.",
          },
        ],
      },
    ],
  },
  {
    id: "animation",
    title: "Animasi Prosedural",
    icon: <Move3D size={18} />,
    subsections: [
      {
        title: "useFrame - Animation Loop",
        content: `useFrame adalah hook dari R3F yang dipanggil setiap frame (biasanya 60fps). Di sinilah kita update animasi.

useFrame menyediakan:
- state: Akses ke scene, camera, clock, dll
- delta: Waktu sejak frame terakhir (dalam detik)

Menggunakan delta time penting untuk animasi konsisten di berbagai refresh rate.`,
        code: `useFrame((state, delta) => {
  // delta = waktu sejak frame terakhir
  
  // Movement berdasarkan delta time
  const speed = 3 // unit per detik
  if (isMoving) {
    position.x += movement.x * speed * delta
    position.z += movement.z * speed * delta
  }
  
  // Animasi berdasarkan waktu
  const time = state.clock.elapsedTime
  mesh.rotation.y = Math.sin(time) * 0.5
})`,
        tips: [
          "Selalu kalikan dengan delta untuk konsistensi",
          "Hindari heavy computation di useFrame",
        ],
        quiz: [
          {
            question:
              "Mengapa perlu mengalikan movement dengan delta time?",
            options: [
              "Untuk membuat gerakan lebih lambat",
              "Agar kecepatan konsisten di berbagai frame rate",
              "Karena delta selalu nilai 1",
              "Untuk menghemat battery",
            ],
            correctIndex: 1,
            explanation:
              "Delta time adalah waktu antara frame. Dengan mengalikannya, gerakan menjadi konsisten baik di 30fps maupun 144fps - karakter bergerak dengan kecepatan yang sama per detik.",
          },
        ],
      },
      {
        title: "Walk Cycle Animation",
        content: `Walk cycle adalah animasi berulang gerakan kaki dan tangan saat berjalan.

Komponen walk cycle:
1. Leg swing: Kaki bergantian maju-mundur
2. Arm swing: Tangan berlawanan dengan kaki
3. Body bob: Sedikit naik-turun
4. Torso rotation: Sedikit twist

Menggunakan Math.sin() dengan fase berbeda untuk gerakan ritmis.`,
        code: `useFrame((state, delta) => {
  if (isMoving) {
    walkCycle += delta * 6 // Kecepatan animasi
  }
  
  const legSwing = Math.sin(walkCycle) * 0.4
  const armSwing = Math.sin(walkCycle + Math.PI) * 0.6
  
  // Kaki kiri maju saat kanan mundur
  bones['thigh_L'].rotation.x = legSwing
  bones['thigh_R'].rotation.x = -legSwing
  
  // Body bob
  const bob = Math.abs(Math.sin(walkCycle)) * 0.02
  group.position.y = baseY + bob
})`,
        quiz: [
          {
            question:
              "Mengapa arm swing menggunakan offset Math.PI dari leg swing?",
            options: [
              "Untuk mempercepat animasi",
              "Agar lengan bergerak berlawanan dengan kaki (natural walking)",
              "Karena lengan lebih panjang",
              "Untuk menghemat perhitungan",
            ],
            correctIndex: 1,
            explanation:
              "Saat berjalan natural, tangan kiri maju bersamaan dengan kaki kanan. Offset Math.PI (180°) pada sin wave membuat gerakan berlawanan.",
          },
        ],
      },
      {
        title: "Smooth Transitions",
        content: `Transisi antara pose harus halus. Gunakan Linear Interpolation (lerp).

THREE.MathUtils.lerp(current, target, alpha):
- Alpha 0.1 = lambat/smooth
- Alpha 0.5 = cepat`,
        code: `const anim = currentAnimRef.current
const lerpSpeed = delta * 6

// Target values
const targetLegSwing = isMoving ? Math.sin(walkCycle) : 0

// Smooth interpolation
anim.legSwing = THREE.MathUtils.lerp(
  anim.legSwing, 
  targetLegSwing, 
  lerpSpeed
)

// Apply smoothed values
bones['thigh_L'].rotation.x = anim.legSwing * 0.4`,
        quiz: [
          {
            question: "Jika lerp alpha = 0.1, apa yang terjadi?",
            options: [
              "Transisi instant",
              "Transisi lambat dan smooth",
              "Tidak ada pergerakan",
              "Animasi error",
            ],
            correctIndex: 1,
            explanation:
              "Alpha 0.1 berarti setiap frame hanya 10% dari perbedaan yang diterapkan. Ini membuat transisi terasa smooth dan gradual.",
          },
        ],
      },
    ],
  },
  {
    id: "footsteps",
    title: "Sistem Jejak Kaki",
    icon: <Footprints size={18} />,
    subsections: [
      {
        title: "Spawning Footsteps",
        content: `Jejak kaki adalah visual feedback untuk langkah karakter. Spawn saat kaki "menyentuh tanah" dalam walk cycle.

Logic spawning:
1. Track fase walk cycle
2. Deteksi saat melewati threshold (puncak swing)
3. Spawn di posisi karakter dengan offset kiri/kanan`,
        code: `const [footsteps, setFootsteps] = useState([])
const lastFoot = useRef(null)

useFrame(() => {
  if (!isMoving) return
  
  const swing = Math.sin(walkPhase)
  const threshold = 0.95
  
  if (swing > threshold && lastFoot.current !== 'left') {
    lastFoot.current = 'left'
    spawnFootstep('left')
  } else if (swing < -threshold && lastFoot.current !== 'right') {
    lastFoot.current = 'right'
    spawnFootstep('right')
  }
})`,
        quiz: [
          {
            question: "Kapan footstep di-spawn?",
            options: [
              "Setiap frame",
              "Saat Math.sin(walkPhase) melewati threshold tertentu",
              "Setiap 1 detik",
              "Saat tombol ditekan",
            ],
            correctIndex: 1,
            explanation:
              "Footstep di-spawn saat sine wave mencapai puncak (threshold 0.95 atau -0.95), yang merepresentasikan saat kaki menyentuh tanah dalam walk cycle.",
          },
        ],
      },
      {
        title: "Fade-out Effect",
        content: `Setiap footstep menghilang secara gradual dengan mengupdate opacity berdasarkan elapsed time.

Menggunakan MultiplyBlending agar bayangan terlihat natural.`,
        code: `function Footstep({ position, rotation, onComplete }) {
  const meshRef = useRef()
  const startTime = useRef(null)
  const duration = 3.0
  
  useFrame((state) => {
    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime
    }
    
    const elapsed = state.clock.elapsedTime - startTime.current
    const progress = Math.min(elapsed / duration, 1)
    
    if (progress >= 1) {
      onComplete()
      return
    }
    
    // Fade out
    meshRef.current.material.opacity = 0.35 * (1 - progress)
  })
  
  return (
    <mesh ref={meshRef}>
      <circleGeometry args={[0.15, 32]} />
      <meshStandardMaterial
        transparent
        blending={THREE.MultiplyBlending}
        premultipliedAlpha
      />
    </mesh>
  )
}`,
        tips: [
          "Batasi jumlah footsteps untuk performa",
          "MultiplyBlending untuk bayangan natural",
        ],
        quiz: [
          {
            question: "Mengapa menggunakan MultiplyBlending?",
            options: [
              "Untuk warna lebih terang",
              "Agar bayangan terlihat natural dengan memgelapkan area di bawahnya",
              "Untuk animasi lebih cepat",
              "Karena required oleh Three.js",
            ],
            correctIndex: 1,
            explanation:
              "MultiplyBlending mengalikan warna dengan warna di bawahnya, membuat efek menggelapkan yang natural seperti bayangan asli.",
          },
        ],
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting dan Tips",
    icon: <Wrench size={18} />,
    subsections: [
      {
        title: "Masalah Umum dan Solusi",
        content: `MODEL TIDAK MUNCUL
- Cek path file (harus di folder /public)
- Pastikan scale tidak terlalu kecil/besar
- Cek posisi kamera

ANIMASI PATAH-PATAH
- Gunakan delta time, bukan Date.now()
- Cek re-render berlebihan

BAYANGAN TIDAK MUNCUL
- Canvas: shadows={true}
- Light: castShadow={true}
- Object: castShadow/receiveShadow={true}

KARAKTER DALAM T-POSE
- Manipulasi shoulder dan arm bones saat mount

Z-FIGHTING (FLICKERING)
- Beri jarak minimal antar surface`,
        quiz: [
          {
            question: "Jika model 3D tidak muncul, apa yang pertama dicek?",
            options: [
              "Warna background",
              "Path file dan apakah ada di folder /public",
              "Kecepatan internet",
              "Versi browser",
            ],
            correctIndex: 1,
            explanation:
              "Masalah paling umum adalah path file salah atau file tidak ada di /public. Cek juga console untuk error loading.",
          },
        ],
      },
      {
        title: "Optimasi Performa",
        content: `GEOMETRY
- Batasi polygon count
- Dispose geometry yang tidak digunakan

MATERIALS
- Reuse materials jika memungkinkan

SHADOWS
- Sesuaikan shadow map size
- Batasi shadow casting objects

JAVASCRIPT
- Hindari object allocation di useFrame
- Gunakan refs untuk animasi`,
        code: `// Dispose saat unmount
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
  }
}, [])

// Gunakan refs untuk animasi
const animRef = useRef({ x: 0 })
useFrame(() => {
  animRef.current.x += 0.01 // Tidak trigger re-render
})`,
        tips: [
          "Profile dengan browser DevTools",
          "Test di low-end devices",
        ],
        quiz: [
          {
            question:
              "Mengapa sebaiknya menggunakan ref daripada state untuk nilai animasi?",
            options: [
              "Ref lebih cepat",
              "Perubahan ref tidak trigger re-render, menghindari unnecessary renders tiap frame",
              "State tidak bisa menyimpan angka",
              "Ref lebih mudah dibaca",
            ],
            correctIndex: 1,
            explanation:
              "setState akan memicu re-render komponen. Di useFrame yang dipanggil 60x/detik, ini akan menyebabkan 60 re-render per detik yang sangat tidak efisien.",
          },
        ],
      },
    ],
  },
  {
    id: "references",
    title: "Referensi Belajar",
    icon: <BookOpen size={18} />,
    subsections: [
      {
        title: "Dokumentasi Resmi",
        content: `REACT THREE FIBER
docs.pmnd.rs/react-three-fiber
- Getting started guide
- API reference lengkap

THREE.JS
threejs.org/docs
- Semua class dan method
- Examples interaktif

DREI (Helper Library)
github.com/pmndrs/drei
- Ready-to-use components
- Controls, loaders, effects`,
      },
      {
        title: "Tutorial dan Community",
        content: `THREE.JS JOURNEY (Recommended)
threejs-journey.com
- Course paling lengkap oleh Bruno Simon

YOUTUBE CHANNELS
- Fireship - Quick overviews
- Wrong Akram - R3F focused
- SimonDev - Advanced techniques

COMMUNITY
- Discord Poimandres (pmndrs)
- Reddit r/threejs
- Twitter #threejs #r3f`,
      },
      {
        title: "Tools Berguna",
        content: `MODEL & TEXTURE
- gltf.report - Inspect, validate, optimize GLTF
- Blender - Full-featured 3D software
- Mixamo - Animasi karakter gratis
- Polyhaven - Texture dan HDRI gratis

DEVELOPMENT
- R3F-Perf - Performance monitor
- Leva - GUI controls untuk debugging

OPTIMIZATION
- gltf-transform - CLI untuk optimize GLTF
- Draco compression - Geometry compression`,
        tips: [
          "Bookmark tools yang sering dipakai",
          "Join community untuk update terbaru",
        ],
      },
    ],
  },
];

// Quiz Component
function QuizSection({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === question.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
      onComplete(
        score + (selectedAnswer === question.correctIndex ? 1 : 0),
        questions.length
      );
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    const finalScore =
      score + (selectedAnswer === question.correctIndex ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);

    return (
      <div className="mt-6 rounded-xl bg-linear-to-br from-neutral-900 to-neutral-800 p-6 text-white">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy
            size={32}
            className={percentage >= 70 ? "text-yellow-400" : "text-neutral-400"}
          />
          <h4 className="text-xl font-bold">Quiz Selesai!</h4>
        </div>
        <div className="text-center mb-4">
          <p className="text-4xl font-bold mb-2">
            {finalScore} / {questions.length}
          </p>
          <p className="text-neutral-400">
            {percentage >= 70
              ? "Bagus! Kamu sudah memahami materi ini."
              : "Coba pelajari lagi materi ini."}
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition-colors"
        >
          <RotateCcw size={16} />
          Ulangi Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
          <HelpCircle size={16} />
          Quiz
        </div>
        <span className="text-xs text-neutral-400">
          {currentQuestion + 1} / {questions.length}
        </span>
      </div>

      <p className="font-medium text-neutral-800 mb-4">{question.question}</p>

      <div className="space-y-2 mb-4">
        {question.options.map((option, index) => {
          let bgClass = "bg-white hover:bg-neutral-100";
          let borderClass = "border-neutral-200";
          let iconElement = null;

          if (showResult) {
            if (index === question.correctIndex) {
              bgClass = "bg-green-50";
              borderClass = "border-green-300";
              iconElement = <CheckCircle2 size={18} className="text-green-600" />;
            } else if (index === selectedAnswer) {
              bgClass = "bg-red-50";
              borderClass = "border-red-300";
              iconElement = <XCircle size={18} className="text-red-600" />;
            }
          } else if (index === selectedAnswer) {
            borderClass = "border-neutral-400";
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={`w-full flex items-center justify-between rounded-lg border ${borderClass} ${bgClass} px-4 py-3 text-left text-sm transition-colors disabled:cursor-default`}
            >
              <span>{option}</span>
              {iconElement}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div
          className={`rounded-lg p-3 mb-4 text-sm ${selectedAnswer === question.correctIndex
            ? "bg-green-100 text-green-800"
            : "bg-amber-100 text-amber-800"
            }`}
        >
          {question.explanation}
        </div>
      )}

      {showResult && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 transition-colors"
        >
          {currentQuestion < questions.length - 1 ? (
            <>
              Pertanyaan Selanjutnya
              <ChevronRight size={16} />
            </>
          ) : (
            <>
              Lihat Hasil
              <Trophy size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [activeSubsection, setActiveSubsection] = useState(0);
  const [quizScores, setQuizScores] = useState<Record<string, { score: number; total: number }>>({});

  const currentSection = docSections[activeSection];
  const currentSubsection = currentSection.subsections[activeSubsection];

  const handleSectionChange = (index: number) => {
    setActiveSection(index);
    setActiveSubsection(0);
  };

  const handleNext = () => {
    if (activeSubsection < currentSection.subsections.length - 1) {
      setActiveSubsection(activeSubsection + 1);
    } else if (activeSection < docSections.length - 1) {
      setActiveSection(activeSection + 1);
      setActiveSubsection(0);
    }
  };

  const handlePrev = () => {
    if (activeSubsection > 0) {
      setActiveSubsection(activeSubsection - 1);
    } else if (activeSection > 0) {
      const prevSection = docSections[activeSection - 1];
      setActiveSection(activeSection - 1);
      setActiveSubsection(prevSection.subsections.length - 1);
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    const key = `${activeSection}-${activeSubsection}`;
    setQuizScores((prev) => ({ ...prev, [key]: { score, total } }));
  };

  const isFirst = activeSection === 0 && activeSubsection === 0;
  const isLast =
    activeSection === docSections.length - 1 &&
    activeSubsection === currentSection.subsections.length - 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/3d-basics"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <ArrowLeft size={16} />
                Kembali ke 3D Basics
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
                <GraduationCap size={18} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-neutral-800">
                  Dokumentasi Pembelajaran 3D
                </h1>
                <p className="text-xs text-neutral-500">
                  Panduan lengkap React Three Fiber
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl flex">
        {/* Sidebar */}
        <aside className="sticky top-[73px] h-[calc(100vh-73px)] w-72 shrink-0 overflow-y-auto border-r border-neutral-100 bg-neutral-50/50 p-4">
          <nav className="space-y-1">
            {docSections.map((section, index) => (
              <div key={section.id}>
                <button
                  onClick={() => handleSectionChange(index)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${activeSection === index
                    ? "bg-neutral-900 text-white shadow-md"
                    : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                >
                  {section.icon}
                  {section.title}
                </button>
                {activeSection === index && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-neutral-200 pl-3">
                    {section.subsections.map((sub, subIndex) => (
                      <button
                        key={subIndex}
                        onClick={() => setActiveSubsection(subIndex)}
                        className={`w-full flex items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-all ${activeSubsection === subIndex
                          ? "bg-neutral-200 text-neutral-900 font-medium"
                          : "text-neutral-500 hover:text-neutral-700"
                          }`}
                      >
                        <span>{sub.title}</span>
                        {sub.quiz && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            Quiz
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-73px)]">
          <div className="p-8 max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
              <span>{currentSection.title}</span>
              <ChevronRight size={12} />
              <span className="text-neutral-600">{currentSubsection.title}</span>
            </div>

            <h2 className="mb-6 text-3xl font-bold text-neutral-800">
              {currentSubsection.title}
            </h2>

            <div className="prose prose-neutral max-w-none">
              <p className="whitespace-pre-line text-neutral-600 leading-relaxed">
                {currentSubsection.content}
              </p>

              {currentSubsection.code && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Code size={14} className="text-neutral-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Contoh Kode
                    </span>
                  </div>
                  <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-sm leading-relaxed">
                    <code className="text-neutral-100 font-mono">
                      {currentSubsection.code}
                    </code>
                  </pre>
                </div>
              )}

              {currentSubsection.tips && currentSubsection.tips.length > 0 && (
                <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-amber-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                      Tips
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {currentSubsection.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="text-sm text-amber-800 flex items-start gap-2"
                      >
                        <span className="text-amber-500 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentSubsection.quiz && currentSubsection.quiz.length > 0 && (
                <QuizSection
                  key={`${activeSection}-${activeSubsection}`}
                  questions={currentSubsection.quiz}
                  onComplete={handleQuizComplete}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between border-t border-neutral-100 pt-6">
              <button
                onClick={handlePrev}
                disabled={isFirst}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>
              <div className="flex items-center gap-1">
                {docSections.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === activeSection
                      ? "w-6 bg-neutral-900"
                      : "w-1.5 bg-neutral-300"
                      }`}
                  />
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={isLast}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Selanjutnya
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
