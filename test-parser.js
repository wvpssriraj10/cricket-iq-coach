const fs = require('fs');
const { parseScorecardText } = require('./lib/scorecard-parser.ts');
const text = fs.readFileSync('pdf_dump.txt', 'utf8');
const res = parseScorecardText([{text, num: 1}]);
console.log('Batting 1:', JSON.stringify(res.innings[0]?.batting.map(b => b.name)));
console.log('Batting 2:', JSON.stringify(res.innings[1]?.batting.map(b => b.name)));
console.log('Bowling 1:', JSON.stringify(res.innings[0]?.bowling.map(b => b.name)));
console.log('Bowling 2:', JSON.stringify(res.innings[1]?.bowling.map(b => b.name)));
