/****************************  Save & Restore  ********************************/
// Saves options to chrome.storage
function saveOptions(event, refreshAfter) {
	console.log('Saving options...');
	var activeAccount = document.getElementById('activeAccount').value;
	var refreshInterval = document.getElementById('refreshInterval').value;
	var useNotifications = document.getElementById('useNotifications').checked;
	var notificationSound = document.getElementById('notificationSound').value;

	// Update the local storage
	localStorage.activeAccount = activeAccount;
	localStorage.useNotifications = useNotifications;
	localStorage.refreshInterval = refreshInterval;
	localStorage.newMailSound = notificationSound;

	chrome.storage.sync.set({
	  activeAccount: activeAccount,
		refreshInterval: refreshInterval,
		useNotifications: useNotifications,
		newMailSound: notificationSound
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		if (refreshAfter)
  	  chrome.extension.getBackgroundPage().refresh();

		setTimeout(function() {
			status.textContent = '';
  	}, 750);
	});


}

function restoreAccounts(accounts, activeAccountIn){

  var activeAccount = document.getElementById('activeAccount');
  var index = 0;

  if (accounts === ''){
    // No detected gmail accounts
    var a = document.createElement('a');
    a.href = chrome.extension.getBackgroundPage().getGmailUrl();
    a.target = '_blank';
    var b = document.createElement('button');
    b.textContent = 'Gmail Login';
    a.appendChild(b);
    activeAccount.parentElement.appendChild(a);
    activeAccount.remove();
    
    if (navigator.onLine){
      alert('Please login into Gmail first..'); 
    } else {
      alert('Please connect to the internet first..'); 
    }
  } else {
    // Add available accounts
    accounts.split(',').forEach(function(item){
      var option = document.createElement("option");
      option.text = item;
      option.value = index++;
      activeAccount.add(option);
    });
    activeAccount.value = activeAccountIn;
    activeAccount.addEventListener("change",
      function(event){
  	    saveOptions(event, true);
	    localStorage.inboxCount = 0;
      });

    oldActiveAccount = activeAccount.value;
  }
}

function restoreRefreshInterval(refreshIntervalIn){
  var refreshInterval = document.getElementById('refreshInterval');
  refreshInterval.value = refreshIntervalIn;
  refreshInterval.addEventListener("change",
    function(event){
	    saveOptions(event, true);
    });
  oldRefreshInterval = refreshInterval.value;
}

function restoreUseNotifications(useNotificationsIn){
  var useNotifications = document.getElementById('useNotifications');
  useNotifications.checked = useNotificationsIn;
  useNotifications.addEventListener("change", saveOptions);
  oldUseNotifications = useNotifications.checked ? 'on' : 'off';
}

