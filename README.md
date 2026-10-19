# CONFIDENT BOOST - Luxury Gold JavaScript Animation 🌟

โปรเจกต์ JavaScript Animation ระดับพรีเมียม สร้างขึ้นจากภาพโปสเตอร์ผลิตภัณฑ์ **CONFIDENT BOOST MOUTHWASH** ผสมผสาน **HTML5 Canvas 2D Particles**, **3D Parallax Tilt**, **Liquid Wave Ribbons**, **4-Point Star Flares** และ **Web Audio API Sound Synthesizer**

---

## 📁 โครงสร้างโปรเจกต์ (Project Files)

```
confident-boost-animation/
├── index.html        # โครงสร้างหน้าเว็บ หน้าต่าง 3D Showcase และแผงควบคุม (Control Deck)
├── style.css         # สไตล์ความหรูหรา Glassmorphism, แสงสะท้อน Specular Sheen และสวิตช์ควบคุม
├── script.js         # ขุมพลัง JavaScript: Particle Engine, Sine Wave Ribbons, 3D Lerp Physics
├── poster.jpg        # ภาพต้นฉบับผลิตภัณฑ์ CONFIDENT BOOST (768 x 1024)
└── README.md         # คำอธิบายเทคนิคและวิธีนำไปปรับใช้
```

---

## ✨ คุณสมบัติและเทคนิคเด่น (Key Features & Engineering)

### 1. HTML5 Canvas Particles & Blend Modes
- **Champagne Gold Dust**: ละอองฝุ่นสีทองกว่า 140 อนุภาคที่ลอยขึ้นช้าๆ พร้อมเอฟเฟกต์กะพริบวิบวับแบบคลื่นฮาร์โมนิก $\sin(\omega t)$
- **Soft Golden Bokeh Orbs**: ลูกแก้วโบเก้แสงกลมละมุน พร้อมไล่เฉด `createRadialGradient` ผสานกับโหมด `globalCompositeOperation = 'screen'` เพื่อให้แสงซ้อนทับกันอย่างนุ่มนวล
- **Mouse Sparks Trail**: ละอองประกายดาวติดตามเคอร์เซอร์เมื่อเลื่อนเมาส์ผ่านตัวขวด
- **Shockwave & Star Bursts**: แรงระเบิดคลื่นวงแหวนแสงและประกายดาว 40-70 ดวงกระจายรอบทิศทางเมื่อคลิก

### 2. 4-Point Star Flares (ประกายดาวสะท้อนแสง)
- วาดรูปทรง Cross Star Flare ด้วย Bezier Tapered Spikes ที่จุดแสงสำคัญบนโปสเตอร์:
  - ดาวประกายหัวข้อ "NEW" ด้านบนซ้าย
  - แสงสะท้อนฝาทองคำ (Gold Metallic Cap)
  - ขอบแท่นวางสินค้า (Gold Pedestal Rims)
  - เหลี่ยมเจียระไนก้นขวดแก้วคริสตัล (Crystal Diamond Facets)
  - โลโก้สัญลักษณ์ฟันและมงกุฎบนฉลากสีทอง

### 3. Dynamic Liquid Wave Ribbon (เกลียวคลื่นน้ำยาบ้วนปาก)
- ใช้สมการพารามิเตอร์คลื่น Sine Wave หลายความถี่ ซ้อนกันตามเส้นโค้งรอบขวด จำลองกระแสน้ำยาบ้วนปากที่โปร่งแสงและสะท้อนประกายทองตามภาพโฆษณา

### 4. 3D Parallax Tilt & Specular Sheen
- คำนวณแกนหมุน 3D (`rotateX`, `rotateY`) แบบมีมุมมองมิติ (`perspective(1200px)`)
- ใช้ระบบ **Linear Interpolation (Lerp)** ความเร็ว 60fps เพื่อให้การเอียงนุ่มนวล ไม่กระตุก
- แผ่นแสงสะท้อนเลื่อมเงา (Specular Sheen) วิ่งตามทิศทางเมาส์แบบไดนามิก

### 5. Web Audio API Crystal Chime Synthesizer
- สังเคราะห์เสียงกระดิ่งคริสตัลระยิบระยับสดๆ จากบราวเซอร์ด้วยคลื่นความถี่เพนทาโทนิก (Pentatonic Scale: C6, E6, G6, B6, C7, E7)
- ไม่ต้องโหลดไฟล์ MP3 หรือเสียงภายนอก โหลดไว ทำงานได้ 100% ทุกที่

---

## 🚀 วิธีเปิดใช้งาน (How to Run)

1. ดับเบิ้ลคลิกเปิดไฟล์ `index.html` ในเว็บบราวเซอร์ (Chrome, Edge, Safari, Firefox)
2. หรือใช้ Live Server / HTTP Server:
   ```powershell
   # ใช้ Python สร้าง local server ง่ายๆ (ถ้ามี python)
   python -m http.server 8000
   ```
   แล้วเปิด `http://localhost:8000` ในบราวเซอร์

---

## 🛠️ การตั้งค่าและปรับแต่ง (Customization)

ในไฟล์ `script.js`:
- ปรับความเร็วอนิเมชั่นได้ที่ตัวแปร `this.globalTime`
- ปรับตำแหน่งประกายดาวในอาร์เรย์ `this.fixedFlares` โดยกำหนดค่าพิกัดนอร์มัลไลซ์ `nx` (0..1) และ `ny` (0..1)
- ปรับเปลี่ยนโทนสีละอองทองได้ที่พาเลตต์ `color` ในฟังก์ชัน `triggerBurst`
