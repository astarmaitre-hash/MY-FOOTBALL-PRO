const $=id=>document.getElementById(id);
const API='https://www.thesportsdb.com/api/v1/json/3/';
function setStatus(s){$('status').textContent=s}
async function findTeam(name){
 const u=API+'searchteams.php?t='+encodeURIComponent(name);
 const r=await fetch(u); if(!r.ok) throw Error('تعذر الاتصال بمصدر البيانات');
 const j=await r.json(); return j.teams?.[0]||null;
}
async function recent(team){
 const r=await fetch(API+'eventslast.php?id='+encodeURIComponent(team.idTeam));
 if(!r.ok) throw Error('تعذر جلب النتائج');
 const j=await r.json(); return j.results||[];
}
function stats(events, teamId){
 const rows=events.filter(e=>e.intHomeScore!==null&&e.intAwayScore!==null).slice(0,5);
 if(!rows.length)return null;
 let gf=0,ga=0,n=0,w=0,d=0,l=0;
 for(const e of rows){const home=String(e.idHomeTeam)===String(teamId);const a=Number(home?e.intHomeScore:e.intAwayScore),b=Number(home?e.intAwayScore:e.intHomeScore);gf+=a;ga+=b;n++;if(a>b)w++;else if(a===b)d++;else l++}
 return {n,gf:gf/n,ga:ga/n,w,d,l};
}
function pct(x){return Math.round(Math.max(1,Math.min(98,x)))+'%'}
function render(a,b,sa,sb){
 const el=$('result');el.classList.remove('hidden');
 if(!sa||!sb){el.innerHTML='<h2>بيانات غير كافية</h2><p>لم نعثر على نتائج حديثة كافية للفريقين. جرّب كتابة الاسم الرسمي بالإنجليزية أو فريقاً آخر.</p>';return}
 const strengthA=sa.gf*0.65-sa.ga*0.35, strengthB=sb.gf*0.65-sb.ga*0.35;
 const diff=strengthA-strengthB;
 const home=50+diff*11, away=50-diff*11;
 const draw=Math.max(18,Math.min(34,29-Math.abs(diff)*2));
 const remain=100-draw, pa=remain*(home/(home+away)), pb=remain-pa;
 const over15= Math.min(92,Math.max(25,Math.round((sa.gf+sb.gf+sa.ga+sb.ga)*13)));
 const over25=Math.min(82,Math.max(12,Math.round(over15*.62)));
 el.innerHTML=`<h2>نتيجة التحليل</h2><p><span class="badge">تقديرات مبنية على آخر ${Math.min(sa.n,sb.n)} مباريات متاحة</span></p>
 <div class="metric"><span>${a} — فوز</span><span class="value">${pct(pa)}</span></div>
 <div class="metric"><span>تعادل</span><span class="value">${pct(draw)}</span></div>
 <div class="metric"><span>${b} — فوز</span><span class="value">${pct(pb)}</span></div>
 <h3>مؤشرات الأهداف</h3><div class="metric"><span>أكثر من 1.5 هدف</span><span class="value">${pct(over15)}</span></div>
 <div class="metric"><span>أكثر من 2.5 هدف</span><span class="value">${pct(over25)}</span></div>
 <h3>آخر النتائج المسجلة</h3>
 <div class="metric"><span>${a}: معدل التسجيل / الاستقبال</span><span class="value">${sa.gf.toFixed(1)} / ${sa.ga.toFixed(1)}</span></div>
 <div class="metric"><span>${b}: معدل التسجيل / الاستقبال</span><span class="value">${sb.gf.toFixed(1)} / ${sb.ga.toFixed(1)}</span></div>
 <p class="warning">هذه نسب تقديرية تجريبية وليست احتمالات معايرة احترافياً ولا توصية للمراهنة. لا تشمل بالضرورة الإصابات والتشكيلة والملعب.</p>`;
}
$('go').addEventListener('click',async()=>{
 const a=$('home').value.trim(),b=$('away').value.trim();
 $('result').classList.add('hidden');
 if(!a||!b){setStatus('المرجو إدخال اسم الفريقين.');return}
 setStatus('جارٍ البحث عن الفريقين وجلب آخر النتائج... تأكد من اتصال الإنترنت.');
 $('go').disabled=true;
 try{
  const [ta,tb]=await Promise.all([findTeam(a),findTeam(b)]);
  if(!ta||!tb){setStatus('لم يتم العثور على أحد الفريقين. جرّب الاسم بالإنجليزية.');return}
  const [ea,eb]=await Promise.all([recent(ta),recent(tb)]);
  const sa=stats(ea,ta.idTeam),sb=stats(eb,tb.idTeam);
  setStatus('اكتمل جلب البيانات. هذه قراءة إحصائية أولية وليست ضماناً.');
  render(ta.strTeam,tb.strTeam,sa,sb);
 }catch(e){setStatus('وقع مشكل أثناء جلب البيانات: '+e.message+'. تحقق من الإنترنت وحاول لاحقاً.')}
 finally{$('go').disabled=false}
});