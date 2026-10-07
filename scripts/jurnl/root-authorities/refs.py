"""Founder reference + clean shell pairs for the four JURNL root parents (P0.JURNL.ROOT-PARENTS.REFERENCE-PLUS-SHELL-OPUS-RECONSTRUCTION1)."""
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','..'))
REF_DIR=os.path.join(ROOT,'JURNL','ROOT_PARENTS_REFERENCE_PLUS_SHELL1','REFERENCES')
FAM=os.path.join(ROOT,'src','projects','jurnl','families')
WORK=os.environ.get('ROOTS_WORK','/tmp/jurnl-root-authorities')
os.makedirs(WORK,exist_ok=True)
REFS={
 'today':os.path.join(REF_DIR,'01_TODAY_REFERENCE.png'),
 'money':os.path.join(REF_DIR,'02_MONEY_REFERENCE.png'),
 'plan':os.path.join(REF_DIR,'03_PLAN_REFERENCE.png'),
 'credit':os.path.join(REF_DIR,'04_CREDIT_REFERENCE.png'),
}
# Clean shells (OpenArt, 2016 × 3584): the plates main already mounts.
SHELLS={
 'today':os.path.join(FAM,'F03_TODAY','ENVIRONMENTS','F03_SIDEKICK_PLATE.jpg'),
 'money':os.path.join(FAM,'F05_MONEY','ENVIRONMENTS','F05_SIDEKICK_PLATE.jpg'),
 'plan':os.path.join(FAM,'F08_PLAN','ENVIRONMENTS','F08_SIDEKICK_PLATE.jpg'),
 'credit':os.path.join(FAM,'F12_CREDIT','ENVIRONMENTS','F12_SIDEKICK_PLATE.jpg'),
}
REF_W,REF_H=941,1672
SHELL_W,SHELL_H=2016,3584
