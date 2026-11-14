/* AUTOPILOT AI. Сценарное демо без API и хранения данных. */
(function(root,factory){const api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.SalonDemo=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const BASE={salon:"Лотос (вымышленный салон)",address:"Вымышленный адрес — укажите реальный адрес только после согласования",hours:"ежедневно с 10:00 до 20:00 (пример)",services:[
{id:"manicure",title:"Маникюр с покрытием",aliases:["маникюр","ногт","покрыти","гель"],price:2500,duration:90},
{id:"pedicure",title:"Педикюр",aliases:["педикюр"],price:3200,duration:90},
{id:"brows",title:"Оформление бровей",aliases:["бров","коррекц"],price:1500,duration:45},
{id:"lashes",title:"Ламинирование ресниц",aliases:["ресниц","ламинир"],price:2800,duration:75},
{id:"haircut",title:"Женская стрижка",aliases:["стриж","волос"],price:2200,duration:60}]};
const normalize=s=>String(s||"").toLowerCase().replaceAll("ё","е").replace(/\s+/g," ").trim();
const rub=n=>new Intl.NumberFormat("ru-RU").format(n)+" ₽";
function cfg(i){const x=i||{},pr=x.prices||{};return {salon:String(x.salon||BASE.salon).slice(0,80),hours:String(x.hours||BASE.hours).slice(0,110),address:String(x.address||BASE.address).slice(0,150),services:BASE.services.map(s=>{const p=pr[s.id],v=Number(p);return {...s,price:p!==""&&p!=null&&Number.isInteger(v)&&v>=100&&v<=100000?v:s.price}})}}
function empty(){return {stage:"idle",serviceId:null,preference:""}}
function isPersonal(s){return /[\w.+-]+@[\w.-]+\.[a-zа-я]{2,}/i.test(s)||/(?:\+7|\b8)[\s()-]*\d[\d\s()-]{8,13}/.test(s)||/\b(?:телефон|номер|почта|email|e-mail|whatsapp|телеграм)\s*[:-]/i.test(s)}
function detectService(t,c){return c.services.find(s=>s.aliases.some(a=>t.includes(a)))||null}
const days=["понедельник","вторник","среду","среда","четверг","пятницу","пятница","субботу","суббота","воскресенье","завтра","сегодня"];
function preference(t){const day=days.find(d=>t.includes(d)),m=t.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b|\b(?:в|к)\s+([01]?\d|2[0-3])\s*(?:час(?:а|ов)?)?\b/);return [day,m?(m[3]?m[3]+":00":m[1].padStart(2,"0")+":"+m[2]):""].filter(Boolean).join(", ")}
function step(raw,state,settings){const c=cfg(settings),original=String(raw||"").trim().slice(0,300),t=normalize(original),s=state&&["idle","await-service","await-preference"].includes(state.stage)?{...state}:empty();
const reply=(message,next,kind)=>({message,state:next||empty(),kind:kind||"info"});
if(!t)return reply("Напишите вопрос о цене, услуге, графике или записи.",s);
if(isPersonal(original))return reply("Не вводите телефон или email: демонстрация не собирает заявки и не хранит контакты.",s,"privacy");
if(/(отмен|заново|сброс|прекрат)/.test(t))return reply("Хорошо, начнём заново. Что вас интересует?",empty());
if(/(аллерги|здоров|беремен|боль|медицин|диагноз|воспал)/.test(t))return reply("Медицинские вопросы и противопоказания должен проверить специалист салона. Я не даю медицинских рекомендаций.",empty(),"handoff");
if(/(скид|акци|сертификат|подароч|промокод)/.test(t))return reply("Нет подтверждённых акций. Условия нужно уточнить у администратора.",empty(),"handoff");
if(/(где|адрес|находит|доехать|метро)/.test(t))return reply("Адрес: "+c.address+". Это исключительно демонстрационные сведения.",s);
if(/(врем.*работ|график|режим|открыт|закрыт|до скольк|час.*работ|работаете)/.test(t))return reply("График: "+c.hours+".",s);
const service=detectService(t,c),price=/(цен|стоит|стоим|прайс|сколько|тариф)/.test(t),duration=/(длит|время процедур|по времени|продолжительн|долг|сколько минут)/.test(t),booking=/(запис|запись|заброни|свободн|окошк|на завтра|на пятниц|на суббот)/.test(t);
if(price||duration){if(service)return reply(service.title+": "+rub(service.price)+", около "+service.duration+" минут. Это вымышленный прайс, не действующая цена.",s);if(price)return reply("Пример прайса:\n"+c.services.map(x=>"• "+x.title+" — "+rub(x.price)).join("\n")+"\nВсе цены демонстрационные.",s);return reply("Уточните услугу: маникюр, педикюр, брови, ресницы или стрижка.",s)}
if(booking){const pref=preference(t);if(service&&pref)return reply("Черновик запроса:\n• Услуга: "+service.title+"\n• Пожелание: "+pref+"\nНЕ подтверждённая запись; ничего не отправлено.",empty(),"booking-draft");if(service)return reply("Услуга: "+service.title+". На какой день и время вам удобно? Без имени и телефона.",{stage:"await-preference",serviceId:service.id,preference:""});return reply("Выберите услугу: маникюр, педикюр, брови, ресницы или стрижка.",{stage:"await-service",serviceId:null,preference:pref})}
if(s.stage==="await-service"&&service){if(s.preference)return reply("Черновик запроса:\n• Услуга: "+service.title+"\n• Пожелание: "+s.preference+"\nЗапрос не отправлен.",empty(),"booking-draft");return reply("На какой день и время вам удобно?",{stage:"await-preference",serviceId:service.id,preference:""})}
if(s.stage==="await-preference"){const selected=c.services.find(x=>x.id===s.serviceId);if(selected){const pref=preference(t);if(pref)return reply("Черновик запроса:\n• Услуга: "+selected.title+"\n• Пожелание: "+pref+"\nЭто НЕ запись, администратор должен подтвердить время.",empty(),"booking-draft");return reply("Укажите день («в пятницу») и, если нужно, время («в 15:00»).",s)}}
if(service)return reply(service.title+" — "+rub(service.price)+", примерно "+service.duration+" минут. Цена тестовая.",s);
if(/(услуг|что делаете|процедур)/.test(t))return reply("Есть услуги: "+c.services.map(x=>x.title).join(", ")+".",s);
if(/(привет|здравств|добрый)/.test(t))return reply("Здравствуйте! 🌸 Это вымышленный салон «"+c.salon+"». Спросите о ценах или записи.",s);
return reply("Не буду выдумывать ответ. В рабочей версии сложные вопросы передаются администратору, а здесь можно попробовать вопросы о ценах и записи.",s,"handoff");
}
return {BASE,cfg,empty,step,isPersonal,detectService,rub};
});