//////////////////////////////////////////////////////////////////////////
// This program is free software: you can redistribute it and/or modify	//
// it under the terms of the GNU General Public License as published by	//
// the Free Software Foundation, either version 3 of the License, or	//
// (at your option) any later version.									//
//																		//
// This program is distributed in the hope that it will be useful,		//
// but WITHOUT ANY WARRANTY; without even the implied warranty of		//
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the		//
// GNU General Public License for more details.							//
//																		//
// You should have received a copy of the GNU General Public License	//
// along with this program. If not, see <http://www.gnu.org/licenses/>.	//
//////////////////////////////////////////////////////////////////////////

// Defines and Globals
var REFRESH_DELAY_TIME = 300; // in milisecends
var XHR_TIMEOUT = 5*1000;   // in milisecends
var MAX_COUNT = 999;
var DEFAULT_ACTIVE_ACCOUNT = 0;
var DEFAULT_REFRESH_INTERVAL = 5; // in minutes
var DEFAULT_NEW_MAIL_SOUND = 'Ding';
var DEFAULT_USE_NOTIFICATIONS = true;

// Analyitics
var gaTrackingId = 'UA-57030497-1';

// Vars
var isRefreshing = false;
var initComplete = false;
var watchDogRefreshId = 0;
var currentNotificationId = '';
var lastVisitEmailCount = 0;
var openTabs = [];

var sounds = {};
var notificationsSoundsSources = {
  'None' :'',
  'Bell Gliss': chrome.extension.getURL('assets/sounds/Bell_Gliss.mp3'),
  'Ding' : chrome.extension.getURL('assets/sounds/mando-3.mp3'),
  'Door Knock': chrome.extension.getURL('assets/sounds/soft-door-knock.mp3'),
  'Doorball': chrome.extension.getURL('assets/sounds/doorbell.mp3'),
  'Lazer': chrome.extension.getURL('assets/sounds/LAZER.mp3'),
  'Quick Siren': chrome.extension.getURL('assets/sounds/Quick_Police_Siren.mp3')
  };
var minTimeBetweenSounds = 0.2;

/********************************   Functions   ******************************/
/*****************************************************************************/
function getGmailUrlBase() {
  return "https://mail.google.com/mail/" ;
}

function getGmailUrl(userIndexIn) {
  var userIndex = userIndexIn || localStorage.activeAccount || '0';
  return getGmailUrlBase() + 'u/' + userIndex ;
}

function getGoogleInboxUrlBase() {
  return "https://inbox.google.com/";
}

function getGoogleInboxUrl(userIndexIn) {
  var userIndex = userIndexIn || localStorage.activeAccount || '0';
  return getGoogleInboxUrlBase() + 'u/' + userIndex;
}

function isGmailUrl(url) {
  return url.indexOf(getGoogleInboxUrl()) === 0;
}

function isInboxUrl(url) {
  return url.indexOf(getGoogleInboxUrl()) === 0;
}

function getFeedUrl(userIndexIn){
  userIndex = userIndexIn || localStorage.userIndex || '0';
  return getGmailUrl(userIndex) + '/feed/atom';
}

function goToInbox(userIndexIn) {
  userIndex = userIndexIn || localStorage.activeAccount || '0';
  console.log('Going to inbox of user #' + userIndex);
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0; i < tabs.length ; i++) {
      tab = tabs[i];
      if (tab.url && isInboxUrl(tab.url)) {
        // focus Inbox tab
        chrome.tabs.update(tab.id, {selected: true});
        return;
      }
    }
    // Open new tab
    chrome.tabs.create({url: getGoogleInboxUrl(userIndex)});
  });
}

function goToOptionsPage(){
  chrome.tabs.create({url: 'options.html'});
}

function gaPush(command, category, action, value){
    _gaq.push(
        ['_setAccount', gaTrackingId],			// set my GA account
        [command, category, action, value]
    );
}

function isOnline(){
  return navigator.onLine;
}

/**********************************   Sounds  *********************************/
function soundLoaded(sound, id){
  console.log(id + ' sound is ready');
  sounds[id] = sound;
}

function loadSound(id, url){
  if (id == 'None' || url.length === 0)
    return;

  var a = new Audio();
  a.id = id;
  a.oncanplaythrough = function(){
    soundLoaded(a, id);
  };
  a.src = url;

  a.load();
}

function loadSounds(){
  for (var id in notificationsSoundsSources){
    console.log('Loading sound ' + id);
    loadSound(id, notificationsSoundsSources[id]);
  }

  console.log('Load Sounds');
}

