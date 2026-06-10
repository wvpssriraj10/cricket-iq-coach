import { describe, it, expect } from 'vitest';
import { parseScorecardText } from '../lib/scorecard-parser';

describe('Scorecard Parser', () => {
  it('should correctly parse single-letter initial surnames without mistaking them for dismissals', () => {
    const text = `Match	Nadaprabhu XI vs Palace Orchard
Date	2026-05-31
Ground	Test Ground
Result	Nadaprabhu XI won

No Batsman             Status             R B M 4s 6s SR
(1st Innings)
Nadaprabhu XI 244/10 (29.2 Ov)            Shailendra (Nadaprabhu XI)
1  Dhiraj C               b 3Nadh Kumar           62 50 90 6  0  124.00
2  Sanjay                 c †Manas Singh b 3Nadh Kumar 6 6 12 1  0  100.00
3  Prithvi BPCA      c Harshavardhana.V b Monish C        12 19 26 0 0 63.16
4  SACHIN S               not out               0 2 3 0  0  0.00
5  W.V.P.S.SRIRAJ (wk)            c Yashu b 3Nadh Kumar       2 2 4 0  0  100.00
6  Shailendra (c)               c Vineeth b Manish Raj HM    6 7 9 1  0  85.71
Extras: (wd 18, nb 2, b 1)                                       21
Total: Overs 29.2, Wickets 10                                             244 (CRR: 8.32)

4   SACHIN S                3  0  17  0  10  2  0  1   0   5.67
3   Sanjay                  4  0  54  3  7  6  0  8   2   13.50
2   Dhiraj C                1  0  13  0  2  3  0  0   0   13.00
1   Monish C                1  0  6  1  4  1  0  0   0   6.00
No  Bowler               O M R W 0s  4s  6s  WD   NB  Eco

6  Shailendra ( C )        Sharan
5  W.V.P.S.SRIRAJ          Vineeth
4  Monish C                Dishan Shetty
3  SACHIN S                Manas Singh ( WK )
2  Sanjay                  Prithvi BPCA
1  Dhiraj C                Yashu ( C )
Playing Squad
`;

    const result = parseScorecardText([{ text, num: 1 }]);

    // Validate Batting Extraction
    const batting = result.innings[0].batting;
    expect(batting.length).toBe(6);
    expect(batting[0].name).toBe('Dhiraj C');
    expect(batting[0].status).toBe('b 3Nadh Kumar');
    expect(batting[0].runs).toBe(62);

    expect(batting[1].name).toBe('Sanjay');
    expect(batting[1].status).toBe('c †Manas Singh b 3Nadh Kumar');

    expect(batting[2].name).toBe('Prithvi BPCA');
    expect(batting[2].status).toBe('c Harshavardhana.V b Monish C');

    expect(batting[3].name).toBe('SACHIN S');
    expect(batting[3].status).toBe('not out');

    // Clean player name should strip (wk) and (c)
    expect(batting[4].name).toBe('W.V.P.S.SRIRAJ');
    expect(batting[5].name).toBe('Shailendra');

    // Validate Bowling Extraction
    const bowling = result.innings[0].bowling;
    expect(bowling.length).toBe(4);
    expect(bowling[0].name).toBe('Monish C');
    expect(bowling[0].overs).toBe(1);
    expect(bowling[0].runs).toBe(6);
    expect(bowling[0].wickets).toBe(1);

    expect(bowling[1].name).toBe('Dhiraj C');
    expect(bowling[1].overs).toBe(1);

    expect(bowling[2].name).toBe('Sanjay');
    expect(bowling[2].overs).toBe(4);

    expect(bowling[3].name).toBe('SACHIN S');
    expect(bowling[3].overs).toBe(3);

    // Validate Squad Extraction
    // Squad parsing splits lines into two columns (team1 and team2)
    // 1 Dhiraj C Yashu ( C )
    expect(result.squad1).toContain('Dhiraj C');
    expect(result.squad1).toContain('Sanjay');
    expect(result.squad1).toContain('SACHIN S');
    expect(result.squad1).toContain('Monish C');
    expect(result.squad1).toContain('W.V.P.S.SRIRAJ');
    expect(result.squad1).toContain('Shailendra ( C )');

    expect(result.squad2).toContain('Yashu ( C )');
    expect(result.squad2).toContain('Prithvi BPCA');
    expect(result.squad2).toContain('Manas Singh ( WK )');
  });
});
