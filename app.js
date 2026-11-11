const KEY='reset-v1';
let d;try{d=JSON.parse(localStorage.getItem(KEY))}catch{}
d=d||{tasks:[{id:1,t:'Build a consistent routine',done:false},{id:2,t:'Move your body',done:false},{id:3,t:'Take time for yourself',done:false}],habits:[{id:1,t:'Drink water',done:false},{id:2,t:'Move for 20 minutes',done:false}],goals:[],routines:{}};
d.tasks=d.tasks||[];d.habits=d.habits||[];d.goals=d.goals||[];d.routines=d.routines||{};
const routineNames=['Morning','Day','Evening','Custom'];
routineNames.forEach(n=>{if(!Array.isArray(d.routines[n]))d.routines[n]=[]});
let page='Home',sub='',activeRoutine='';
const save=()=>localStorage.setItem(KEY,JSON.stringify(d));
const app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function tool(t,desc){return `<button class="tool" data-tool="${esc(t)}"><i>✧</i><span><b>${esc(t)}</b><small>${esc(desc)}</small></span>　›</button>`}
function rows(a,type){return a.length?a.map(x=>`<div class="row ${x.done?'done':''}"><button class="check" data-toggle="${type}:${x.id}">${x.done?'✓':''}</button><span>${esc(x.t)}</span>${type==='task'?`<button class="delete" data-del="${x.id}">×</button>`:''}</div>`).join(''):'<div class="empty">Nothing here yet.</div>'}
function backButton(){return '<button id="back">← Plan</button>'}
function render(){
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
 let pct=d.tasks.length?Math.round(d.tasks.filter(x=>x.done).length/d.tasks.length*100):0;
 if(page==='Home')app.innerHTML=`<h1>Good ${new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}.</h1><p>Today is another chance to become who you want to be.</p><section class="card"><div class="label">TODAY'S FOCUS</div><h3>Small steps. Big changes.</h3><p>Your journey starts with one action.</p></section><section class="card"><div class="label">MY PLAN FOR TODAY</div>${rows(d.tasks.slice(0,3),'task')}</section><section class="card"><div class="label">TODAY'S PROGRESS</div><h2>${pct}% completed</h2><progress value="${pct}" max="100" style="width:100%;accent-color:#A8C3B1"></progress></section>`;
 else if(page==='Plan'&&!sub)app.innerHTML=`<h1>Your Plan</h1><p>Organize your life, one step at a time.</p>${tool('TASKS','Manage your daily tasks')}${tool('HABITS','Build consistent habits')}${tool('ROUTINES','Morning, day and evening routines')}${tool('GOALS','Set goals and track progress')}${tool('CALENDAR','Daily, weekly and monthly planning')}`;
 else if(page==='Plan'&&sub==='TASKS')app.innerHTML=`${backButton()}<h1>TASKS</h1><p>${d.tasks.filter(x=>!x.done).length} tasks remaining</p><button class="primary" id="add">＋ Add New Task</button><section class="card"><div class="label">TO DO</div>${rows(d.tasks.filter(x=>!x.done),'task')}</section><section class="card"><div class="label">COMPLETED</div>${rows(d.tasks.filter(x=>x.done),'task')}</section>`;
 else if(page==='Plan'&&sub==='HABITS')app.innerHTML=`${backButton()}<h1>HABITS</h1><section class="card"><div class="label">MY HABITS TODAY</div>${rows(d.habits,'habit')}<input id="habit" class="field" placeholder="Add a habit"><button class="primary" id="addhabit">Add Habit</button></section>`;
 else if(page==='Plan'&&sub==='GOALS')app.innerHTML=`${backButton()}<h1>GOALS</h1><section class="card">${d.goals.map(g=>`<p>${esc(g.t)} — ${g.progress}%</p>`).join('')||'No goals yet'}<input id="goal" class="field" placeholder="Add a goal"><button class="primary" id="addgoal">Add Goal</button></section>`;
 else if(page==='Plan'&&sub==='ROUTINES'&&!activeRoutine)app.innerHTML=`${backButton()}<h1>ROUTINES</h1>${routineNames.map(x=>`<button class="tool" data-routine="${x}"><span><b>${x}</b><small>${d.routines[x].length} steps · Build your ${x.toLowerCase()} routine.</small></span>　›</button>`).join('')}`;
 else if(page==='Plan'&&sub==='ROUTINES'&&activeRoutine){let a=d.routines[activeRoutine];app.innerHTML=`<button id="routineback">← Routines</button><h1>${activeRoutine.toUpperCase()}</h1><p>Build your ${activeRoutine.toLowerCase()} routine, one step at a time.</p><section class="card"><div class="label">YOUR ROUTINE</div>${a.length?a.map((x,i)=>`<div class="row ${x.done?'done':''}"><button class="check" data-rstep="${i}">${x.done?'✓':''}</button><span>${esc(x.t)}</span><button class="delete" data-rdelete="${i}">×</button></div>`).join(''):'<div class="empty">Add your first step below.</div>'}<input id="rstep" class="field" placeholder="Add a step to this routine"><button class="primary" id="addrstep">Add Step</button><button class="primary" id="resetRoutine" style="background:#EDE6DA;color:#344238">Reset today's checklist</button></section>`}
 else if(page==='Plan'&&sub==='CALENDAR')app.innerHTML=`${backButton()}<h1>CALENDAR</h1><section class="card"><div class="label">TODAY</div>${rows(d.tasks.filter(x=>!x.done),'task')}</section><section class="card"><div class="label">COMING UP</div><p>Your dated plans will appear here.</p></section>`;
 else{const lists={Health:['Movement','Workout Planner','Nutrition','Meal Planner','Sleep','Wellness','Mobility & Flexibility'],Growth:['Journal','Mindset','Learning','Self-Development','Gratitude','Vision Board'],Progress:['Dashboard','Consistency Tracker','Goal Progress','Health Progress','Statistics & Reports','Achievements','My Journey'],Profile:['Personal Information','Preferences','Appearance','Notifications','Privacy & Security','Data & Backup','App Customization']};app.innerHTML=`<h1>${page}</h1><p>${page==='Health'?'Health without extremes.':page==='Growth'?'Become who you want to be.':'Your personal RESET space.'}</p>${(lists[page]||[]).map(x=>tool(x,'Open '+x.toLowerCase())).join('')}`}
 bind();
}
function modal(){document.body.insertAdjacentHTML('beforeend',`<div class="backdrop" id="shade"><div class="modal"><h2>New Task</h2><p>What would you like to accomplish?</p><input id="taskinput" class="field" placeholder="Write your task here"><div class="actions"><button id="cancel">Cancel</button><button id="save">Add Task</button></div></div></div>`);const input=document.getElementById('taskinput');setTimeout(()=>input.focus(),100);document.getElementById('cancel').onclick=()=>document.getElementById('shade').remove();document.getElementById('save').onclick=()=>{if(input.value.trim()){d.tasks.push({id:Date.now(),t:input.value.trim(),done:false});save();document.getElementById('shade').remove();render()}};input.onkeydown=e=>{if(e.key==='Enter')document.getElementById('save').click()}}
function bind(){
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=b.dataset.page;sub='';activeRoutine='';render()});
 document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{if(page==='Plan'){sub=b.dataset.tool;activeRoutine='';render()}});
 document.getElementById('add')?.addEventListener('click',modal);
 document.getElementById('back')?.addEventListener('click',()=>{sub='';activeRoutine='';render()});
 document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{let [type,id]=b.dataset.toggle.split(':');let arr=type==='task'?d.tasks:d.habits;let x=arr.find(x=>x.id==id);if(x)x.done=!x.done;save();render()});
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{d.tasks=d.tasks.filter(x=>x.id!=b.dataset.del);save();render()});
 document.getElementById('addhabit')?.addEventListener('click',()=>{let v=document.getElementById('habit').value.trim();if(v){d.habits.push({id:Date.now(),t:v,done:false});save();render()}});
 document.getElementById('addgoal')?.addEventListener('click',()=>{let v=document.getElementById('goal').value.trim();if(v){d.goals.push({id:Date.now(),t:v,progress:0});save();render()}});
 document.querySelectorAll('[data-routine]').forEach(b=>b.onclick=()=>{activeRoutine=b.dataset.routine;render()});
 document.getElementById('routineback')?.addEventListener('click',()=>{activeRoutine='';render()});
 document.getElementById('addrstep')?.addEventListener('click',()=>{let input=document.getElementById('rstep'),v=input.value.trim();if(v){d.routines[activeRoutine].push({t:v,done:false});save();render()}});
 document.querySelectorAll('[data-rstep]').forEach(b=>b.onclick=()=>{let x=d.routines[activeRoutine][Number(b.dataset.rstep)];x.done=!x.done;save();render()});
 document.querySelectorAll('[data-rdelete]').forEach(b=>b.onclick=()=>{d.routines[activeRoutine].splice(Number(b.dataset.rdelete),1);save();render()});
 document.getElementById('resetRoutine')?.addEventListener('click',()=>{d.routines[activeRoutine].forEach(x=>x.done=false);save();render()});
}
render();