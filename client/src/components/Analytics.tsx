import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Script } from '@/types/script';

interface AnalyticsProps {
  script: Script;
}

export function Analytics({ script }: AnalyticsProps) {
  // ボケ/ツッコミの比率を計算
  const roleCount = script.blocks.reduce(
    (acc, block) => {
      if (block.type === 'line') {
        acc[block.role]++;
      }
      return acc;
    },
    { boke: 0, tsukkomi: 0 }
  );

  const pieData = [
    { name: 'ボケ', value: roleCount.boke },
    { name: 'ツッコミ', value: roleCount.tsukkomi },
  ];

  // 台詞の長さ分析
  const lengthData = script.blocks
    .filter(block => block.type === 'line')
    .map((block, index) => ({
      index: index + 1,
      length: block.content.length,
      role: block.role,
    }));

  // 頻出フレーズの分析（3文字以上のフレーズを抽出）
  const phrases = new Map<string, number>();
  script.blocks.forEach(block => {
    if (block.type !== 'line') return;
    const content = block.content;
    for (let i = 0; i <= content.length - 3; i++) {
      const phrase = content.slice(i, i + 3);
      phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
    }
  });

  const topPhrases = Array.from(phrases.entries())
    .filter(([, count]) => count > 1) // 2回以上出現したフレーズのみ
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([phrase, count]) => ({
      phrase,
      count,
    }));

  // リズムとテンポの分析データを生成
  const lineBlocks = script.blocks.filter(block => block.type === 'line');
  const rhythmData = lineBlocks.map((block, index) => {
    const nextBlock = lineBlocks[index + 1];
    const prevBlock = lineBlocks[index - 1];
    
    // 前後の台詞との長さの比率を計算
    const prevRatio = prevBlock ? block.content.length / prevBlock.content.length : 1;
    const nextRatio = nextBlock ? nextBlock.content.length / block.content.length : 1;
    
    // 文字数の変化率を計算（前後の台詞との差分）
    const prevDiff = prevBlock ? block.content.length - prevBlock.content.length : 0;
    const nextDiff = nextBlock ? nextBlock.content.length - block.content.length : 0;
    
    // テンポの変化を計算（値が大きいほど大きな変化があることを示す）
    const tempoChange = Math.abs(prevDiff) + Math.abs(nextDiff);
    
    // 前後の台詞の役割（ボケ/ツッコミ）の関係を分析
    const rolePattern = prevBlock && nextBlock
      ? `${prevBlock.role}-${block.role}-${nextBlock.role}`
      : prevBlock
      ? `${prevBlock.role}-${block.role}`
      : nextBlock
      ? `${block.role}-${nextBlock.role}`
      : block.role;
    
    // テンポバランスの計算を改善（文字数とロールパターンを考慮）
    const baseTempoBalance = Math.abs(1 - prevRatio) + Math.abs(1 - nextRatio);
    const roleTransitionPenalty = 
      (prevBlock && prevBlock.role === block.role && nextBlock && nextBlock.role === block.role) ? 0.5 : 0;
    const tempoBalance = Number((baseTempoBalance + roleTransitionPenalty).toFixed(2));
    
    return {
      index: index + 1,
      length: block.content.length,
      role: block.role,
      prevRatio: Number(prevRatio.toFixed(2)),
      nextRatio: Number(nextRatio.toFixed(2)),
      tempoChange,
      rolePattern,
      tempoBalance
    };
  });

  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <div className="p-4 space-y-8 h-full overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle>ボケ/ツッコミ比率</CardTitle>
          <CardDescription>台本全体でのボケとツッコミの割合</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>台詞の長さ分析</CardTitle>
          <CardDescription>各台詞の文字数の推移</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lengthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" label={{ value: '台詞番号', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: '文字数', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="text-sm">{`台詞番号: ${data.index}`}</p>
                          <p className="text-sm">{`文字数: ${data.length}`}</p>
                          <p className="text-sm">{`役割: ${data.role === 'boke' ? 'ボケ' : 'ツッコミ'}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="length"
                  fill="#8884d8"
                  stroke="#8884d8"
                  fillOpacity={0.6}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>頻出フレーズ</CardTitle>
          <CardDescription>2回以上使用されている3文字以上のフレーズ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPhrases.map(({ phrase, count }, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm font-medium">「{phrase}」</span>
                <span className="text-sm text-muted-foreground">{count}回</span>
              </div>
            ))}
            {topPhrases.length === 0 && (
              <p className="text-sm text-muted-foreground">
                頻出フレーズが見つかりません
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>リズムとテンポの分析</CardTitle>
          <CardDescription>台詞の長さのバランスとテンポの変化を可視化</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rhythmData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" label={{ value: '台詞番号', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: '前後の台詞との比率', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="text-sm font-medium mb-1">{`台詞番号: ${data.index}`}</p>
                          <p className="text-sm">{`役割: ${data.role === 'boke' ? 'ボケ' : 'ツッコミ'}`}</p>
                          <p className="text-sm">{`文字数: ${data.length}文字`}</p>
                          <p className="text-sm">{`テンポの変化: ${data.tempoChange}文字`}</p>
                          <p className="text-sm">{`前後の役割パターン: ${data.rolePattern}`}</p>
                          <div className="mt-1 pt-1 border-t">
                            <p className="text-sm">{`前の台詞との比率: ${data.prevRatio}`}</p>
                            <p className="text-sm">{`次の台詞との比率: ${data.nextRatio}`}</p>
                            <p className="text-sm font-medium mt-1">
                              テンポのバランス: ${data.tempoBalance}
                              {data.tempoBalance > 1.5 
                                ? '（大きな変化）' 
                                : data.tempoBalance > 1.0 
                                ? '（やや変化あり）' 
                                : '（安定）'}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="tempoBalance"
                  fill="#8884d8"
                  name="テンポのバランス"
                >
                  {rhythmData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.tempoBalance > 1 ? '#ff7c7c' : '#82ca9d'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>
              ※ テンポのバランスの見方：
              <br />
              - 1.0未満：安定したテンポ
              <br />
              - 1.0-1.5：適度な変化
              <br />
              - 1.5以上：大きな変化（インパクトのある展開）
            </p>
            <p>
              ※ 前後の役割パターンは、連続した3つの台詞（前-現在-次）の
              ボケ/ツッコミの組み合わせを示します。
              同じ役割が続く場合は、テンポのバランスにペナルティが加算されます。
            </p>
            <p>
              ※ テンポの変化は、前後の台詞との文字数の差の合計を示します。
              値が大きいほど、台詞の長さに大きな変化があることを表します。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
