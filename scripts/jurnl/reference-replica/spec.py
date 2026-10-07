# Measured geometry per founder reference (reference px; 853 × 1844 stage).
# text: (id, text, family, weight, search box, align, {mode, group, ink})
SPEC={}
LOCKUP_TEXT=lambda dy=0:[
 ('desc1','FINANCIAL LIFE.','sans',500,(80,232+dy,260,250+dy),'left',{'group':'desc'}),
 ('desc2','BEAUTIFULLY ORGANIZED.','sans',500,(80,254+dy,360,272+dy),'left',{'group':'desc'}),
 ('tag1','PLAN TODAY.','sans',500,(580,190+dy,735,210+dy),'left',{'group':'tag'}),
 ('tag2','GROW FREELY.','sans',500,(580,215+dy,745,236+dy),'left',{'group':'tag'}),
]
SPEC['check']=dict(
 box=dict(
  sprig=(79,111,156,186), word=(79,184,270,226), panelAmount=(87,700,768,1000), input=(119,770,738,895), caret=(258,791,261,875),
  chip1=(119,914,264,977), chip2=(277,914,421,977), chip3=(435,914,580,977), chip4=(592,914,738,977),
  panelCategory=(87,1012,768,1206), iconCategory=(119,1083,216,1180), bag=(147,1107,188,1153), selectCategory=(237,1083,737,1178), arrowCategory=(686,1118,715,1145),
  panelPay=(87,1217,768,1414), iconPay=(119,1290,216,1387), card=(145,1320,191,1357), selectPay=(237,1290,737,1385), arrowPay=(686,1324,715,1351),
  cta=(88,1431,767,1517), ctaArrow=(698,1463,727,1488), back=(88,1530,768,1607), backArrow=(360,1556,388,1582),
 ),
 text=LOCKUP_TEXT()+[
  ('title','CHECK A PURCHASE','serif',500,(130,425,745,485),'left'),
  ('sub1','SEE HOW IT FITS YOUR PLAN','sans',400,(140,495,660,530),'left',{'group':'sub'}),
  ('sub2','BEFORE YOU BUY.','sans',400,(140,535,470,565),'left',{'group':'sub'}),
  ('lblAmount','PURCHASE AMOUNT','sans',500,(115,728,380,755),'left',{'group':'lbl'}),
  ('amount','$0','serif',500,(140,785,255,885),'left'),
  ('chip1','$25','sans',400,(150,925,235,968),'center',{'group':'chip'}),
  ('chip2','$50','sans',400,(300,925,395,968),'center',{'group':'chip'}),
  ('chip3','$100','sans',400,(455,925,560,968),'center',{'group':'chip'}),
  ('chip4','$250','sans',400,(615,925,720,968),'center',{'group':'chip'}),
  ('lblCategory','PURCHASE CATEGORY','sans',500,(115,1038,390,1064),'left',{'group':'lbl'}),
  ('selCategory','SELECT A CATEGORY','sans',500,(255,1110,600,1155),'left',{'group':'sel'}),
  ('lblPay','PAY WITH','sans',500,(115,1245,250,1272),'left',{'group':'lbl'}),
  ('selPay','SELECT ACCOUNT','sans',500,(255,1315,600,1360),'left',{'group':'sel'}),
  ('cta','CHECK PURCHASE','sans',500,(290,1455,600,1495),'center',{'mode':'light','group':'btn'}),
  ('back','BACK','sans',500,(405,1550,500,1590),'left',{'group':'btn'}),
 ],
)
SPEC['category']=dict(
 box=dict(sheet=(0,830,853,1844), handle=(386,850,467,857), close=(785,869,813,897),
  tiles_x=(35,235,436,637), tile_w=183, rows_y=(1027,1266,1505), rows_img_h=(178,178,171), rows_h=(224,224,219), rows_label_dy=(194,193,187), apply=(31,1743,822,1819), applyArrow=(0,0,0,0)),
 text=[
  ('title','SELECT A CATEGORY','serif',500,(200,885,660,935),'center'),
  ('sub1','CHOOSE THE CATEGORY THAT BEST FITS','sans',400,(140,948,710,975),'center',{'group':'sub'}),
  ('sub2','YOUR PURCHASE.','sans',400,(300,978,560,1002),'center',{'group':'sub'}),
  ('label','FASHION','sans',500,(60,1212,200,1242),'center',{'group':'label'}),
  ('label2','GROCERIES','sans',500,(450,1452,610,1480),'center',{'group':'label'}),
  ('apply','APPLY CATEGORY','sans',500,(290,1765,560,1800),'center',{'mode':'light'}),
 ],
)
SPEC['dock']=dict(ref='check',
 box=dict(add=(380,1647,473,1724), plusH=(409,1684,444,1687), plusV=(425,1666,428,1703),
  home=(91,1664,133,1704), money=(247,1668,289,1703), plan=(565,1667,603,1710), credit=(720,1661,756,1706)),
 text=[
  ('HOME','HOME','sans',500,(60,1715,170,1745),'center',{'group':'dock'}),
  ('MONEY','MONEY','sans',400,(210,1715,330,1745),'center',{'group':'dock'}),
  ('ADD','ADD','sans',400,(380,1733,480,1760),'center',{'group':'dock'}),
  ('PLAN','PLAN','sans',400,(540,1715,630,1745),'center',{'group':'dock'}),
  ('CREDIT','CREDIT','sans',400,(680,1715,800,1745),'center',{'group':'dock'}),
 ])
