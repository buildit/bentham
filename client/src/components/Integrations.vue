<template>
    <div class="integrations">
        <div v-if="userToken">
            <!-- Dropbox -->
            <div class="row">
                <div v-if="userToken.dropboxAccountId">
                    <div class="panel panel-success">
                        <div class="panel-heading">Icarus is monitoring your Dropbox activity</div>
                        <div class="panel-body">
                            Icarus logs your actions (e.g. file created/modified) and the time it happened,
                            but no file name or content.
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <button v-on:click="dropboxLogin()" 
                                    class="btn btn-lg btn-primary">Link Dropbox account</button>
                        </div>
                        <div class="panel-body">
                            Icarus will only log your action (e.g. file created/modified) and the time it happened,
                            but no file name or content.            
                        </div>
                    </div>
                </div>        
            </div>

            <!-- Github -->
            <div class="row">        
                <div v-if="userToken.githubUsername">
                    <div class="panel panel-success">
                        <div class="panel-heading">Icarus is monitoring your Github activity</div>
                        <div class="panel-body">
                            Icarus only logs your actions (e.g. open an Issue) and the time it happened, but no ID, content or text.<br/>
                            Only Organisations and Repositories configured to notify events to Icarus are monitored.
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <button v-on:click="githubLogin()" 
                                    class="btn btn-lg btn-primary">Link Github account</button>
                        </div>
                        <div class="panel-body">
                            Icarus will only log your actions (e.g. open an Issue) and the time it happened, but ID, content or text.<br/>
                            Only Organisations and Repositories configured to notify events to Icarus are monitored.
                        </div>
                    </div>              
                </div>  
            </div>   

            <!-- Forget Me -->
            <div class="row"
                 v-if="userToken.githubUsername || userToken.dropboxAccountId">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <button v-on:click="forgetMe()"
                                class="btn btn-lg btn-danger">Forget Me</button>
                    </div>
                    <div class="panel-body">
                        Icarus stops monitoring your activities in all of your currently associated accounts and logs you out of the system.
                    </div>
                </div>    
            </div>

            <!-- Logout -->
            <div class="row">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <button v-on:click="logout()"
                                class="btn btn-lg btn-warning">Logout</button></div>
                    <div class="panel-body">
                        Logging out this page will not stop Icarus from monitoring your activity.
                        This is only useful while the product in development to refresh your status.
                    </div>
                </div>    
            </div> 
        </div>  

        <!-- Slack login --> 
        <div v-else class="row">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <button v-on:click="slackLogin()" 
                            class="btn btn-lg btn-primary">Login / Sign in with Slack</button></div>
                <div class="panel-body">
                    Icarus only accesses your user basic info (name, user ID, team ID).<br/>
                    The Slack user is your main identity in Icarus.
                </div>
            </div>  
        </div>          
    </div>
</template>

<script>

import {
    getUserToken,
    postForm,
    removeUserToken,
} from '../common';
import {
    forgetMe,
} from '../core/api';

export default {
  name: 'integrations',
  props: [ 'siteBasePath', 'lambdaPath' ],
  data: () => ({
      userToken:  getUserToken()
  }),
  methods: {
    slackLogin: function() {
      const returnPageUri = this.siteBasePath + '/post-login'; // Using URL-rewrite or redirect rule to map to /#/post-login
      const authInitiateUri = this.lambdaPath + '/slack-oauth-initiate?returnUri=' + encodeURIComponent(returnPageUri);
      console.log('Initiating Slack login via: ' + authInitiateUri)
      window.location.href = authInitiateUri; // TODO This could be a Form POST, for consistency
    },
    dropboxLogin: function() {
      const icarusAccessToken = this.userToken.accessToken;
      const returnPageUri = this.siteBasePath + '/dropbox-post-login' // Same as for slackLogin return page URI
      
      postForm(this.lambdaPath + '/dropbox-oauth-initiate', {
        icarusAccessToken: icarusAccessToken,
        returnUri: returnPageUri,
      })
    },
    githubLogin: function() {
      const icarusAccessToken = this.userToken.accessToken;
      const returnPageUri = this.siteBasePath + '/github-post-login'  // Same as for slackLogin return page URI

      postForm(this.lambdaPath + '/github-oauth-initiate', {
        icarusAccessToken: icarusAccessToken,
        returnUri: returnPageUri,        
      })
    },
    logout: function() {
        removeUserToken()
        this.userToken = undefined;
    },
    forgetMe: function () {
        forgetMe(this.userToken.accessToken)
            .then((response) => {
                removeUserToken();
                this.userToken = undefined;
            });
    },
  }
}

</script>

<style scoped>

div.row {
  padding-right: 10px;
  padding-left: 10px;
}

</style>
