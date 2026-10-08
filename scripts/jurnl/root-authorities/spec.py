"""Search boxes for every line of type in the four root references.
SPEC[screen][frame] = [(id, text, family, weight, search box, align, {mode, group, rot, size, ls})]
Frames are a reference (wall type, reference px) or a straightened copy (straight.py; local px)."""
SPEC={}
LOCKUP=lambda d1,d2,t1,t2:[
 ('desc1','FINANCIAL LIFE.','sans',500,d1,'left',{'group':'desc'}),
 ('desc2','BEAUTIFULLY ORGANIZED.','sans',500,d2,'left',{'group':'desc'}),
 ('tag1','PLAN TODAY.','sans',500,t1,'left',{'group':'tag'}),
 ('tag2','GROW FREELY.','sans',500,t2,'left',{'group':'tag'}),
]
SPEC['today']={
 'today':LOCKUP((74,147,255,166),(74,166,355,185),(722,118,865,138),(722,140,885,160))+[
  ('kicker','TODAY','sans',500,(76,234,198,260),'left'),
  ('head','WHAT IS TRUE.','serif',600,(76,265,585,332),'left'),
  ('label','SAFE TO SPEND','sans',500,(78,362,330,387),'left'),
  ('amount','$6,500','serif',500,(78,395,432,512),'left'),
  ('status','A COMPUTED SIGNAL. PREVIEW.','sans',500,(80,519,498,541),'left'),
  ('why','SEE WHY','sans',500,(118,588,250,614),'left',{'mode':'light'}),
 ],
 'today_slip':[
  ('note','RENT IS CLOSE.','sans',500,(600,684,800,712),'left'),
 ],
 'today_sheet':[
  ('coming','COMING','sans',500,(210,860,342,888),'left',{'group':'sec'}),
  ('moved','MOVED','sans',500,(568,864,688,892),'left',{'group':'sec'}),
  ('n1','RENT','sans',500,(210,933,292,960),'left',{'group':'name'}),
  ('w1','THURSDAY · BILL','sans',400,(214,966,430,989),'left',{'group':'when'}),
  ('a1','$1,800','serif',500,(214,993,362,1044),'left',{'group':'amt'}),
  ('n2','GROCERIES','sans',500,(216,1087,382,1111),'left',{'group':'name'}),
  ('w2','FRIDAY · BILL','sans',400,(217,1118,390,1141),'left',{'group':'when'}),
  ('a2','$120','serif',500,(220,1148,328,1196),'left',{'group':'amt'}),
  ('more','MORE','sans',500,(221,1238,300,1261),'left',{'group':'act'}),
  ('n3','ATELIER','sans',500,(573,937,695,964),'left',{'group':'name'}),
  ('w3','YESTERDAY','sans',400,(577,970,722,993),'left',{'group':'when'}),
  ('a3','$86','serif',500,(578,999,665,1047),'left',{'group':'amt'}),
  ('n4','MARKET','sans',500,(585,1098,703,1122),'left',{'group':'name'}),
  ('w4','YESTERDAY','sans',400,(589,1130,732,1153),'left',{'group':'when'}),
  ('a4','$42','serif',500,(595,1160,680,1206),'left',{'group':'amt'}),
  ('activity','ACTIVITY','sans',500,(595,1246,712,1270),'left',{'group':'act'}),
  ('f1','UPCOMING','sans',500,(241,1354,368,1378),'left',{'group':'foot'}),
  ('f2','SAFE TO SPEND','sans',500,(449,1356,640,1381),'left',{'group':'foot'}),
  ('f3','MORE','sans',500,(746,1360,818,1385),'left',{'group':'foot'}),
 ],
}
SPEC['money']={
 'money':LOCKUP((95,165,275,186),(95,187,375,208),(680,141,840,165),(680,166,852,190))+[
  ('title','MONEY','serif',600,(170,248,655,355),'left'),
  ('sub','YOUR MONEY IS IN 2 PLACES.','sans',500,(218,380,725,412),'left'),
  ('heldLbl','HELD','sans',500,(222,445,290,469),'left',{'group':'lbl'}),
  ('held','$8,420','serif',500,(218,474,402,535),'left',{'group':'fig'}),
  ('owedLbl','OWED','sans',500,(524,445,598,469),'left',{'group':'lbl'}),
  ('owed','$0','serif',500,(522,474,592,535),'left',{'group':'fig'}),
  ('question','WHAT DO I HAVE, AND WHERE IS IT?','sans',500,(190,560,725,586),'left'),
  ('cap1','CHECKING + CASH','sans',500,(190,733,382,756),'left',{'group':'cap'}),
  ('name1','CHECKING','serif',600,(190,763,416,808),'left',{'group':'name'}),
  ('sub1','CHECKING · BY HAND','sans',500,(192,811,436,835),'left',{'group':'insub'}),
  ('amt1','$8,420','serif',500,(565,760,702,808),'left',{'group':'amt'}),
  ('front1','EVERYDAY','sans',500,(178,878,366,907),'left',{'group':'front'}),
  ('cap2','CARDS + LOANS','sans',500,(200,983,368,1004),'left',{'group':'cap'}),
  ('name2','CARD','serif',600,(200,1014,330,1060),'left',{'group':'name'}),
  ('sub2','CARD · REGISTRY','sans',500,(202,1060,410,1086),'left',{'group':'insub'}),
  ('amt2','$0','serif',500,(570,1008,628,1055),'left',{'group':'amt'}),
  ('front2','OWED','sans',500,(182,1130,290,1159),'left',{'group':'front'}),
  ('front3','ADD A PLACE','sans',500,(182,1245,406,1280),'left',{'group':'front'}),
  ('see','SEE ALL PLACES.','sans',500,(88,1348,326,1374),'left'),
  ('note1','NO BANK CONNECTED.','sans',500,(88,1409,324,1432),'left',{'group':'note'}),
  ('note2','BALANCES ARE WHAT YOU ENTERED.','sans',500,(88,1431,467,1454),'left',{'group':'note'}),
  ('next','NEXT','sans',500,(718,1368,803,1395),'left',{'mode':'light'}),
 ],
}
SPEC['plan']={
 'plan':LOCKUP((88,175,272,196),(88,197,378,219),(684,97,852,121),(684,124,872,146))+[
  ('title','PLAN.','serif',600,(90,268,588,418),'left'),
  ('sub','YOUR MONEY HAS A PLAN.','sans',500,(88,433,604,465),'left'),
  ('line','HERE IS WHAT YOU ARE ARRANGING.','sans',500,(88,486,600,511),'left',{'ink':(95,491,595,506)}),
 ],
 'plan_right':[
  ('l1','NOTHING IS','sans',500,(560,775,730,806),'center',{'group':'lead'}),
  ('l2','ARRANGED YET.','sans',500,(535,804,760,837),'center',{'group':'lead'}),
  ('q1','WHAT DO I WANT','sans',500,(528,893,756,924),'center',{'group':'q'}),
  ('q2','IT TO DO?','sans',500,(572,921,712,952),'center',{'group':'q'}),
  ('add','ADD AN INTENTION','sans',500,(520,1025,760,1058),'center',{'mode':'light'}),
  ('goals','GOALS','sans',500,(860,704,886,774),'left',{'rot':90,'group':'tab'}),
  ('purchases','PURCHASES','sans',500,(876,822,905,943),'left',{'rot':90,'group':'tab'}),
  ('trips','TRIPS','sans',500,(879,983,908,1053),'left',{'rot':90,'group':'tab'}),
  ('ahead','AHEAD','sans',500,(885,1116,914,1198),'left',{'rot':90,'group':'tab','mode':'light'}),
 ],
 'plan_left':[
  ('a1','A CLEARER','sans',500,(158,970,284,992),'center',{'group':'aside'}),
  ('a2','TOMORROW','sans',500,(155,993,285,1016),'center',{'group':'aside'}),
  ('a3','BEGINS','sans',500,(175,1017,262,1040),'center',{'group':'aside'}),
  ('a4','HERE.','sans',500,(182,1043,252,1066),'center',{'group':'aside'}),
 ],
}
SPEC['credit']={
 'credit':LOCKUP((80,170,265,191),(80,192,375,214),(715,145,880,166),(715,168,885,190))+[
  ('title','CREDIT','serif',600,(80,262,575,365),'left'),
  ('l1','1 CARD OR LOAN.','sans',500,(90,398,400,422),'left',{'group':'lead'}),
  ('l2','$5,000 USED IN TOTAL.','sans',500,(90,434,485,460),'left',{'group':'lead'}),
  ('o1','OPEN ONE TO SET ITS','sans',500,(90,488,425,510),'left',{'group':'open'}),
  ('o2','LIMIT, RATE AND DUE DAY.','sans',500,(90,521,490,545),'left',{'group':'open'}),
  ('q1','WHAT IS HAPPENING,','sans',500,(90,600,385,622),'left',{'group':'q'}),
  ('q2','AND WHAT MATTERS?','sans',500,(90,630,385,652),'left',{'group':'q'}),
  ('card','CARD','serif',500,(180,920,280,955),'left'),
  ('util','100% OF THE LIMIT USED','sans',500,(500,986,745,1006),'left'),
  ('amount','$5,000','serif',500,(180,1010,400,1068),'left'),
  ('tab','CARD','sans',500,(820,832,850,904),'left',{'rot':90}),
  ('b1','HOW MUCH IS USED','sans',500,(88,1296,335,1318),'left',{'group':'btn','ink':(95,1293,324,1307)}),
  ('b2','ADD A CARD OR LOAN','sans',500,(512,1296,785,1318),'left',{'group':'btn','ink':(518,1293,780,1307)}),
  ('pay','PAYDOWN','sans',500,(390,1390,550,1414),'left',{'mode':'light'}),
 ],
}