SPEC['check']['box']['applyArrow']=(0,0,0,0)
SPEC['category']['box']['applyArrow']=(756,1770,784,1793)
SPEC['parent']=dict(
 box=dict(sprig=(78,114,156,186), word=(78,184,270,227), menu=(765,131,804,162),
  why=(226,629,652,708), whyArrow=(589,659,612,678),
  rule=(178,1182,264,1185), div1=(278,1213,280,1268), div2=(399,1213,401,1268), div3=(521,1213,523,1268),
  bridge=(31,1458,821,1604), spark=(65,1490,98,1525), pill=(533,1497,803,1562), pillArrow=(760,1521,780,1540),
 ),
 text=LOCKUP_TEXT()+[
  ('signal','SAFE TO SPEND','sans',400,(300,355,575,390),'center'),
  ('amount','$1,284','serif',500,(250,412,632,560),'center'),
  ('through','AVAILABLE THROUGH OCT 18','sans',500,(262,570,622,596),'center'),
  ('why','SEE WHY THIS AMOUNT','sans',500,(275,652,570,686),'left'),
  ('tabBills','BILLS','sans',500,(536,900,556,966),'left',{'rot':90,'group':'tab'}),
  ('tabPlans','PLANS','sans',500,(592,914,612,986),'left',{'rot':90,'group':'tab'}),
  ('tabGoals','GOALS','sans',500,(646,943,665,1019),'left',{'rot':90,'group':'tab'}),
  ('tabBuffer','BUFFER','sans',500,(700,960,721,1053),'left',{'rot':90,'group':'tab','mode':'light'}),
  ('kicker','YOUR MONEY','sans',500,(172,1012,345,1040),'left'),
  ('head1','ORGANIZED.','serif',600,(172,1050,480,1102),'left',{'group':'head'}),
  ('head2','THEN YOURS.','serif',600,(172,1104,500,1155),'left',{'group':'head'}),
  ('lblBills','BILLS','sans',500,(172,1208,240,1230),'left',{'group':'flbl'}),
  ('lblPlans','PLANS','sans',500,(300,1208,375,1230),'left',{'group':'flbl'}),
  ('lblGoals','GOALS','sans',500,(425,1208,500,1230),'left',{'group':'flbl'}),
  ('lblBuffer','BUFFER','sans',500,(545,1208,625,1230),'left',{'group':'flbl'}),
  ('amtBills','$2,310','serif',500,(172,1234,265,1275),'left',{'group':'famt'}),
  ('amtPlans','$950','serif',500,(300,1234,385,1275),'left',{'group':'famt'}),
  ('amtGoals','$600','serif',500,(425,1234,505,1275),'left',{'group':'famt'}),
  ('amtBuffer','$500','serif',500,(545,1234,630,1275),'left',{'group':'famt'}),
  ('want','WANT TO SPEND ON SOMETHING?','sans',500,(120,1485,525,1512),'left'),
  ('g1','CHECK HOW IT FITS YOUR PLAN','sans',400,(120,1524,480,1546),'left',{'group':'g'}),
  ('g2','BEFORE YOU BUY.','sans',400,(120,1548,320,1570),'left',{'group':'g'}),
  ('pill','CHECK A PURCHASE','sans',500,(550,1518,745,1545),'left'),
 ])

