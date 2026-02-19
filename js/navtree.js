/*
 @licstart  The following is the entire license notice for the JavaScript code in this file.

 The MIT License (MIT)

 Copyright (C) 1997-2020 by Dimitri van Heesch

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 and associated documentation files (the "Software"), to deal in the Software without restriction,
 including without limitation the rights to use, copy, modify, merge, publish, distribute,
 sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or
 substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 @licend  The above is the entire license notice for the JavaScript code in this file
 */
var navTreeSubIndices = new Array();
var arrowDown = '&#9660;';
var arrowRight = '&#9658;';

function getData(varName) {
  var i = varName.lastIndexOf('/');
  var n = i >= 0 ? varName.substring(i + 1) : varName;
  return eval(n.replace(/\-/g, '_'));
}

/*
function stripPath(uri) {
  var pagesIndex = uri.indexOf('pages/');
  if (pagesIndex !== -1) {
    return uri.substring(pagesIndex);
  }
  return uri.substring(uri.lastIndexOf('/') + 1);
}
*/

// Replace your current stripPath with this:
function stripPath(uri) {
  var i = uri.lastIndexOf('/');
  var s = uri.substring(i + 1);
  // This ensures we always compare just the filename (e.g., class_low_node.html) 
  // against the tree index, regardless of whether it's in the root or /pages/
  return s;
}

function stripPath2(uri) {
  var pagesIndex = uri.indexOf('pages/');
  if (pagesIndex !== -1) {
    return uri.substring(pagesIndex);
  }
  var i = uri.lastIndexOf('/');
  var s = uri.substring(i + 1);
  var m = uri.substring(0, i + 1).match(/\/d\w\/d\w\w\/$/);
  return m ? uri.substring(i - 6) : s;
}

function hashValue() {
  return $(location).attr('hash').substring(1).replace(/[^\w\-]/g, '');
}

function hashUrl() {
  return '#' + hashValue();
}

function pathName() {
  return $(location).attr('pathname').replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]/g, '');
}

function localStorageSupported() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null && window.localStorage.getItem;
  }
  catch (e) {
    return false;
  }
}

function storeLink(link) {
  if (!$("#nav-sync").hasClass('sync') && localStorageSupported()) {
    window.localStorage.setItem('navpath', link);
  }
}

function deleteLink() {
  if (localStorageSupported()) {
    window.localStorage.setItem('navpath', '');
  }
}

function cachedLink() {
  if (localStorageSupported()) {
    return window.localStorage.getItem('navpath');
  } else {
    return '';
  }
}

function getScript(scriptName, func) {
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement('script');
  script.id = scriptName;
  script.type = 'text/javascript';
  script.onload = func;
  script.src = scriptName + '.js';
  head.appendChild(script);
}

function createIndent(o, domNode, node, level) {
  var level = -1;
  var n = node;
  while (n.parentNode) { level++; n = n.parentNode; }
  if (node.childrenData) {
    var imgNode = document.createElement("span");
    imgNode.className = 'arrow';
    imgNode.style.paddingLeft = (16 * level).toString() + 'px';
    imgNode.innerHTML = arrowRight;
    node.plus_img = imgNode;
    node.expandToggle = document.createElement("a");
    node.expandToggle.href = "javascript:void(0)";
    node.expandToggle.onclick = function () {
      if (node.expanded) {
        $(node.getChildrenUL()).slideUp("fast");
        node.plus_img.innerHTML = arrowRight;
        node.expanded = false;
      } else {
        expandNode(o, node, false, true);
      }
    }
    node.expandToggle.appendChild(imgNode);
    domNode.appendChild(node.expandToggle);
  } else {
    var span = document.createElement("span");
    span.className = 'arrow';
    span.style.width = 16 * (level + 1) + 'px';
    span.innerHTML = '&#160;';
    domNode.appendChild(span);
  }
}

var animationInProgress = false;

function gotoAnchor(anchor, aname, updateLocation) {
  var pos, docContent = $('#doc-content');
  var ancParent = $(anchor.parent());
  if (ancParent.hasClass('memItemLeft') ||
    ancParent.hasClass('memtitle') ||
    ancParent.hasClass('fieldname') ||
    ancParent.hasClass('fieldtype') ||
    ancParent.is(':header')) {
    pos = ancParent.position().top;
  } else if (anchor.position()) {
    pos = anchor.position().top;
  }
  if (pos) {
    var dist = Math.abs(Math.min(
      pos - docContent.offset().top,
      docContent[0].scrollHeight -
      docContent.height() - docContent.scrollTop()));
    animationInProgress = true;
    docContent.animate({
      scrollTop: pos + docContent.scrollTop() - docContent.offset().top
    }, Math.max(50, Math.min(500, dist)), function () {
      if (updateLocation) window.location.href = aname;
      animationInProgress = false;
    });
  }
}

