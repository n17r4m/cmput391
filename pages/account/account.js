AccountsTemplates.configure({
    
    // layout 
    defaultLayoutType: 'blaze',
    defaultLayout: 'applicationLayout',
    defaultLayoutRegions: {},
    defaultContentRegion: 'main',
    
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: false,
    lowercaseUsername: false,
    focusFirstInput: true,

    // Appearance
    showAddRemoveServices: false,
    showForgotPasswordLink: true,
    showLabels: true,
    showPlaceholders: true,
    showResendVerificationEmailLink: true,

    // Client-side Validation
    continuousValidation: true,
    negativeFeedback: true,
    negativeValidation: true,
    positiveValidation: true,
    positiveFeedback: true,
    showValidating: true,

    // Privacy Policy and Terms of Use
    privacyUrl: 'privacy',
    termsUrl: 'terms-of-use',

    // Redirects
    homeRoutePath: '/',
    redirectTimeout: 4000,

    // Hooks
    /*
    onLogoutHook: myLogoutFunc,
    onSubmitHook: mySubmitFunc,
    preSignUpHook: myPreSubmitFunc,
    postSignUpHook: myPostSubmitFunc,
    */

    // Texts
    /*
    texts: {
      button: {
          signUp: "Register Now!"
      },
      socialSignUp: "Register",
      socialIcons: {
          "meteor-developer": "fa fa-rocket"
      },
      title: {
          forgotPwd: "Recover Your Password"
      },
    },
    */
});


var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: "username",
      type: "text",
      displayName: "username",
      required: true,
      minLength: 5,
  },
  {
      _id: 'email',
      type: 'email',
      required: true,
      displayName: "email",
      re: /.+@(.+){2,}\.(.+){2,}/,
      errStr: 'Invalid email',
  },
  pwd
]);

AccountsTemplates.addField({
    _id: 'firstName',
    type: 'text',
    required: true,
    displayName: "First Name"
});

AccountsTemplates.addField({
    _id: 'lastName',
    type: 'text',
    required: true,
    displayName: "Last Name"
});


function isValidPhone(tel){
    // http://stackoverflow.com/questions/10616314/how-do-i-validate-a-phone-number-with-javascript
    if(/^[\d\.\-]+$/.test(tel)){
        return false;
    }
    return true;
}

AccountsTemplates.addField({
    _id: 'phone',
    type: 'tel',
    displayName: "Phone",
    required: true,
    func: isValidPhone,
    errStr: 'Invalid Phone number!',
});


AccountsTemplates.addField({
    _id: 'address',
    type: 'text',
    displayName: "Address",
    required: true,
    errStr: 'Address is required!',
});




AccountsTemplates.configureRoute('signIn', {
  name: 'signin',
  path: '/login',
  template: 'login'
});

AccountsTemplates.configureRoute('signUp', {
  name: 'signup',
  path: '/register',
  template: 'register'
});

AccountsTemplates.configureRoute('forgotPwd', {
  name: 'forgotPassword',
  path: '/forgotPassword',
  template: 'forgotPassword'
});

FlowRouter.route('/logout', {
    action: function(params, queryParams) {
        Meteor.logout()
        FlowRouter.go("home")
    },
    name: "logout"
});