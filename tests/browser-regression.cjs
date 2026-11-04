// Serve this repository locally, then run with Node and Playwright.
// TEST_URL, PLAYWRIGHT_MODULE and BROWSER_EXECUTABLE may override defaults.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||undefined,headless:true});let failed=0;const results=[];
 async function check(name,repo,fn,init){const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.setDefaultTimeout(6000);page.on('pageerror',e=>errors.push(e.message));try{if(init)await page.addInitScript(init);await page.goto(process.env.TEST_URL||'http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});await fn(page);assert.deepEqual(errors,[]);results.push({name,passed:true});console.log('PASS',name);}catch(e){failed++;results.push({name,passed:false,error:e.message,errors});console.log('FAIL',name,e.message,errors)}finally{await page.close()}}

 await check('blue damaged hand falls back safely','blue-blockgame',async p=>{assert.equal(await p.locator('#board .cell').count(),64);assert.equal(await p.locator('#tray .slot').count(),3);},()=>localStorage.setItem('blue-block-state-classic',JSON.stringify({grid:Array(64).fill(null),hand:[{shape:null},null,null]})));
 await check('blue drag ignores a second finger and clears on blur','blue-blockgame',async p=>{await p.evaluate(()=>{let b=document.querySelector('.slot');b.dispatchEvent(new PointerEvent('pointerdown',{pointerId:41,clientX:100,clientY:500,bubbles:true}));const first=drag;document.querySelectorAll('.slot')[1].dispatchEvent(new PointerEvent('pointerdown',{pointerId:42,clientX:200,clientY:500,bubbles:true}));if(drag!==first)throw Error('drag stolen');window.dispatchEvent(new PointerEvent('pointerup',{pointerId:42}));if(drag!==first)throw Error('wrong finger committed');window.dispatchEvent(new Event('blur'));if(drag!==null)throw Error('drag remained');});});
 await browser.close();process.exitCode=failed?1:0;
})();
