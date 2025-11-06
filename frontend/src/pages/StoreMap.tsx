import { useState, useEffect } from 'react';
import { Map, Trophy } from 'lucide-react';
import axios from 'axios';
import { SimpleSouthKoreaMapChart } from 'react-simple-south-korea-map-chart';

interface RegionStats {
  region: string;
  store_count: number;
  total_1st_wins: number;
  total_wins: number;
  avg_1st_wins: number;
}

// 지역명 매핑 (API 짧은 이름 → 라이브러리 긴 이름)
const REGION_NAME_MAP: Record<string, string> = {
  '경기': '경기도',
  '서울': '서울특별시',
  '부산': '부산광역시',
  '대구': '대구광역시',
  '인천': '인천광역시',
  '광주': '광주광역시',
  '대전': '대전광역시',
  '울산': '울산광역시',
  '세종': '세종특별자치시',
  '강원': '강원도',
  '충북': '충청북도',
  '충남': '충청남도',
  '전북': '전라북도',
  '전남': '전라남도',
  '경북': '경상북도',
  '경남': '경상남도',
  '제주': '제주특별자치도',
};

export default function StoreMap() {
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
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

  // 지역별 1등 배출 횟수에 따른 색상 반환
  const setColorByCount = (count: number): string => {
    if (count >= 300) return '#7c2d12';
    if (count >= 200) return '#991b1b';
    if (count >= 100) return '#dc2626';
    if (count >= 80) return '#f97316';
    if (count >= 60) return '#fb923c';
    if (count >= 40) return '#fbbf24';
    if (count >= 20) return '#fde047';
    if (count >= 10) return '#bef264';
    if (count > 0) return '#86efac';
    return '#e2e8f0';
  };

  const mapData = regionStats.map((region) => ({
    locale: REGION_NAME_MAP[region.region] || region.region,
    count: region.total_1st_wins,
  }));

  const getRegionData = (localeName: string): RegionStats | undefined => {
    return regionStats.find(r => REGION_NAME_MAP[r.region] === localeName || r.region === localeName);
  };

  const handleRegionClick = (localeName: string) => {
    const regionData = getRegionData(localeName);
    if (regionData) {
      setSelectedRegion(regionData.region);
    }
  };

  const handleRegionHover = (localeName: string | null) => {
    if (localeName) {
      const regionData = getRegionData(localeName);
      if (regionData) {
        setHoveredRegion(regionData.region);
      }
    } else {
      setHoveredRegion(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 md:py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Map className="w-6 h-6 md:w-8 md:h-8" />
            <h1 className="text-2xl md:text-3xl font-bold">지역별 당첨 현황</h1>
          </div>
          <p className="text-sm md:text-base text-blue-100">1등 배출 지역 분포</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* 지도 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">대한민국 당첨 지도</h2>
              
              {loading ? (
                <div className="h-[300px] md:h-[500px] flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="relative">
                  {/* 범례 */}
                  <div className="mb-4 p-3 md:p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-xs md:text-sm font-bold text-slate-700 mb-2">1등 배출 횟수</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7c2d12' }}></div>
                        <span className="text-slate-600">300+</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#991b1b' }}></div>
                        <span className="text-slate-600">200-299</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                        <span className="text-slate-600">100-199</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
                        <span className="text-slate-600">80-99</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fb923c' }}></div>
                        <span className="text-slate-600">60-79</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
                        <span className="text-slate-600">40-59</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fde047' }}></div>
                        <span className="text-slate-600">20-39</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#bef264' }}></div>
                        <span className="text-slate-600">10-19</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#86efac' }}></div>
                        <span className="text-slate-600">1-9</span>
                      </div>
                    </div>
                  </div>

                  {/* 한국 지도 */}
                  <div className="border border-slate-200 rounded-lg bg-white p-2 md:p-4 relative map-container">
                    <div className="min-w-[300px] w-full">
                      <SimpleSouthKoreaMapChart
                        data={mapData}
                        setColorByCount={setColorByCount}
                        customOnClickPath={handleRegionClick}
                        customOnMouseOverPath={handleRegionHover}
                        customOnMouseOutPath={() => handleRegionHover(null)}
                      />
                    </div>
                    
                    {/* 호버 툴팁 */}
                    {hoveredRegion && (() => {
                      const regionData = regionStats.find(r => r.region === hoveredRegion);
                      if (!regionData) return null;
                      return (
                        <div 
                          className="absolute top-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl z-50 
                                     animate-in fade-in slide-in-from-right-5 duration-300"
                        >
                          <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <span className="text-2xl">📍</span>
                            {regionData.region}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded">
                              <Trophy className="w-5 h-5 text-yellow-400" />
                              <div>
                                <p className="text-slate-300 text-xs">1등 배출</p>
                                <p className="font-bold text-lg text-yellow-400">{regionData.total_1st_wins}회</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded">
                              <span className="text-slate-300 text-xs">판매점</span>
                              <span className="font-semibold">{regionData.store_count}개</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 통계 패널 */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">지역별 순위 TOP 3</h2>
              
              <div className="space-y-3 max-h-[400px] md:max-h-[600px] overflow-y-auto">
                {regionStats
                  .sort((a, b) => b.total_1st_wins - a.total_1st_wins)
                  .slice(0, 3)
                  .map((region, index) => (
                    <div
                      key={region.region}
                      onMouseEnter={() => setHoveredRegion(region.region)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() => setSelectedRegion(region.region)}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
                                  transform hover:scale-105 hover:-translate-y-1 ${
                        selectedRegion === region.region || hoveredRegion === region.region
                          ? 'border-blue-500 bg-blue-50 shadow-xl scale-105 -translate-y-1'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-lg'
                      }`}
                      style={{
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xl md:text-2xl font-bold transition-transform duration-300 
                                            ${hoveredRegion === region.region ? 'scale-125' : ''} ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-slate-400' :
                            'text-orange-600'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                          <div>
                            <h3 className="text-sm md:text-base font-bold text-slate-900">
                              {region.region}
                            </h3>
                            <p className="text-xs text-slate-600">
                              {region.store_count}개 판매점
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center 
                                      text-white text-sm md:text-base font-bold shadow-lg transition-all duration-300
                                      ${hoveredRegion === region.region ? 'scale-110 shadow-2xl' : ''}`}
                          style={{ backgroundColor: setColorByCount(region.total_1st_wins) }}
                        >
                          {region.total_1st_wins}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 bg-slate-100 px-3 py-2 rounded">
                        <Trophy className={`w-4 h-4 md:w-5 md:h-5 text-yellow-500 transition-transform duration-300
                                            ${hoveredRegion === region.region ? 'scale-125 rotate-12' : ''}`} />
                        <div className="flex-1">
                          <p className="text-xs text-slate-600">1등 배출</p>
                          <p className="text-base md:text-lg font-bold text-slate-900">
                            {region.total_1st_wins}회
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✨ 미묘한 hover 효과로 수정 */}
      <style>{`
        /* 지도 지역 hover 효과 - 훨씬 미묘하게 */
        .map-container svg path {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        
        .map-container svg path:hover {
          /* 크기는 거의 그대로, 위로만 살짝 */
          transform: translateY(-3px);
          
          /* 그림자와 밝기로 강조 효과 */
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2)) brightness(1.15);
          
          /* 파란색 테두리 추가 */
          stroke: #2563eb;
          stroke-width: 1.5px;
          
          /* z-index로 앞으로 */
          position: relative;
          z-index: 100;
        }
        
        /* 툴팁 애니메이션 */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
