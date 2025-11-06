import { useState, useEffect } from 'react';
import { Map, Trophy, Award } from 'lucide-react';
import axios from 'axios';

interface RegionStats {
  region: string;
  store_count: number;
  total_1st_wins: number;
  total_2nd_wins: number;
  total_wins: number;
  avg_1st_wins: number;
  avg_2nd_wins: number;
}

// 한국 지역 좌표 (간략화된 좌표)
const REGION_COORDINATES: Record<string, { x: number; y: number }> = {
  '서울특별시': { x: 127.0, y: 37.5 },
  '부산광역시': { x: 129.0, y: 35.1 },
  '대구광역시': { x: 128.6, y: 35.8 },
  '인천광역시': { x: 126.7, y: 37.4 },
  '광주광역시': { x: 126.9, y: 35.1 },
  '대전광역시': { x: 127.4, y: 36.3 },
  '울산광역시': { x: 129.3, y: 35.5 },
  '세종특별자치시': { x: 127.3, y: 36.5 },
  '경기도': { x: 127.0, y: 37.4 },
  '강원특별자치도': { x: 128.0, y: 37.8 },
  '충청북도': { x: 127.5, y: 36.8 },
  '충청남도': { x: 126.8, y: 36.5 },
  '전북특별자치도': { x: 127.1, y: 35.7 },
  '전라남도': { x: 126.7, y: 34.8 },
  '경상북도': { x: 128.8, y: 36.4 },
  '경상남도': { x: 128.2, y: 35.4 },
  '제주특별자치도': { x: 126.5, y: 33.5 },
};

export default function StoreMap() {
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRegionStats();
  }, []);

  const loadRegionStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/data/stores/stats/region');
      if (response.data.success) {
        setRegionStats(response.data.data);
      }
    } catch (error) {
      console.error('지역 통계 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorByWins = (wins: number) => {
    if (wins >= 40) return '#ef4444'; // red-500
    if (wins >= 30) return '#f97316'; // orange-500
    if (wins >= 20) return '#eab308'; // yellow-500
    if (wins >= 10) return '#84cc16'; // lime-500
    return '#94a3b8'; // slate-400
  };

  const getSize = (wins: number) => {
    return Math.max(30, Math.min(100, wins * 2));
  };

  // SVG 좌표 변환 (경도/위도 → SVG 좌표)
  const convertCoords = (lon: number, lat: number) => {
    const minLon = 124.5;
    const maxLon = 131.5;
    const minLat = 33.0;
    const maxLat = 38.5;
    
    const x = ((lon - minLon) / (maxLon - minLon)) * 600;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 700;
    
    return { x, y };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Map className="w-8 h-8" />
            <h1 className="text-3xl font-bold">지역별 당첨 현황</h1>
          </div>
          <p className="text-blue-100">1등/2등 배출 지역 분포</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 지도 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">대한민국 당첨 지도</h2>
              
              {loading ? (
                <div className="h-[700px] flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="relative">
                  <svg
                    viewBox="0 0 600 700"
                    className="w-full h-auto border border-slate-200 rounded-lg bg-slate-50"
                  >
                    {/* 배경 그리드 */}
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="600" height="700" fill="url(#grid)" />
                    
                    {/* 범례 */}
                    <g transform="translate(20, 20)">
                      <text x="0" y="0" fontSize="14" fontWeight="bold" fill="#334155">
                        당첨 횟수
                      </text>
                      <circle cx="10" cy="25" r="6" fill="#ef4444" />
                      <text x="25" y="30" fontSize="12" fill="#64748b">40회 이상</text>
                      
                      <circle cx="10" cy="45" r="6" fill="#f97316" />
                      <text x="25" y="50" fontSize="12" fill="#64748b">30-39회</text>
                      
                      <circle cx="10" cy="65" r="6" fill="#eab308" />
                      <text x="25" y="70" fontSize="12" fill="#64748b">20-29회</text>
                      
                      <circle cx="10" cy="85" r="6" fill="#84cc16" />
                      <text x="25" y="90" fontSize="12" fill="#64748b">10-19회</text>
                      
                      <circle cx="10" cy="105" r="6" fill="#94a3b8" />
                      <text x="25" y="110" fontSize="12" fill="#64748b">10회 미만</text>
                    </g>
                    
                    {/* 지역별 원형 마커 */}
                    {regionStats.map((region) => {
                      const coords = REGION_COORDINATES[region.region];
                      if (!coords) return null;
                      
                      const { x, y } = convertCoords(coords.x, coords.y);
                      const radius = getSize(region.total_wins) / 4;
                      const color = getColorByWins(region.total_wins);
                      const isSelected = selectedRegion === region.region;
                      
                      return (
                        <g
                          key={region.region}
                          onMouseEnter={() => setSelectedRegion(region.region)}
                          onMouseLeave={() => setSelectedRegion(null)}
                          className="cursor-pointer transition-all"
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={radius}
                            fill={color}
                            fillOpacity={isSelected ? 0.9 : 0.7}
                            stroke="white"
                            strokeWidth={isSelected ? 3 : 2}
                            className="transition-all"
                          />
                          
                          {/* 지역명 */}
                          <text
                            x={x}
                            y={y - radius - 8}
                            textAnchor="middle"
                            fontSize={isSelected ? "14" : "12"}
                            fontWeight={isSelected ? "bold" : "normal"}
                            fill="#1e293b"
                            className="transition-all pointer-events-none"
                          >
                            {region.region.replace('특별시', '').replace('광역시', '').replace('특별자치시', '').replace('특별자치도', '').replace('도', '')}
                          </text>
                          
                          {/* 당첨 횟수 */}
                          <text
                            x={x}
                            y={y + 5}
                            textAnchor="middle"
                            fontSize={isSelected ? "16" : "14"}
                            fontWeight="bold"
                            fill="white"
                            className="transition-all pointer-events-none"
                          >
                            {region.total_wins}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* 통계 패널 */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">지역별 순위</h2>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {regionStats
                  .sort((a, b) => b.total_wins - a.total_wins)
                  .map((region, index) => (
                    <div
                      key={region.region}
                      onMouseEnter={() => setSelectedRegion(region.region)}
                      onMouseLeave={() => setSelectedRegion(null)}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedRegion === region.region
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-slate-400">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {region.region.replace('특별시', '').replace('광역시', '').replace('특별자치시', '').replace('특별자치도', '')}
                            </h3>
                            <p className="text-xs text-slate-600">
                              {region.store_count}개 판매점
                            </p>
                          </div>
                        </div>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: getColorByWins(region.total_wins) }}
                        >
                          {region.total_wins}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <div>
                            <p className="text-xs text-slate-600">1등</p>
                            <p className="font-semibold text-slate-900">{region.total_1st_wins}회</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-600">2등</p>
                            <p className="font-semibold text-slate-900">{region.total_2nd_wins}회</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
