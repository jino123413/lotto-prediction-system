import { useState } from 'react';
import { dataAPI } from '../lib/api';

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

interface MatchResult {
  round: number;
  draw_date: string;
  matched: number;
  bonus_matched: boolean;
  prize: string;
  winning_numbers: number[];
  user_numbers: number[];
}

export default function CheckWinning() {
  const [inputNumbers, setInputNumbers] = useState<string[]>(['', '', '', '', '', '']);
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string>('');

  const handleNumberChange = (index: number, value: string) => {
    const num = value.replace(/\D/g, ''); // 숫자만 허용
    if (num === '' || (parseInt(num) >= 1 && parseInt(num) <= 45)) {
      const newNumbers = [...inputNumbers];
      newNumbers[index] = num;
      setInputNumbers(newNumbers);
    }
  };

  const checkWinning = async () => {
    // 유효성 검사
    const numbers = inputNumbers.map(n => parseInt(n)).filter(n => !isNaN(n));
    
    if (numbers.length !== 6) {
      setError('6개의 번호를 모두 입력해주세요.');
      return;
    }

    // 중복 검사
    if (new Set(numbers).size !== 6) {
      setError('중복된 번호가 있습니다.');
      return;
    }

    // 범위 검사
    if (numbers.some(n => n < 1 || n > 45)) {
      setError('번호는 1~45 사이여야 합니다.');
      return;
    }

    setError('');
    setIsChecking(true);

    try {
      // 전체 당첨 내역 조회 (최신 100회)
      const response = await dataAPI.getHistory(1, 100);
      const history: LottoNumber[] = response.data;

      // 각 회차별 당첨 비교
      const matchResults: MatchResult[] = [];

      for (const draw of history) {
        const winningNumbers = [
          draw.number1, draw.number2, draw.number3,
          draw.number4, draw.number5, draw.number6
        ];

        // 일치하는 번호 개수
        const matched = numbers.filter(n => winningNumbers.includes(n)).length;
        
        // 보너스 번호 일치 여부
        const bonusMatched = numbers.includes(draw.bonus_number);

        // 등수 판정
        let prize = '';
        if (matched === 6) {
          prize = '1등';
        } else if (matched === 5 && bonusMatched) {
          prize = '🎊 2등';
        } else if (matched === 5) {
          prize = '🏆 3등';
        } else if (matched === 4) {
          prize = '🎖️ 4등';
        } else if (matched === 3) {
          prize = '🎗️ 5등';
        }

        if (prize) {
          matchResults.push({
            round: draw.round,
            draw_date: draw.draw_date,
            matched,
            bonus_matched: bonusMatched,
            prize,
            winning_numbers: winningNumbers.sort((a, b) => a - b),
            user_numbers: numbers.sort((a, b) => a - b)
          });
        }
      }

      setResults(matchResults);
    } catch (err) {
      setError('당첨 확인 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  const clearNumbers = () => {
    setInputNumbers(['', '', '', '', '', '']);
    setResults([]);
    setError('');
  };

  const getNumberColor = (num: number) => {
    if (num <= 10) return 'bg-yellow-500';
    if (num <= 20) return 'bg-blue-500';
    if (num <= 30) return 'bg-red-500';
    if (num <= 40) return 'bg-gray-700';
    return 'bg-green-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">당첨 확인</h1>
        <p className="mt-2 text-gray-600">
          내 번호를 입력하고 최근 100회차의 당첨 내역과 비교해보세요
        </p>
      </div>

      {/* 번호 입력 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">내 번호 입력</h2>
        
        <div className="flex gap-3 mb-4">
          {inputNumbers.map((num, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={num}
              onChange={(e) => handleNumberChange(index, e.target.value)}
              placeholder={(index + 1).toString()}
              className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={checkWinning}
            disabled={isChecking}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isChecking ? '확인 중...' : '당첨 확인'}
          </button>
          <button
            onClick={clearNumbers}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 결과 섹션 */}
      {results.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            🎊 당첨 결과 ({results.length}건)
          </h2>
          
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-2xl font-bold">{result.prize}</span>
                    <span className="ml-3 text-gray-600">
                      {result.round}회 ({result.draw_date})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {result.matched}개 일치
                      {result.bonus_matched && ' + 보너스'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">내 번호</div>
                    <div className="flex gap-2">
                      {result.user_numbers.map((num) => (
                        <div
                          key={num}
                          className={`w-10 h-10 rounded-full ${getNumberColor(num)} text-white flex items-center justify-center font-bold ${
                            result.winning_numbers.includes(num) ? 'ring-4 ring-yellow-300' : ''
                          }`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-2">당첨 번호</div>
                    <div className="flex gap-2">
                      {result.winning_numbers.map((num) => (
                        <div
                          key={num}
                          className={`w-10 h-10 rounded-full ${getNumberColor(num)} text-white flex items-center justify-center font-bold`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : results.length === 0 && !error && inputNumbers.some(n => n !== '') ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">😢</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            최근 100회차에서 당첨된 적이 없습니다
          </h3>
          <p className="text-gray-500">
            다른 번호로 다시 확인해보세요!
          </p>
        </div>
      ) : null}

      {/* 안내 사항 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">당첨 등수 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 1등: 6개 번호 일치</li>
          <li>• 2등: 5개 번호 + 보너스 번호 일치</li>
          <li>• 3등: 5개 번호 일치</li>
          <li>• 4등: 4개 번호 일치</li>
          <li>• 5등: 3개 번호 일치</li>
        </ul>
      </div>
    </div>
  );
}
