// Inisialisasi peta Pantai Wediombo
export function initWediomboMap() {
  const mapContainer = document.getElementById('wediomboMap');
  
  if (!mapContainer) {
    console.warn('Kontainer peta tidak ditemukan');
    return;
  }

  // Koordinat Pantai Wediombo (anchor di zona pasir)
  // Desa Jepitu, Kecamatan Girisubo, Gunungkidul
  // GPS: S8°11'13" E110°42'33" ≈ -8.18695, 110.70920
  const wediomboCoords = [-8.18695, 110.70920];

  // Inisialisasi peta dengan zoom level yang tepat
  const map = L.map('wediomboMap', {
    center: wediomboCoords,
    zoom: 17, // Zoom lebih dekat untuk detail
    scrollWheelZoom: true,
    zoomControl: true
  });

  // Tambahkan tile layer dari OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  // Custom icon untuk marker
  const surfIcon = L.divIcon({
    className: 'custom-surf-marker',
    html: `<div style="
      background: linear-gradient(135deg, #0066cc, #003366);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transform: rotate(-45deg);
      position: relative;
    ">
      <i class="fas fa-water" style="transform: rotate(45deg);"></i>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  // Tambahkan marker dengan popup
  const marker = L.marker(wediomboCoords, { icon: surfIcon }).addTo(map);
  
  marker.bindPopup(`
    <div style="font-family: 'Poppins', sans-serif; padding: 5px;">
      <h3 style="margin: 0 0 8px 0; color: #003366; font-size: 16px;">
        <i class="fas fa-map-marker-alt" style="color: #0066cc;"></i> 
        Pantai Wediombo
      </h3>
      <p style="margin: 5px 0; font-size: 13px;">
        <i class="fas fa-location-dot"></i> Desa Jepitu, Gunungkidul
      </p>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">
        <i class="fas fa-water"></i> Surga Surfing di Pantai Selatan
      </p>
      <a href="https://www.google.com/maps/dir/?api=1&destination=-8.18695,110.70920" 
         target="_blank" 
         style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; font-size: 12px;">
        <i class="fas fa-directions"></i> Petunjuk Arah
      </a>
    </div>
  `).openPopup();

  // Tambahkan area circle untuk zona surfing (lebih kecil dan akurat)
  const surfZone = L.circle(wediomboCoords, {
    color: '#0066cc',
    fillColor: '#30cfd0',
    fillOpacity: 0.2,
    radius: 250 // 250 meter radius - lebih akurat
  }).addTo(map);

  surfZone.bindPopup(`
    <div style="font-family: 'Poppins', sans-serif;">
      <strong style="color: #003366;">Zona Surfing</strong><br>
      <span style="font-size: 12px;">Area aman untuk aktivitas surfing</span>
    </div>
  `);

  // Tambahkan marker untuk spot-spot surfing (dalam zona aman Wediombo)
  const surfSpots = [
    {
      name: 'Spot Pemula',
      coords: [-8.18700, 110.70905], // dekat garis air, sisi timur pasir
      level: 'Beginner',
      color: '#4CAF50',
      description: 'Jarak: 10-30m. White water aman untuk belajar'
    },
    {
      name: 'Spot Intermediate',
      coords: [-8.18685, 110.70870], // agak ke tengah teluk
      level: 'Intermediate',
      color: '#FF9800',
      description: 'Jarak: 40-80m. Area tengah teluk, ombak konsisten'
    },
    {
      name: 'Spot Pro',
      coords: [-8.18650, 110.70845], // lebih ke luar teluk, ombak lebih besar
      level: 'Professional',
      color: '#F44336',
      description: 'Jarak: 100-200m. Luar teluk, ombak besar & kuat'
    }
  ];

  surfSpots.forEach(spot => {
    const spotMarker = L.circleMarker(spot.coords, {
      radius: 10,
      fillColor: spot.color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map);

    spotMarker.bindPopup(`
      <div style="font-family: 'Poppins', sans-serif; text-align: center; padding: 5px;">
        <strong style="color: ${spot.color}; font-size: 14px;">${spot.name}</strong><br>
        <span style="font-size: 11px; color: #666;">${spot.level}</span><br>
        <span style="font-size: 10px; color: #999;">${spot.description}</span>
      </div>
    `);
  });

  console.log('✅ Peta Pantai Wediombo berhasil dimuat!');
}
