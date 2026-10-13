import sys,json,math,re,unicodedata
# Requires fontTools (pip install fonttools).
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from pathlib import Path
root=Path(__file__).resolve().parents[1]
font=TTFont(root/'scripts/fonts/BagelFatOne-Regular.ttf'); glyphs=font.getGlyphSet(); cmap=font.getBestCmap()
# Match the homepage's outline treatment: tall stems, outward sweep,
# shallow crown, and a baseline whose ends descend. Less droop than NameArc.
class OutlinePen(BasePen):
 def __init__(self,offset,warp): super().__init__(glyphs); self.offset=offset;self.warp=warp;self.parts=[];self.last=None
 def point(self,p):
  x,y=self.warp(p[0]+self.offset,p[1]);return f'{x:.1f} {y:.1f}'
 def _moveTo(self,p): self.parts.append('M'+self.point(p));self.last=p
 def _lineTo(self,p): self.parts.append('L'+self.point(p));self.last=p
 def _qCurveToOne(self,p1,p2):
  p0=self.last
  for i in range(1,13):
   t=i/12;v=1-t;p=(v*v*p0[0]+2*v*t*p1[0]+t*t*p2[0],v*v*p0[1]+2*v*t*p1[1]+t*t*p2[1]);self.parts.append('L'+self.point(p))
  self.last=p2
 def _curveToOne(self,p1,p2,p3):
  p0=self.last
  for i in range(1,17):
   t=i/16;v=1-t;p=(v**3*p0[0]+3*v*v*t*p1[0]+3*v*t*t*p2[0]+t**3*p3[0],v**3*p0[1]+3*v*v*t*p1[1]+3*v*t*t*p2[1]+t**3*p3[1]);self.parts.append('L'+self.point(p))
  self.last=p3
 def _closePath(self): self.parts.append('Z')
source=json.loads((root/'src/data/strava-since-2023.json').read_text())
names=sorted({source['cityGroups'].get(row['city'],row['city']) for row in source['locations'] if row['city'] not in ['Victoria','Queensland','No location tag']} | {row['country'] for row in source['locations']})
for name in names:
 text=unicodedata.normalize("NFKD",name).encode("ascii", "ignore").decode().upper(); sequence=[cmap[ord(c)] for c in text]; total=sum(glyphs[g].width for g in sequence);width=total*.2
 def warp(x,y):
  u=(x/total-.5)*2;t=y/730
  # Measured from NameArc: narrow crown, long outside stems, short centre.
  # Preserve this full outline shape; the page only changes its overall aspect.
  top=20*(1-u*u);bottom=230+230*u*u
  raw=x*.2
  shaped_x=raw + .27*t*(width/2-raw)
  return shaped_x, bottom+(top-bottom)*t
 parts=[];offset=0
 for g in sequence:
  pen=OutlinePen(offset,warp);glyphs[g].draw(pen);parts.extend(pen.parts);offset+=glyphs[g].width
 slug=name.lower().replace(' ','-');out=root/'src/assets/city-lettering'/f'{slug}.svg'
 out.write_text(f'<svg preserveAspectRatio="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="-12 -20 {width+24:.1f} 500"><path fill="currentColor" d="'+''.join(parts)+'"/></svg>')
print('Generated',len(names),'city outlines')