function playSound(id){
  if (!id || id == 'None'){
    console.log('No sound to play ' + id);
    return;
  }

  console.log('Playing sound ' + id);
  var sound = sounds[id];

  if (sound && sound.readyState == 4){
    if (!sound.paused){
      if (sound.currentTime < minTimeBetweenSounds){
        console.log('Not playing sound to prevent very short replays');
        return;
      }

      sound.pause();
      sound.currentTime = 0;
    }

    sound.play();
  }
}
/**********************************   Inits   *********************************/
function getUserIndexAddress(userIndex){
  if (typeof userIndex == 'undefined')
    console.error('Error. userIndex == null');

	var xhr = new XMLHttpRequest();

	// Set abort after timeout
	var abortTimerId = window.setTimeout(function() {
	  	xhr.abort();
  	console.log('Xhr timeout...');
    	window.setTimeout(getUserIndexAddress,1000);
	}, XHR_TIMEOUT);

	// Error handling
	function handleError(e){
		window.clearTimeout(abortTimerId);
		handleXhrError();
		if (e)
	  		console.error(e.message);
	}

  // Actual method
  try {
    xhr.onerror = function(error) {
      handleError(error);
    };

    xhr.open("GET", getFeedUrl(userIndex), false);
    xhr.send(null);

    if (xhr.readyState != 4) return '';

    if (xhr.status != 200){
      // cancel retry
      window.clearTimeout(abortTimerId);
      xhr.abort();
      return '';
    }

    var title = xhr.responseXML.getElementsByTagName('title')[0].textContent;
    if (!title || title == 'Unauthorized') return '';

    var address = title.match(/[^ ]+[@][^ ]+/g)[0];
    if (!address) return '';

		console.log('getUserIndexAddress = ' + address);
		window.clearTimeout(abortTimerId);
		return address;

  } catch(e) {
    handleXhrError();
    return '';
  }
}

function getAllusersAddresses(){
  var index = 0;
  var res = [];
  var curAddress = getUserIndexAddress(index);

  while(curAddress !== '' && res.toString().indexOf(curAddress) == -1){
    res[index] = curAddress;
    curAddress = getUserIndexAddress(++index);
  }
  localStorage.accounts = res.toString();
  return res;
}

