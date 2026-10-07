"""Ink boxes for the non-type marks (lockup layers, rules, dividers, buttons, arrows).
BOXES[screen][frame] = [(id, search box, mode)]; frame as in spec.py."""
import json, os, sys
from inkbox import ink
from refs import WORK
BOXES={}
BOXES['today']={
 'today':[('sprig',(66,32,168,101),'dark'),('word',(64,102,270,143),'dark'),
          ('why',(70,550,398,646),'abs<110'),('whyDiv',(276,576,292,626),'light'),('whyArrow',(303,582,358,620),'light')],
 'today_slip':[('noteRule',(650,716,740,730),'dark')],
 'today_sheet':[('comingRule',(212,895,282,912),'dark'),('movedRule',(570,903,642,920),'dark'),
          ('rule1',(212,1058,498,1078),'dark'),('rule2',(582,1066,815,1084),'dark'),
          ('vdiv',(520,858,562,1292),'dark'),('footRule',(206,1316,862,1334),'dark'),
          ('fdiv1',(404,1343,418,1390),'dark'),('fdiv2',(681,1343,696,1392),'dark'),
          ('moreArrow',(298,1234,348,1264),'dark'),('activityArrow',(718,1242,768,1272),'dark')],
}
BOXES['money']={
 'money':[('sprig',(90,45,182,119),'dark'),('word',(90,119,290,161),'dark'),('titleRule',(178,362,252,376),'dark'),
          ('heldRule',(190,444,204,536),'dark'),('owedRule',(480,444,494,536),'dark'),
          ('div1',(528,750,542,826),'dark'),('div2',(528,1002,542,1075),'dark'),
          ('line1',(380,885,470,896),'dark'),('line2',(305,1137,462,1148),'dark'),('line3',(412,1251,478,1262),'dark'),
          ('plus',(804,1224,834,1256),'dark'),('seeRule',(88,1385,138,1396),'dark'),
          ('next',(672,1338,915,1425),'abs<110'),('nextArrow',(828,1364,875,1399),'light')],
}
BOXES['plan']={
 'plan':[('sprig',(78,45,188,123),'dark'),('word',(86,127,296,170),'dark')],
 'plan_right':[('rule',(604,856,680,868),'dark'),('add',(462,998,816,1086),'abs<110')],
 'plan_left':[('rule',(191,1086,237,1096),'dark'),('sprig',(130,700,330,968),'dark')],
}
BOXES['credit']={
 'credit':[('sprig',(78,48,178,120),'dark'),('word',(78,122,282,165),'dark'),('titleRule',(82,372,160,382),'dark'),('qRule',(90,568,185,582),'dark'),
           ('meter',(180,960,750,986),'dark'),('meterFill',(180,960,480,986),'abs<70'),
           ('b1Arrow',(395,1290,440,1322),'dark'),('b2Arrow',(820,1290,866,1322),'dark'),
           ('pay',(48,1352,895,1440),'abs<110'),('payArrow',(812,1394,852,1420),'light')],
}
# Outline buttons are hairline borders on a pale field: read off the gridded zoom.
FIXED={'credit':{'credit':{'b1':[55,1262,462,1338],'b2':[480,1262,886,1338],'pay':[55,1356,887,1442],'b1Arrow':[398,1293,426,1309],'b2Arrow':[823,1293,852,1309],'payDiv':[765,1380,767,1420]}}}
if __name__=='__main__':
    for name in sys.argv[1:]:
        out={f:{i:ink(f,b,m) for i,b,m in rows} for f,rows in BOXES[name].items()}
        for f,v in FIXED.get(name,{}).items(): out[f].update(v)
        os.makedirs(os.path.join(WORK,'layout'),exist_ok=True)
        json.dump(out,open(os.path.join(WORK,'layout',f'{name}_boxes.json'),'w'),indent=1)
        for f,v in out.items(): print(f,v)