def card_items(prefix, card, kicker, title, gray=(), right=None, title_dy=0, g0=117, gp=28):
    """Search regions inside an ACCOUNT card for kicker / title / grey lines."""
    x0,y0,x1,y1=card; T=[]
    T.append((prefix+'Kicker',kicker,'sans',500,(x0+118,y0+22,x1-70,y0+58),'left',{'group':'acKicker'}))
    T.append((prefix+'Title',title,'serif',500,(x0+118,y0+58+title_dy,(x1-130) if right else (x1-75),y0+112+title_dy),'left',{'group':'acTitle'}))
    for i,g in enumerate(gray):
        gy=y0+g0+title_dy+i*gp
        T.append((prefix+'Gray%d'%(i+1),g,'sans',400,(x0+118,gy-8,x1-75,gy+20),'left',{'group':'acGray'}))
    return T

ACCT1_CARDS=dict(profile=(103,560,752,736), currency=(103,746,752,907), connection=(103,917,752,1078), ask=(103,1088,752,1268), buffer=(103,1278,752,1518))
SPEC['acct1']=dict(
 box=dict(sprig=(101,113,205,200), word=(101,201,323,245), menu=(771,136,818,171),
  **ACCT1_CARDS,
  well1=(130,597,220,687), well2=(130,781,220,871), well3=(130,952,220,1042), well4=(130,1126,220,1216), well5=(130,1320,220,1410),
  bufferField=(251,1360,725,1486), bufferDivider=(466,1390,468,1458), save=(488,1390,711,1460),
  toggle=(619,1147,718,1207), next=(528,1532,762,1607), dot1=(381,1570,397,1586), dot2=(418,1570,434,1586), dot3=(455,1570,471,1586),
 ),
 text=[
  ('desc1','FINANCIAL LIFE.','sans',500,(100,255,320,280),'left',{'group':'desc'}),
  ('desc2','BEAUTIFULLY ORGANIZED.','sans',500,(100,281,430,306),'left',{'group':'desc'}),
  ('tag1','PLAN TODAY.','sans',500,(565,203,745,230),'left',{'group':'tag'}),
  ('tag2','GROW FREELY.','sans',500,(565,234,760,262),'left',{'group':'tag'}),
  ('title','ACCOUNT','serif',500,(205,365,670,456),'left'),
  ('sub','ONE SETTINGS OWNER.','sans',400,(205,470,680,502),'left'),
  ('profileKicker','PROFILE','sans',500,(240,588,400,616),'left',{'group':'acKicker'}),
  ('profileTitle','PREVIEW GUEST','serif',500,(240,628,600,668),'left',{'group':'acTitle'}),
  ('profileGray1','NO EMAIL ON DEVICE.','sans',400,(240,678,600,703),'left',{'group':'acGray'}),
  ('currencyKicker','DISPLAY CURRENCY','sans',500,(240,780,520,808),'left',{'group':'acKicker'}),
  ('currencyTitle','USD · US DOLLAR','serif',500,(240,812,560,860),'left',{'group':'acTitle'}),
  ('currencyChange','CHANGE','sans',500,(580,812,676,844),'left'),
  ('connectionKicker','CONNECTION','sans',500,(240,955,520,982),'left',{'group':'acKicker'}),
  ('connectionTitle','NOT SET','serif',500,(240,983,560,1032),'left',{'group':'acTitle'}),
  ('askKicker','ASK JURNL CONTEXT','sans',500,(240,1118,520,1146),'left',{'group':'acKicker'}),
  ('askGray1','ALLOW JURNL TO USE YOUR DATA','sans',400,(240,1160,605,1186),'left',{'group':'acGray'}),
  ('askGray2','TO PROVIDE MORE PERSONALIZED','sans',400,(240,1188,605,1214),'left',{'group':'acGray'}),
  ('askGray3','INSIGHTS.','sans',400,(240,1216,605,1242),'left',{'group':'acGray'}),
  ('bufferKicker','SAFE TO SPEND BUFFER','sans',500,(240,1310,560,1338),'left',{'group':'acKicker'}),
  ('bufferLabel','BUFFER','sans',500,(265,1380,360,1404),'left'),
  ('bufferValue','$500','serif',500,(265,1408,380,1466),'left'),
  ('save','SAVE BUFFER','sans',500,(505,1410,650,1440),'left',{'mode':'light'}),
  ('next','NEXT','sans',500,(570,1555,650,1585),'left',{'group':'pill'}),
 ],
)
ACCT2_CARDS=dict(c1=(100,582,753,778), c2=(100,795,753,999), c3=(100,1017,753,1223), c4=(100,1241,753,1446))
SPEC['acct2']=dict(
 box=dict(**ACCT2_CARDS, back=(104,1485,345,1565), next=(505,1485,747,1565), dot1=(383,1519,399,1535), dot2=(419,1519,435,1535), dot3=(455,1519,471,1535)),
 text=card_items('c1',ACCT2_CARDS['c1'],'NOTIFICATIONS','REMINDERS & UPDATES',('MANAGE YOUR NOTIFICATIONS','AND PREFERENCES.'))
  +card_items('c2',ACCT2_CARDS['c2'],'PRIVACY & CONSENTS','MANAGE DATA',('REVIEW YOUR PRIVACY SETTINGS','AND DATA CONSENTS.'))
  +card_items('c3',ACCT2_CARDS['c3'],'SECURITY','FACE ID / PASSCODE',('MANAGE YOUR SIGN-IN','PREFERENCES.'))
  +card_items('c4',ACCT2_CARDS['c4'],'WEEK START & DATE FORMAT','CALENDAR PREFERENCES',('CHOOSE YOUR WEEK START','AND DATE FORMAT.'))
  +[('back','BACK','sans',500,(220,1510,300,1540),'left',{'group':'pill'}),('next','NEXT','sans',500,(545,1510,630,1540),'left',{'group':'pill'})],
)
ACCT3_CARDS=dict(c1=(111,560,742,765), c2=(111,780,742,988), c3=(111,1002,742,1208), c4=(111,1222,742,1437))
SPEC['acct3']=dict(
 box=dict(**ACCT3_CARDS, back=(108,1460,387,1540), dot1=(381,1570,397,1586), dot2=(419,1570,435,1586), dot3=(457,1570,473,1586)),
 text=card_items('c1',ACCT3_CARDS['c1'],'DATA EXPORT','DOWNLOAD YOUR DATA',('EXPORT A COPY OF YOUR DATA','ANYTIME.'),g0=122,gp=30)
  +card_items('c2',ACCT3_CARDS['c2'],'HELP & SUPPORT','GET SUPPORT',('FIND ANSWERS, CONTACT OUR','TEAM, OR BROWSE GUIDES.'),g0=122,gp=30)
  +card_items('c3',ACCT3_CARDS['c3'],'LEGAL','TERMS & POLICIES',('REVIEW OUR TERMS OF SERVICE','AND PRIVACY POLICY.'),g0=122,gp=30)
  +card_items('c4',ACCT3_CARDS['c4'],'ACCOUNT','SIGN OUT',('SIGN OUT OF YOUR JURNL','ACCOUNT ON THIS DEVICE.'),g0=122,gp=30)
  +[('back','BACK','sans',500,(250,1485,340,1515),'left',{'group':'pill'})],
)
SPEC['acct1']['box'].update(icon1=(159,622,191,662), icon2=(164,804,187,853), icon3=(155,975,194,1017), icon4=(154,1150,195,1194), icon5=(158,1343,191,1386),
  arrow1=(685,634,715,657), arrow2=(685,816,714,840), arrow3=(685,985,715,1009), saveArrow=(659,1414,684,1436), nextArrow=(668,1558,695,1581))
