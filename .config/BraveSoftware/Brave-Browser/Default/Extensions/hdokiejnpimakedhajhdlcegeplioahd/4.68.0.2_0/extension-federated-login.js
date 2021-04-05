var FederatedLogin=function(){var e;return new function(){var g=this,f={},m=!1;FederatedLoginService.call(g),g._ajax=function(e){"undefined"!=typeof base_url&&0!==e.url.indexOf("http")&&(e.url=base_url+e.url),LPServer.ajax(e)},g.login=function(n,a){n=fix_username(n),g.getPassword(n,function(e,r,t,o){setFragmentId(t,o),LP_do_login(n,e,a,void 0,void 0,void 0,void 0,void 0,void 0,r)},lpshowError)};var p=function(e,r){if(e.keypair){var t,o=(new DOMParser).parseFromString(atob(r),"application/xml"),n=o.querySelector('Attribute[Name="LastPassKeyPart"]').childNodes[0].textContent,a=o.querySelector('Attribute[Name="LastPassKeyPartSignature"]').childNodes[0].textContent,i=g._decryptK1WithPrivateKey(atob(n),e.keypair.privateKey);e.valid=!!i&&s(i,a),e.submitted=!0,e.valid||g._handleError(e.error,new Error(gs("K1 not valid!")))}},t=function(e){var r=forge.md.sha256.create();return r.update(e),btoa(r.digest().bytes())},s=function(e,r){return t(e)===r},o=function(e){var t={},r;return e.split("&").forEach(function(e){var r=e.split("=");2===r.length&&(t[r[0]]=decodeURIComponent(r[1]))}),t},v=function(e){try{if(e&&e.formData&&e.formData.SAMLResponse&&1===e.formData.SAMLResponse.length)return e.formData.SAMLResponse[0];if(e&&e.raw){var r=e.raw.reduce(function(e,r){return e+String.fromCharCode.apply(null,new Uint8Array(r.bytes))},"");if(0<r.length){var t=o(r);if(t.SAMLResponse)return t.SAMLResponse}}}catch(e){console.log(e)}return null};g.getPasswordSaml=function(l,c,u){l=fix_username(l),LPPlatform.getCurrentTabDetails(function(d){g._initiate(l,function(a,i){var s={valid:!1,idp:a,keypair:i,submitted:!1,error:u};LPPlatform.openTab({extension:!0,url:a.IdentityProviderURL+"/auth/saml2/"+a.IdentityProviderGUID,loadHandler:function(n){s.cleanup=LPPlatform.onBeforeNavigate(function(e,r){var t=/\/auth\/saml2\/success\/(.*)$/.exec(e);if(t&&2===t.length)return s.valid||!i?g._getAuthInfo(l,t[1],function(r){g._assemblePassword(l,i,r,function(e){c(e,r.authSessionId)},u)},u):g._handleError(u,new Error(gs("K1 not valid!"))),s.submitted=!0,LPPlatform.closeTab(n.tabDetails),LPPlatform.activateTab(d),!1;if(i&&!s.valid&&0===e.indexOf(a.IdentityProviderURL)){var o=v(r);if(o)return p(s,o),s.valid}},n.tabDetails),f[n.tabDetails.tabID]=s},closeHandler:function(){s.submitted||g._handleError(u,new Error(gs("Federated login tab closed!")))}})})})},g.parseJwt=function(e){var r,t;return(new Oidc.UserManager)._joseUtil.parseJwt(e).payload},g.getPassword=function(f,p,v){f=fix_username(f),g.clearCache(),LPPlatform.getCurrentTabDetails(function(e){g._initiate(f,function(e,r){var l={valid:!1,idp:e,keypair:r,submitted:!1,error:v};if(l.idp.type<=2)g.getPasswordSaml(f,p,v);else{3!=l.idp.type&&v(),Oidc.Log.logger=console,Oidc.Log.level=Oidc.Log.INFO;var c={authority:l.idp.OpenIDConnectAuthority,client_id:l.idp.OpenIDConnectClientId,redirect_uri:"https://accounts.lastpass.com/federated/oidcredirect.html",response_type:"id_token token",scope:"openid email profile"+(2===l.idp.Provider?" groups":""),signingKeys:l.idp.OpenIDConnectKeys,extraQueryParams:{login_hint:f}},u=g.getOIDCProviderName(l.idp.Provider),o=new Oidc.OidcClient(c);o.createSigninRequest().then(function(e){m?m=!1:(m=!0,LPPlatform.openTab({extension:!0,url:e.url,closeHandler:function(){m=!1,l.submitted||g._handleError(v,new Error(gs("Federated login tab closed!")))},loadHandler:function(){},onBeforeRequestCallback:function(e,r,d){function t(e){return[sprintf(gs("%s reported a problem during login."),u),sprintf(gs("Contact your %s administrator for assistance."),u),sprintf(gs("Here’s the message from %s:"),u),e].join("<br/><br/>")}/https:\/\/accounts\.lastpass\.com\/federated\/oidcredirect\.html.*/.test(e)&&o.processSigninResponse(e).then(function(e){if(l.submitted=!0,LPPlatform.closeTab({tabID:d}),m=!1,e.error)return console.log(e.error),g._handleError(v,new Error(getErrorMessage(e.error))),!1;if(!e.profile)return g._handleError(v,new Error(gs("No profile information."))),!1;var r=e.profile.email?e.profile.email.toLowerCase():void 0,t=e.profile.preferred_username?e.profile.preferred_username.toLowerCase():void 0;if(r!=f.toLowerCase()&&t!=f.toLowerCase()){var o=[sprintf(gs("Use the same account to log in to both %s and LastPass."),u),"<br/><br/>",sprintf(gs("Current %s account:"),u)+" "+(r||t||gs("unknown")),"<br/>",gs("Attempted LastPass account:")+" "+f].join("");return g._handleError(v,new Error(o)),!1}var n=null;if(l.idp.Provider==g.OIDC_PROVIDERS.Okta||l.idp.Provider==g.OIDC_PROVIDERS.OktaWithoutAuthorizationServer){var a;if(l.idp.Provider==g.OIDC_PROVIDERS.Okta)g.parseJwt(e.access_token)&&(n=g.parseJwt(e.access_token).LastPassK1);else l.idp.Provider==g.OIDC_PROVIDERS.OktaWithoutAuthorizationServer&&(n=e.profile.LastPassK1);n&&33==n.length||g._handleError(v,new Error(gs("LastPassK1 is missing or has invalid length.")))}var i=g.GRAPH_API_HOST.Com;l.idp.Provider===g.OIDC_PROVIDERS.Azure&&0<c.authority.indexOf("microsoftonline.us")&&(i=g.GRAPH_API_HOST.Us);var s={idToken:e.id_token,accessToken:e.access_token,companyId:l.idp.CompanyId,alpUrl:alp_url,provider:l.idp.Provider,oktaK1:n,graphApiHost:i};return g._assemblePasswordForOIDC(s,p,v),!0}).catch(function(e){console.log(e);var r=decodeURIComponent(e.error_description.replace(/\+/g,"%20"));g._handleError(v,new Error(t(r)))})}}))})}})})},g.validateK1Encryption=function(e,r,t){var o=!0,n=f[t.tabID];n&&n.keypair&&(p(n,e),o=n.valid),r&&r(o)},LPPlatform.onTabClosed(function(e){f[e]&&(f[e].cleanup(),delete f[e])})}}();