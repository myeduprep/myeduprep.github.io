const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext();const page=await context.newPage();const errors=[];const bad=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(process.env.SITE_TEST_URL || 'http://127.0.0.1:8001')&&r.status()>=400)bad.push(r.url())});
 const base=process.env.SITE_TEST_URL || 'http://127.0.0.1:8001';
 await page.goto(base+'/boarding-schools/');assert.equal(await page.locator('[data-school-card]').count(),8);
 await page.locator('[data-filter="search"]').fill('Canford');assert.equal(await page.locator('[data-school-card]:visible').count(),1);
 await page.locator('[data-filter="gender"]').selectOption('girls');assert.equal(await page.locator('[data-school-card]:visible').count(),0);
 await page.locator('button[type=reset]').click();await page.waitForTimeout(50);assert.equal(await page.locator('[data-school-card]:visible').count(),8);
 for (const [filter,value,count] of [['location','Dorset',3],['gender','girls',1],['age','13',5],['programmes','IB',2],['fees','0-40000',0],['fees','60000-999999',1],['boarding','weekly',3]]) {
   await page.locator(`[data-filter="${filter}"]`).selectOption(value);assert.equal(await page.locator('[data-school-card]:visible').count(),count,filter+': '+value);await page.locator('button[type=reset]').click();await page.waitForTimeout(20);
 }
 console.log('PASS eight schools, search, all filters, reset and unknown-data exclusion');
 for(const id of ['bradfield','bedes','lancing']) await page.locator(`[data-compare-add="${id}"]`).click();
 await page.locator('[data-compare-add="embley"]').click();assert.match(await page.locator('[data-selection-feedback]').innerText(),/3/);
 await page.locator('[data-compare-link]').click();assert.equal(await page.locator('thead th').count(),4);assert.equal(await page.locator('tbody tr').count(),19);
 await page.reload();assert.equal(await page.locator('thead th').count(),4);await page.locator('.school-remove').first().click();assert.equal(await page.locator('thead th').count(),3);
 await page.locator('#school-picker').selectOption('embley');await page.locator('[data-picker-add]').click();assert.equal(await page.locator('thead th').count(),4);
 console.log('PASS three-school maximum, table, persistence, removal and add');
 await page.goto(base+'/boarding-schools/compare/?schools=invalid,canford,canford,lancing,bedes,bradfield');assert.equal(await page.locator('thead th').count(),4);
 await Promise.all([page.waitForEvent('load'),page.locator('[data-lang-button="en"]').click()]);assert.equal(await page.locator('html').getAttribute('lang'),'en');assert.equal(await page.locator('thead th').count(),4);assert.match(await page.locator('tbody').innerText(),/Not currently verified/);
 console.log('PASS share URL sanitization and bilingual comparison');
 for(const path of ['/','/long-term-planning/','/tutoring/','/summer-camp/','/application-support/','/testimonials/','/about/','/contact/','/blogs/','/404.html',...['bradfield','bedes','lancing','embley','canford','bryanston','clayesmore','talbot-heath'].map(x=>'/boarding-schools/'+x+'/')]){
   const response=await page.goto(base+path);assert.equal(response.status(),200);if(path!=='/404.html'){assert.equal(await page.locator('site-header .site-nav').count(),1);assert.equal(await page.locator('site-footer footer').count(),1);}
   await page.evaluate(async()=>{for(const img of document.images) img.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
   assert.deepEqual(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.naturalWidth).map(i=>i.src)),[]);
 }
 assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://myeduprep.com/boarding-schools/talbot-heath/');
 await page.goto(base+'/long-term-planning/');assert.ok(await page.locator('main a[href="/boarding-schools/"]').count());
 console.log('PASS 18 existing/profile pages, images, canonical and roadmap link');
 for(const width of [1440,1024,900,810,800,390,320]) {
  await page.setViewportSize({width,height:900});await page.goto(base+'/boarding-schools/');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'overflow at '+width);
  if(width>800){const nav=await page.locator('.nav-shell').boundingBox();const last=await page.locator('.nav-cta').boundingBox();assert.ok(last.x+last.width<=nav.x+nav.width+1,'navigation overflow at '+width);}
  else {await page.locator('.menu-toggle').click();await page.locator('.site-nav a[href="/boarding-schools/"]').click();assert.equal(new URL(page.url()).pathname,'/boarding-schools/');}
 }
 await page.goto(base+'/boarding-schools/compare/?schools=bradfield,canford');assert.ok(await page.locator('.school-table-scroll').evaluate(el=>el.scrollWidth>el.clientWidth));
 console.log('PASS desktop/mobile navigation, 320–1440px layouts, horizontally scrollable mobile comparison');
 await page.setViewportSize({width:1200,height:1000});await page.goto(base+'/contact/');
 const phone=page.locator('input[name=phone]');assert.equal(await phone.getAttribute('type'),'tel');assert.equal(await phone.getAttribute('required'),'');
 await page.locator('[name=name]').fill('Website QA');await page.locator('[name=email]').fill('qa@example.com');await page.locator('[name=service]').selectOption({index:1});await page.locator('[name=message]').fill('Automated local test only.');
 assert.equal(await phone.evaluate(el=>el.checkValidity()),false);
 for(const value of ['010-1234-5678','+82 10-1234-5678','+44 (0)20 1234 5678','+1 212 555 0123']) {await phone.fill(value);assert.equal(await phone.evaluate(el=>el.checkValidity()),true,value);}
 for(const value of ['abcdefghi','-------','123','+1234567890123456']) {await phone.fill(value);assert.equal(await phone.evaluate(el=>el.checkValidity()),false,value);}
 await phone.fill('+82 10-1234-5678');let payload;
 await page.route('https://formsubmit.co/**',async route=>{payload=route.request().postData();await route.fulfill({status:200,contentType:'text/html',body:'<p>Local intercepted submission received</p>'})});
 await page.locator('button[type=submit]').click();await page.waitForURL('https://formsubmit.co/**');assert.equal(new URLSearchParams(payload).get('phone'),'+82 10-1234-5678');assert.ok(new URLSearchParams(payload).has('_honey'));assert.equal(new URLSearchParams(payload).get('_next'),'https://myeduprep.com/contact/?sent=1');
 console.log('PASS required phone, international validation and real browser POST payload (intercepted locally; no email sent)');
 await page.goto(base+'/contact/?sent=1');assert.equal(await page.locator('[data-contact-success]').isVisible(),true);assert.equal(await page.locator('[data-contact-form]').isVisible(),false);
 await page.goto(base+'/testimonials/');assert.equal(await page.locator('.review-card').count(),12);await page.locator('[data-review-load-more]').click();assert.equal(await page.locator('.review-card').count(),24);
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);console.log('PASS existing form success state, reviews pagination, zero browser exceptions/HTTP errors');
 await page.goto(base+'/boarding-schools/');await page.screenshot({path:'/tmp/mep-guide-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(350);await page.screenshot({path:'/tmp/mep-guide-mobile.png',fullPage:true});
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
