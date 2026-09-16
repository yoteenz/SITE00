import sharp from 'sharp';
const W=768,H=1376;
const GOLDEN='/workspace/public/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg';
const tag=process.argv[2]||'before';
const live=`/tmp/r1/${tag}-live.png`;
const gold=await sharp(GOLDEN).resize(W,H,{kernel:'lanczos3'}).png().toBuffer();
const regions={
  shell:[0,0,768,205],
  band:[0,100,768,210],
  heroL:[0,205,400,615],
  heroR:[380,205,388,615],
  gallery:[0,615,768,215],
  structured:[0,828,768,205],
  pipeline:[0,1033,768,165],
  lower:[0,1194,768,182],
};
const pick=process.argv[3];
for(const [n,[x,y,w,h]] of Object.entries(regions)){
  if(pick && n!==pick) continue;
  const scale = Math.min(3, 1180/w);
  const g=await sharp(gold).extract({left:x,top:y,width:w,height:h}).resize({width:Math.round(w*scale)}).png().toBuffer();
  const l=await sharp(live).extract({left:x,top:y,width:w,height:h}).resize({width:Math.round(w*scale)}).png().toBuffer();
  const cw=Math.round(w*scale), ch=Math.round(h*scale);
  await sharp({create:{width:cw,height:ch*2+14,channels:3,background:'#e11'}})
    .composite([{input:g,left:0,top:0},{input:l,left:0,top:ch+14}])
    .png().toFile(`/tmp/r1/cmp-${n}.png`);
}
console.log('ok');
