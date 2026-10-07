SOURCES={'drawer':(300,90,853,1790)}
# Mask shapes per reference (reference px). rect/rrect/circle = full UI shapes; ink/inkl = dark/light type over the photograph.
MASKS={
'check':[
 ('ink',70,100,365,276,3),          # lockup + descriptor
 ('ink',575,186,752,238,3),         # tagline
 ('ink',130,424,742,486,3),         # title
 ('ink',140,496,662,566,3),         # subtitle
 ('rrect',82,694,774,1006,30),      # amount panel
 ('rrect',81,1006,774,1212,30),     # category panel
 ('rrect',81,1211,774,1420,30),     # pay with panel
 ('rrect',83,1426,772,1522,28),     # check purchase
 ('rrect',83,1525,773,1612,28),     # back
 ('rect',0,1618,853,1844),          # dock
],
}
MASKS['parent']=[
 ('ink',90,30,800,82,3),            # device status bar (not JURNL)
 ('ink',70,104,365,284,3),          # lockup + descriptor
 ('ink',575,186,752,238,3),         # tagline
 ('ink',755,122,815,170,3),         # menu
 ('ink',300,355,575,390,3),         # SAFE TO SPEND
 ('ink',250,412,632,560,4),         # amount
 ('ink',262,570,622,596,3),         # through date
 ('rrect',218,621,660,716,26),      # SEE WHY button + shadow
 ('ink',533,898,558,968,3),         # BILLS
 ('ink',590,886,614,988,3),         # PLANS (and its dash)
 ('ink',644,940,668,1021,3),        # GOALS
 ('inkl',697,957,724,1056,3),       # BUFFER
 ('ink',172,1012,500,1156,4,0.18),  # folio headline
 ('ink',172,1176,272,1192,3),       # rule
 ('ink',170,1205,630,1276,3),       # folio amounts + dividers
 ('rect',275,1206,284,1274), ('rect',396,1206,405,1274), ('rect',517,1206,526,1274),  # folio dividers
 ('rect',612,34,790,74),            # status icons
 ('rrect',24,1450,830,1612,44),     # bridge card
 ('rect',0,1620,853,1847),          # dock + home indicator
]
MASKS['acct1']=[
 ('ink',92,104,440,310,3),          # lockup + descriptor
 ('ink',560,198,765,266,3),         # tagline
 ('ink',760,126,830,182,3),         # menu
 ('ink',200,362,672,462,4),         # ACCOUNT (olive leaves left of it stay)
 ('ink',205,468,690,505,3),         # sub
 ('rrect',96,552,760,744,24), ('rrect',96,738,760,915,24), ('rrect',96,909,760,1086,24), ('rrect',96,1080,760,1276,24), ('rrect',96,1270,760,1526,24),
 ('rrect',520,1524,770,1615,40),    # NEXT pill
 ('circle',389,1578,13), ('circle',426,1578,13), ('circle',463,1578,13),
 ('rect',0,1650,853,1844),          # dock
]
MASKS['drawer']=[
 ('ink',345,140,640,305,3),         # lockup + descriptor
 ('ink',318,340,690,412,4),         # ACCOUNT
 ('rrect',306,426,838,610,26), ('rrect',306,614,838,747,24), ('rrect',306,750,838,888,24), ('rrect',306,891,838,1096,24),
 ('rrect',306,1100,838,1403,24), ('rrect',307,1405,837,1600,24), ('rrect',306,1606,838,1713,24),
]
MASKS['why']=[
 ('rrect',58,105,146,190,22), ('rrect',713,105,801,190,22),   # back + menu buttons
 ('ink',280,66,575,180,3),           # centred lockup + rules
 ('ink',360,68,500,142,4,0.1),       # olive and sprig, low contrast
 ('circle',212,858,14), ('circle',212,936,14), ('circle',213,1013,14), ('circle',214,1090,14), ('circle',214,1171,14), ('circle',215,1243,14),
 ('ink',78,232,470,505,4),           # title, amount, state
 ('ink',532,602,560,724,3), ('ink',592,616,618,734,3), ('ink',644,656,670,719,3), ('ink',692,676,718,755,3), ('inkl',745,688,771,777,3),
 ('ink',195,704,465,800,3),          # folio copy
 ('ink',195,805,712,1340,3,0.2),     # rows: dots, labels, amounts, sources, chevrons
 ('rect',200,812,700,818), ('rect',200,893,700,899), ('rect',200,972,700,978), ('rect',200,1051,700,1057), ('rect',200,1129,700,1135), ('rect',200,1210,700,1216), ('rect',200,1278,700,1284),
 ('rrect',146,1350,717,1448,24),     # CHANGE WHAT'S HELD
 ('rrect',30,1530,824,1660,44),      # bar
 ('rect',0,1662,853,1844),           # dock
]
