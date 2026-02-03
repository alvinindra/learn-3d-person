"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Clock,
  Target,
  BookOpen,
  ChevronRight,
  Shuffle,
} from "lucide-react";

interface QuizQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// All 40 quiz questions organized by curriculum topic
const allQuestions: QuizQuestion[] = [
  // Topic 1: Setting up 3D scene in R3F (6 questions)
  {
    id: 1,
    topic: "Setting up 3D Scene",
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
    id: 2,
    topic: "Setting up 3D Scene",
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
  {
    id: 3,
    topic: "Setting up 3D Scene",
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
    id: 4,
    topic: "Setting up 3D Scene",
    question: "Komponen apa yang menjadi container utama untuk scene 3D di R3F?",
    options: ["Scene", "Canvas", "Stage", "Container3D"],
    correctIndex: 1,
    explanation:
      "Canvas dari @react-three/fiber adalah komponen utama yang membuat context WebGL dan mengelola seluruh scene 3D.",
  },
  {
    id: 5,
    topic: "Setting up 3D Scene",
    question: "Apa fungsi dari properti 'dpr' pada Canvas?",
    options: [
      "Mengatur kedalaman render",
      "Menentukan device pixel ratio untuk retina display",
      "Mengontrol durasi animasi",
      "Mengatur transparansi",
    ],
    correctIndex: 1,
    explanation:
      "DPR (Device Pixel Ratio) mengontrol resolusi rendering untuk mendukung layar dengan kepadatan pixel tinggi seperti retina display.",
  },
  {
    id: 6,
    topic: "Setting up 3D Scene",
    question: "Apa keuntungan menggunakan React Three Fiber dibanding Three.js murni?",
    options: [
      "Performa lebih cepat",
      "Sintaks deklaratif seperti React biasa dan integrasi dengan ekosistem React",
      "Tidak memerlukan WebGL",
      "Bisa berjalan di server",
    ],
    correctIndex: 1,
    explanation:
      "R3F memungkinkan sintaks deklaratif seperti React, otomatis handle lifecycle, dan integrasi sempurna dengan hooks dan state management React.",
  },

  // Topic 2: Embedding person.glb model (6 questions)
  {
    id: 7,
    topic: "Embedding GLB Model",
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
  {
    id: 8,
    topic: "Embedding GLB Model",
    question: "Hook apa yang digunakan untuk load model GLTF di React Three Drei?",
    options: ["useLoader", "useGLTF", "useModel", "useAsset"],
    correctIndex: 1,
    explanation:
      "useGLTF dari @react-three/drei adalah cara termudah untuk loading model GLTF/GLB dengan caching otomatis dan preloading.",
  },
  {
    id: 9,
    topic: "Embedding GLB Model",
    question: "Di folder mana file GLB harus ditempatkan di proyek Next.js?",
    options: ["/src", "/components", "/public", "/assets"],
    correctIndex: 2,
    explanation:
      "File statis seperti model 3D harus ditempatkan di folder /public agar bisa diakses dengan path absolut.",
  },
  {
    id: 10,
    topic: "Embedding GLB Model",
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
  {
    id: 11,
    topic: "Embedding GLB Model",
    question: "Komponen apa yang digunakan untuk render object Three.js langsung di R3F?",
    options: ["<mesh>", "<object3D>", "<primitive>", "<rawObject>"],
    correctIndex: 2,
    explanation:
      "<primitive object={...} /> digunakan untuk merender Three.js object langsung di R3F, termasuk scene dari GLTF.",
  },
  {
    id: 12,
    topic: "Embedding GLB Model",
    question: "Apa fungsi useGLTF.preload()?",
    options: [
      "Menghapus model dari memory",
      "Memuat model sebelum komponen render untuk loading lebih cepat",
      "Mengupdate model secara real-time",
      "Mengkonversi GLB ke GLTF",
    ],
    correctIndex: 1,
    explanation:
      "preload() memuat model lebih awal sehingga saat komponen render, model sudah siap tanpa delay loading.",
  },

  // Topic 3: Understanding gltfjsx (5 questions)
  {
    id: 13,
    topic: "GLTFJSX",
    question: "Apa yang dilakukan oleh tool gltfjsx?",
    options: [
      "Menganimasikan model 3D",
      "Mengkonversi file GLTF/GLB menjadi komponen JSX React",
      "Membuat model 3D dari scratch",
      "Mengoptimasi texture",
    ],
    correctIndex: 1,
    explanation:
      "gltfjsx mengkonversi file GLTF/GLB menjadi komponen React yang bisa langsung digunakan dengan akses ke setiap mesh dan material.",
  },
  {
    id: 14,
    topic: "GLTFJSX",
    question: "Command apa untuk menjalankan gltfjsx?",
    options: [
      "npm run gltfjsx model.glb",
      "npx gltfjsx model.glb",
      "gltfjsx --convert model.glb",
      "node gltfjsx model.glb",
    ],
    correctIndex: 1,
    explanation:
      "npx gltfjsx [file.glb] adalah command untuk mengkonversi model menjadi komponen JSX.",
  },
  {
    id: 15,
    topic: "GLTFJSX",
    question: "Apa keuntungan menggunakan output gltfjsx dibanding primitive?",
    options: [
      "File lebih kecil",
      "Akses langsung ke setiap mesh, bone, dan material untuk customization",
      "Loading lebih cepat",
      "Tidak perlu Three.js",
    ],
    correctIndex: 1,
    explanation:
      "Output gltfjsx memberikan akses granular ke setiap bagian model (nodes, materials) sehingga mudah di-customize.",
  },
  {
    id: 16,
    topic: "GLTFJSX",
    question: "Flag apa yang digunakan untuk menghasilkan TypeScript dari gltfjsx?",
    options: ["--typescript", "--ts", "-t", "--type"],
    correctIndex: 2,
    explanation:
      "npx gltfjsx model.glb -t menghasilkan file .tsx dengan type definitions yang proper.",
  },
  {
    id: 17,
    topic: "GLTFJSX",
    question: "Apa itu Draco compression yang sering digunakan dengan GLTF?",
    options: [
      "Kompresi texture",
      "Kompresi geometry untuk file size lebih kecil",
      "Kompresi animasi",
      "Kompresi audio",
    ],
    correctIndex: 1,
    explanation:
      "Draco compression adalah algoritma kompresi geometry yang bisa mengurangi ukuran file GLTF secara signifikan.",
  },

  // Topic 4: Applying basic lighting (6 questions)
  {
    id: 18,
    topic: "Basic Lighting",
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
    id: 19,
    topic: "Basic Lighting",
    question: "Untuk mensimulasikan cahaya matahari, cahaya mana yang paling cocok?",
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
  {
    id: 20,
    topic: "Basic Lighting",
    question: "Properti mana yang harus diset true pada objek agar MENERIMA bayangan?",
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
  {
    id: 21,
    topic: "Basic Lighting",
    question: "Apa fungsi dari shadow-mapSize pada DirectionalLight?",
    options: [
      "Mengatur ukuran bayangan",
      "Menentukan resolusi shadow map untuk kualitas bayangan",
      "Mengatur jarak bayangan",
      "Mengatur warna bayangan",
    ],
    correctIndex: 1,
    explanation:
      "shadow-mapSize menentukan resolusi texture shadow map. Nilai lebih tinggi = bayangan lebih detail tapi lebih berat.",
  },
  {
    id: 22,
    topic: "Basic Lighting",
    question: "HemisphereLight mensimulasikan efek pencahayaan seperti apa?",
    options: [
      "Lampu sorot",
      "Cahaya gradien dari langit ke tanah",
      "Cahaya dari satu titik",
      "Cahaya laser",
    ],
    correctIndex: 1,
    explanation:
      "HemisphereLight mensimulasikan cahaya ambient outdoor dengan gradien warna dari langit (atas) ke tanah (bawah).",
  },
  {
    id: 23,
    topic: "Basic Lighting",
    question: "Apa itu shadow-bias dan mengapa diperlukan?",
    options: [
      "Untuk membuat bayangan lebih gelap",
      "Untuk mengurangi artifak shadow acne pada permukaan",
      "Untuk mempercepat rendering",
      "Untuk mengatur transparansi bayangan",
    ],
    correctIndex: 1,
    explanation:
      "shadow-bias adalah offset kecil untuk mencegah shadow acne, yaitu artifak striping yang muncul saat permukaan menghasilkan bayangan pada dirinya sendiri.",
  },

  // Topic 5: Camera basics (6 questions)
  {
    id: 24,
    topic: "Camera Basics",
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
  {
    id: 25,
    topic: "Camera Basics",
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
  {
    id: 26,
    topic: "Camera Basics",
    question: "Apa fungsi dari near dan far clipping plane pada kamera?",
    options: [
      "Mengatur warna background",
      "Membatasi jarak render minimum dan maksimum",
      "Mengontrol kecepatan kamera",
      "Mengatur resolusi",
    ],
    correctIndex: 1,
    explanation:
      "Near dan far plane menentukan batas jarak objek yang akan dirender. Objek di luar range ini tidak akan terlihat.",
  },
  {
    id: 27,
    topic: "Camera Basics",
    question: "OrbitControls dari drei digunakan untuk?",
    options: [
      "Menganimasikan kamera otomatis",
      "Memungkinkan user mengontrol kamera dengan mouse (orbit, zoom, pan)",
      "Membuat kamera mengikuti objek",
      "Mengunci posisi kamera",
    ],
    correctIndex: 1,
    explanation:
      "OrbitControls memungkinkan interaksi mouse untuk memutar (orbit), zoom, dan pan kamera di sekitar target point.",
  },
  {
    id: 28,
    topic: "Camera Basics",
    question: "Hook apa untuk mengakses kamera di dalam komponen R3F?",
    options: ["useCamera", "useThree", "useCanvas", "useScene"],
    correctIndex: 1,
    explanation:
      "useThree() mengembalikan state R3F termasuk camera, scene, gl (renderer), dan lainnya.",
  },
  {
    id: 29,
    topic: "Camera Basics",
    question: "Apa perbedaan utama PerspectiveCamera dan OrthographicCamera?",
    options: [
      "Kecepatan render",
      "PerspectiveCamera memiliki depth distortion, Orthographic tidak",
      "Warna yang didukung",
      "Jumlah objek yang bisa dilihat",
    ],
    correctIndex: 1,
    explanation:
      "PerspectiveCamera mensimulasikan penglihatan manusia dengan depth (objek jauh lebih kecil), OrthographicCamera tidak memiliki depth distortion.",
  },

  // Topic 6: Plane geometry / ground surface (5 questions)
  {
    id: 30,
    topic: "Plane Geometry",
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
  {
    id: 31,
    topic: "Plane Geometry",
    question: "Sumbu mana yang menentukan posisi vertikal objek?",
    options: ["X-Axis", "Y-Axis", "Z-Axis", "W-Axis"],
    correctIndex: 1,
    explanation:
      "Y-Axis adalah sumbu vertikal. Nilai Y positif berarti objek lebih tinggi, negatif berarti lebih rendah.",
  },
  {
    id: 32,
    topic: "Plane Geometry",
    question: "Berapa nilai radian untuk rotasi 90 derajat?",
    options: ["Math.PI", "Math.PI / 2", "Math.PI / 4", "Math.PI * 2"],
    correctIndex: 1,
    explanation:
      "90 derajat = π/2 radian. Karena 180 derajat = π, maka 90 derajat = π/2.",
  },
  {
    id: 33,
    topic: "Plane Geometry",
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
  {
    id: 34,
    topic: "Plane Geometry",
    question: "Apa itu z-fighting dan bagaimana mengatasinya?",
    options: [
      "Konflik antar texture, atasi dengan material berbeda",
      "Flickering saat dua surface terlalu dekat, atasi dengan memberi jarak minimal",
      "Error saat render, atasi dengan restart",
      "Masalah performa, atasi dengan mengurangi polygon",
    ],
    correctIndex: 1,
    explanation:
      "Z-fighting adalah flickering yang terjadi saat dua surface hampir sejajar di kedalaman yang sama. Solusinya memberi jarak minimal antar surface.",
  },

  // Topic 7: Movement with keyboard arrows (6 questions)
  {
    id: 35,
    topic: "Keyboard Movement",
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
  {
    id: 36,
    topic: "Keyboard Movement",
    question: "Jika player menekan W dan D bersamaan, gerakan apa yang terjadi?",
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
    id: 37,
    topic: "Keyboard Movement",
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
  {
    id: 38,
    topic: "Keyboard Movement",
    question: "Mengapa perlu mengalikan movement dengan delta time?",
    options: [
      "Untuk membuat gerakan lebih lambat",
      "Agar kecepatan konsisten di berbagai frame rate",
      "Karena delta selalu nilai 1",
      "Untuk menghemat battery",
    ],
    correctIndex: 1,
    explanation:
      "Delta time adalah waktu antara frame. Dengan mengalikannya, gerakan menjadi konsisten baik di 30fps maupun 144fps.",
  },
  {
    id: 39,
    topic: "Keyboard Movement",
    question: "Mengapa sebaiknya menggunakan ref daripada state untuk nilai animasi?",
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
  {
    id: 40,
    topic: "Keyboard Movement",
    question: "Mengapa arm swing menggunakan offset Math.PI dari leg swing?",
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
];

// Shuffle function using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Topic colors for visual distinction
const topicColors: Record<string, string> = {
  "Setting up 3D Scene": "bg-blue-100 text-blue-700",
  "Embedding GLB Model": "bg-purple-100 text-purple-700",
  "GLTFJSX": "bg-pink-100 text-pink-700",
  "Basic Lighting": "bg-amber-100 text-amber-700",
  "Camera Basics": "bg-green-100 text-green-700",
  "Plane Geometry": "bg-cyan-100 text-cyan-700",
  "Keyboard Movement": "bg-rose-100 text-rose-700",
};

export default function ExamPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize shuffled questions
  useEffect(() => {
    setQuestions(shuffleArray(allQuestions));
    setStartTime(new Date());
  }, []);

  // Timer
  useEffect(() => {
    if (!startTime || isComplete) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }));
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleReset = () => {
    setQuestions(shuffleArray(allQuestions));
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setIsComplete(false);
    setStartTime(new Date());
    setElapsedTime(0);
  };

  // Calculate score
  const score = useMemo(() => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  }, [answers, questions]);

  // Calculate score by topic
  const scoreByTopic = useMemo(() => {
    const topics: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q) => {
      if (!topics[q.topic]) {
        topics[q.topic] = { correct: 0, total: 0 };
      }
      topics[q.topic].total++;
      if (answers[q.id] === q.correctIndex) {
        topics[q.topic].correct++;
      }
    });
    return topics;
  }, [answers, questions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = percentage >= 70;

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading exam...</div>
      </div>
    );
  }

  // Results screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="mx-auto max-w-3xl px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${passed ? "bg-green-500/20" : "bg-red-500/20"
                }`}
            >
              <Trophy size={40} className={passed ? "text-green-400" : "text-red-400"} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {passed ? "Selamat! Kamu Lulus!" : "Belum Lulus"}
            </h1>
            <p className="text-neutral-400">
              {passed
                ? "Kamu sudah menguasai dasar-dasar 3D dengan React Three Fiber"
                : "Pelajari lagi materinya dan coba lagi"}
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-neutral-800/50 backdrop-blur border border-neutral-700 rounded-2xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-white mb-2">
                {score} / {questions.length}
              </div>
              <div
                className={`text-2xl font-semibold ${passed ? "text-green-400" : "text-red-400"}`}
              >
                {percentage}%
              </div>
              <div className="flex items-center justify-center gap-2 text-neutral-400 mt-2">
                <Clock size={16} />
                <span>Waktu: {formatTime(elapsedTime)}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-neutral-700 rounded-full overflow-hidden mb-8">
              <div
                className={`h-full transition-all duration-500 ${passed ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-red-500 to-orange-400"
                  }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Score by topic */}
            <h3 className="text-lg font-semibold text-white mb-4">Hasil per Topik</h3>
            <div className="space-y-3">
              {Object.entries(scoreByTopic).map(([topic, { correct, total }]) => {
                const topicPercent = Math.round((correct / total) * 100);
                return (
                  <div key={topic} className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${topicColors[topic] || "bg-neutral-100 text-neutral-700"}`}
                    >
                      {topic}
                    </span>
                    <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${topicPercent >= 70 ? "bg-green-500" : "bg-red-500"}`}
                        style={{ width: `${topicPercent}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-400 w-16 text-right">
                      {correct}/{total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/3d-basics"
              className="flex-1 flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl py-4 font-medium transition-colors"
            >
              <ArrowLeft size={18} />
              Kembali ke 3D Basics
            </Link>
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-4 font-medium transition-colors"
            >
              <RotateCcw size={18} />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Exam question screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-700/50 bg-neutral-900/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/3d-basics"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Kembali</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-neutral-400">
                <BookOpen size={18} />
                <span className="text-sm font-medium">3D Basics Exam</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-neutral-400">
                <Clock size={16} />
                <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                title="Reset & Shuffle"
              >
                <Shuffle size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-neutral-800">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Question info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 text-white font-bold">
              {currentIndex + 1}
            </div>
            <span className="text-neutral-500">dari {questions.length}</span>
          </div>
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${topicColors[currentQuestion.topic] || "bg-neutral-100 text-neutral-700"
              }`}
          >
            {currentQuestion.topic}
          </span>
        </div>

        {/* Question card */}
        <div className="bg-neutral-800/50 backdrop-blur border border-neutral-700 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let bgClass = "bg-neutral-700/50 hover:bg-neutral-700 border-neutral-600";
              let textClass = "text-neutral-200";
              let iconElement = null;

              if (showResult) {
                if (index === currentQuestion.correctIndex) {
                  bgClass = "bg-green-500/20 border-green-500";
                  textClass = "text-green-300";
                  iconElement = <CheckCircle2 size={20} className="text-green-400" />;
                } else if (index === answers[currentQuestion.id]) {
                  bgClass = "bg-red-500/20 border-red-500";
                  textClass = "text-red-300";
                  iconElement = <XCircle size={20} className="text-red-400" />;
                } else {
                  bgClass = "bg-neutral-800/50 border-neutral-700";
                  textClass = "text-neutral-500";
                }
              } else if (answers[currentQuestion.id] === index) {
                bgClass = "bg-blue-500/20 border-blue-500";
                textClass = "text-blue-300";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full flex items-center justify-between rounded-xl border ${bgClass} px-5 py-4 text-left transition-all disabled:cursor-default`}
                >
                  <span className={textClass}>{option}</span>
                  {iconElement}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div
              className={`mt-6 rounded-xl p-4 ${answers[currentQuestion.id] === currentQuestion.correctIndex
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-amber-500/10 border border-amber-500/30"
                }`}
            >
              <p
                className={`text-sm ${answers[currentQuestion.id] === currentQuestion.correctIndex
                    ? "text-green-300"
                    : "text-amber-300"
                  }`}
              >
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        {showResult && (
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-4 font-medium transition-colors"
          >
            {currentIndex < questions.length - 1 ? (
              <>
                Pertanyaan Selanjutnya
                <ChevronRight size={18} />
              </>
            ) : (
              <>
                Lihat Hasil
                <Trophy size={18} />
              </>
            )}
          </button>
        )}

        {/* Quick stats */}
        <div className="mt-8 flex justify-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{score}</div>
            <div className="text-xs text-neutral-500">Benar</div>
          </div>
          <div className="w-px bg-neutral-700" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {Object.keys(answers).length - score}
            </div>
            <div className="text-xs text-neutral-500">Salah</div>
          </div>
          <div className="w-px bg-neutral-700" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {questions.length - Object.keys(answers).length}
            </div>
            <div className="text-xs text-neutral-500">Tersisa</div>
          </div>
        </div>
      </main>
    </div>
  );
}
