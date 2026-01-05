<?php
/**
 * Mengambil data prakiraan cuaca dari BMKG dan mengkonversi menjadi kondisi ombak
 * Source: BMKG API
 */

header("Content-Type: application/json; charset=utf-8");

// Lokasi: Wediombo Beach (Yogyakarta)
$api_url = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=34.03.11.2008";

try {
    $response_body = @file_get_contents($api_url);
    
    if ($response_body === false) {
        throw new Exception("Gagal mengambil data dari BMKG API");
    }
    
    $data = json_decode($response_body, true);
    
    if ($data === null || json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Format data BMKG tidak valid");
    }
    
    // Extract location info
    $location = $data['lokasi'] ?? [];
    $locationName = $location['desa'] ?? 'Unknown';
    $province = $location['provinsi'] ?? 'Unknown';
    
    // Extract weather forecasts
    $forecasts = $data['data'][0]['cuaca'] ?? [];
    
    // Process data untuk wave monitoring
    $waveHours = [];
    $waveHeights = [];
    $windSpeeds = [];
    $temperatures = [];
    $descriptions = [];
    $currentData = [];
    
    foreach ($forecasts as $dayIndex => $dayForecasts) {
        if (!is_array($dayForecasts)) continue;
        
        foreach ($dayForecasts as $index => $forecast) {
            $datetime = $forecast['local_datetime'] ?? '';
            $timeOnly = substr($datetime, 11, 5); // Extract HH:MM
            
            // Parse wind speed (ws) - formula untuk estimasi tinggi ombak
            $windSpeed = (float)($forecast['ws'] ?? 0);
            $waveHeight = estimateWaveHeight($windSpeed);
            
            // Get temperature
            $temp = (int)($forecast['t'] ?? 28);
            $weatherDesc = $forecast['weather_desc'] ?? 'Unknown';
            $humidity = (int)($forecast['hu'] ?? 0);
            
            // Store data
            $waveHours[] = $timeOnly;
            $waveHeights[] = round($waveHeight, 2);
            $windSpeeds[] = round($windSpeed, 2);
            $temperatures[] = $temp;
            $descriptions[] = $weatherDesc;
            
            // Set current data (first forecast)
            if ($index === 0 && $dayIndex === 0) {
                $currentData = [
                    'waveHeight' => round($waveHeight, 2),
                    'windSpeed' => round($windSpeed, 2),
                    'temperature' => $temp,
                    'humidity' => $humidity,
                    'weatherDesc' => $weatherDesc,
                    'timestamp' => $datetime,
                    'waveCondition' => getWaveCondition($waveHeight)
                ];
            }
        }
    }
    
    // Response
    $response = [
        'success' => true,
        'source' => 'BMKG - Badan Meteorologi, Klimatologi, dan Geofisika',
        'location' => [
            'name' => $locationName,
            'province' => $province
        ],
        'current' => $currentData,
        'forecast' => [
            'hours' => array_slice($waveHours, 0, 24),
            'waveHeights' => array_slice($waveHeights, 0, 24),
            'windSpeeds' => array_slice($windSpeeds, 0, 24),
            'temperatures' => array_slice($temperatures, 0, 24)
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Estimate wave height dari wind speed (Beaufort scale adaptation)
function estimateWaveHeight($windSpeed) {
    // Konversi dari km/h ke wave height estimation
    // Lebih tinggi angin = lebih tinggi ombak
    if ($windSpeed < 10) {
        return 0.3;
    } elseif ($windSpeed < 20) {
        return 0.5 + ($windSpeed - 10) * 0.05;
    } elseif ($windSpeed < 30) {
        return 1.0 + ($windSpeed - 20) * 0.1;
    } elseif ($windSpeed < 40) {
        return 2.0 + ($windSpeed - 30) * 0.15;
    } else {
        return 3.5;
    }
}

// Get wave condition description
function getWaveCondition($height) {
    if ($height < 0.5) {
        return ['status' => 'Flat', 'level' => 'poor', 'advice' => 'Kondisi ombak terlalu kecil'];
    } elseif ($height < 1.0) {
        return ['status' => 'Small', 'level' => 'fair', 'advice' => 'Cocok untuk pemula'];
    } elseif ($height < 1.5) {
        return ['status' => 'Small-Medium', 'level' => 'good', 'advice' => 'Ideal untuk pemula dan menengah'];
    } elseif ($height < 2.0) {
        return ['status' => 'Medium', 'level' => 'good', 'advice' => 'Cocok untuk menengah ke atas'];
    } elseif ($height < 3.0) {
        return ['status' => 'Medium-Large', 'level' => 'excellent', 'advice' => 'Excellent untuk advanced surfers'];
    } else {
        return ['status' => 'Large', 'level' => 'warning', 'advice' => 'Hati-hati untuk semua level'];
    }
}
?>
