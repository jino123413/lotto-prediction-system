import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mlAPI, dataAPI, predictionAPI } from '../lib/api';

interface Prediction {
  predictionId?: number;
  id?: string;
  date?: string;
  createdAt?: string;
  method: string;
  numbers: number[];
  confidence: number;
  checked?: boolean;
  matchResult?: {
    round: number;
    matched: number;
    prize: string;
  };
}

export default function PredictionHistory() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    loadPredictions(!!token);
  }, []);

  const loadPredictions = async (loggedIn: boolean) => {
    if (loggedIn) {
      // 서버에서 불러오기
      try {
        const response = await predictionAPI.getAll();
        if (response && Array.isArray(response)) {
          const formatted = response.map((pred: any) => ({
            predictionId: pred.predictionId,
            createdAt: pred.createdAt,
            method: pred.method,
            numbers: pred.predictedNumbers.split(',').map(Number),
            confidence: pred.confidence || 0,
          }));
          setPredictions(formatted);
        }
      } catch (error) {
        console.error('Failed to load predictions from server:', error);
      }
    } else {
      // localStorage에서 불러오기
      const saved = localStorage.getItem('lotto_predictions');
      if (saved) {
        setPredictions(JSON.parse(saved));
      }
    }
  };

  const generateNewPredictions = async () => {
    setIsGenerating(true);
    try {
      const response = await mlAPI.predictMultiple();
      
      if (response.success && response.predictions) {
        const newPredictions = response.predictions.map((pred: any) => ({
          method: pred.method,
          numbers: pred.numbers,
          confidence: pred.confidence,
        }));

        if (isLoggedIn) {
          // 서버에 저장
          for (const pred of newPredictions) {
            try {
              await predictionAPI.save(pred);
            } catch (error) {
              console.error('Failed to save prediction:', error);
            }
          }
          loadPredictions(true);
        } else {
          // localStorage에 저장
          const withIds = newPredictions.map((pred: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            ...pred,
          }));
          const updated = [...withIds, ...predictions].slice(0, 50);
          localStorage.setItem('lotto_predictions', JSON.stringify(updated));
          setPredictions(updated);
        }
      }
    } catch (error) {
      console.error('Failed to generate predictions:', error);
      alert('예측 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const deletePrediction = async (prediction: Prediction) => {
    if (isLoggedIn && prediction.predictionId) {
      try {
        await predictionAPI.delete(prediction.predictionId);
        loadPredictions(true);
      } catch (error) {
        console.error('Failed to delete prediction:', error);
      }
    } else {
      const updated = predictions.filter(p => p.id !== prediction.id);
      localStorage.setItem('lotto_predictions', JSON.stringify(updated));
      setPredictions(updated);
    }
  };

  const checkPrediction = async (prediction: Prediction) => {
    try {
      const response = await dataAPI.getLatest(1);
      
      if (response.data && response.data.length > 0) {
        const latest = response.data[0];
        const winningNumbers = [
          latest.number1, latest.number2, latest.number3,
          latest.number4, latest.number5, latest.number6
        ];

        const matched = prediction.numbers.filter(n => winningNumbers.includes(n)).length;
        const bonusMatched = prediction.numbers.includes(latest.bonus_number);

        let prize = '';
        if (matched === 6) prize = '1등';
        else if (matched === 5 && bonusMatched) prize = '2등';
        else if (matched === 5) prize = '3등';
        else if (matched === 4) prize = '4등';
        else if (matched === 3) prize = '5등';
        else prize = '미당첨';

        const updated = predictions.map(p => 
          (p.predictionId === prediction.predictionId || p.id === prediction.id)
            ? { 
                ...p, 
                checked: true, 
                matchResult: { round: latest.round, matched, prize } 
              }
            : p
        );
        setPredictions(updated);

        if (!isLoggedIn) {
          localStorage.setItem('lotto_predictions', JSON.stringify(updated));
        }
      }
    } catch (error) {
      console.error('Failed to check prediction:', error);
    }
  };

  const clearAllPredictions = () => {
    if (confirm('모든 예측 이력을 삭제하시겠습니까?')) {
      if (isLoggedIn) {
        predictions.forEach(async (pred) => {
          if (pred.predictionId) {
            try {
              await predictionAPI.delete(pred.predictionId);
            } catch (error) {
              console.error('Failed to delete:', error);
            }
          }
        });
        loadPredictions(true);
      } else {
        localStorage.setItem('lotto_predictions', JSON.stringify([]));
        setPredictions([]);
      }
    }
  };

  const getNumberColor = (num: number) => {
    if (num <= 10) return 'from-amber-400 to-yellow-500';
    if (num <= 20) return 'from-blue-400 to-blue-600';
    if (num <= 30) return 'from-red-400 to-red-600';
    if (num <= 40) return 'from-slate-400 to-slate-600';
    return 'from-emerald-400 to-green-600';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          예측 이력
        </h1>
        <p className="mt-2 text-slate-600">
          AI가 생성한 로또 번호를 저장하고 관리하세요
        </p>
      </div>

      {/* Auth Notice */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <button 
                  onClick={() => navigate('/login')}
                  className="font-semibold underline hover:text-blue-900"
                >
                  로그인
                </button>
                {' '}하면 모든 기기에서 예측 이력을 동기화할 수 있어요
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateNewPredictions}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                생성 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                새 예측 생성 (5개)
              </>
            )}
          </button>
          
          {predictions.length > 0 && (
            <button
              onClick={clearAllPredictions}
              className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors border border-slate-300"
            >
              전체 삭제
            </button>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">팁:</span> "새 예측 생성" 버튼을 클릭하면 학습된 ML 모델로 5개의 로또 예측을 생성합니다
            {!isLoggedIn && ' (로컬에 저장)'}
            {isLoggedIn && ' (서버에 저장)'}.
          </p>
        </div>
      </div>

      {/* Predictions List */}
      {predictions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            아직 예측이 없습니다
          </h3>
          <p className="text-slate-500">
            "새 예측 생성" 버튼을 클릭하여 AI 기반 로또 예측을 만드세요
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              저장된 예측 <span className="text-slate-500">({predictions.length}개)</span>
            </h2>
          </div>

          {predictions.map((prediction, index) => (
            <div
              key={prediction.predictionId || prediction.id || index}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Prediction Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 text-sm font-semibold rounded-full">
                      {prediction.method}
                    </span>
                    <span className="text-sm text-slate-500">
                      {formatDate(prediction.createdAt || prediction.date)}
                    </span>
                  </div>

                  <div className="flex gap-2 mb-3 flex-wrap">
                    {prediction.numbers.map((num, idx) => (
                      <div
                        key={idx}
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${getNumberColor(num)} text-white flex items-center justify-center font-bold text-lg shadow-md`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>

                  {prediction.checked && prediction.matchResult && (
                    <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-sm">
                        <span className="font-semibold text-slate-900">{prediction.matchResult.round}회차</span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span className={`font-bold ${
                          prediction.matchResult.prize === '미당첨' 
                            ? 'text-slate-600' 
                            : 'text-indigo-600'
                        }`}>
                          {prediction.matchResult.prize}
                        </span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span className="text-slate-600">
                          {prediction.matchResult.matched}개 일치
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-col gap-2">
                  {!prediction.checked && (
                    <button
                      onClick={() => checkPrediction(prediction)}
                      className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      당첨 확인
                    </button>
                  )}
                  <button
                    onClick={() => deletePrediction(prediction)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors border border-slate-300"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Notice */}
      <div className="mt-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
        <h3 className="font-semibold text-amber-900 mb-2">주의 사항</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          {isLoggedIn ? (
            <>
              <li>• 예측 이력이 계정에 저장됩니다</li>
              <li>• 모든 기기에서 예측 이력에 접근할 수 있습니다</li>
            </>
          ) : (
            <>
              <li>• 예측 이력은 브라우저 로컬 스토리지에 저장됩니다</li>
              <li>• 브라우저 캠시를 삭제하면 데이터가 손실될 수 있습니다</li>
              <li>• 최대 50개까지 저장되며, 초과 시 가장 오래된 항목이 자동 삭제됩니다</li>
            </>
          )}
          <li>• "당첨 확인"은 최신 회차 번호와 비교합니다</li>
        </ul>
      </div>
    </div>
  );
}
