import math
# Requires fontTools (pip install fonttools).
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from pathlib import Path
root=Path(__file__).resolve().parents[1]
font=TTFont(root/'scripts/fonts/BagelFatOne-Regular.ttf'); glyphs=font.getGlyphSet(); cmap=font.getBestCmap()
# "Welcome" for the homepage intro, in the NameArc face (Bagel Fat One) and
# NameArc's warp mirrored over a horizontal line: the feet sit on a shallow
# curve and the outside letters stretch upwards instead of down. The letters
# themselves stay upright. Each glyph fills the band, as in NameArc.
class OutlinePen(BasePen):
 def __init__(self,offset,height,warp): super().__init__(glyphs); self.offset=offset;self.height=height;self.warp=warp;self.parts=[];self.last=None
 def point(self,p):
  x,y=self.warp(p[0]+self.offset,p[1]/self.height);return f'{x:.1f} {y:.1f}'
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
text='Welcome'; sequence=[cmap[ord(c)] for c in text]; total=sum(glyphs[g].width for g in sequence); width=total*.2
def warp(x,t):
 u=(x/total-.5)*2
 # NameArc's curves (crown 20*(1-u*u), feet 230+230*u*u) flipped about y=230.
 base=440+20*u*u; top=230-230*u*u
 raw=x*.2
 # NameArc narrows the tops; mirrored, the feet narrow and the tops fan out.
 shaped_x=raw + .27*(1-t)*(width/2-raw)
 return shaped_x, base+(top-base)*t
parts=[];offset=0
for g in sequence:
 b=BoundsPen(glyphs);glyphs[g].draw(b)
 pen=OutlinePen(offset,b.bounds[3],warp);glyphs[g].draw(pen);parts.extend(pen.parts);offset+=glyphs[g].width
out=root/'src/assets/welcome-lettering.svg'
out.write_text(f'<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="-12 -20 {width+24:.1f} 500"><path fill="currentColor" d="'+''.join(parts)+'"/></svg>')
print('Wrote',out)
