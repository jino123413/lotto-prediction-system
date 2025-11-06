import { useState, useEffect } from 'react'
import { dataAPI, statsAPI, mlAPI } from '../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

interface LottoNumber {
  round: number;
  draw_date: string;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  bonus_number: number;
}

export default function Home() {
  const [latestNumbers, setLatestNumbers] = useState<LottoNumber[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [hotNumbers, setHotNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [latest, frequency] = await Promise.all([
        dataAPI.getLatest(3),
        statsAPI.getFrequency(),
      ]);
      
      if (latest.success) {
        setLatestNumbers(latest.data);
      }
      
      if (frequency.success) {
        setHotNumbers(frequency.hot_numbers.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const result = await mlAPI.predictMultiple();
      if (result.success) {
        setPredictions(result.predictions);
      }
    } catch (error) {
      console.error('Error predicting:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNumber = (num: number, isBonus = false) => (
    <div
      key={num}
      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md ${
        isBonus ? 'bg-gradient-to-br from-emerald-400 to-green-600' : 
        num <= 10 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
        num <= 20 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
        num <= 30 ? 'bg-gradient-to-br from-red-400 to-red-600' :
        num <= 40 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
        'bg-gradient-to-br from-purple-400 to-purple-600'
      }`}
    >
      {num}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">
            로또 인텔리전스
          </h1>
          <p className="text-slate-300">데이터 기반 인공지능 번호 분석 시스템</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Numbers */}
          <Card className="lg:col-span-2 border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900">
                최신 당첨 번호
              </CardTitle>
              <CardDescription className="text-slate-600">최근 3회차 당첨 결과</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestNumbers.map((draw) => (
                <div key={draw.round} className="p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-lg text-slate-900">{draw.round}회차</span>
                    <span className="text-sm text-slate-500">{draw.draw_date}</span>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    {[draw.number1, draw.number2, draw.number3, draw.number4, draw.number5, draw.number6].map(num => renderNumber(num))}
                    <span className="mx-2 text-slate-400 font-bold">+</span>
                    {renderNumber(draw.bonus_number, true)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Hot Numbers */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900">
                핫 넘버
              </CardTitle>
              <CardDescription className="text-slate-600">최다 출현 번호 TOP 6</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {hotNumbers.map((item) => (
                  <div key={item.number} className="text-center">
                    {renderNumber(item.number)}
                    <p className="text-xs text-slate-600 mt-2 font-semibold">{item.count}회</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Predictions */}
        <Card className="mt-6 border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">
              AI 번호 예측
            </CardTitle>
            <CardDescription className="text-slate-600">5가지 방식의 데이터 기반 AI 추천 번호</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handlePredict} 
              disabled={loading}
              className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md"
            >
              {loading ? '예측 중...' : '번호 예측하기'}
            </Button>

            {predictions && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictions.map((pred: any, idx: number) => (
                  <div key={idx} className="p-5 bg-white rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md">
                    <div className="mb-4">
                      <h4 className="font-bold text-slate-900 text-lg">{pred.method}</h4>
                      <p className="text-sm text-indigo-600 font-semibold">추천 {idx + 1}순위</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pred.numbers.map((num: number) => renderNumber(num))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-300">© 2024 로또 인텔리전스 - 데이터 기반 인공지능 분석</p>
        </div>
      </footer>
    </div>
  )
}

