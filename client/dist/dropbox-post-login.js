options = {
  namespace: 'vuejs__'
};

Vue.use(VueLocalStorage, options);

var router = new VueRouter({
    mode: 'history',
    routes: []
});

// TODO Code is very similar to post-login.js and github-post-login.js

var dropboxPostLogin = new Vue({
  router,
  el: '#dropbox-post-login',
  data: {
    mustLogIn: false,
    hasAccessToken: false
  },
  mounted: function() {
    var dropboxAuthorisationCode = this.$route.query.code;
    console.log("Dropbox authorisation code obtained: " + dropboxAuthorisationCode);

    var userToken = Vue.ls.get("icarus_user_token");
    if( userToken ) {
      var icarusAccessToken = userToken.accessToken;
      this.$nextTick(function() {
        getIcarusTokenWithDropbox(dropboxAuthorisationCode, icarusAccessToken);
      });
    } else {
      console.log("Missing Icarus user token!");
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


function getIcarusTokenWithDropbox(dropboxAuthorisationCode, icarusAccessToken) {
  var initReturnUri = siteBasePath + '/dropbox-post-login.html'; // This is the return uri used when initiating the OAuth journey; for verification only

  axios.post(lambdaPath + '/dropbox-oauth-complete', {
    code: dropboxAuthorisationCode,
    icarusAccessToken: icarusAccessToken,
    initReturnUri: initReturnUri,
  }).then(function(response) {
      console.log(response);
      dropboxPostLogin.processToken(response.data);
    })
    .catch(function(err) {
        console.log(err);
    });
}
