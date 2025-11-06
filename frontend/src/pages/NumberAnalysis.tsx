import { useState, useEffect } from 'react';
import { dataAPI } from '../lib/api';

interface NumberStats {
  number: number;
  frequency: number;
  lastAppeared: number | null;
  recentAppearances: number[];
  companionNumbers: { number: number; count: number }[];
}

export default function NumberAnalysis() {
  const [allNumbers, setAllNumbers] = useState<NumberStats[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedStats, setSelectedStats] = useState<NumberStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'number' | 'frequency'>('number');

  useEffect(() => {
    loadNumberStats();
  }, []);

  const loadNumberStats = async () => {
    setIsLoading(true);
    try {
      // 전체 데이터 조회
      const historyResponse = await dataAPI.getHistory(1, 100);
      const history = historyResponse.data;

      // 각 번호별 통계 계산
      const stats: { [key: number]: NumberStats } = {};
      
      // 초기화
      for (let i = 1; i <= 45; i++) {
        stats[i] = {
          number: i,
          frequency: 0,
          lastAppeared: null,
          recentAppearances: [],
          companionNumbers: []
        };
      }

      // 데이터 분석
      history.forEach((draw: any) => {
        const numbers = [
          draw.number1, draw.number2, draw.number3,
          draw.number4, draw.number5, draw.number6
        ];

        numbers.forEach(num => {
          stats[num].frequency++;
          stats[num].recentAppearances.push(draw.round);
          if (stats[num].lastAppeared === null || draw.round > stats[num].lastAppeared) {
            stats[num].lastAppeared = draw.round;
          }
        });
      });

      // 함께 나온 번호 계산
      history.forEach((draw: any) => {
        const numbers = [
          draw.number1, draw.number2, draw.number3,
          draw.number4, draw.number5, draw.number6
        ];

        numbers.forEach(num1 => {
          const companions: { [key: number]: number } = {};
          numbers.forEach(num2 => {
            if (num1 !== num2) {
              companions[num2] = (companions[num2] || 0) + 1;
            }
          });

          stats[num1].companionNumbers = Object.entries(companions)
            .map(([num, count]) => ({ number: parseInt(num), count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        });
      });

      setAllNumbers(Object.values(stats));
    } catch (error) {
      console.error('번호 통계 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectNumber = (num: number) => {
    setSelectedNumber(num);
    const stats = allNumbers.find(n => n.number === num);
    setSelectedStats(stats || null);
  };

  const getNumberColor = (num: number) => {
    if (num <= 10) return 'bg-yellow-500';
    if (num <= 20) return 'bg-blue-500';
    if (num <= 30) return 'bg-red-500';
    if (num <= 40) return 'bg-gray-700';
    return 'bg-green-500';
  };

  const getSortedNumbers = () => {
    if (sortBy === 'frequency') {
      return [...allNumbers].sort((a, b) => b.frequency - a.frequency);
    }
    return allNumbers;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-lg text-gray-600">통계 분석 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">번호 분석</h1>
        <p className="mt-2 text-gray-600">
          각 번호의 상세 분석 정보를 확인하세요 (최근 100회 기준)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 번호 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">전체 번호 (1~45)</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('number')}
                  className={`px-3 py-1 text-sm rounded ${
                    sortBy === 'number'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  번호순
                </button>
                <button
                  onClick={() => setSortBy('frequency')}
                  className={`px-3 py-1 text-sm rounded ${
                    sortBy === 'frequency'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  빈도순
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-9 gap-3">
              {getSortedNumbers().map((numStat) => (
                <button
                  key={numStat.number}
                  onClick={() => selectNumber(numStat.number)}
                  className={`relative group ${getNumberColor(numStat.number)} ${
                    selectedNumber === numStat.number
                      ? 'ring-4 ring-indigo-400 scale-110'
                      : 'hover:scale-105'
                  } rounded-full transition-transform shadow-lg`}
                >
                  <div className="aspect-square flex flex-col items-center justify-center text-white p-2">
                    <span className="text-2xl font-bold">{numStat.number}</span>
                    <span className="text-[10px] mt-1">{numStat.frequency}회</span>
                  </div>
                  
                  {/* 호버 툴팁 */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {numStat.frequency}회 출현
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽: 상세 분석 */}
        <div className="lg:col-span-1">
          {selectedStats ? (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className={`w-24 h-24 ${getNumberColor(selectedStats.number)} rounded-full mx-auto flex items-center justify-center text-white mb-4`}>
                  <span className="text-5xl font-bold">{selectedStats.number}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedStats.number}번 분석
                </h3>
              </div>

              <div className="space-y-4">
                {/* 출현 빈도 */}
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500 mb-1">출현 빈도</div>
                  <div className="text-3xl font-bold text-indigo-600">
                    {selectedStats.frequency}회
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    전체의 {((selectedStats.frequency / 100) * 100 / 6).toFixed(1)}%
                  </div>
                </div>

                {/* 최근 출현 */}
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500 mb-2">최근 출현</div>
                  {selectedStats.lastAppeared ? (
                    <div>
                      <div className="text-lg font-semibold">
                        {selectedStats.lastAppeared}회차
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        마지막 출현 회차
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">출현 기록 없음</div>
                  )}
                </div>

                {/* 최근 5회 출현 회차 */}
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500 mb-2">최근 출현 회차</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedStats.recentAppearances.slice(0, 5).map((round, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {round}회
                      </span>
                    ))}
                  </div>
                </div>

                {/* 함께 나온 번호 */}
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500 mb-2">함께 자주 나온 번호</div>
                  <div className="space-y-2">
                    {selectedStats.companionNumbers.map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${getNumberColor(comp.number)} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                            {comp.number}
                          </div>
                          <span className="text-sm font-medium">{comp.number}번</span>
                        </div>
                        <span className="text-xs text-gray-500">{comp.count}회</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center sticky top-4">
              <div className="text-6xl mb-4">👆</div>
              <p className="text-gray-500">
                번호를 선택하면<br />상세 분석을 볼 수 있습니다
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">📊 전체 통계</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">가장 많이 나온 번호</div>
            <div className="mt-2">
              {getSortedNumbers()
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 3)
                .map((num, idx) => (
                  <div key={idx} className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 ${getNumberColor(num.number)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                        {num.number}
                      </div>
                      <span className="text-sm font-medium">{num.number}번</span>
                    </div>
                    <span className="text-xs text-gray-600">{num.frequency}회</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">가장 적게 나온 번호</div>
            <div className="mt-2">
              {getSortedNumbers()
                .sort((a, b) => a.frequency - b.frequency)
                .slice(0, 3)
                .map((num, idx) => (
                  <div key={idx} className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 ${getNumberColor(num.number)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                        {num.number}
                      </div>
                      <span className="text-sm font-medium">{num.number}번</span>
                    </div>
                    <span className="text-xs text-gray-600">{num.frequency}회</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">분석 기준</div>
            <div className="mt-2 text-sm text-gray-700">
              <div>• 최근 100회 데이터</div>
              <div>• 총 600개 번호 분석</div>
              <div>• 실시간 업데이트</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
