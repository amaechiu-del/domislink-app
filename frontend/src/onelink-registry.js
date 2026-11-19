export const registry = Object.freeze({
  church:{url:'https://church.domislink.com',status:'pending',verified:false,auth:'church-session',plannedAuth:'oidc',healthPath:'/',sessionEndpoint:'/api/auth/me',loginPath:'/login'},
  'ai-business':{url:null,status:'repair',verified:false,auth:'oidc'},
  meet:{url:'https://meet.domislink.com',status:'pending',verified:false,auth:'oidc'},
  property:{url:'https://propertymarketplace.domislinker.com',status:'pending',verified:false,auth:'oidc'},
  'ai-studio':{url:null,status:'development',verified:false,auth:'oidc'},
  'air-tickets':{url:'https://airticket.domislink.com',status:'pending',verified:false,auth:'oidc'},
  store:{url:'https://store.domislink.com',status:'pending',verified:false,auth:'oidc'},
  aviation:{url:null,status:'development',verified:false,auth:'oidc'}
});
export function canLaunch(entry){if(!entry||entry.status!=='live'||entry.verified!==true||!entry.url)return false;try{const url=new URL(entry.url);return url.protocol==='https:'&&url.username===''&&url.password===''&&url.hostname.endsWith('.domislink.com')||url.protocol==='https:'&&url.username===''&&url.password===''&&url.hostname.endsWith('.domislinker.com')}catch{return false}}
export function getLaunchUrl(entry){return canLaunch(entry)?entry.url:null}