function restoreNotificationsSounds(newMailSound){

  var notificationSound = document.getElementById('notificationSound');
  var sounds = chrome.extension.getBackgroundPage().notificationsSoundsSources;
  for (var item in sounds){
    if (chrome.extension.getBackgroundPage().sounds[item] ||
        item == 'None'){
      var option = document.createElement("option");
      option.text = item;
      option.value = item;
      notificationSound.add(option);
    }
  }
  notificationSound.value = newMailSound;
  oldNotificationsSound = newMailSound;
  togglePreviewSoundIfNeed(newMailSound);

  function togglePreviewSoundIfNeed(value){
  if (value == 'None'){
      document.getElementById('previewSound').style.display = 'none';
    } else {
      document.getElementById('previewSound').style.display = 'initial';
    }
  }
  notificationSound.addEventListener("change",
    function(event){
      togglePreviewSoundIfNeed(event.target.value);
	    saveOptions(event, true);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions(event) {
	console.log('Restoring options...');
  // Use default value refreshInterval = 5 and useNotifications = true.
  chrome.storage.sync.get({
    accounts: chrome.extension.getBackgroundPage().getAllusersAddresses().toString(),
    activeAccount: chrome.extension.getBackgroundPage().DEFAULT_ACTIVE_ACCOUNT ,
    refreshInterval: chrome.extension.getBackgroundPage().DEFAULT_REFRESH_INTERVAL,
    useNotifications:  chrome.extension.getBackgroundPage().DEFAULT_USE_NOTIFICATIONS,
    newMailSound: chrome.extension.getBackgroundPage().DEFAULT_NEW_MAIL_SOUND
  }, function(items) {

    restoreAccounts(items.accounts, items.activeAccount);

    restoreRefreshInterval(items.refreshInterval);

    restoreUseNotifications(items.useNotifications);

	  restoreNotificationsSounds(items.newMailSound);
  });
}

/********************************   Utils   ***********************************/
function previewSound(){
  var b = document.getElementById('notificationSound');
  chrome.extension.getBackgroundPage().playSound(b.value);
}

function openInNewPopup(url, width, height){
  var popupLeft = parseInt(screen.width/2 - width/2);
  var popupTop = parseInt(screen.height/2 - height/2);
  chrome.windows.create({
    'url':url,
    'type':'popup',
    'width':width,
    'height':height,
    'left':popupLeft,
    'top':popupTop
  });
}

function initPage(){
  document.body.onload = restoreOptions;

  document.getElementById('previewSound').onclick = previewSound;
  document.getElementsByClassName('fbimg')[0].onclick = shareToFacebook;
  document.getElementsByClassName('gplusimg')[0].onclick = shareToGPlus;
  document.getElementsByClassName('twitterimg')[0].onclick = shareToTwitter;

  window.addEventListener('unload', sendParamsToAnalytics);

  // add the right version umber to the header
  var version = chrome.runtime.getManifest().version;
  var v = document.getElementById('version');
  v.innerText = 'V.' + version;
}
/******************************   Analytics   *********************************/
function initAnalytics(){
	_gaq = window._gaq || [];
	console.log(chrome.extension.getBackgroundPage().gaTrackingId);
	if(_gaq.unshift){
    	_gaq.unshift(['_setAccount', chrome.extension.getBackgroundPage().gaTrackingId]);
	} else {
		_gaq.push(['_setAccount', chrome.extension.getBackgroundPage().gaTrackingId]);
	}

	(function(){
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  	ga.src = 'https://ssl.google-analytics.com/ga.js';
	  	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();

	console.log('init GA');
}

function sendParamsToAnalytics(){
  console.log('sendParamsToAnalytics');

	var value = document.getElementById('activeAccount').value;
	if (value != oldActiveAccount){
		_gaq.push(
			['_trackEvent', 'Options', 'Changed activeAccount', value]
		);
	}

	value = document.getElementById('refreshInterval').value;
	if (value != oldRefreshInterval){
		_gaq.push(
			['_trackEvent', 'Options', 'Changed refreshInterval', value]
		);
	}

	value = document.getElementById('useNotifications').checked ? 'on' : 'off';
	if (value != oldUseNotifications){
		_gaq.push(
			['_trackEvent', 'Options', 'Changed useNotifications', value]
		);
	}

	value = document.getElementById('notificationSound').value;
	if (value != oldNotificationsSound){
		_gaq.push(
			['_trackEvent', 'Options', 'Changed notificationSound', value]
		);
	}
}

function sendSocialEventToAnalytics(network){
  _gaq.push(
			['_trackEvent', 'Social', 'Shared extension', network]
		);
	console.log('shared to ' + network);
}
/*******************************  Social Share  *******************************/
var webstoreUrl = 'https://chrome.google.com/webstore/detail/google-inbox-checker-inbo/ljeebljkookphadpedhmnlokpennimon';

function shareToFacebook(){
  sendSocialEventToAnalytics('Facebook');
  var FBShareUrl = 'https://www.facebook.com/sharer/sharer.php?app_id=309437425817038&u=' + webstoreUrl;
  openInNewPopup(FBShareUrl, 600,550);
}

function shareToGPlus(){
  var GPlusShareUrl = 'https://plus.google.com/u/' + localStorage.activeAccount + '/share?url=' + webstoreUrl;
  sendSocialEventToAnalytics('Google Plus');
  openInNewPopup(GPlusShareUrl, 500,700);
}

function shareToTwitter(){
  var TwitterShareUrl = 'https://twitter.com/share?url=' + webstoreUrl + '&hashtags=GogleInboxChecker&text=Check this extension!';
  sendSocialEventToAnalytics('Twitter');
  openInNewPopup(TwitterShareUrl, 600,300);
}
/******************************  Main Section  ********************************/

initAnalytics();
initPage();

_gaq.push(
		['_trackEvent', 'Options', 'Options page loaded'],
		['_trackPageview']
	);