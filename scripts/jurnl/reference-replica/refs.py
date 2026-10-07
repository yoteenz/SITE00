"""Founder reference images and working paths for the SAFE TO SPEND replicas (P0.JURNL.F09.REFERENCE-REPLICA1)."""
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','..'))
REF_DIR=os.path.join(ROOT,'JURNL','F09_SAFE','REFERENCE_REPLICA1','REFERENCES')
ASSET_DIR=os.path.join(ROOT,'src','projects','jurnl','families','F09_SAFE','REFERENCE_REPLICA')
LAYOUT_TS=os.path.join(ROOT,'src','projects','jurnl','runtime','layout','referenceLayout.ts')
WORK=os.environ.get('REPLICA_WORK','/tmp/jurnl-reference-replica')
os.makedirs(WORK,exist_ok=True)
REFS={
 'parent':os.path.join(REF_DIR,'01_SAFE_TO_SPEND.png'),
 'why':os.path.join(REF_DIR,'02_WHY_THIS_NUMBER.png'),
 'acct1':os.path.join(REF_DIR,'03_ACCOUNT_PAGE_1.png'),
 'acct2':os.path.join(REF_DIR,'04_ACCOUNT_PAGE_2.png'),
 'acct3':os.path.join(REF_DIR,'05_ACCOUNT_PAGE_3.png'),
 'drawer':os.path.join(REF_DIR,'06_ACCOUNT_DRAWER.png'),
 'check':os.path.join(REF_DIR,'07_CHECK_A_PURCHASE.png'),
 'category':os.path.join(REF_DIR,'08_SELECT_A_CATEGORY.png'),
 'account':os.path.join(REF_DIR,'09_SELECT_AN_ACCOUNT_CURRENT.png'),
}
