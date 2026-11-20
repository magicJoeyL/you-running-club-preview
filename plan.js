const $ = id => document.getElementById(id);
const letters = ['A','B','C','D'];
const dates = ['11.16—11.22','11.23—11.29','11.30—12.06','12.07—12.13'];
const names = ['周一','周二','周三','周四','周五','周六','周日'];
const types = ['恢复跑','轻松跑','质量课','恢复跑','轻松跑','休息','长距离'];
const q = new URLSearchParams(location.search);
let g = letters.indexOf(q.get('group') || localStorage.getItem('youGroup') || 'A');
if(g<0)g=0;
let w = Math.max(0,Math.min(3,Number(q.get('week')||2)-2));
if(!Number.isInteger(w))w=0;
let view='all';
function render(){
  const p=plans[w][g];
  $('groups').querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===g);b.setAttribute('aria-pressed',String(i===g));b.onclick=()=>{g=i;localStorage.setItem('youGroup',letters[g]);render()}});
  $('weeks').querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===w);b.setAttribute('aria-pressed',String(i===w));b.onclick=()=>{w=i;view='all';render()}});
  $('total').innerHTML=`<span>${dates[w]}<br>${letters[g]}组 W${w+2}</span><b>${p.km} km</b>`;
  const day=(new Date().getDay()+6)%7;
  $('days').innerHTML=p.days.map((value,i)=>view==='today'&&i!==day?'':`<div class="day ${i===2||i===6?'key':''}"><span>${names[i]}<small>${types[i]}</small></span><div><strong>${value}</strong>${i===2?`<p>${w===0?'转段休5分钟，组间休3分钟':w===3?'连续提速':'连续跑'}</p>`:''}</div></div>`).join('');
  $('today').classList.toggle('active',view==='today');$('all').classList.toggle('active',view==='all');
  $('today').setAttribute('aria-pressed',String(view==='today'));$('all').setAttribute('aria-pressed',String(view==='all'));
  const params=new URLSearchParams(location.search);params.set('group',letters[g]);params.set('week',String(w+2));try{history.replaceState(null,'','?'+params.toString())}catch{}
}
$('today').onclick=()=>{const now=new Date(),day=Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())-Date.UTC(2026,10,16))/86400000);if(day>=0&&day<28){w=Math.floor(day/7);view='today'}else view='all';render()};
$('all').onclick=()=>{view='all';render()};
$('download').onclick=()=>{
  const p=plans[w][g],canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const c=canvas.getContext('2d');
  c.fillStyle='#fff';c.fillRect(0,0,1080,1440);c.fillStyle='#c8102e';c.fillRect(0,0,1080,230);c.fillStyle='#fff';c.font='bold 60px Microsoft YaHei';c.fillText('YOU 跑团 冬训课表',60,86);c.font='35px Microsoft YaHei';c.fillText(`${letters[g]}组  W${w+2}  ${dates[w]}  ${p.km}km`,60,168);c.textBaseline='middle';
  p.days.forEach((value,i)=>{const y=275+i*143;c.strokeStyle='#ddd';c.beginPath();c.moveTo(60,y+116);c.lineTo(1020,y+116);c.stroke();c.fillStyle=i===2||i===6?'#c8102e':'#222';c.font='bold 34px Microsoft YaHei';c.fillText(names[i],60,y+20);c.font='26px Microsoft YaHei';c.fillText(types[i],60,y+65);c.fillStyle='#181818';c.font='bold 36px Microsoft YaHei';c.fillText(value,255,y+35,760);if(i===2){c.font='25px Microsoft YaHei';c.fillText(w===0?'转段5分钟，组间3分钟':w===3?'连续提速':'连续跑',255,y+80)}});c.fillStyle='#555';c.font='26px Microsoft YaHei';c.fillText('周三另加3km热身、2km放松。静止或步行恢复。',60,1340,970);const a=document.createElement('a');a.download=`YOU冬训-${letters[g]}组-W${w+2}.png`;a.href=canvas.toDataURL('image/png');a.click();
};render();