function newNode(o, po, text, link, childrenData, lastNode) {
  var node = new Object();
  node.children = Array();
  node.childrenData = childrenData;
  node.depth = po.depth + 1;
  node.relpath = po.relpath;
  node.isLast = lastNode;

  node.li = document.createElement("li");
  po.getChildrenUL().appendChild(node.li);
  node.parentNode = po;

  node.itemDiv = document.createElement("div");
  node.itemDiv.className = "item";

  node.labelSpan = document.createElement("span");
  node.labelSpan.className = "label";

  createIndent(o, node.itemDiv, node, 0);
  node.itemDiv.appendChild(node.labelSpan);
  node.li.appendChild(node.itemDiv);

  var a = document.createElement("a");
  node.labelSpan.appendChild(a);
  node.label = document.createTextNode(text);
  node.expanded = false;
  a.appendChild(node.label);
  if (link) {
    var url;
    if (link.substring(0, 1) == '^') {
      url = link.substring(1);
      link = url;
    } else {
      url = node.relpath + link;
    }
    a.className = stripPath(link.replace('#', ':'));
    if (link.indexOf('#') != -1) {
      var aname = '#' + link.split('#')[1];
      var srcPage = stripPath(pathName());
      var targetPage = stripPath(link.split('#')[0]);
      a.href = srcPage != targetPage ? url : "javascript:void(0)";
      a.onclick = function () {
        storeLink(link);
        if (!$(a).parent().parent().hasClass('selected')) {
          $('.item').removeClass('selected');
          $('.item').removeAttr('id');
          $(a).parent().parent().addClass('selected');
          $(a).parent().parent().attr('id', 'selected');
        }
        var anchor = $(aname);
        gotoAnchor(anchor, aname, true);
      };
    } else {
      a.href = url;
      a.onclick = function () { storeLink(link); }
    }
  } else {
    if (childrenData != null) {
      a.className = "nolink";
      a.href = "javascript:void(0)";
      a.onclick = node.expandToggle.onclick;
    }
  }

  node.childrenUL = null;
  node.getChildrenUL = function () {
    if (!node.childrenUL) {
      node.childrenUL = document.createElement("ul");
      node.childrenUL.className = "children_ul";
      node.childrenUL.style.display = "none";
      node.li.appendChild(node.childrenUL);
    }
    return node.childrenUL;
  };

  return node;
}

function showRoot() {
  var headerHeight = $("#top").height();
  var footerHeight = $("#nav-path").height();
  var windowHeight = $(window).height() - headerHeight - footerHeight;
  (function () { // retry until we can scroll to the selected item
    try {
      var navtree = $('#nav-tree');
      navtree.scrollTo('#selected', 100, { offset: -windowHeight / 2 });
    } catch (err) {
      setTimeout(arguments.callee, 0);
    }
  })();
}

function expandNode(o, node, imm, setFocus) {
  if (node.childrenData && !node.expanded) {
    if (typeof (node.childrenData) === 'string') {
      var varName = node.childrenData;
      var scriptPath = node.relpath + varName;
      if (scriptPath.indexOf('pages/') === -1 && scriptPath !== 'navtreeindex' && (varName.startsWith('namespaces') || varName.startsWith('annotated') || varName.startsWith('classes') || varName.startsWith('files') || varName.startsWith('functions') || varName.startsWith('globals'))) {
        scriptPath = 'pages/' + scriptPath;
      }
      getScript(scriptPath, function () {
        node.childrenData = getData(varName);
        expandNode(o, node, imm, setFocus);
      });
    } else {
      if (!node.childrenVisited) {
        getNode(o, node);
      }
      $(node.getChildrenUL()).slideDown("fast");
      node.plus_img.innerHTML = arrowDown;
      node.expanded = true;
      if (setFocus) {
        $(node.expandToggle).focus();
      }
    }
  }
}

function glowEffect(n, duration) {
  n.addClass('glow').delay(duration).queue(function (next) {
    $(this).removeClass('glow'); next();
  });
}

function highlightAnchor() {
  var aname = hashUrl();
  var anchor = $(aname);
  if (anchor.parent().attr('class') == 'memItemLeft') {
    var rows = $('.memberdecls tr[class$="' + hashValue() + '"]');
    glowEffect(rows.children(), 300); // member without details
  } else if (anchor.parent().attr('class') == 'fieldname') {
    glowEffect(anchor.parent().parent(), 1000); // enum value
  } else if (anchor.parent().attr('class') == 'fieldtype') {
    glowEffect(anchor.parent().parent(), 1000); // struct field
  } else if (anchor.parent().is(":header")) {
    glowEffect(anchor.parent(), 1000); // section header
  } else {
    glowEffect(anchor.next(), 1000); // normal member
  }
}

