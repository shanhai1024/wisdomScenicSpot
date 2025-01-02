
  ;(function(){
  let u=void 0,isReady=false,onReadyCallbacks=[],isServiceReady=false,onServiceReadyCallbacks=[];
  const __uniConfig = {"pages":[],"globalStyle":{"backgroundColor":"#F8F8F8","navigationBar":{"backgroundColor":"#F8F8F8","titleText":"uni-app","type":"default","titleColor":"#000000"},"isNVue":false},"nvue":{"compiler":"uni-app","styleCompiler":"uni-app","flex-direction":"column"},"renderer":"auto","appname":"wisdomScenicSpot","splashscreen":{"alwaysShowBeforeRender":true,"autoclose":true},"compilerVersion":"4.36","entryPagePath":"pages/advertisement/advertisement","entryPageQuery":"","realEntryPagePath":"","networkTimeout":{"request":60000,"connectSocket":60000,"uploadFile":60000,"downloadFile":60000},"tabBar":{"position":"bottom","color":"#666","selectedColor":"#007aff","borderStyle":"black","blurEffect":"none","fontSize":"10px","iconWidth":"24px","spacing":"3px","height":"50px","list":[{"selectedIconPath":"/static/tabbar/homeSelect.png","pagePath":"pages/index/index","iconPath":"/static/tabbar/home.png","text":"首页"},{"selectedIconPath":"/static/tabbar/activitiesSelect.png","iconPath":"/static/tabbar/activities.png","pagePath":"pages/activities/activities","text":"活动"},{"selectedIconPath":"/static/tabbar/mySelect.png","iconPath":"/static/tabbar/my.png","pagePath":"pages/my/my","text":"我的"}],"backgroundColor":"#fff","selectedIndex":0,"shown":true},"fallbackLocale":"zh-Hans","locales":{},"darkmode":false,"themeConfig":{}};
  const __uniRoutes = [{"path":"pages/advertisement/advertisement","meta":{"isQuit":true,"isEntry":true,"navigationBar":{"titleText":"","style":"custom","type":"default"},"isNVue":false}},{"path":"pages/login/login","meta":{"navigationBar":{"titleText":"登录","style":"custom","type":"default"},"isNVue":false}},{"path":"pages/index/index","meta":{"isQuit":true,"isTabBar":true,"tabBarIndex":0,"navigationBar":{"titleText":"首页","style":"custom","type":"default"},"isNVue":false}},{"path":"pages/register/register","meta":{"navigationBar":{"titleText":"注册","type":"default"},"isNVue":false}},{"path":"pages/activities/activities","meta":{"isQuit":true,"isTabBar":true,"tabBarIndex":1,"navigationBar":{"titleText":"活动预约","type":"default"},"isNVue":false}},{"path":"pages/my/my","meta":{"isQuit":true,"isTabBar":true,"tabBarIndex":2,"navigationBar":{"titleText":"我的","style":"custom","type":"default"},"isNVue":false}},{"path":"pages/showInfo/showInfo","meta":{"navigationBar":{"titleText":"景点详情","style":"custom","type":"default"},"isNVue":false}},{"path":"pages/scenicAlbum/scenicAlbum","meta":{"navigationBar":{"titleText":"景区相册","type":"default"},"isNVue":false}},{"path":"pages/test/test","meta":{"navigationBar":{"titleText":"测试页","type":"default"},"isNVue":false}},{"path":"pages/raiders/raiders","meta":{"navigationBar":{"titleText":"游玩攻略","style":"custom","type":"default"},"isNVue":false}},{"path":"pages/raiders/raidersInfo","meta":{"navigationBar":{"titleText":"攻略详情","style":"custom","type":"default"},"isNVue":false}},{"path":"pages/myFavorite/myFavorite","meta":{"navigationBar":{"titleText":"我的喜欢","type":"default"},"isNVue":false}},{"path":"pages/myCollection/myCollection","meta":{"navigationBar":{"titleText":"我的收藏","type":"default"},"isNVue":false}},{"path":"pages/myFootprints/myFootprints","meta":{"navigationBar":{"titleText":"我的足迹","type":"default"},"isNVue":false}}].map(uniRoute=>(uniRoute.meta.route=uniRoute.path,__uniConfig.pages.push(uniRoute.path),uniRoute.path='/'+uniRoute.path,uniRoute));
  __uniConfig.styles=[];//styles
  __uniConfig.onReady=function(callback){if(__uniConfig.ready){callback()}else{onReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"ready",{get:function(){return isReady},set:function(val){isReady=val;if(!isReady){return}const callbacks=onReadyCallbacks.slice(0);onReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
  __uniConfig.onServiceReady=function(callback){if(__uniConfig.serviceReady){callback()}else{onServiceReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"serviceReady",{get:function(){return isServiceReady},set:function(val){isServiceReady=val;if(!isServiceReady){return}const callbacks=onServiceReadyCallbacks.slice(0);onServiceReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
  service.register("uni-app-config",{create(a,b,c){if(!__uniConfig.viewport){var d=b.weex.config.env.scale,e=b.weex.config.env.deviceWidth,f=Math.ceil(e/d);Object.assign(__uniConfig,{viewport:f,defaultFontSize:16})}return{instance:{__uniConfig:__uniConfig,__uniRoutes:__uniRoutes,global:u,window:u,document:u,frames:u,self:u,location:u,navigator:u,localStorage:u,history:u,Caches:u,screen:u,alert:u,confirm:u,prompt:u,fetch:u,XMLHttpRequest:u,WebSocket:u,webkit:u,print:u}}}}); 
  })();
  