SPEC['acct1']['text']=[t if t[0]!='title' else ('title','ACCOUNT','serif',500,(205,365,670,456),'left',{'ink':(211,374,658,451)}) for t in SPEC['acct1']['text']]
def wells(icons):
    out={}
    for i,(x0,y0,x1,y1) in enumerate(icons):
        cx=(x0+x1)/2; cy=(y0+y1)/2; out['well%d'%(i+1)]=(round(cx-46),round(cy-46),round(cx+46),round(cy+46)); out['icon%d'%(i+1)]=(x0,y0,x1,y1)
    return out
SPEC['acct2']['box'].update(wells([(146,643,185,687),(149,864,184,909),(148,1087,185,1133),(146,1314,187,1358)]),
  arrow1=(689,664,719,688), arrow2=(689,880,720,903), arrow3=(690,1104,720,1129), arrow4=(690,1328,721,1352), backArrow=(176,1514,206,1538), nextArrow=(647,1514,678,1538))
SPEC['acct3']['box'].update(wells([(171,624,204,667),(167,841,208,885),(170,1067,203,1112),(170,1292,207,1335)]),
  arrow1=(679,641,710,664), arrow2=(679,859,710,883), arrow3=(679,1085,710,1108), arrow4=(679,1308,710,1331), backArrow=(197,1490,226,1511))
