options = {
  namespace: 'vuejs__'
};

Vue.use(VueLocalStorage, options);

var router = new VueRouter({
    mode: 'history',
    routes: []
});

// TODO Code is very similar to post-login.js and dropbox-post-login.js

var githubPostLogin = new Vue({
  router,
  el: '#github-post-login',
  data: {
    mustLogIn: false,
    hasAccessToken: false
  },
  mounted: function() {
    var githubAuthorisationCode = this.$route.query.code;
    console.log("GitHub authorisation code obtained: " + githubAuthorisationCode);

    var userToken = Vue.ls.get("icarus_user_token");
    if (userToken) {
      var icarusAccessToken = userToken.accessToken;
      this.$nextTick(function() {
        getIcarusTokenWithGithub(githubAuthorisationCode, icarusAccessToken);
      });
    } else {
      console.log("Missing Icarus user token!")
      window.location.href="index.html";
    }
  },
  methods: {
    processToken: function(icarusAccessToken) {
      Vue.ls.set("icarus_user_token", icarusAccessToken);
      window.location.href="index.html";
    },
  }
});


function getIcarusTokenWithGithub(githubAuthorisationCode, icarusAccessToken) {
  var initReturnUri = siteBasePath + '/github-post-login.html'; // This is the return uri used when initiating the OAuth journey; for verification only

  axios.post(lambdaPath + '/github-oauth-complete',{
    code: githubAuthorisationCode,
    icarusAccessToken: icarusAccessToken,
    initReturnUri: initReturnUri,
  }).then(function(response) {
      console.log(response);
      githubPostLogin.processToken(response.data);
    })
    .catch(function(err) {
        console.log(err);
    });
}