function selectAndHighlight(hash, n) {
  var a;
  if (hash) {
    var link = stripPath(pathName()) + ':' + hash.substring(1);
    a = $('.item a[class$="' + link + '"]');
  }
  if (a && a.length) {
    a.parent().parent().addClass('selected');
    a.parent().parent().attr('id', 'selected');
    highlightAnchor();
  } else if (n) {
    $(n.itemDiv).addClass('selected');
    $(n.itemDiv).attr('id', 'selected');
  }
  var topOffset = 5;
  if (typeof page_layout !== 'undefined' && page_layout == 1) {
    topOffset += $('#top').outerHeight();
  }
  if ($('#nav-tree-contents .item:first').hasClass('selected')) {
    topOffset += 25;
  }
  $('#nav-sync').css('top', topOffset + 'px');
  showRoot();
}

function showNode(o, node, index, hash) {
  if (node && node.childrenData) {
    if (typeof (node.childrenData) === 'string') {
      var varName = node.childrenData;
      getScript(node.relpath + 'js/' + varName, function () {
        node.childrenData = getData(varName);
        showNode(o, node, index, hash);
      });
    } else {
      if (!node.childrenVisited) {
        getNode(o, node);
      }
      $(node.getChildrenUL()).css({ 'display': 'block' });
      node.plus_img.innerHTML = arrowDown;
      node.expanded = true;
      var n = node.children[o.breadcrumbs[index]];
      if (index + 1 < o.breadcrumbs.length) {
        showNode(o, n, index + 1, hash);
      } else {
        if (typeof (n.childrenData) === 'string') {
          var varName = n.childrenData;
          getScript(n.relpath + 'js/' + varName, function () {
            n.childrenData = getData(varName);
            node.expanded = false;
            showNode(o, node, index, hash); // retry with child node expanded
          });
        } else {
          var rootBase = stripPath(o.toroot.replace(/\..+$/, ''));
          if (rootBase == "index" || rootBase == "pages" || rootBase == "search") {
            expandNode(o, n, true, false);
          }
          selectAndHighlight(hash, n);
        }
      }
    }
  } else {
    selectAndHighlight(hash);
  }
}

function removeToInsertLater(element) {
  var parentNode = element.parentNode;
  var nextSibling = element.nextSibling;
  parentNode.removeChild(element);
  return function () {
    if (nextSibling) {
      parentNode.insertBefore(element, nextSibling);
    } else {
      parentNode.appendChild(element);
    }
  };
}

function getNode(o, po) {
  var insertFunction = removeToInsertLater(po.li);
  po.childrenVisited = true;
  var l = po.childrenData.length - 1;
  for (var i in po.childrenData) {
    var nodeData = po.childrenData[i];
    po.children[i] = newNode(o, po, nodeData[0], nodeData[1], nodeData[2],
      i == l);
  }
  insertFunction();
}

function gotoNode(o, subIndex, root, hash, relpath) {
  var nti = navTreeSubIndices[subIndex][root + hash];
  o.breadcrumbs = $.extend(true, [], nti ? nti : navTreeSubIndices[subIndex][root]);
  if (!o.breadcrumbs && root != NAVTREE[0][1]) { // fallback: show index
    navTo(o, NAVTREE[0][1], "", relpath);
    $('.item').removeClass('selected');
    $('.item').removeAttr('id');
  }
  if (!o.breadcrumbs && root == NAVTREE[0][1]) {
    o.breadcrumbs = [];
  }
  if (o.breadcrumbs) {
    o.breadcrumbs.unshift(0); // add 0 for root node
    showNode(o, o.node, 0, hash);
  }
}

