import { useState, useEffect } from 'react';
import { MapPin, Trophy, Award, TrendingUp, Building2 } from 'lucide-react';
import axios from 'axios';

interface Store {
  store_id: number;
  store_name: string;
  address: string;
  region: string;
  wins_1st: number;
  wins_2nd: number;
  total_wins: number;
  rank: number;
}

interface RegionStats {
  region: string;
  store_count: number;
  total_1st_wins: number;
  total_2nd_wins: number;
  total_wins: number;
  avg_1st_wins: number;
  avg_2nd_wins: number;
}

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStores();
    loadRegionStats();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/data/stores/top?limit=100');
      if (response.data.success) {
        setStores(response.data.data);
      }
    } catch (error) {
      console.error('판매점 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegionStats = async () => {
    try {
      const response = await axios.get('/api/data/stores/stats/region');
      if (response.data.success) {
        setRegionStats(response.data.data);
      }
    } catch (error) {
      console.error('지역 통계 로드 실패:', error);
    }
  };

  const filteredStores = selectedRegion === '전체' 
    ? stores 
    : stores.filter(s => s.region === selectedRegion);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Award className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-700" />;
    return <span className="text-slate-600 font-semibold">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8" />
            <h1 className="text-3xl font-bold">당첨 판매점 순위</h1>
          </div>
          <p className="text-blue-100">1등/2등 배출 판매점 현황</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 지역별 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">총 판매점</p>
                <p className="text-2xl font-bold text-slate-900">{stores.length}개</p>
              </div>
              <Building2 className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">1등 배출</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stores.reduce((sum, s) => sum + s.wins_1st, 0)}회
                </p>
              </div>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">2등 배출</p>
                <p className="text-2xl font-bold text-slate-600">
                  {stores.reduce((sum, s) => sum + s.wins_2nd, 0)}회
                </p>
              </div>
              <Award className="w-10 h-10 text-slate-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">지역 수</p>
                <p className="text-2xl font-bold text-indigo-600">{regionStats.length}곳</p>
              </div>
              <MapPin className="w-10 h-10 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* 지역 필터 */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedRegion('전체')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRegion === '전체'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              전체
            </button>
            {regionStats.slice(0, 10).map((region) => (
              <button
                key={region.region}
                onClick={() => setSelectedRegion(region.region)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRegion === region.region
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {region.region} ({region.store_count})
              </button>
            ))}
          </div>
        </div>

        {/* 판매점 목록 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedRegion === '전체' ? '전국' : selectedRegion} 판매점 순위
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {filteredStores.length}개 판매점
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">로딩 중...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">순위</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">판매점명</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">주소</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">1등</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">2등</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">합계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        데이터가 없습니다. 관리자에게 판매점 데이터 수집을 요청하세요.
                      </td>
                    </tr>
                  ) : (
                    filteredStores.map((store, index) => (
                      <tr key={store.store_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-12">
                            {getRankBadge(index + 1)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{store.store_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4" />
                            {store.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                            <Trophy className="w-4 h-4" />
                            {store.wins_1st}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold">
                            <Award className="w-4 h-4" />
                            {store.wins_2nd}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">
                            <TrendingUp className="w-4 h-4" />
                            {store.total_wins}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
