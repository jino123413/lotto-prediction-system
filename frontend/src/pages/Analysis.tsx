import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { statsAPI } from '@/lib/api';

interface FrequencyData {
  number: number;
  count: number;
}

interface PatternData {
  consecutive_avg: number;
  odd_even_ratio: {
    avg_odd: number;
    avg_even: number;
  };
  sum_stats: {
    mean: number;
    min: number;
    max: number;
    std: number;
  };
}

export default function Analysis() {
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([]);
  const [allFrequencyData, setAllFrequencyData] = useState<FrequencyData[]>([]);
  const [patternData, setPatternData] = useState<PatternData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 빈도 데이터
      const freqData = await statsAPI.getFrequency();
      const hotNumbers = freqData.hot_numbers || [];
      
      // 전체 데이터 저장 (범위 분포 계산용)
      const allData = hotNumbers.map((item: any) => ({
        number: item.number,
        count: item.count
      }));
      setAllFrequencyData(allData);
      
      // 상위 20개만 표시 (차트가 너무 복잡하지 않도록)
      const chartData = hotNumbers.slice(0, 20).map((item: any) => ({
        number: item.number,
        count: item.count
      }));
      setFrequencyData(chartData);

      // 패턴 데이터
      const patternData = await statsAPI.getPatterns();
      setPatternData(patternData);

    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 홀/짝 데이터
  const oddEvenData = patternData ? [
    { name: '홀수', value: Math.round(patternData.odd_even_ratio.avg_odd * 25), color: '#3b82f6' },
    { name: '짝수', value: Math.round(patternData.odd_even_ratio.avg_even * 25), color: '#ef4444' }
  ] : [];

  // 번호 범위 분포 데이터
  const getRangeDistribution = () => {
    if (allFrequencyData.length === 0) return [];
    
    const ranges = [
      { name: '1-10', min: 1, max: 10, count: 0 },
      { name: '11-20', min: 11, max: 20, count: 0 },
      { name: '21-30', min: 21, max: 30, count: 0 },
      { name: '31-40', min: 31, max: 40, count: 0 },
      { name: '41-45', min: 41, max: 45, count: 0 },
    ];

    allFrequencyData.forEach(item => {
      const range = ranges.find(r => item.number >= r.min && item.number <= r.max);
      if (range) range.count += item.count;
    });

    return ranges;
  };

  const rangeDistribution = getRangeDistribution();

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-8">통계 분석</h1>
          <div className="text-center py-20">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-xl text-slate-600">데이터를 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-8">통계 분석</h1>

        {/* 요약 카드 */}
        {patternData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">평균 합계</CardTitle>
                <CardDescription className="text-slate-600">6개 번호의 평균 합</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {patternData.sum_stats.mean.toFixed(1)}
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  범위: {patternData.sum_stats.min} ~ {patternData.sum_stats.max}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">연속 번호 평균</CardTitle>
                <CardDescription className="text-slate-600">회차당 연속 번호 쌍</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {patternData.consecutive_avg.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">홀/짝 평균 비율</CardTitle>
                <CardDescription className="text-slate-600">회차당 평균 개수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  홀수: {patternData.odd_even_ratio.avg_odd.toFixed(1)} / 짝수: {patternData.odd_even_ratio.avg_even.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 번호별 출현 빈도 */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">번호별 출현 빈도 (상위 20개)</CardTitle>
              <CardDescription className="text-slate-600">가장 많이 나온 번호들</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="number" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="출현 횟수" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 홀/짝 비율 */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">홀수/짝수 비율</CardTitle>
              <CardDescription className="text-slate-600">전체 출현 번호의 홀짝 분포</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={oddEvenData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {oddEvenData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 번호 범위 분포 */}
          <Card className="lg:col-span-2 border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">번호 범위별 분포</CardTitle>
              <CardDescription className="text-slate-600">각 범위에서 나온 번호의 총 출현 횟수</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rangeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" name="출현 횟수" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 안내 메시지 */}
        <Card className="mt-8 border-slate-200 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">통계 분석 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-slate-700">
              <p>• <strong>출현 빈도</strong>: 각 번호가 당첨된 횟수를 보여줍니다</p>
              <p>• <strong>홀/짝 비율</strong>: 전체 당첨 번호 중 홀수와 짝수의 비율입니다</p>
              <p>• <strong>범위 분포</strong>: 1-45를 5개 구간으로 나누 출현 분포입니다</p>
              <p>• <strong>평균 합계</strong>: 6개 당첨 번호의 합계 평균값입니다</p>
              <p className="text-sm text-slate-500 mt-4">
                * 통계는 현재 수집된 {frequencyData.length > 0 ? '525' : '0'}개 회차 데이터를 기반으로 합니다
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
