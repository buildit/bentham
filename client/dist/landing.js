options = {
  namespace: 'vuejs__'
};

Vue.use(VueLocalStorage, options);

var router = new VueRouter({
    mode: 'history',
    routes: []
});

var landing = new Vue({
  router,
  el: '#landing-page',
  data: {
    mustLogIn: false,
    hasAccessToken: false
  },
  mounted: function() {
    var accessToken = Vue.ls.get("icarus_user_token");

    this.$nextTick(function() {
      if (accessToken) {
        console.log("Access token retrieved from local storage");
        console.log(accessToken);
        this.accessToken = accessToken;
        showApplication(accessToken);
      } else {
        showLoginButton();
      }
    });
  },
  methods: {
    slackLogin: function() {
      var returnPageUri = siteBasePath + '/post-login.html';
      var authInitiateUri = lambdaPath + '/slack-oauth-initiate?returnUri=' + returnPageUri;
      window.location.href = authInitiateUri;
    },
    dropboxLogin: function() {
      var icarusAccessToken = Vue.ls.get("icarus_user_token").accessToken;
      var returnPageUri = siteBasePath + '/dropbox-post-login.html';
      var authInitiateUri = lambdaPath + '/dropbox-oauth-initiate';
      postForm(lambdaPath + '/dropbox-oauth-initiate', {
        icarusAccessToken: icarusAccessToken,
        returnUri: returnPageUri,
      })

    },
    githubLogin: function() {
      var icarusAccessToken = Vue.ls.get("icarus_user_token").accessToken;
      var returnPageUri = siteBasePath + '/github-post-login.html';
      postForm(lambdaPath + '/github-oauth-initiate', {
        icarusAccessToken: icarusAccessToken,
        returnUri: returnPageUri,        
      })
    },
  }
});

function showLoginButton() {
  landing.hasAccessToken = false;
  landing.mustLogIn = true;
}

function showApplication(accessToken) {
  landing.userDetails = accessToken;
  landing.mustLogIn = false;
  landing.hasAccessToken = true;
}
