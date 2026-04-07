'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface RehearsalResult {
  totalWords: number;
  matchedWords: number;
  unmatchedKeywords: string[];
  confidenceScore: number;
}

interface RehearsalScoreProps {
  result: RehearsalResult;
  onAddSynonym: (imageId: string, keywordId: string, synonym: string) => void;
  onRetry: () => void;
}

export function RehearsalScore({
  result,
  onRetry,
}: RehearsalScoreProps) {
  const { confidenceScore, totalWords, matchedWords, unmatchedKeywords } = result;

  const scoreColor =
    confidenceScore >= 80
      ? 'text-green-600'
      : confidenceScore >= 50
        ? 'text-yellow-600'
        : 'text-red-600';

  const scoreMessage =
    confidenceScore >= 80
      ? 'Harika! Sunuma hazırsınız.'
      : confidenceScore >= 50
        ? 'İyi, ama birkaç keyword eklemek faydalı olabilir.'
        : 'Düşük eşleşme. Keyword\'lerinizi gözden geçirin.';

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">Güven Skoru</p>
        <p className={`text-5xl font-bold ${scoreColor}`}>
          %{confidenceScore}
        </p>
        <p className="text-sm text-muted-foreground mt-2">{scoreMessage}</p>
      </div>

      <Progress value={confidenceScore} />

      <div className="grid grid-cols-2 gap-4 text-center text-sm">
        <div className="p-3 bg-muted rounded-md">
          <p className="font-semibold">{totalWords}</p>
          <p className="text-muted-foreground">Toplam kelime</p>
        </div>
        <div className="p-3 bg-muted rounded-md">
          <p className="font-semibold text-green-600">{matchedWords}</p>
          <p className="text-muted-foreground">Eşleşen</p>
        </div>
      </div>

      {unmatchedKeywords.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">
            Hiç tetiklenmemiş keyword&apos;ler:
          </p>
          <div className="flex flex-wrap gap-1">
            {unmatchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="text-xs bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded px-2 py-1"
              >
                {kw}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Bu kelimeleri konuşmanıza ekleyin veya görsellere synonym ekleyin.
          </p>
        </div>
      )}

      <Button onClick={onRetry} className="w-full">
        Tekrar Dene
      </Button>
    </Card>
  );
}
