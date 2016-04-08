// ==UserScript==
// @author			Jack_mustang
// @contributor		doej
// @version			1.11
// @name			PH.com
// @description		Remove ads, enlarges video, stops autoplay keeping buffering & block pop-ups from pornhub.com
// @date			2015 January 28
// @include			*pornhub.com/*
// @run-at			document-start
// @grant			none
// @license			Public Domain
// @icon			https://gmgmla.dm2301.livefilestore.com/y2pAKJYeZAp4tG23hG68x1mRuEUQXqb1MxdLbuqVnyyuHFxC7ra5Fc-tfq6hD-r9cNnVufT3egUHaimL547xDlESrOVmQsqNSJ5gzaiSccLYzo/ExtendPornHub-logo.png
// @namespace		649b97180995e878e7e91b2957ef3bbee0f840a0
// ==/UserScript==

// jshint multistr: true
// globals: open parent

// Block popups
function Nop(e){ return; }
function NoOpen(e){ return 1; }
parent.open = NoOpen;
this.open   = NoOpen;
window.open = NoOpen;
open        = NoOpen;
window.open = Nop;
open        = Nop;
this.open   = Nop;
parent.open = Nop;

// Pop-up killer, we trick PH to think we are old Presto Opera, this kills the pop-ups
if (!window.opera)
	window.opera = true;


// Autoplay, autoload, etc.
function changePlayer() {
	if (!document.getElementById('player'))
		return setTimeout(changePlayer, 50);
		
	var player = document.getElementById('player'),
		vidId = parseInt(player.getAttribute("data-video-id")),
		newflashvars = document.createElement("script");
	newflashvars.setAttribute("type", "text/javascript");
	newflashvars.id = "EPH-newflashvars";
	newflashvars.innerHTML = '                \
		.autoplay = false;                    \
		.autoload = true;                     \
		.htmlPauseRoll = false;               \
		.htmlPostRoll = false;                \
		.video_unavailable_country = false;   \
		'.replace(/\./g, 'flashvars_' + vidId + '.');
	document.body.appendChild(newflashvars);
}

// wait while player doesn't load
function html5player() {
	var flash = document.querySelector("#player object"),
		html5 = document.querySelector("#player video");
	if (flash === null && html5 === null)
		return setTimeout(html5player, 50);
	
	var vidId = parseInt(document.getElementById('player').getAttribute("data-video-id")),
		playerDiv = document.getElementById("playerDiv_"+vidId);
	playerDiv.setAttribute("class", playerDiv.getAttribute("class") + " wide");
	scrollthere();
}

// Scroll video to middle of page
function scrollthere() {
	var player = document.getElementById('player'),
		vh = player.offsetHeight,
		vd = document.querySelector(".container").offsetTop +
			document.querySelector(".container").parentNode.offsetTop +
			document.querySelector(".video-wrapper").offsetTop +
			((document.querySelector("#PornhubNetworkBar>.bar_body") === null) ? 25 : 0),
		fh = window.innerHeight,
		sc = vd-((fh-vh)/2);
	scrollTo(0, sc);
	console.info("** ExtendPornHub **\ntop: "+vd+", height: "+vh+", scrolled: "+sc+", window: "+fh)  ;
}

// Remove ads functions
function removeQuery(query) {
	var ifr = document.querySelectorAll(query);
	if(ifr.length > 0)
		for(var i=0; i < ifr.length; i++)
			ifr[i].parentNode.removeChild(ifr[i]);
}

function addStyle() {
	// While <head> is not loaded we keep trying
	if (!document.querySelector("head"))
		return setTimeout(addStyle, 50);

	// We create an object and start including its content to include in DOM at the end
	var ephcss =
	// Hide ads while we can't remove them
	"iframe, \
	.home-ad-container, \
	.adblockWhitelisted, \
	.browse-ad-container, \
	.playlist-ad-container, \
	.communityAds, \
	.photo-ad-container, \
	#advertisementBox, \
	.ad_box, \
	.ad-link, \
	.removeAdLink, \
	#videoPageAds, \
	.sectionTitle+div:not(#categoriesStraightImages), \
	.edit-mode+div, \
	.generator-sidebar>.sectionWrapper:first-child, \
	.gifsWrapper>div:first-child {\
		display: none !important;\
	}" +
	// Videos Being Watched Right Now in one line + video ads + adBlock bar
	"ul.row-5-thumbs.videos-being-watched li.omega, #pb_block, .abAlertShown {\
		display: none !important;\
	}" +
	// Maximum full-width video
	"div#player {\
		max-width: 100vw;\
		max-height: 100vh;\
	}";

	// Inject created CSS
	var ephnode = document.createElement("style");
	ephnode.type = "text/css";
	ephnode.id = "EPH-style";
	ephnode.appendChild(document.createTextNode(ephcss));
	document.head.appendChild(ephnode);
}

function main(){
	changePlayer();
	// Remove iframes because they are ads
	removeQuery("iframe:not(#pb_iframe)");
	// Homepage
	removeQuery(".home-ad-container");
	removeQuery(".adblockWhitelisted");
	// Search
	removeQuery(".browse-ad-container");
	// Playlist
	removeQuery(".playlist-ad-container");
	// Community
	removeQuery(".communityAds");
	// Photo Gif
	removeQuery(".photo-ad-container");
	// unique Photo
	removeQuery("#advertisementBox");
	// Video
	removeQuery("videoPageAds");

	// Video page
	if(document.getElementById('player')) {
		document.getElementById("hd-rightColVideoPage").setAttribute("class", "wide");
		document.getElementById("player").setAttribute("class", "wide");

		// Inject this function to page
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.innerHTML = scrollthere.toString() + html5player.toString() + "html5player();";
		script.id = "EPH-scrollVid";
		document.body.appendChild(script);

		// Include button in right corner to center video on screen
		var node = document.createElement("div");
		node.setAttribute("style"," \
			position: fixed; \
			bottom: 0; \
			right: 0; \
			cursor: pointer; \
			border: 1px solid #313131; \
			border-top-left-radius: 5px; \
			color: #676767; \
			font-weight: 700; \
			background: #101010; \
			text-align: center; \
			font-size: 12px; \
			padding: 7px 15px; \
			z-index: 999999; \
		");

		node.setAttribute("onclick", "scrollthere();");
		node.innerHTML = "Center video";
		node.id = "EPH-scroll";
		document.body.appendChild(node);
		
		// Add video download when not logged
		if( document.body.classList[0].search("logged-in") < 0 ) {
			var tab = document.querySelector(".download-tab"),
				dwlinks = '';

			// where are those defined?
			var qualities = ['240p', '480p', '720p'];
			for (var i = 0; i < qualities.length; i++) {
				var quality = qualities[i];
				var quality_url = window["player_quality_" + quality];
				if (quality_url) {
					dwlinks += '<a class="downloadBtn greyButton" target="_blank" href="' + quality_url + '">' +
						'<i></i>' + (quality === '720p' ? '<span>HD</span>&nbsp;' : '') +
						quality + '</a>';
				}
			}
			tab.innerHTML = dwlinks;
		}
	}
}

var ExtendPH = function ExtendPornHub(){

	addStyle();

	window.addEventListener('DOMContentLoaded', main, false);
}();

// vim: sw=4 noet :