SPEC['acct1']['box'].update(nextLeaf=(699,1533,760,1606))
SPEC['acct2']['box'].update(backLeaf=(106,1486,172,1565), nextLeaf=(505+171,1485+2,505+171+61,1485+2+73))
SPEC['acct3']['box'].update(backLeaf=(110,1461,176,1540))
DRAWER_CARDS=dict(profile=(312,432,832,604), currency=(312,620,832,741), connection=(312,756,832,882), ask=(312,897,832,1090), buffer=(312,1106,832,1397), privacy=(313,1411,831,1594), signout=(312,1612,832,1707))
SPEC['drawer']=dict(
 box=dict(sprig=(361,152,441,214), word=(356,225,526,259), **DRAWER_CARDS,
  thumb=(330,447,472,589), divProfile=(497,462,499,576), divCurrency=(647,646,649,710), divConnection=(647,786,649,852),
  arrowProfile=(781,505,806,526), arrowCurrency=(781,667,805,688), arrowConnection=(781,807,805,829),
  toggle=(710,955,805,1006), bufferField=(341,1231,805,1297), save=(341,1311,805,1377), saveArrow=(758,1335,780,1354),
  privacyArrow=(781,1531,804,1552), signoutIcon=(338,1637,379,1675), signoutArrow=(782,1649,805,1670)),
 text=[
  ('desc1','FINANCIAL LIFE.','sans',500,(350,266,530,285),'left',{'group':'desc'}),
  ('desc2','BEAUTIFULLY ORGANIZED.','sans',500,(350,284,630,302),'left',{'group':'desc'}),
  ('title','ACCOUNT','serif',500,(320,340,690,410),'left'),
  ('profileKicker','PROFILE','sans',500,(515,468,620,494),'left',{'group':'dKicker'}),
  ('profileTitle','PREVIEW GUEST','serif',500,(515,505,730,538),'left'),
  ('profileGray1','NO EMAIL ON DEVICE','sans',400,(515,544,760,566),'left',{'group':'dGray'}),
  ('currencyKicker','DISPLAY CURRENCY','sans',500,(335,643,600,669),'left',{'group':'dKicker'}),
  ('currencyTitle','USD · US DOLLAR','serif',500,(335,676,630,713),'left',{'group':'dTitle'}),
  ('currencyChange','CHANGE','sans',500,(660,665,765,692),'left',{'group':'dAct'}),
  ('connectionKicker','CONNECTION','sans',500,(335,782,600,808),'left',{'group':'dKicker'}),
  ('connectionTitle','NOT SET','serif',500,(335,816,630,853),'left',{'group':'dTitle'}),
  ('connectionSetup','SET UP','sans',500,(670,805,765,832),'left',{'group':'dAct'}),
  ('askKicker','ASK JURNL CONTEXT','sans',500,(333,924,600,950),'left',{'group':'dKicker'}),
  ('askGray1','HELP JURNL GIVE YOU','sans',400,(335,961,690,986),'left',{'group':'dGray'}),
  ('askGray2','PERSONALIZED INSIGHTS','sans',400,(335,989,690,1014),'left',{'group':'dGray'}),
  ('askGray3','BASED ON YOUR SPENDING,','sans',400,(335,1015,690,1036),'left',{'group':'dGray','ink':(342,1021,649,1034)}),
  ('askGray4','PLANS AND GOALS.','sans',400,(335,1040,690,1066),'left',{'group':'dGray'}),
  ('bufferKicker','SAFE TO SPEND BUFFER','sans',500,(333,1128,640,1155),'left',{'group':'dKicker'}),
  ('bufferGray1','AMOUNT TO KEEP AS A BUFFER','sans',400,(335,1164,800,1190),'left',{'group':'dGray'}),
  ('bufferGray2','IN YOUR SAFE TO SPEND CALCULATION.','sans',400,(335,1190,800,1215),'left',{'group':'dGray'}),
  ('bufferValue','$500','serif',500,(355,1240,470,1292),'left'),
  ('save','SAVE BUFFER','sans',500,(470,1330,680,1360),'center',{'mode':'light'}),
  ('privacyKicker','PRIVACY & CONSENTS','sans',500,(330,1466,600,1494),'left',{'ink':(340,1474,564,1487),'group':'dKicker'}),
  ('privacy1','MANAGE YOUR PRIVACY','sans',400,(0,0,0,0),'left',{'ink':(339,1505,560,1518),'like':'askGray1'}),
  ('privacy2','SETTINGS AND DATA CONSENTS.','sans',400,(0,0,0,0),'left',{'ink':(339,1531,600,1544),'like':'askGray1'}),
  ('signout','SIGN OUT','sans',500,(410,1645,560,1675),'left'),
 ])