function navTo(o, root, hash, relpath) {
  if (root.indexOf('pages/') === -1 && root !== 'index.html' && root !== 'files.html' && root !== 'globals.html' && (root.startsWith('class') || root.startsWith('struct') || root.startsWith('namespace') || root.startsWith('dir_'))) {
    root = 'pages/' + root;
  }
  var link = cachedLink();
  if (link) {
    var parts = link.split('#');
    root = parts[0];
    if (parts.length > 1) hash = '#' + parts[1].replace(/[^\w\-]/g, '');
    else hash = '';
  }
  if (hash.match(/^#l\d+$/)) {
    var anchor = $('a[name=' + hash.substring(1) + ']');
    glowEffect(anchor.parent(), 1000); // line number
    hash = ''; // strip line number anchors
  }
  var url = root + hash;
  var i = -1;
  while (NAVTREEINDEX[i + 1] <= url) i++;
  if (i == -1) {
    i = 0;
    root = NAVTREE[0][1];
  } // fallback: show index
  if (window.location.href.indexOf('index.html') !== -1 || root === 'index.html' || root === 'pages/index.html') {
    o.breadcrumbs = [0];
    showNode(o, o.node, 0, hash);
    return;
  }

  if (navTreeSubIndices[i]) {
    gotoNode(o, i, root, hash, relpath)
  } else {
    // If we are at root index.html and it's not in the index, just show root.
    if (i === 0 && root === 'index.html' && typeof NAVTREEINDEX0 === 'undefined') {
      // Proceed to show root without index if index0 is not loaded yet or doesn't exist for it
      // This might need more robust handling if index0 IS needed for children.
      // Let's try to load it anyway.
    }

    getScript(relpath + 'js/navtreeindex' + i, function () {
      navTreeSubIndices[i] = eval('NAVTREEINDEX' + i);
      if (navTreeSubIndices[i]) {
        if (navTreeSubIndices[i][root + hash] || navTreeSubIndices[i][root]) {
          gotoNode(o, i, root, hash, relpath);
        } else if (i === 0 && (root === 'index.html' || root === 'pages/index.html')) {
          console.log("Fallback 1 calling showNode with:", o, o.node);
          showNode(o, o.node, 0, hash);
        } else {
          gotoNode(o, i, root, hash, relpath);
        }
      } else if (i === 0 && (root === 'index.html' || root === 'pages/index.html')) {
        // Fallback if index0 doesn't contain entry for index.html but we want to show root
        console.log("Fallback 2 calling showNode with:", o, o.node);
        showNode(o, o.node, 0, hash);
      }
    });
  }
}

function showSyncOff(n, relpath) {
  n.html('<img src="' + relpath + 'images/sync_off.png" title="' + SYNCOFFMSG + '"/>');
}

function showSyncOn(n, relpath) {
  n.html('<img src="' + relpath + 'images/sync_on.png" title="' + SYNCONMSG + '"/>');
}

function toggleSyncButton(relpath) {
  var navSync = $('#nav-sync');
  if (navSync.hasClass('sync')) {
    navSync.removeClass('sync');
    showSyncOff(navSync, relpath);
    storeLink(stripPath2(pathName()) + hashUrl());
  } else {
    navSync.addClass('sync');
    showSyncOn(navSync, relpath);
    deleteLink();
  }
}

var loadTriggered = false;
var readyTriggered = false;
var loadObject, loadToRoot, loadUrl, loadRelPath;

$(window).on('load', function () {
  if (readyTriggered) { // ready first
    navTo(loadObject, loadToRoot, loadUrl, loadRelPath);
    showRoot();
  }
  loadTriggered = true;
});

function initNavTree(toroot, relpath) {
  var o = new Object();
  o.toroot = toroot;
  o.node = new Object();
  o.node.li = document.getElementById("nav-tree-contents");
  o.node.childrenData = NAVTREE;
  o.node.children = new Array();
  o.node.childrenUL = document.createElement("ul");
  o.node.getChildrenUL = function () { return o.node.childrenUL; };
  o.node.li.appendChild(o.node.childrenUL);
  o.node.depth = 0;
  o.node.relpath = relpath;
  o.node.expanded = false;
  o.node.isLast = true;
  o.node.plus_img = document.createElement("span");
  o.node.plus_img.className = 'arrow';
  o.node.plus_img.innerHTML = arrowRight;

  if (localStorageSupported()) {
    var navSync = $('#nav-sync');
    if (cachedLink()) {
      showSyncOff(navSync, relpath);
      navSync.removeClass('sync');
    } else {
      showSyncOn(navSync, relpath);
    }
    navSync.click(function () { toggleSyncButton(relpath); });
  }

  if (loadTriggered) { // load before ready
    navTo(o, toroot, hashUrl(), relpath);
    showRoot();
  } else { // ready before load
    loadObject = o;
    loadToRoot = toroot;
    loadUrl = hashUrl();
    loadRelPath = relpath;
    readyTriggered = true;
  }

  $(window).bind('hashchange', function () {
    if (window.location.hash && window.location.hash.length > 1) {
      var a;
      if ($(location).attr('hash')) {
        var clslink = stripPath(pathName()) + ':' + hashValue();
        a = $('.item a[class$="' + clslink.replace(/</g, '\\3c ') + '"]');
      }
      if (a == null || !$(a).parent().parent().hasClass('selected')) {
        $('.item').removeClass('selected');
        $('.item').removeAttr('id');
      }
      var link = stripPath2(pathName());
      navTo(o, link, hashUrl(), relpath);
    } else if (!animationInProgress) {
      $('#doc-content').scrollTop(0);
      $('.item').removeClass('selected');
      $('.item').removeAttr('id');
      navTo(o, toroot, hashUrl(), relpath);
    }
  })

  $("div.toc a[href]").click(function (e) {
    e.preventDefault();
    var docContent = $('#doc-content');
    var aname = $(this).attr("href");
    gotoAnchor($(aname), aname, true);
  })
}
/* @license-end */