function initAnalytics(){
	_gaq = window._gaq || [];
	if(_gaq.unshift){
    	_gaq.unshift(['_setAccount', gaTrackingId]);
	} else {
		_gaq.push(['_setAccount', gaTrackingId]);
	}

	var version = chrome.runtime.getManifest().version;
	gaPush('_trackEvent', 'Extension', 'Extension loaded', version);
	gaPush('_trackPageview');

	(function(){
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  	ga.src = 'https://ssl.google-analytics.com/ga.js';
	  	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();

	chrome.runtime.onInstalled.addListener(function(details){
				if (details.reason == 'update' || details.reason == 'install'){
					var version = chrome.runtime.getManifest().version;
					showInstallNotification('Google Inbox Checker', 'Welcome to version '+ version +'!');

					if (details.reason == 'update'){
						gaPush('_trackEvent', 'Updates', 'Version update', version);
					} else if (details.reason == 'install'){
						gaPush('_trackEvent', 'Installations', 'Install', version);
					}
				}
			});

	console.log('init GA');
}

function initNotifications(){
	lastVisitEmailCount = localStorage.inboxCount;

	// check for notifications support
	chrome.notifications.getPermissionLevel(function(level){
		if (level == 'granted'){
			console.log("Notifications are supported!");

			chrome.notifications.onClicked.addListener(function(notificationId) {
				console.log('Notification was clicked: ' + notificationId);
					if (notificationId != 'install') goToInbox();
				  else goToOptionsPage();

					clearNotification(notificationId);
					gaPush('_trackEvent', 'Notifications','Notification click');
			});

		} else {
			console.log("Notifications permitions are not granted.");
		}
	});
}

function initLocalStorage(){

	localStorage.inboxCount = 0;

	// Get options from storage

	chrome.storage.sync.get({
	    accounts: chrome.extension.getBackgroundPage().getAllusersAddresses().toString(),
      activeAccount: DEFAULT_ACTIVE_ACCOUNT ,
			refreshInterval: DEFAULT_REFRESH_INTERVAL,
			useNotifications: true,	// default value is to show notifications
			newMailSound: DEFAULT_NEW_MAIL_SOUND
		}, function(items) {
		  localStorage.accounts = items.accounts;
      localStorage.activeAccount = items.activeAccount;
			localStorage.refreshInterval = items.refreshInterval;
			localStorage.useNotifications = items.useNotifications;
			localStorage.sounds = items.sounds;
			localStorage.newMailSound = items.newMailSound;
  	});

  	console.log('Init localStorage');
}

function addEventHandlers(){
  // Icon click listener
  chrome.browserAction.onClicked.addListener(onClick);
  
  // New tab listener
  chrome.tabs.onUpdated.addListener(handleTabUpdate);
  
  // Close tab listener
  chrome.tabs.onRemoved.addListener(handleRemovedTab);
  
  // Change focused tab listener
  chrome.tabs.onActivated.addListener(handleActivateTab);
  
  // New messages from injected script
  chrome.runtime.onMessage.addListener(handleNewMessage);
  
  // internet connection status changes
  if (window.addEventListener) {
	  window.addEventListener("online", handleOnlineStatusChange, false);
	  window.addEventListener("offline", handleOnlineStatusChange, false);	
	}
}

function init() {

  initAnalytics();

	initLocalStorage();

	refresh('Init');

	initNotifications();

	loadSounds();
	
	initComplete = true;
}
/**********************************   Refresh   *******************************/
function startRefreshing(){
	isRefreshing = true;
  // chrome.browserAction.setBadgeText({text: '...'});
  // chrome.browserAction.setBadgeBackgroundColor({color:[228, 128, 0, 255]});  // orange
}

function endRefreshing(){
	isRefreshing = false;
	updateIcon();
}

function updateInboxCount(alreadyRetried) {
	var xhr = new XMLHttpRequest();
  	var abortTimerId = window.setTimeout(function() {
  	  	xhr.abort();
    	  console.log('Xhr timeout...');
    	  window.setTimeout(updateInboxCount,1000);
  	}, XHR_TIMEOUT);

	function handleSuccess(inCount){
		console.log('success = ' + inCount.textContent);
		window.clearTimeout(abortTimerId);
		var newEmail = false;
		var count = parseInt(inCount.textContent,10);

		if (localStorage.inboxCount != count){
			if (localStorage.useNotifications == 'true'){
				if (parseInt(localStorage.inboxCount,10) < count){
				  // New emails
				  newEmail = true;
					var newMails = count - parseInt(lastVisitEmailCount,10);
					console.log('New eMail - count = ' + newMails);
					var text = 'You have '+ newMails +' new mail'+ (newMails>1 ? 's':'') +' in your Inbox';
					updateNotification(currentNotificationId, 'New Mail', text);
					playSound(localStorage.newMailSound);
					
				} else if (parseInt(localStorage.inboxCount,10) > count){
					// read mail
					lastVisitEmailCount = count;
					console.log('lastVisitEmailCount = ' + lastVisitEmailCount);
					clearNotification(currentNotificationId);
				}
			}

			localStorage.inboxCount = count;
			updateIcon(newEmail);
		}
	}

  xhr.onerror = function(error) {
    console.error(error);
    window.clearTimeout(abortTimerId);
	  handleXhrError();
  };
  
  xhr.onreadystatechange = function() {
    
    if (xhr.status == 401){
      // cancel retry
      window.clearTimeout(abortTimerId);
      xhr.abort();
      if (alreadyRetried){
        // Do nothing
        console.error('Already retried. aborting until next watchdog..');
      } else {
        console.log('Retrying...');
        updateInboxCount(true);
      }
    }

    if (xhr.readyState != 4){
      return;
    }

    if (xhr.responseXML) {
      var xmlDoc = xhr.responseXML;

      if (xmlDoc.getElementsByTagName('title')[0].textContent == 'Unauthorized'
          && navigator.onLine ){
        alert('Please login into gmail');
      }
        

      var feed = xmlDoc.getElementsByTagName('feed')[0];

      if (feed){
        var count = feed.getElementsByTagName('fullcount')[0];
        if (count){
        	handleSuccess(count);
        	return;
        }
      }
    }
    
    console.debug('Deleting localStorage.inboxCount');
    delete localStorage.inboxCount;
    handleXhrError();
  };
    
  try {
    xhr.open("GET", getFeedUrl(localStorage.activeAccount), true);
    xhr.send(null);
  } catch(e) {
    console.error('Catched error while updating inbox count');
    handleXhrError();
    console.error(e);
    return;
  }
}

function updateIcon() {

  if (isOnline() &&localStorage.inboxCount){
    // All OK
    chrome.browserAction.setIcon({path: "assets/inbox_logged_in.png"});
    var count = localStorage.inboxCount;
    chrome.browserAction.setBadgeBackgroundColor({color:[24, 0, 200, 255]});  // Blue

	var newBadge = '';
	if (parseInt(count,10) > MAX_COUNT)
		newBadge = MAX_COUNT + '+';
	else if (parseInt(count,10) > 0)
		newBadge = count;

    chrome.browserAction.setBadgeText({text: newBadge});

  } else {
    // Not logged in
    chrome.browserAction.setIcon({path:"assets/inbox_not_logged_in.png"});
    chrome.browserAction.setBadgeBackgroundColor({color:[128, 128, 128, 255]});  // Grey
    chrome.browserAction.setBadgeText({text: '?'});
  }
}

function clearNotification(notificationId){
	currentNotificationId = '';
	chrome.notifications.clear(notificationId, function (){
		console.log('Cleard notification ' + notificationId);
	});
}

function updateNotification(notificationId, title,message){
	var options = {};
	options.type = 'basic';
	options.iconUrl = 'assets/icon_128.png';
	options.title = title;
	options.contextMessage = 'Click to open Google Inbox';
	options.message = message;


	if (notificationId !== ''){
		console.log('Clearing notification ' + notificationId);
    	clearNotification(notificationId);
	}

	chrome.notifications.create('', options ,function(newNotificationId){
		console.log('Created notification ' + newNotificationId);
		currentNotificationId = newNotificationId;
  });
}

function showInstallNotification(title,message){
	var options = {};
	options.type = 'basic';
	options.iconUrl = 'assets/icon_128.png';
	options.title = title;
	options.contextMessage = 'Click to open options';
	options.message = message;

	chrome.notifications.create('install', options ,function(notificationId){
    		console.log('Created notification ' + currentNotificationId);
    		});
}

function watchDogRefresh(){
  gaPush('_trackPageview');
	refresh('Watchdog');
}

function refresh(inReason){
  if (isOnline()) {
    startRefreshing();

    var reason = inReason || 'General';
    console.log('Refreshing (' + reason +')... ');
  
    // Cancel last refresh schedule
    if (watchDogRefreshId > 0){
      console.debug('Cancel last schedule');
      window.clearTimeout(watchDogRefreshId);
    }
    // Set new refresh schedule
    var now = (new Date()).getTime();
  
    if (typeof localStorage.refreshInterval == 'undefined')
    	localStorage.refreshInterval = 5;
  
    var time = now + localStorage.refreshInterval*60*1000;
  
    console.debug('Scheduling for ' + (new Date(time)).toLocaleTimeString() );
    watchDogRefreshId = window.setTimeout(watchDogRefresh, localStorage.refreshInterval*60*1000);
  
    updateInboxCount();
    endRefreshing();
  }
}
/*********************************   Handlers   *******************************/
function handleOnlineStatusChange() {
  
  if (isOnline()){
    console.log('Now connected to the internet!');
    if (!initComplete){
      // first time connectes to the internet since loading the extension
      // nee t to init
      console.log('This is the first time so need to init..');
      init();
    } else {
      refresh();
    }
  } else {
    console.log('Where is this Internet thingy?');
    // offline. 
    updateIcon();
  }
}

function handleNewMessage (message) {
  // We only accept messages from ourselves
  if (message.type && (message.type == "FROM_CONTENT_SCRIPT")) {
    if (message.text == "refresh"){
      console.log("BG script received: " + message.text + ' from id: ' + message.sourceId);
      if (!isRefreshing)
        window.setTimeout(refresh,REFRESH_DELAY_TIME,'Inbox obsrver');
    }
  }
}

function handleXhrError(){
  console.error('XhrError getting data from Inbox/Gmail');
  updateIcon();
}

function handleTabUpdate(id,details){
  if (typeof details.url == 'undefined' ||
      (!isInboxUrl(details.url) && !isGmailUrl(details.url))) {
        return;
      }
  // Check if already open tab
  if (openTabs[id]){
    // If the tab alraedy open we don't need to do anything
    // mutations observers will do what needed
    return;
  }

  console.log('New Gmail/Inbox tab: ' + details.url);

  // Add the tab id
  openTabs[id] = true;

  // inject script
  console.log('Trying to inject script..');
  chrome.tabs.executeScript(id, {file: "injectedscript.js"});

  lastVisitEmailCount = localStorage.inboxCount;
  clearNotification(currentNotificationId);

  gaPush('_trackPageview');
  refresh('Opened new Inbox tab');
}

function handleRemovedTab(id,removeInfo){

  if (openTabs[id]){
    delete openTabs[id];
    console.log('Removed Gmail/Inbox tab');
    window.postMessage({ type: "FROM_BG", text: "Closed Inbox tab."}, "*");
    refresh('Removed tab');
  }
}

function handleActivateTab(details){

  if (openTabs[details.tabId]) {
    console.log('Activated Gmail/Inbox tab');
    gaPush('_trackPageview');
    refresh('Activated tab');
    lastVisitEmailCount = localStorage.inboxCount;
    clearNotification(currentNotificationId);
  }
}

function onClick(){
	gaPush('_trackEvent', 'Icon interactions', 'Icon click');
    console.log('click');
    goToInbox(localStorage.activeAccount);
}
/*****************************   End Handlers   *******************************/
/****************************  MAIN  ******************************************/

addEventHandlers();
if (isOnline()){
  init();
}
/****************************  END MAIN  *************************************/

// TODO
// refresh interval