def dock_spec(ref, icons, labels, add, plusH, plusV, addLabel):
    names=['HOME','MONEY','PLAN','CREDIT']
    text=[(nm,nm,'sans',500 if nm=='HOME' else 400,(b[0]-8,b[1]-6,b[2]+8,b[3]+6),'center',{'group':'dock'}) for nm,b in zip(names,labels)]
    text.append(('ADD','ADD','sans',400,(addLabel[0]-8,addLabel[1]-6,addLabel[2]+8,addLabel[3]+6),'center',{'group':'dock'}))
    return dict(ref=ref, box=dict(add=add, plusH=plusH, plusV=plusV, home=icons[0], money=icons[1], plan=icons[2], credit=icons[3]), text=text)
SPEC['dock_acct']=dock_spec('acct1',[(92,1697,136,1741),(242,1696,288,1737),(561,1696,605,1745),(722,1689,762,1742)],
  [(82,1758,147,1773),(226,1758,306,1773),(554,1758,611,1773),(701,1758,784,1773)],(381,1673,472,1752),(409,1712,444,1715),(425,1695,428,1733),(403,1769,449,1784))
SPEC['dock_why']=dock_spec('why',[(93,1692,133,1731),(249,1696,289,1730),(566,1694,601,1733),(713,1688,749,1732)],
  [(83,1749,142,1762),(232,1749,301,1762),(558,1749,607,1762),(698,1749,771,1762)],(381,1678,472,1752),(410,1713,444,1716),(425,1698,428,1731),(407,1766,446,1778))
WHY_ROWS=[('Cash','CASH',857,832),('Upcoming','UPCOMING',936,911),('Held','HELD',1014,989),('Assigned','ASSIGNED',1091,1068),('Goal','GOAL SET ASIDE',1172,1149),('Buffer','SAFETY BUFFER',1245,None)]
def why_rows():
    T=[]
    for k,lab,cy,at in WHY_ROWS:
        T.append(('lbl'+k,lab,'sans',500,(240,cy-14,500,cy+14),'left',{'group':'wLbl'}))
        if at:
            T.append(('amt'+k,{'Cash':'$8,420','Upcoming':'$1,920'}.get(k,'$0'),'serif',500,(505,at-6,650,at+30),'left',{'group':'wAmt'}))
            T.append(('src'+k,{'Cash':'ACCOUNTS','Upcoming':'MOCK'}.get(k,'NONE'),'sans',400,(505,at+31,650,at+52),'left',{'group':'wSrc'}))
    return T
