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

// Vars
var inboxObserver;
var inboxObserverConfig = { subtree:true, childList: true, characterData: true};
var REFRESH_MESSAGE = 'please refresh';
/********************************   Functions   ******************************/
/*****************************************************************************/
function addEventsListeners(){
  console.log('addEventsListeners');

  var inboxContainers = document.getElementsByClassName('scroll-list-section-body');
  if (inboxObserver)
    inboxObserver.disconnect();
  inboxObserver = new MutationObserver(handleInboxMutations);
  var container = inboxContainers[0].parentNode.parentNode;
  inboxObserver.observe(container, inboxObserverConfig);

  // handles messages from the webpage
  window.addEventListener("message", handleNewMessage);
}

function handleNewMessage (event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "FROM_PAGE") &&
      event.data.text && event.data.text == REFRESH_MESSAGE) {
    console.log("Content script(" + id +") received: " + event.data.text);
    chrome.runtime.sendMessage({type: "FROM_CONTENT_SCRIPT" ,text: "refresh",
    sourceId: id});
  } else {
    console.log("Content script(" + id +") received: " + event.data.text);
    console.log(event);
  }
}

function classNameContains(node, searchFor){
  return node && node.className && node.className.indexOf(searchFor) > -1;
}

function handleInboxMutations(mutations){
  mutations.some(function(mutation) {
      if (((mutation.removedNodes.length == 1 && mutation.addedNodes.length == 0) &&
          ( classNameContains(mutation.removedNodes[0], 'scroll-list-item')||
          classNameContains(mutation.removedNodes[0].firstChild, 'section-header')))
          ||
          ((mutation.removedNodes.length == 0 && mutation.addedNodes.length == 1) &&
           ( classNameContains(mutation.addedNodes[0], 'scroll-list-item')||
          classNameContains(mutation.addedNodes[0].firstChild, 'section-header'))))
          {
              console.log(mutation);
              window.postMessage({ type: "FROM_PAGE", text: REFRESH_MESSAGE}, "*");
              return true;
      }
      return false;
  });
}

/*****************************************************************************/
/****************************  MAIN  *****************************************/

if (inboxObserver){
  console.log('already observing?');
} else {
  var id = new Date().getTime();
  console.log('Running myScript ' + id);
  addEventsListeners();
}
/****************************  END MAIN  *************************************/