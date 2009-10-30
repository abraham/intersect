// Activate Intersect
activate();

/**
 * Activate Intersect code.
 */
function activate() {
  console.log('activate');

  // find variables and set defaults
  var page = document.getElementsByName('page-user-screen_name')[0];
  var session = document.getElementsByName('session-user-screen_name')[0];
  var following = document.getElementById('following');
  var header = buildHeader('Intersect');
  var content = buildProcessingContent();
  var footer = buildFooter('Intersect Home...', 'http://intersect.labs.poseurtech.com');
  var block;

  // exit if following block is not found
  if (!following) {
    console.log('No following block');

    return;
  // else if user is not authenciated
  } else if (!session) {
    console.log('Not authenciated');

    content = buildSimpleContent('You must log into Twittter for Intersect to work.', {href: '/login', title: 'Login'}, 'now.');
  // else if user is view thier own profile
  } else if (window.location.pathname == "/" || page.content === session.content) {
    console.log('Viewing own profile');

    content = buildSimpleContent('This is your profile silly! Why not try', {href: '/invitations/find_on_twitter', title: 'searching'}, 'for a different one.');
  // else build social graph intersect
  } else {
    console.log('fetching social graph');
    var port = chrome.extension.connect({name: 'intersect'});
    port.postMessage({page: page.content, session: session.content});
    port.onMessage.addListener(onMessageRecieved);

  }

  attachBlock(buildBlock(header, content, footer));
}

/**
 * Fetch the social graph data.
 */
function onMessageRecieved(msg, port) {
  var sg = msg.sg;
  var header = buildHeader('Intersect');
  var content;
  var footer = buildFooter('Intersect Home...', 'http://intersect.labs.poseurtech.com');
  var block;

  var intersect = document.getElementById('intersect');
  intersect.parentNode.removeChild(intersect.previousSibling);
  intersect.parentNode.removeChild(intersect);

  header = buildHeader('Mutual Followers');
  if (sg && sg.followers) {
    content = buildUserContent('following_list', sg.followers);
  } else {
    content = buildSimpleContent('No results :( Try', {href: "/home?status=What's+YOUR+Intersect?+http://intersect.labs.poseurtech.com+%23intersect+%23twitter", title: 'tweeting'}, 'something interesting.');
  }
  footer = buildFooter('Follow @abraham...', '/abraham');
  attachBlock(buildBlock(header, content, footer));

  header = buildHeader('Mutual Friends');
  if (sg && sg.friends) {
    content = buildUserContent('following_list', sg.friends);
  } else {
    content = buildSimpleContent('No results :( Try', {href: '/invitations/find_on_twitter', title: 'finding'}, 'more people to follow.');
  }
  footer = buildFooter('Intersect Home...', 'http://intersect.labs.poseurtech.com');
  attachBlock(buildBlock(header, content, footer));
}

/**
 * Build block.
 */
function buildBlock(header, content, footer) {
  console.log('buildBlock');

  // build the <div>
  var div = document.createElement('div');
  div.id = 'intersect';
  div.appendChild(header);
  div.appendChild(content);
  div.appendChild(footer);

  return div;
}


/**
 * Build simple content.
 */
function buildSimpleContent(pre, link, post) {
  console.log('buildSimpleContent');

  // build the textNodes;
  var textNode = document.createTextNode(link.title);

  // build the <a>
  var a = document.createElement('a');
  a.setAttribute('href', link.href);
  a.className = 'url';
  a.setAttribute('hreflang', 'en');
  a.setAttribute('title', link.title);
  a.appendChild(textNode);

  // build the <span>
  var span = document.createElement('span');
  span.appendChild(document.createTextNode(pre + ' '));
  span.appendChild(a);
  span.appendChild(document.createTextNode(' ' + post));

  // build the <div>
  var div = document.createElement('div');
  div.className = 'sidebar-menu';
  div.appendChild(span);
  div.setAttribute('style', 'padding:5px 10px 5px 14px');

  return div;
}

/**
 * Build processing content.
 */
function buildProcessingContent() {
  console.log('buildProcessingContent');
  
  // get loading.gif url
  var loading = chrome.extension.getURL('loading.gif');

  // build the <img>
  var img = document.createElement('img');
  img.setAttribute('alt', 'Loading...');
  img.className = 'photo fn';
  img.setAttribute('height', 24);
  img.setAttribute('src', loading);
  img.setAttribute('width', 24);

  // build the <span>
  var span = document.createElement('span');
  span.appendChild(img);

  // build the <div>
  var div = document.createElement('div');
  div.className = 'sidebar-menu';
  div.appendChild(span);
  div.setAttribute('style', 'padding:5px 10px 5px 14px');

  return div;
}

/**
 * Build user content.
 */
function buildUserContent(id, users) {
  console.log('buildUserContent');

  // build the <div>
  var div = document.createElement('div');
  div.className = 'sidebar-menu';
  div.appendChild(buildUserList(id, users));

  return div;
}

/**
 * Build user list.
 */
function buildUserList(id, users) {
  console.log('buildUserList');

  // build the <div>
  var div = document.createElement('div');
  div.id = id;
  div.setAttribute('style', 'padding:5px 10px 5px 14px');
  
  // loop through all the user objects
  for(var i = 0; i < users.length; i++) {
    // append user <span>s
    div.appendChild(buildUserSpan(users[i]));
  }

  return div;
}

/**
 * Build a user span.
 */
function buildUserSpan(user) {
  console.log('buildUserSpan');

  // build the <img>
  var img = document.createElement('img');
  img.setAttribute('alt', user.screen_name);
  img.className = 'photo fn';
  img.setAttribute('height', 24);
  img.setAttribute('src', user.profile_image_url);
  img.setAttribute('width', 24);

  // build the <a>
  var a = document.createElement('a');
  a.setAttribute('href', '/' + user.screen_name);
  a.className = 'url';
  a.setAttribute('hreflang', 'en');
  a.setAttribute('rel', 'contact');
  a.setAttribute('title', user.name);
  a.appendChild(img);

  // build the <span>
  var span = document.createElement('span');
  span.className = 'vcard';
  span.appendChild(a);

  return span;
}

/**
 * Build a block header.
 */
function attachBlock(block) {
  console.log('attachBlock');

  // find following div and add block after it
  var following = document.getElementById('following');
  // keep from adding to the end of the page if nextSibling does not exist
  if (following.nextSibling) {
    following.parentNode.insertBefore(block, following.nextSibling);
    following.parentNode.insertBefore(document.createElement('hr'), following.nextSibling);
  }
}

/**
 * Build a block header.
 */
function buildHeader(title) {
  console.log('buildHeader');

  // build the textNode;
  var textNode = document.createTextNode(title);

  // build the <span>
  var span = document.createElement('span');
  span.appendChild(textNode);

  // build the <h2>
  var h2 = document.createElement('h2');
  h2.className = 'sidebar-title';
  h2.id = 'fm_menu';
  h2.appendChild(span);

  return h2;
}

/**
 * Build a block footer.
 */
function buildFooter(text, href) {
  console.log('buildFooter');

  // build the textNode;
  var textNode = document.createTextNode(text);

  // build the <a>
  var a = document.createElement('a');
  a.setAttribute('href', href);
  a.appendChild(textNode);

  // build block footer
  var div = document.createElement('div');
  div.id = 'friends_view_all';
  div.setAttribute('style', 'padding:5px 10px 5px 14px; font-size: 0.9em');
  div.appendChild(a);

  return div;
}
