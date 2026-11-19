# בונה את index.html מקבצי המקור שבתיקיית src
# הרצה:  python build.py
parts = ['src/head.html', 'src/world.js', 'src/market.js', 'src/action.js', 'src/garden.js', 'src/online.js', 'src/tail.html']
out = ''.join(open(p, encoding='utf8').read() for p in parts)
open('index.html', 'w', encoding='utf8').write(out)
print('index.html נבנה:', len(out), 'תווים')