SPEC['why']=dict(
 box=dict(sprig=(372,76,487,136), word=(346,140,503,172), ruleL=(294,151,337,154), ruleR=(515,151,559,154),
  back=(66,113,138,182), backIcon=(93,134,106,160), menu=(721,113,793,182), menuIcon=(742,135,772,159),
  dotCash=(203,848,222,868), dotUpcoming=(203,926,222,946), dotHeld=(204,1003,223,1023), dotAssigned=(205,1081,223,1100), dotGoal=(205,1162,224,1181), dotBuffer=(206,1234,224,1253),
  chevCash=(688,850,696,865), chevUpcoming=(688,929,696,944), chevHeld=(688,1008,696,1023), chevAssigned=(689,1086,697,1101), chevGoal=(689,1166,697,1182), chevBuffer=(689,1241,697,1255), chevComplete=(689,1314,697,1329),
  sep0=(205,814,695,816), sep1=(205,895,695,897), sep2=(205,974,695,976), sep3=(205,1053,695,1055), sep4=(205,1131,695,1133), sep5=(205,1212,695,1214), sep6=(205,1280,695,1282),
  hold=(154,1358,709,1440), holdArrow=(652,1391,680,1415),
  bar=(38,1538,816,1652), spark=(67,1568,106,1607), learn=(592,1568,800,1630), learnArrow=(760,1590,780,1608)),
 text=[
  ('title1','WHY THIS','serif',500,(80,235,440,302),'left',{'group':'wTitle'}),
  ('title2','NUMBER','serif',500,(80,306,440,372),'left',{'group':'wTitle'}),
  ('amount','$6,500','serif',500,(80,378,300,442),'left'),
  ('state1','AN ESTIMATE. FINISH SETUP','sans',400,(85,445,470,472),'left',{'group':'wState'}),
  ('state2','FOR A FULL READING.','sans',400,(85,475,470,502),'left',{'group':'wState'}),
  ('tabAccounts','ACCOUNTS','sans',500,(534,604,556,722),'left',{'rot':90,'group':'wTab','ink':(538,609,552,717)}),
  ('tabUpcoming','UPCOMING','sans',500,(594,618,616,732),'left',{'rot':90,'group':'wTab','ink':(598,623,612,727)}),
  ('tabHeld','HELD','sans',500,(646,658,668,717),'left',{'rot':90,'group':'wTab','ink':(650,663,664,712)}),
  ('tabGoals','GOALS','sans',500,(694,678,716,753),'left',{'rot':90,'group':'wTab','ink':(698,683,712,748)}),
  ('tabBuffer','BUFFER','sans',500,(747,690,769,775),'left',{'rot':90,'group':'wTab','ink':(751,695,765,770),'mode':'light'}),
  ('copy1',"HERE’S HOW",'sans',400,(195,708,460,739),'left',{'group':'wCopy'}),
  ('copy2','YOUR NUMBER','sans',400,(195,739,460,769),'left',{'group':'wCopy'}),
  ('copy3','COMES TOGETHER.','sans',400,(195,769,460,797),'left',{'group':'wCopy'}),
 ]+why_rows()+[
  ('lblComplete','COMPLETENESS','sans',500,(200,1305,400,1332),'left',{'ink':(208,1312,364,1325),'group':'wLbl'}),
  ('valComplete','NEEDS_SETUP','sans',400,(505,1305,670,1335),'left'),
  ('hold','CHANGE WHAT’S HELD','sans',500,(265,1385,590,1420),'left'),
  ('bar1','THIS UPDATES YOUR SAFE TO SPEND.','sans',500,(125,1558,540,1584),'left'),
  ('bar2','CHANGES HERE WILL ADJUST','sans',400,(125,1588,520,1612),'left',{'group':'wBar'}),
  ('bar3','YOUR NUMBER.','sans',400,(125,1612,300,1636),'left',{'group':'wBar'}),
  ('learn','LEARN MORE','sans',500,(610,1588,750,1612),'left'),
 ])
SPEC['why']['box'].update(sprigOlive=(366,70,493,138))
