FlowRouter.route('/', {
    action: function(params, queryParams) {
        BlazeLayout.render('applicationLayout', { main: "home" });
    },
    name: "home"
});

AccountsTemplates.configure({
    defaultLayout: 'applicationLayout',
    defaultLayoutRegions: {},
    defaultContentRegion: 'main',
    showForgotPasswordLink: true
});

AccountsTemplates.configureRoute('signIn', {
  layoutType: 'blaze',
  name: 'signin',
  path: '/login',
  template: 'login',
  // layoutTemplate: 'myLayout',
  layoutRegions: {},
  contentRegion: 'main'
});

AccountsTemplates.configureRoute('signUp', {
  layoutType: 'blaze',
  name: 'signup',
  path: '/register',
  template: 'register',
  // layoutTemplate: 'myLayout',
  layoutRegions: {},
  contentRegion: 'main'
});

AccountsTemplates.configureRoute('forgotPwd', {
  layoutType: 'blaze',
  name: 'forgotPassword',
  path: '/forgotPassword',
  template: 'forgotPassword',
  // layoutTemplate: 'myLayout',
  layoutRegions: {},
  contentRegion: 'main'
});