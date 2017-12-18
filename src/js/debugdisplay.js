/**
 * (JSON) DebugDisplay
 * 
 * a simple display for JSON data and/or JavaScript evaluation
 * 
 * 
 * License
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * This software is provided by the author "as is" and any express or implied warranties, including, but not limited to, the implied warranties of merchantability and fitness for a particular purpose are disclaimed. In no event shall the author be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of the use of this software, even if advised of the possibility of such damage.
 *
 *	@package	DebugDisplay
 *	@author		Björn Bartels <me@bjoernbartels.earth>, [bjoernbartels.earth] <development@bjoernbartels.earth>
 *	
 *	@copyright	Copyright (c) 2014, [bjoernbartels.earth] <development@bjoernbartels.earth>. All rights reserved.
 *	@license	Apache 2.0
 *
 *	@created	03/2014
 *	@modified	04/2014
 *	@version	1.0.0
 */

if (typeof DebugDisplay == "undefined") {
	
	/**
	 * add '_getElementsByXPath' method to base element object for XPath compatiblity
	 * 
	 * @param		STRING	expression
	 * @param		HTMLElement|Element	parentElement
	 * @returns		ARRAY
	 */
	if ( (!!document.evaluate) ) {
		if ( typeof document._getElementsByXPath != 'function' ) {
			document._getElementsByXPath = function (expression, parentElement) {
				var results = [];
				var query = document.evaluate(expression, $(parentElement) || document,
					null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				for (var i = 0, length = query.snapshotLength; i < length; i++)
					results.push(query.snapshotItem(i));
				return results;
			};
		}
	}

	/**
	 * add 'getElementsByClassName' methods to base element object
	 * 
	 * @param		STRING	className
	 * @uses		_getElementsByXPath
	 * @returns		ARRAY
	 */
	if ( typeof document.getElementsByClassName != 'function' ) {
		document.getElementsByClassName = function (className) {
			if ( (!!document.evaluate) ) { // check for XPath compatiblity
				var q = ".//*[contains(concat(' ', @class, ' '), ' " + className + " ')]";
				return document._getElementsByXPath( q, (this || document.body) );
			} else {
				var children = (this || document.body).getElementsByTagName('*');
				var elements = [], child;
				for (var i = 0, length = children.length; i < length; i++) {
					child = children[i];
					var elementClassName = child.className;
					if (elementClassName == className ||
							elementClassName.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
						elements.push( (child) );
				}
				return elements;
			}
		};
	}

	/*if (!Array.prototype.indexOf) {
		/**
		 * detect index/position of specified array item, returns -1 if item is not found
		 * (Mozilla Developer Network [MDN] version)
		 * 
		 * @param	MIXED		searchElement
		 * @param	INTEGER		fromIndex
		 * @returns	INTEGER
		 * /
		Array.prototype.indexOf = function(searchElement /*, fromIndex * /) {
			"use strict";
			if (this === void 0 || this === null) { throw new TypeError(); }
			var t = Object(this);
			var len = t.length >>> 0;
			if (len === 0) { return -1; }
			var n = 0;
			if (arguments.length > 0) {
				n = Number(arguments[1]);
				if (n !== n) { n = 0; }
				else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) { 
					n = (n > 0 || -1) * Math.floor(Math.abs(n));
				}
			}
			if (n >= len) { return -1; }
			var k = n >= 0
	          ? n
	          : Math.max(len - Math.abs(n), 0);
			for (; k < len; k++) {
				if (k in t && t[k] === searchElement) { return k; }
			}
			return -1;
		};
	}*/

	if (!Array.prototype.indexOf) {
		/**
		 * detect index/position of specified array item, returns -1 if item is not found
		 * (simple version)
		 * 
		 * @param	MIXED		searchElement
		 * @param	INTEGER		fromIndex
		 * @returns	INTEGER
		 */
		Array.prototype.indexOf = function( searchElement, fromIndex ) {
			var t = Object(this),
				len = t.length >>> 0,
				fi = (typeof fromIndex == 'number') ? fromIndex : 0;
			for (k=fi; k < t.length; k++) {
				if (t[k] == searchElement) { return k; }
			}
			return -1;
		};
	}
	
	/**
	 *	capitalize first character of a given string, turn all others to lower cased characters
	 *		a = capitalize('hello');
	 *			-> a == 'Hello'
	 *		a = capitalize('HELLO WORLD!');
	 *			-> a == 'Hello world!'
	 *
	 *	@param		STRING		sString
	 *	@returns	STRING
	 */
	var capitalize = function( sString ) {
			return String(sString).charAt(0).toUpperCase() + String(sString).substring(1).toLowerCase();
	};

	/**
	 * class DebugDisplay
	 * 
	 * @param		MIXED	debugData
	 * @param		OBJECT	settings
	 * @returns		DebugDisplay
	 */
	function DebugDisplay ( data2debug, settings, useCookie ) {

		var _self = this;
		
		if ((typeof useCookie == 'undefined') || (useCookie === true)) {
			useCookie = true;
		} else {
			useCookie = false;
		}
		//
		// private constants
		//
		
		var _NOW_			= new Date(),
			
			_DEFAULTS_		= {
				name			: 'DebugDisplay-'+Number(_NOW_),
				autocreate		: true,
				autodebug		: true,
				displayDepthMax	: 3,			// 0 = all levels, max 3 for DOM object debugging (use browsing instead)
				
				searchEnabled	: true,
				searchKeys		: true,
				searchPaths		: true,
				searchValues	: true,
				searchMinChar	: 3,
				
				debugDataDisplaySuggestEnabled	: true,
				debugDataDisplaySuggestMinChar	: 3,
				
				fontsize		: 10,
				fontsizeMin		: 8,
				fontsizeMax 	: 20,
				
				historyMax		: 10,

				showSearch		: true,
				showLevelUp		: true,
				showRefresh		: true,
				showHistory		: true,
				showExpand		: true,
				showFormat		: true,
				showSettings	: true,
				showHelp		: true,
				
				debug			: false
			},

			_HISTORY_		= [],
			_HISTORY_INDEX_	= 0,

			_DEBUG_			= {},
			_debugDataDisplaySuggest_		= {},
			
			CONST			= {
				LABELELEMENT	: 'SPAN',
				VALUEELEMENT	: 'SPAN'
			}
		;
			
		
		//
		// private methods and properties
		//
		
		// some helper functions

		/**
		 * overwrite one's object properties with another object's properties and/or add missing properties
		 * 
		 * @param	OBJECT|MIXED	destination
		 * @param	OBJECT|MIXED	source
		 * @returns	OBJECT|MIXED
		 */
		var extend = function (destination, source) {
			for (var property in source)
				//if (destination[property] && (typeof source[property] != 'undefined'))
					destination[property] = source[property];
			return destination;
		};
		
		/**
		 * overwrite one's object properties with another object's properties without adding missing properties
		 * 
		 * @param	OBJECT|MIXED	destination
		 * @param	OBJECT|MIXED	source
		 * @returns	OBJECT|MIXED
		 */
		var apply = function (destination, source) {
			for (var property in destination)
				if (destination[property] && (typeof source[property] != 'undefined'))
					destination[property] = source[property];
			return destination;
		};
		
		/**
		 * console debug output
		 * 
		 * @param	MIXED	items
		 * @returns	DebugDisplay
		 */
		var debugMsg = function ( items ) {
		    if (settings.debug === true) {
		    	for (i in arguments) {
		    		console.debug(arguments[i]);
		    	}
		    }
		    return (this);
		};
		
		/**
		 * check for array type object
		 * 
		 * @param	MIXED	value
		 * @returns	BOOLEAN
		 */
		var isArray = function (value) {
		    return Object.prototype.toString.call(value) === '[object Array]';
		};
		var is_array = isArray;
		
		/**
		 * check if string is a url
		 * 
		 * @param	STRING	value
		 * @returns	BOOLEAN
		 */
		var isUrl = function (value) {
		    return (
			    (String(value).indexOf('http:') == 0) ||
			    (String(value).indexOf('https:') == 0) ||
			    (String(value).indexOf('javascript:') == 0) ||
			    (String(value).indexOf('file:') == 0)
		    );
		};
		
	    // for entity conversion
	    var entity = function (str) {
	    	var entityElement = document.createElement('div');
	        entityElement.innerHTML = 
	        	str.replace("<", "&lt;").replace(">", "&gt;");
	        return entityElement.innerHTML;
	    };

		/**
		 * adds (escaping) back-slashes to certain characters, " and '
		 * 
		 * @param		STRING		sString
		 * @returns		STRING
		 */
		if (typeof addSlashes != 'function') {
			var addSlashes = function ( str ) {
			    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
			};
		}

		/**
		 * strips (escaping) back-slashes from string
		 * 
		 * @param		STRING		sString
		 * @returns		STRING
		 */
		var stripSlashes = function (sString) {
			sString=sString.replace(/\\'/g,'\'');
			sString=sString.replace(/\\"/g,'"');
			sString=sString.replace(/\\\\/g,"\\");
			sString=sString.replace(/\\r/g,"\r");
			sString=sString.replace(/\\n/g,"\n");
			//sString=sString.replace(/\\u(..)/g,"\u$1");
			sString=sString.replace(/\\0/g,'\0');
			return sString;
		};
		
		/**
		 * convert special unicode encoded characters/sequences
		 * 
		 * @param		STRING	unicode_string
		 * @returns		STRING
		 */
		var convertUnicode = function ( unicode_string ) {
			return unescape(stripSlashes(String(unicode_string)))
				.replace(/\\u003d/g, "=")
				.replace(/\\u0026/g, "&")
				.replace(/\\u003c/g, "&lt;")
				.replace(/\\u003e/g, "&gt;")
				.replace(/\\u0027/g, "&quot;");
		};
		
		
		if ( typeof capitalize != 'function' ) {
			/**
			 *	capitalize first character of a given string, turn all others to lower cased characters
			 *		a = capitalize('hello');
			 *			-> a == 'Hello'
			 *		a = capitalize('HELLO WORLD!');
			 *			-> a == 'Hello world!'
			 *
			 *	@param		STRING		sString
			 *	@returns	STRING
			 */
			var capitalize = function( sString ) {
					return String(sString).charAt(0).toUpperCase() + String(sString).substring(1).toLowerCase();
			};
		}

		// element class-name functions

		/**
		 * add classname to element
		 * 
		 * @param	HTMLElement|Element	elem
		 * @param	STRING				classname
		 * @returns	DebugDisplay
		 */
		var addClass = function (elem, class_name) {
			var classes = (elem.className=="") ? [] : String(elem.className).split(" ");
			if (classes.indexOf(class_name) == -1) {
				classes.push(class_name);
			}
			elem.className = classes.join(" ");
			return (this);
		};
		
		/**
		 * remove classname from element
		 * 
		 * @param	HTMLElement|Element	elem
		 * @param	STRING				classname
		 * @returns	DebugDisplay
		 */
		var removeClass = function (elem, class_name) {
			var classes = (elem.className=="") ? [] : String(elem.className).split(" ");
			if (classes.indexOf(class_name) != -1) {
				delete (classes[classes.indexOf(class_name)]);
			}
			elem.className = classes.join(" ");
			return (this);
		};
		
		/**
		 * check for classname on element
		 * 
		 * @param	HTMLElement|Element	elem
		 * @param	STRING				classname
		 * @returns	BOOLEAN
		 */
		var hasClass = function (elem, class_name) {
			var classes = (elem.className=="") ? [] : String(elem.className).split(" ");
			return (classes.indexOf(class_name) != -1);
		};
		
		/**
		 * toggle between classnames on element
		 * 
		 * @param	HTMLElement|Element	elem
		 * @param	STRING				classname 1
		 * @param	STRING				classname 2
		 * @returns	DebugDisplay
		 */
		var toggleClass = function (elem, classname1, classname2) {
			if ( hasClass(elem, classname1) ) {
				removeClass(elem, classname1);
				addClass(elem, classname2);
			} else {
				removeClass(elem, classname2);
				addClass(elem, classname1);
			}
			return (this);
		};
		
		
		// element event functions

		/**
		 * add an event to give, element
		 * 
		 * @param		HTMLElement|Element	elm
		 * @param		STRING				evType
		 * @param		FUNCTION|OBJECT		fn
		 * @param		BOOLEAN				useCapture
		 * @returns		MIXED|BOOLEAN
		 */
		var addEvent = function (elm, evType, fn, useCapture) {
			if (!elm) { return false; }
			if (elm.addEventListener){
				elm.addEventListener(evType, fn, useCapture);
				return true;
			} else if (elm.attachEvent){
				var r = elm.attachEvent("on"+evType, fn);
				return r;
			} else { /* alert("event handler could not be added"); */ }
		};
		
		/**
		 * remove event from give element
		 * 
		 * @param		HTMLElement|Element	elm
		 * @param		STRING				evType
		 * @param		FUNCTION|OBJECT		fn
		 * @param		BOOLEAN				useCapture
		 * @returns		MIXED|BOOLEAN
		 */
		var removeEvent = function (elm, evType, fn, useCapture) {
			if (elm.removeEventListener){
				elm.removeEventListener(evType, fn, useCapture);
				return true;
			} else if (elm.detachEvent){
				var r = elm.detachEvent("on"+evType, fn);
				return r;
			} else { /* alert("event handler could not be removed"); */ }
		};
	
		/**
		 * trigger DOM event on element
		 * 
		 * @param		HTMLElement|Element	elm		can be any DOM Element or other EventTarget
		 * @param		STRING				evType	Event type (i.e. 'click')
		 * @param		HTMLElement|Element	doc		Placeholder for document
		 * @param		Event				event	Placeholder for creating an Event
		 * @returns		DebugDisplay
		 */
		var triggerEvent = function (elm, evType, doc, event) {
			doc = document;
			if (doc.createEvent) {
				event = new Event(type);
				target.dispatchEvent(event);
			} else {
				event = doc.createEventObject();
				target.fireEvent('on' + type, event);
			}
		};
		
		if ( typeof getEvent != 'function' ) {
			/**
			 *	get current event object
			 * 
			 *	@param		Event|OBJECT	event
			 *	@returns	void
			 */
			var getEvent = function (event) {
			    return ( (window.event) ? window.event : event );
			};
		}

		if ( typeof getEventTarget != 'function' ) {
			/**
			 *	get element's/object's event target           
			 *                                               
			 *	@param		Event|OBJECT	event             
			 *	@returns	void                             
			 */
			var getEventTarget = function (event) {
			    var realEvent = getEvent(event); 
			    return ( (realEvent.target) ? realEvent.target : realEvent.srcElement );
			};
		}

		
		// cookie methods

		/**
		 *	creates (domain based) user's browser cookie
		 * 
		 *	@param		STRING		name
		 *	@param		MIXED		value
		 *	@param		INTEGER		days	(optional)
		 *	@param		STRING		domain	(optional)
		 *	@returns	DebugDisplay
		 */
		var createCookie = function (name,value,days,domain) {
			if (days) {
				var ablauf = new Date();
				var inXTagen = ablauf.getTime() + ( 30 * 24 * 60 * 60 * 1000);
				ablauf.setTime(inXTagen);
				var expires = "; expires="+ablauf.toGMTString();
			}
			else var expires = "";
			var domain_str = "";
				if (domain) {
				domain_str = "; domain=" + escape (domain);
			}
			document.cookie = name+"="+ encodeURIComponent(value) + expires + "; path=/"+domain_str;
			return (this);
		};
	
		/**
		 *	reads information/content from a specific cookie given by its name
		 *
		 *	@param		STRING	name
		 *	@returns	MIXED
		 */
		var readCookie = function (name) {
			var nameEquivalent = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEquivalent) == 0) return decodeURIComponent( c.substring(nameEquivalent.length,c.length) );
			}
			return null;
		};
	
		/**
		 *	removes a specific cookie given by its name
		 * 
		 *	@param		STRING	name
		 *	@param		STRING	domain
		 *	@returns	void
		 */
		var eraseCookie = function (name, domain) {
			createCookie(name,"",-1, domain);
		};
	
		/**
		 *	test if user's browser allows cookies to be set
		 * 
		 *	@returns	BOOLEAN
		 */
		var testCookiesEnabled = function () {
			var cookieEnabled=(navigator.cookieEnabled)? true : false;
			//if not IE4+ nor NS6+
			if (typeof navigator.cookieEnabled=="undefined" && !cookieEnabled) { 
					document.cookie="testcookie";
					cookieEnabled=(document.cookie.indexOf("testcookie")!=-1)? true : false;
			}
			return useCookie && cookieEnabled;
		};
		
		
		// DebugDisplay helpers
		
		/**
		 * toggle visibility
		 * 
		 * @param		MIXED	element
		 * @param		MIXED	data
		 * @returns		DebugDisplay
		 */
		var toggleVisibility = function ( element ) {
			if (element.style) {
				if ( element.style.display != 'none' ) {
					if ( !element.style.display ) {
						element.style.display = 'block';
					}
					element.style.display_save = element.style.display;
					element.style.display = 'none';
				} else {
					if ( !element.style.display_save ) {
						element.style.display_save = 'block';
					}
					element.style.display = element.style.display_save;
					element.style.display_save = 'none';
				}
			}
			return (this);
		};
		
		/**
		 * toggle visibility
		 * 
		 * @param		MIXED	element
		 * @param		MIXED	data
		 * @returns		DebugDisplay
		 */
		var toggleDataDisplay = function ( element ) {
			if ( hasClass(element, "collapsed") ) {
				removeClass(element, "collapsed");
			} else {
				addClass(element, "collapsed");
			}
			return (this);
		};
		
		/**
		 * convert special unicode encoded characters/sequences
		 * 
		 * @param		HTMLElement|Element	elem
		 * @param		STRING				path
		 * @returns		void
		 */
		var truncateFunctionCode = function ( _func ) {
			var i1 = String(_func).indexOf("{", 0);
			return String(_func).slice(0, i1) + ' { [native code] }'; 
		};

		/**
		 * convert special unicode encoded characters/sequences
		 * 
		 * @param		HTMLElement|Element	elem
		 * @param		STRING				path
		 * @returns		void
		 */
		var setPathTitle = function ( elem, path ) {
			return (elem.title = 'path: '+path); 
		};

		/**
		 * set fontsize in panel
		 * 
		 * @param		MIXED	panel element
		 * @returns		DebugDisplay
		 */
		var setFontsize = function ( size ) {
			if ( !size || isNaN(size) )			{ size = Number(settings.fontsize); }
			if ( size > settings.fontsizeMax )	{ size = Number(settings.fontsizeMax); }
			if ( size < settings.fontsizeMin )	{ size = Number(settings.fontsizeMin); }
			document.getElementById('debugDataDisplayPanel').style.fontSize = ''+size+'px';
			debugMsg( 'new font-size:', size );
			return (this);
		};

		
		// DebugDisplay selected item history/navigation
		
		/**
		 * parse for item next level up
		 * 
		 * @param		STRING		path
		 * @returns		STRING
		 */
		var levelUp = function ( path ) {
			var iDot		= String(path).lastIndexOf('.'),
				iBracketO	= String(path).lastIndexOf('['),
				iSplit		= (iBracketO > iDot) ? iBracketO : iDot,
				path		= String(path).substring(0, iSplit)
			;
			debugMsg( 'level up:', path );
			return (path); 
		};

		/**
		 * add to query history, returns new query history
		 * 
		 * @param		STRING		path
		 * @returns		ARRAY
		 */
		var historyAdd = function ( path ) {
			if ( _HISTORY_[_HISTORY_.length-1] != path ) {
				_HISTORY_.push(path);
				++_HISTORY_INDEX_;
				if ( (settings.historyMax > 0) && (_HISTORY_.length > settings.historyMax) ) {
					_HISTORY_.shift();
					--_HISTORY_INDEX_;
				}
			}
			debugMsg( 
				'path to add to history:', path, 
				'history items:', _HISTORY_, 
				'history length:', _HISTORY_.length,
				'history max length:', settings.historyMax,
				'history index:', _HISTORY_INDEX_ 
			);
			return (_HISTORY_);
		};

		/**
		 * clear history items
		 * 
		 * @returns		DebugDisplay
		 */
		var historyTruncate = function () {
			if (_HISTORY_INDEX_ >= 0) {
				_HISTORY_.splice(_HISTORY_INDEX_, _HISTORY_.length);
			}
			return (this);
		};

		/**
		 * clear history items
		 * 
		 * @returns		DebugDisplay
		 */
		var historyClear = function () {
			_HISTORY_ = [];
			_HISTORY_INDEX_ = 0;
			return (this);
		};

		/**
		 * get from query history at index
		 * 
		 * @param		INTEGER		idx
		 * @returns		STRING
		 */
		var historyGo = function ( idx ) {

			if (typeof idx != 'undefined') {
				if ( idx == 0 ) {
					_HISTORY_INDEX_ = 0;
				} else {
					_HISTORY_INDEX_ += idx;
					if (typeof _HISTORY_[_HISTORY_INDEX_-1] == 'undefined') {
						if ( _HISTORY_INDEX_ >= 0 ) {
							_HISTORY_INDEX_ -= idx;
						}
					} 
				}
			}
			debugMsg( 'history:', _HISTORY_, 'history index:', _HISTORY_INDEX_ );
			if ( _HISTORY_INDEX_ <= 0) {
				return '';
			}
			return (_HISTORY_[_HISTORY_INDEX_-1]);
		};
		

		// DebugDisplay settings functions/actions
				
		/**
		 * get settings form input values
		 * 
		 * @returns	OBJECT
		 */
		var getSettingsFormValues = function ( ) {
			var setting = settings,
				aInput = document.getElementsByClassName('debugDisplaySettingValue');
			for (i in aInput) {
				if ((aInput[i].type == "checkbox") || (aInput[i].type == "radio")) {
					if (aInput[i].checked) {
						setting[aInput[i].name] = true;
					} else {
						setting[aInput[i].name] = false;
					}
				} else if (aInput[i].type == "select") {
					setting[aInput[i].name] = aInput[i].selectedOption;
				} else {
					setting[aInput[i].name] = aInput[i].value;
				}
			}
			apply (settings, setting);
			return (settings);
		};
		
		/**
		 * apply settings to form inputs
		 * 
		 * @returns	DebugDisplay
		 */
		var fillSettingsForm = function ( setting ) {
			if (typeof setting != 'object') {
				setting = settings;
			}
			var aInput = document.getElementsByClassName('debugDisplaySettingValue');
			for (i in aInput) {
				if (aInput[i].name && setting[aInput[i].name]) {
					if ((aInput[i].type == "text") || (aInput[i].tagName == "textarea")) {
						aInput[i].value = setting[aInput[i].name];
					} else if ((aInput[i].type == "checkbox") || (aInput[i].type == "radio")) {
						if (
							( (setting[aInput[i].name] === true) || 
							(setting[aInput[i].name] == 'true') || 
							(setting[aInput[i].name] == 1) )
							// && !((aInput[i].checked == 'checked') || (aInput[i].checked == true))
						)  {
							//aInput[i].checked = true;
							aInput[i].checked = 'checked';
							//triggerEvent(aInput[i], 'click');
						}
					} else if (aInput[i].type == "select") {
						aInput[i].selectedOption = setting[aInput[i].name];
					}
				}
			}
			return (this);
		};
		
		/**
		 * load settings/options form cookie
		 * 
		 * @returns	DebugDisplay
		 */
		var loadOptions = function ( ) {
			if (testCookiesEnabled()) {
				var sSerializedOptions = readCookie("DebugDisplay");
				if (sSerializedOptions) {
					try {
						oOptions = JSON.parse(sSerializedOptions);
						setOptions(oOptions);
					} catch (exception) {
						debugMsg("error reading options from cookie:", exception);
					}
				}
			}
			return (settings);
		};
		
		/**
		 * save settings/options to cookie
		 * 
		 * @returns	DebugDisplay
		 */
		var saveOptions = function ( options ) {
			if (typeof options != 'object') {
				options = settings;
			}
			if (testCookiesEnabled()) {
				var sSerializedOptions = JSON.stringify(options);
				try {
					createCookie("DebugDisplay", sSerializedOptions);
					debugMsg("saving settings to cookie:", options);
				} catch (exception) {
					debugMsg("error saving settings to cookie:", exception);
				}
			}
			return (this);
		};
		
		/**
		 * set new settings/options
		 * 
		 * @returns	DebugDisplay
		 */
		var setOptions = function ( options ) {
			settings = apply(settings, options);
			return (this);
		};
		
		/**
		 * get settings/options
		 * 
		 * @returns	OBJECT
		 */
		var getOptions = function ( ) {
			return (settings);
		};
		
		/**
		 * get default settings/options
		 * 
		 * @returns	OBJECT
		 */
		var getDefaults = function ( ) {
			return (_DEFAULTS_);
		};
		
		/**
		 * apply (new) settings/options
		 * 
		 * @returns	DebugDisplay
		 */
		var applyOptions = function ( ) {
			for (key in settings) {
				if (String(key).indexOf('show') != -1) {
					toggleShowAction(key);
				}
			}
		};
		
		/**
		 * show/hide actions according to settings
		 * 
		 * @returns	DebugDisplay
		 */
		var toggleShowAction = function ( name ) {
			var sName = String(name).replace("show", "").toLowerCase();
			if (sName == 'format') {
				sName = 'fontsize';
			} 
			var aActionElements = document.getElementsByClassName(sName);
			for (i in aActionElements) {
				if (aActionElements[i] && aActionElements[i].style) {
					if (settings[name] !== true) {
						aActionElements[i].style.display = 'none';
					} else {
						aActionElements[i].style.display = 'block';
					}
				}
			}
		};
		

		// DebugDisplay panel functions/actions
		
		/**
		 * show activity panel
		 * 
		 * @returns		DebugDisplay
		 */
		var debugDataDisplayActivityShow = function ( ) {
			document.getElementById('debugDataDisplayPanel').style.display = 'none';
			document.getElementById('debugDataDisplayActivity').style.display = 'block';
			return (this);
		};
		
		/**
		 * show activity panel
		 * 
		 * @returns		DebugDisplay
		 */
		var debugDataDisplayActivityHide = function ( ) {
			document.getElementById('debugDataDisplayActivity').style.display = 'none';
			document.getElementById('debugDataDisplayPanel').style.display = 'block';
			return (this);
		};
		
		/**
		 * expand all object/array items
		 * 
		 * @param		MIXED	panel element
		 * @returns		DebugDisplay
		 */
		var debugDataDisplayExpandAll = function ( ) {
			var aObjects = document.getElementsByClassName('type_object'),
				aArrays = document.getElementsByClassName('type_array'),
				aContainers = document.getElementsByClassName('dataContainer');
			for (con in aContainers) {
				if ( (con > -1) && aContainers[con].style ) {
					aContainers[con].style.display = 'block';
					if (aContainers[con].previousSibling) {
						removeClass(aContainers[con].previousSibling, 'closed');
						addClass(aContainers[con].previousSibling, 'opened');
					}
				}
			}
			return (this);
		};

		/**
		 * collapse all object/array items
		 * 
		 * @param		MIXED	panel element
		 * @returns		DebugDisplay
		 */
		var debugDataDisplayCollapseAll = function ( ) {
			var aObjects = document.getElementsByClassName('type_object'),
				aArrays = document.getElementsByClassName('type_array'),
				aContainers = document.getElementsByClassName('dataContainer');
			for (con in aContainers) {
				if ( (con > -1) && aContainers[con].style ) {
					aContainers[con].style.display = 'none';
					if (aContainers[con].previousSibling) {
						removeClass(aContainers[con].previousSibling, 'opened');
						addClass(aContainers[con].previousSibling, 'closed');
					}
				}
			}
			aContainers[0].style.display = 'block';
			return (this);
		};
		
		/**
		 * debug/evaluate(/search) for item by query from input element
		 * 
		 * @param		STRING	query
		 * @returns		DebugDisplay
		 */
		var debugDataDisplaySearch = function ( query ) {
			debugDataDisplayClear();
			var result = {};
			if (!query || query === '') {
				debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), data2debug.root );
				result = true;
			} else {
				try {
					// look into debug data
					var sQuery = 'debugData.root.'+query;
					result[query] = eval(sQuery);
					
					debugMsg( 'query:', sQuery, 'result:', result );

					if (typeof result != 'undefined') {
						if (typeof result != 'object') {
							debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), result, query );
						} else {
							debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), result, query );
						}
						result = true;
					} else {
				        debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), _DATA_ );
				        var results = debugDataSearch( query );
				        if (results._count > 0) {
					    	debugDataDisplayClear();
					        debugDataDisplayShow(
					        	document.getElementById('debugDataDisplayPanel'),
					        	//{ word : results._all }
					        	results._all
					        );
					        historyAdd(query);
					    } else {
							debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), {"error": "property could not be found within given path..."} );
					    }
					}
				} catch (exception) {
					try {
						// look into global JS objects/properties
						var sQuery = 'window.'+query+'';
						var result = {};
						result[query] = eval(sQuery);
						
						debugMsg( 'query:', sQuery, 'result:', result );
						
						if (typeof result != 'undefined') {
							if (typeof result != 'object') {
								debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), result, query );
							} else {
								debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), result, query );
							}
							result = true;
						} else {
					        debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), _DATA_ );
					        var results = debugDataSearch( query );
					        if (results._count > 0) {
						    	debugDataDisplayClear();
						        debugDataDisplayShow(
						        	document.getElementById('debugDataDisplayPanel'),
						        	//{ word : results._all }
						        	results._all
						        );
						        historyAdd(query);
						    } else {
						    	debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), {"error": "query could not be evaluated or global object could not be found..."} );
						    }
						}
					} catch (exception2) {
						try {
							// evaluate expression
							var sQuery = ''+query+'';
							var result = {};
							result[query] = eval(sQuery);
							
							debugMsg( 'query:', sQuery, 'result:', result );
							
							if (typeof result != 'undefined') {
								if (typeof result != 'object') {
									debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), result, query );
								} else {
									debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), result, query );
								}
								result = true;
							} else {
						        debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), _DATA_ );
						        var results = debugDataSearch( query );
						        if (results._count > 0) {
							    	debugDataDisplayClear();
							        debugDataDisplayShow(
							        	document.getElementById('debugDataDisplayPanel'),
							        	//{ word : results._all }
							        	results._all
							        );
							        historyAdd(query);
							    } else {
									debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), {"error": "expression could not be evaluated..."} );
							    }
							}
						} catch (exception3) {
							debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), {"error": "expression could not be evaluated..."} );
						}
					}
				}
			}
			document.getElementById('debugDataDisplayPanel').style.display = 'block';
			return (result);
		};

		
		/**
		 * clear data display panel
		 * 
		 * @param		MIXED	panel element
		 * @returns		DebugDisplay
		 */
		var debugDataDisplayClear = function ( rootelement ) {
			if (!document.getElementById('debugDataDisplayPanel')) { return (false); }
			var emptyPanelHTML = []; 
			if ((typeof rootelement != 'undefined') && (typeof rootelement.innerHTML != 'undefined')) {
				rootelement.innerHTML = emptyPanelHTML.join("");
			} else  {
				document.getElementById('debugDataDisplayPanel').innerHTML = emptyPanelHTML.join("");
			}
			return (this);
		};

		/**
		 * search for item in debug data
		 * 
		 * @param		STRING	query
		 * @returns		ARRAY
		 */
		var debugDataSearch = function ( query ) {
			var aKeys = document.getElementById('debugDataDisplayPanel').getElementsByClassName('key');
			var result = {
					_keys	: {},
					_paths	: {},
					_values	: {},
					_all	: {},
					_count	: 0
				};
			if ( (query != '') || (String(query).length()) >= settings.searchMinChar) { 
				for (idx in aKeys) {
					if (typeof aKeys[idx]['data-path'] == 'undefined') { continue; }
					if (settings.searchKeys) {
						if (String(aKeys[idx].innerHTML).toLowerCase().indexOf(String(query).toLowerCase()) != -1) {
							result._keys[String(aKeys[idx]['data-path'])] = aKeys[idx].innerHTML.replace(" : ", "");
							if (typeof result._all[String(aKeys[idx]['data-path'])] == 'undefined') {
								result._all[String(aKeys[idx]['data-path'])] = aKeys[idx].innerHTML.replace(" : ", "");
								result._count++;
							}
						}
					}
					if (settings.searchPath) {
						if (String(aKeys[idx]['data-path']).toLowerCase().indexOf(String(query).toLowerCase()) != -1) {
							result._paths[String(aKeys[idx]['data-path'])] = String(aKeys[idx]['data-path']);
							if (typeof result._all[String(aKeys[idx]['data-path'])] == 'undefined') {
								result._all[String(aKeys[idx]['data-path'])] = aKeys[idx].innerHTML.replace(" : ", ""); 
								result._count++;
							}
						}
					}
					if (settings.searchValues) {
						if (String(aKeys[idx].nextSibling.innerHTML).toLowerCase().indexOf(String(query).toLowerCase()) != -1) {
							result._values[String(aKeys[idx]['data-path'])] = aKeys[idx].nextSibling.innerHTML;
							if (typeof result._all[String(aKeys[idx]['data-path'])] == 'undefined') {
								result._all[String(aKeys[idx]['data-path'])] = aKeys[idx].innerHTML.replace(" : ", ""); 
								result._count++;
							}
						}
					}
				}
			}
			debugMsg('query results:', query, result);
			
			return result;
		};

		/**
		 * display data in UL list(s)
		 * 
		 * @param		HTMLElement|Element		rootelement
		 * @param		MIXED					data
		 * @param		STRING					path
		 * @param		INTEGER					level
		 * @returns		DebugDisplay
		 */
		var debugDataDisplayShow = function ( rootelement, data, path, level ) {
			if (!document.getElementById('debugDataDisplay')) { return (false); }
			if (typeof rootelement != 'object') { return (false); }
			if (typeof path != 'string') { path = String(path || ""); }
			if (typeof level == 'undefined') { level = 0; }
			if ((level >= settings.displayDepthMax) && (settings.displayDepthMax > 0) ) { return (this); }
			var save_path = path;
			
			//if (typeof data == 'object') {
				var oUL = document.createElement('UL');
				for (property in data) {
				
					if ( (new RegExp(/_\[(\w+)\]/gi)).test(property) ) continue;
					
					path = save_path;
					var oLI = document.createElement('LI'),
						oKey = document.createElement('SPAN'),
						oValue = document.createElement('SPAN'),
						oDataContainer = false,
						mData = data[property],
						aDescr = [];

					if ( 
						isArray( data ) && 
						(data.length-1 == property) && 
						( (typeof data[(data.length-1)] != 'undefined') && (data[(data.length-1)] !== null) && 
						((typeof data[(data.length-1)]._type != 'undefined')  ||
						(typeof data[(data.length-1)]._baseType != 'undefined')) )
					) {
						break;
					}
					addClass(oKey, 'key');
					oKey.innerHTML = String(property) + ' : ';
					addClass(oValue, 'value');
					
					if ( 
						(property != 'root') && (property != '_value') && (property != '_type') && (property != '_baseType')
					) {
						if ( !isNaN(property) ) {
							if ( (path[path.length-1] == '.') && (path != '') ) {
								path = String(path).substring(0, path.length-1);
							}
							path = String(path)+'['+String(property)+']';
						} else if (path != property) {
							if ( (path[path.length-1] != '.') && (path != '') ) {
								path = String(path)+'.';
							}
							path = String(path)+String(property);
						}
					} 
					
					if ( mData === null ) {
						addClass(oLI, 'type_null');
						aDescr.push("Scalar Type: Null");
						oValue.innerHTML = '<em>null</em>';
					} else if ( isArray( mData ) ) {
						oValue = document.createElement('A');
						oValue.href="#";
						addClass(oLI, 'type_array');
						var s_type = '', s_def = '';
						if ((mData.length-1) == -1) {
							s_type = '[object Array]' + ' (0 elements)';
						} else if ((mData.length-1) != 1) {
							s_type = '[object Array]' + ' ('+(mData.length-1)+' elements)';
						} else {
							s_type = '[object Array]' + ' ('+(mData.length-1)+' element)';
						}
						if ((typeof mData[(mData.length-1)] != 'undefined') && (mData[(mData.length-1)] !== null) && (typeof mData[(mData.length-1)]._type != 'undefined')) {
							if (typeof mData[(mData.length-1)]._baseType != 'undefined') {
								s_def = ' {'+mData[(mData.length-1)]._baseType+'|'+mData[(mData.length-1)]._baseType+'}';
							} else {
								s_def = ' {'+mData[(mData.length-1)]._type+'}';
							}
						} else {
							if ((mData.length-1) == -1) {
								s_type = '[object Array]' + ' (0 elements)';
							} else if ((mData.length-1) != 1) {
								s_type = '[object Array]' + ' ('+(mData.length)+' elements)';
							} else {
								s_type = '[object Array]' + ' ('+(mData.length)+' element)';
							}
						}
						oValue.innerHTML = s_type + s_def;
						oDataContainer = document.createElement('DIV');
						addClass(oDataContainer, 'dataContainer');
						debugDataDisplayShow(oDataContainer, mData, String(path), (level+1)); // +' > ');
					} else if ( typeof mData == 'object' ) {
						// display object type
						if ( (mData.value || (mData.value===true) || (mData.value===false) || (mData.value===null) || (mData.value=="")) && mData._type ) {
							// (Java-style) scalar object type (with 'value' and/or '_type' attribute)
							if ( mData.value === null ) {
								addClass(oLI, 'type_null');
								oValue.innerHTML = '<em>null</em>';
								aDescr.push("Scalar Type: Null");
							} else if ( !isNaN(mData.value) && !isNaN(parseInt(mData.value)) && !isNaN(parseFloat(mData.value)) ) {
								addClass(oLI, 'type_number');
								aDescr.push("Scalar Type: Number");
							} else if ( 
								((mData.value===true) || (mData.value===false) ||
								(mData.value=='true') || (mData.value=='false'))
							) {
								addClass(oLI, 'type_boolean');
								aDescr.push("Scalar Type: Boolean");
							} else if ( typeof mData == 'function' ) {
								addClass(oLI, 'type_function');
								aDescr.push("Scalar Type: function");
							} else {
								addClass(oLI, 'type_string');
								aDescr.push("Scalar Type: String");
							}
							for ( ti in mData ) {
								aDescr.push(ti+": "+mData[ti]);
							}

							if ( typeof mData != 'function' ) {
								if (isUrl(mData.value)) { 
									addClass(oLI, 'type_url');
									oValue.innerHTML += '<span>"'+convertUnicode(String(mData.value))+'"</span> <a class="gl link" target="_blank" href="'+convertUnicode(String(mData.value))+'"><span></span></a>';
								} else {
									oValue.innerHTML = '"'+entity( convertUnicode(String(mData.value)) )+'"';
								}
							} else {
								oValue.innerHTML = truncateFunctionCode( String(mData.toString()) );
							}
							//oValue.innerHTML = '"'+convertUnicode(String(mData.value))+'"';
						} else {
							// real (JS) object type
							oValue = document.createElement('A');
							oValue.href="#";
							addClass(oLI, 'type_object');
							oValue.innerHTML = '[object Object]';
							if (typeof mData._type != 'undefined') {
								if (typeof mData._baseType != 'undefined') {
									oValue.innerHTML = oValue.innerHTML + ' {'+mData._baseType+'|'+mData._type+'}';
								} else {
									oValue.innerHTML = oValue.innerHTML + ' {'+mData._type+'}';
								}
							} else {
								var sName = mData.constructor.name;
								if (sName && (sName != "")) {
									oValue.innerHTML = '[object '+sName+']';
								}
							}
							if ( (mData != data) ) {
								oDataContainer = document.createElement('DIV');
								addClass(oDataContainer, 'dataContainer');
								if ( !((mData instanceof HTMLElement) && (mData.id == "debugDataDisplay")) ) {
									debugDataDisplayShow(oDataContainer, mData, String(path)+'.', (level+1));
								}
							} else {
								oValue.innerHTML = oValue.innerHTML + ' <span class="warning recursion">{recursion}</span>';
							}
						}
					} else {
						// display scalar types
						if ( !isNaN(mData) && !isNaN(parseInt(mData)) && !isNaN(parseFloat(mData)) ) {
							addClass(oLI, 'type_number');
							aDescr.push("Scalar Type: Number");
						} else if ( 
							(mData===true) || (mData===false) ||
							(mData=='true') || (mData=='false') 
						) {
							addClass(oLI, 'type_boolean');
							aDescr.push("Scalar Type: Boolean");
						} else if ( typeof mData == 'function' ) {
							addClass(oLI, 'type_function');
							aDescr.push("Scalar Type: function");
						} else {
							addClass(oLI, 'type_string');
							aDescr.push("Scalar Type: String");
						}

						if ( typeof mData != 'function' ) {
							//if ( (data instanceof HTMLHtmlElement) || (data instanceof HTMLDocumentElement)) {
							if ( (data instanceof HTMLElement) ) {
								if ( (property == 'innerHTML') ) {
									oValue.innerHTML = '[ HTML code, inspect element properties instead ]';
								} else if ( (property == 'outerHTML') ) {
									oValue.innerHTML = '[ HTML code, inspect element properties instead ]';
								} else {
									oValue.innerHTML = '"'+entity( convertUnicode(String(mData)) )+'"';
								}
							} else {
								if (isUrl(mData)) { 

									//oValue = document.createElement('A');
									//oValue.href="#";
									addClass(oLI, 'type_object');
									addClass(oLI, 'type_url');
									var evalValue = false,
										prop = false,
										prop1 = property + '_['+'action'+']',
										prop2 = property + '_['+'tree'+']',
										props = [];
									
									if ( (typeof data[prop1] == 'object') ) {
										evalValue = data[prop1];
										prop = 'action';
										props = String(prop1).match(/_[(w+)]/ig);
									} else if ( (typeof data[prop2] == 'object') ) {
										evalValue = data[prop2];
										prop = 'tree';
										props = String(prop2).match(/_[(w+)]/ig);
									}
									if ( prop && evalValue) {
										addClass(oLI, 'type_object');
										oValue.innerHTML = '<span>"'+convertUnicode(String(mData))+'"</span> <a class="'+prop+'" href="#">[object '+capitalize(prop)+']</a> <a class="gl link" target="_blank" href="'+convertUnicode(String(mData))+'"><span></span></a>';								
										oDataContainer = document.createElement('DIV');
										addClass(oDataContainer, 'dataContainer');
										addClass(oLI, 'type_object');
										if ( !((mData instanceof HTMLElement) && (mData.id == "debugDataDisplay")) ) {
											//
											// TODO:
											// korrekt [Action] paths
											//
											
											//var pathReplace = '["'+property+'_['+prop+']"]';
											//var propertyPath = path.replace(property, pathReplace).replace('.'+property, pathReplace);
											
											var _regex = new RegExp( /.\["([a-zA-Z]*)_\[([a-zA-Z]*)\]"\]/ig ) ;
											if ( (typeof String(path).test == 'function') && String(path).test(_regex) ) {
												path = String(path).replace( _regex , '["$1_[$2]"]');
											}
											debugDataDisplayShow(oDataContainer, evalValue, /*String(path+'_'+capitalize(prop))*/ path, (level+1));
										}
									} else {
										oValue.innerHTML = '<span>"'+convertUnicode(String(mData))+'"</span><a class="gl link" target="_blank" href="'+convertUnicode(String(mData))+'"><span></span></a>';								
									}
									
								} else {
									try {
										var _regex = new RegExp( /.\["([a-zA-Z]*)_\[([a-zA-Z]*)\]"\]/ig ) ;
										/*if ( path.indexOf("zumWarenkorb") > -1) {
											console.debug( property );
											console.debug( evalCmd );
											console.debug( _regex.test(path) );
											console.debug( String(path).replace( _regex , '["$1_[$2]"]') );
										}*/
										if ( String(path).test(_regex) ) {
											path = String(path).replace( _regex , '["$1_[$2]"]');
										}
										var evalCmd = 'window["'+settings.name+'"].debugdata().'+String(path);
										if ( path.charAt(0) == "[" ) {
											evalCmd = 'window["'+settings.name+'"].debugdata()'+String(path);
										}
										//var evalValue = eval( 'window["'+settings.name+'"].debugdata().'+String(path)); //.replace(/_[(w+)]/ig, '__$1_');
										var evalValue = eval( evalCmd );
										if ( !((evalValue instanceof Object) && (evalValue instanceof Array)) ) {
											oValue.innerHTML = '"'+entity( convertUnicode(String(mData)) )+'"';
										} else {
											var sName = evalValue.constructor.name;
											if (sName && (sName != "")) {
												oValue.innerHTML = '[object '+sName+']';
											}
											oDataContainer = document.createElement('DIV');
											addClass(oDataContainer, 'dataContainer');
											addClass(oLI, 'type_object');
											if ( !((mData instanceof HTMLElement) && (mData.id == "debugDataDisplay")) ) {
												debugDataDisplayShow(oDataContainer, evalValue, String(path)+'.', (level+1));
											}
										}
									} catch (exception4) {
										//console.debug(exception4);
										oValue.innerHTML = '"'+entity( convertUnicode(String(mData)) )+'"';
									}
								}
							}
						} else {
							oValue.innerHTML = truncateFunctionCode( String(mData.toString()) );
						}
					}

					setPathTitle( oKey, String(path) );
					if ( path != '' ) {
						oKey['data-path'] = path;
					}
					
					oValue.title = aDescr.join("\n");
					
					oLI.appendChild(oKey);
					oLI.appendChild(oValue);
					if (oDataContainer) { oLI.appendChild(oDataContainer); }
					oUL.appendChild(oLI);
					
				}
				if (typeof rootelement.appendChild == 'function') {
					rootelement.appendChild(oUL);
				}
			//} else {
				//
				// if "data" is NOT an object.... !!!!
			//}
				
				
			var aObjects = document.getElementsByClassName('type_object'),
				aArrays = document.getElementsByClassName('type_array'),
				aContainers = document.getElementsByClassName('dataContainer'),
				aAllreadyExpanded = document.getElementsByClassName('opened');
			for (con in aContainers) {
				if ( (con > -1) && aContainers[con].style ) {
					aContainers[con].style.display = 'none';
				}
			}

			for (link in aAllreadyExpanded) {
				debugMsg('sub-panel link:', aAllreadyExpanded[link], aAllreadyExpanded[link].nextSibling);
				if (aAllreadyExpanded[link].nextSibling && aAllreadyExpanded[link].nextSibling.style) {
					aAllreadyExpanded[link].nextSibling.style.display = 'block';
				}
			}
			/**/
			
			initEvents();
			return (this);
		};
		
		/**
		 * create/build DebugDisplay panels
		 * 
		 * @returns	DebugDisplay
		 */
		var createDebugDataDisplayPanel = function ( ) {
			if (!document.getElementById('debugDataDisplay')) {
				var sPANEL = [
				    '<div class="opener">',
				    	'<a id="debugDataDisplay_open" class="gl open" href="#" title="open debug display">', 
					    	'<span>', '</span>', 
				    	'</a>',
				    	'<a id="debugDataDisplay_close_" class="gl close" href="#" title="close debug display">', 
					    	'<span>', '</span>', 
				    	'</a>',
				    '</div>',
				    '<div class="menu panel" id="debugDataDisplayMenu">',
				    
			    		'<a id="debugDataDisplay_close" class="gl close" href="#" title="close debug display">', 
			    			'<span>', '</span>', 
			    		'</a>',

			    		'<span class="seperator search">', '</span>',
			    		
				    	'<a id="debugDataDisplay_search" class="gl search" href="#" title=" debug / evaluate / search ">', 
				    		'<span>', '</span>', 
				    	'</a>',
						'<span id="debugDataDisplaySearch" class="search searchinput">', 
							'<input type="text" class="" id="debugDataDisplaySearchInput" name="" value="" placeholder=" debug / evaluate / search" />', 
						'</span>',
				    	'<a id="debugDataDisplay_searchreset" class="gl search searchreset" href="#" title="reset search input">', 
				    		'<span>', '</span>', 
				    	'</a>',

				    	'<span class="seperator levelup">', '</span>',
				    	
				    	'<a id="debugDataDisplay_levelup" class="gl levelup" href="#" title="level up">', 
				    		'<span>', '</span>', 
				    	'</a>',

				    	'<span class="seperator refresh">', '</span>',
				    	
				    	'<a id="debugDataDisplay_refresh" class="gl refresh" href="#" title="refresh display">', 
				    		'<span>', '</span>', 
				    	'</a>',

				    	'<span class="seperator history">', '</span>',
				    	
				    	'<a id="debugDataDisplay_historyprevious" class="gl history historyprevious" href="#" title="previous history item">', 
				    		'<span>', '</span>', 
				    	'</a>',
				    	'<a id="debugDataDisplay_historynext" class="gl history historynext" href="#" title="next history item">', 
				    		'<span>', '</span>', 
				    	'</a>',
				    	
				    	'<span class="seperator expand">', '</span>',
				    	
				    	'<a id="debugDataDisplay_expandall" class="gl expand expandall" href="#" title="expand all items">', 
				    		'<span>', '</span>', 
				    	'</a>',
				    	'<a id="debugDataDisplay_collapseall" class="gl expand collapseall" href="#" title="collapse all items">', 
				    		'<span>', '</span>', 
				    	'</a>',
				    	
				    	'<span class="seperator fontsize">', '</span>',
			    	
				    	'<a id="debugDataDisplay_fontsize_increase" class="gl fontsize increase" href="#" title="increase font size">', 
				    		'<span>', '</span>', 
				    	'</a>',
				    	'<a id="debugDataDisplay_fontsize_reset" class="gl fontsize reset" href="#" title="reset font size">', 
				    		'<span>', '</span>', 
				    	'</a>',
				    	'<a id="debugDataDisplay_fontsize_decrease" class="gl fontsize decrease" href="#" title="decrease font size">', 
				    		'<span>', '</span>', 
				    	'</a>',

				    	'<span class="seperator settings">', '</span>',
				    	
				    	'<a id="debugDataDisplay_settings" class="gl settings" href="#" title="debugDisplay settings">', 
				    		'<span>', '</span>', 
				    	'</a>',

				    	'<span class="seperator help">', '</span>',
				    	
				    	'<a id="debugDataDisplay_help" class="gl help" href="#" title="help">', 
				    		'<span>', '</span>', 
				    	'</a>',
					    '<div class="panel" id="debugDataDisplaySettings">',
						    '<div class="panelContent">',
						    	'<form id="debugDataDisplaySettingsForm" name="debugSettingsForm" action="#">',
						    		'<ul>',
				    					'<li>',
				    						'<label>','<span class="label">maximum display depth</span>','<input class="debugDisplaySettingValue" type="text" size="4" name="displayDepthMax" value="" />','</label>',
				    					'</li>',
				    					'<li>',
				    						'<label>','<span class="label">be verbose (to console)</span>','<input class="debugDisplaySettingValue" type="checkbox" name="debug" value="1" />','</label>',
				    					'</li>',
					    			'</ul>',
						    		'<ul>',
				    					'<li>',
				    						'<label>','<span class="label">initial font-size</span>','<input class="debugDisplaySettingValue" type="text" size="4" name="fontsize" value="" />','</label>',
				    					'</li>',
				    					'<li>',
				    						'<label>','<span class="label">minimum font-size</span>','<input class="debugDisplaySettingValue" type="text" size="4" name="fontsizeMin" value="" />','</label>',
				    					'</li>',
				    					'<li>',
				    						'<label>','<span class="label">maximum font-size</span>','<input class="debugDisplaySettingValue" type="text" size="4" name="fontsizeMax" value="" />','</label>',
				    					'</li>',
					    			'</ul>',
						    		'<ul>',
				    					'<li>',
				    						'<label>','<span class="label">enable search</span>','<input class="debugDisplaySettingValue" type="checkbox" name="searchEnabled" value="1" />','</label>',
				    					'</li>',
				    					'<li>',
				    						'<label>','<span class="label">search in keys</span>','<input class="debugDisplaySettingValue" type="checkbox" name="searchKeys" value="1" />','</label>',
				    					'</li>',
				    					'<li>',
				    						'<label>','<span class="label">search in paths</span>','<input class="debugDisplaySettingValue" type="checkbox" name="searchPaths" value="1" />','</label>',
				    					'</li>',
				    					'<li>',
				    						'<label>','<span class="label">search in values</span>','<input class="debugDisplaySettingValue" type="checkbox" name="searchValues" value="1" />','</label>',
				    					'</li>',
				    					'<li>',
				    						'<label>','<span class="label">minimum query length to start search</span>','<input class="debugDisplaySettingValue" type="text" size="4" name="searchMinChar" value="" />','</label>',
				    					'</li>',
				    					'<li>',
				    						'<label>','<span class="label">enable property debugDataDisplaySuggest</span>','<input class="debugDisplaySettingValue" type="checkbox" name="enabledebugDataDisplaySuggest" value="1" disabled="disabled" />','</label>',
				    					'</li>',
				    					'<li>',
				    						'<label>','<span class="label">minimum query length to show debugDataDisplaySuggest</span>','<input class="debugDisplaySettingValue" type="text" size="4" name="debugDataDisplaySuggestMinChar" value="" disabled="disabled" />','</label>',
				    					'</li>',
					    			'</ul>',
					    			'<ul>',
					    				'<li>',
					    					'<label>','<span class="label">show searchbar</span>','<input class="debugDisplaySettingValue" type="checkbox" name="showSearch" value="1" />','</label>',
					    				'</li>',
					    				'<li>',
				    						'<label>','<span class="label">show level up</span>','<input class="debugDisplaySettingValue" type="checkbox" name="showLevelUp" value="1" />','</label>',
				    					'</li>',
				    					'<li>',
			    							'<label>','<span class="label">show refresh</span>','<input class="debugDisplaySettingValue" type="checkbox" name="showRefresh" value="1" />','</label>',
			    						'</li>',
				    					'<li>',
				    						'<label>','<span class="label">show history</span>','<input class="debugDisplaySettingValue" type="checkbox" name="showHistory" value="1" />','</label>',
				    					'</li>',
					    				'<li>',
					    					'<label>','<span class="label">show expand/collapse</span>','<input class="debugDisplaySettingValue" type="checkbox" name="showExpand" value="1" />','</label>',
					    				'</li>',
					    				'<li>',
				    						'<label>','<span class="label">show formater</span>','<input class="debugDisplaySettingValue" type="checkbox" name="showFormat" value="1" />','</label>',
				    					'</li>',
				    					'<li>',
			    							'<label>','<span class="label">show settings</span>','<input class="debugDisplaySettingValue" type="checkbox" name="showSettings" value="1" disabled="disabled" />','</label>',
			    						'</li>',
				    					'<li>',
				    						'<label>','<span class="label">show help</span>','<input class="debugDisplaySettingValue" type="checkbox" name="showHelp" value="1" disabled="disabled" />','</label>',
				    					'</li>',
					    			'</ul>',
						    	'</form>',
							    '<div class="panel settingsActions">',
							    
							    	'<a id="debugDataDisplay_restoredefaults" class="gl restoredefaults" href="#" title="restore default settings">', 
							    		'<span>', '</span>', 
							    	'</a>',
							    	
							    	'<span class="seperator">', '</span>',
					    	
					    			'<a id="debugDataDisplay_removecookie" class="gl removecookie" href="#" title="remove settings cookie">', 
							    		'<span>', '</span>', 
							    	'</a>',
							    	
							    	'<span class="seperator">', '</span>',
					    	
							    	'<a id="debugDataDisplay_savecookie" class="gl savecookie" href="#" title="save settings to cookie">', 
							    		'<span>', '</span>', 
							    	'</a>',
							    	
							    	'<span class="seperator">', '</span>',
							    	
							    	'<a id="debugDataDisplay_apply" class="gl apply" href="#" title="apply settings">', 
							    		'<span>', '</span>', 
							    	'</a>',
		
							    	'<span class="seperator">', '</span>',
							    	
							    '</div>',
						    '</div>',
						'</div>',
					    '<div class="panel" id="debugDataDisplayHelp">',
					    	'<div class="panelContent">',
				    			'<h3>DebugDisplay</h3>',
				    			'<p>JSON data and JavaScript evaluation</p>',
				    			'<h4>Info :</h4>',
				    			'<p>This is a simple display widget for JSON data, simple JavaScript object debugging and JavaScript expression evaluation.</p>',
				    			'<h4>Features</h4>',
				    			'<p>this widget currently supports the following features:</p>',
				    			'<ul>',
		    						'<li>','colorized type highlighting','</li>',
		    						'<li>','object\'s/property\'s path and extended type info','</li>',
				    				'<li>','expandable/collapsable deep object and array items','</li>',
				    				'<li>','object &quot;browsing&quot;','</li>',
				    				'<li>','debugging/browsing history','</li>',
				    				'<li>','adjustable font-size','</li>',
				    				'<li>','memorized widget settings','</li>',
				    			'</ul>',
				    			'<p>some additional specifications apply to this widget:</p>',
				    			'<ul>',
	    							'<li>','easy to use and configurable interface','</li>',
	    							'<li>','no (JavaScript) framework required','</li>',
		    						'<li>','compatible with modern A-grade browsers, including IE8+, FF27+, Chrome25+, Safari5+, Opera12+','</li>',
				    				'<li>','when debugging DOM element objects, &quot;displayDepthMax&quot; should not exceed 3 levels due to browser\'s resource restrictions, use object browsing to navigate items and properties','</li>',
				    			'</ul>',
				    			'<h4>Legend</h4>',
				    			'<p>data panel type highlighting:</p>',
				    			'<ul class="legend">',
			    					'<li>','[<span class="null">val</span>] &quot;null&quot; value, unable to determine type','</li>',
		    						'<li>','[<span class="bool">val</span>] boolean value','</li>',
		    						'<li>','[<span class="num">val</span>] numeric value','</li>',
				    				'<li>','[<span class="str">val</span>] string type value','</li>',
				    				'<li>','[<span class="arr">val</span>] array type value','</li>',
				    				'<li>','[<span class="obj">val</span>] object type value','</li>',
				    				'<li>','[<span class="func">val</span>] function or object method','</li>',
				    			'</ul>',
				    			'<p>data panel actions:</p>',
				    			'<ul class="legend">',
			    					'<li>','[ <span class="icon link"></span> ] open (detected) URL in new window/tab','</li>',
		    						'<li>','[ <span class="icon expand"></span> / <span class="icon collapse"></span> ] expand/collapse sub-panels for array items and object properties','</li>',
		    						'<li>','[ <span class="icon key">index/property : </span> ] double-click to select item for (direct) debugging, use &quot;level up&quot; and &quot;history&quot; to navigate, hover to view item\'s access path information','</li>',
				    				'<li>','[ <span class="icon value">"val"</span> ] hover to view value\'s extended type information','</li>',
				    			'</ul>',
				    			'<p>menu panel actions:</p>',
				    			'<ul class="legend">',
			    					'<li>','[ <span class="icon open"></span> / <span class="icon close"></span> ] toggle DebugDisplay main panel','</li>',
		    						'<li>','[ <span class="icon search"></span> ] start debugging initial data set or item from query input','</li>',
		    						'<li>','[ <span class="icon reset"></span> ] reset debugging to initial data set','</li>',
				    				'<li>','[ <span class="icon levelup"></span> ] browse/navigate one level up in data hierachy','</li>',
				    				'<li>','[ <span class="icon refresh"></span> ] refresh current data display','</li>',
				    				'<li>','[ <span class="icon historyprev"></span> / <span class="icon historynext"></span> ] navigate debugging item history','</li>',
				    				'<li>','[ <span class="icon expand"></span> / <span class="icon collapse"></span> ] expand/collapse all object properties and array items','</li>',
				    				'<li>','[ <span class="icon format inc"></span> / <span class="icon format res"></span> / <span class="icon format dec"></span> ] increase, reset and decrease data display font-size','</li>',
				    				'<li>','[ <span class="icon settings"></span> ] open/close settings panel','</li>',
				    				'<li>','[ <span class="icon help"></span> ] open/close help/info panel','</li>',
				    			'</ul>',
				    			'<p>configuration panel actions:</p>',
				    			'<ul class="legend">',
				    				'<li>','[ <span class="icon apply"></span> ] apply settings to widget and data display','</li>',
				    				'<li>','[ <span class="icon savecookie"></span> ] store current settings in (domain-based) (browser) cookie','</li>',
				    				'<li>','[ <span class="icon removecookie"></span> ] remove entire settings cookie','</li>',
				    				'<li>','[ <span class="icon restoredefaults"></span> ] restore default settings','</li>',
				    			'</ul>',
				    			'<h4>Disclaimer</h4>',
				    			'<p>Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:</p>',
				    			'<p>1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.</p>',
				    			'<p>2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.</p>',
				    			'<p>3. The name of the author may not be used to endorse or promote products derived from this software without specific prior written permission.</p>',
				    			'<p>This software is provided by the author "as is" and any express or implied warranties, including, but not limited to, the implied warranties of merchantability and fitness for a particular purpose are disclaimed. In no event shall the author be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of the use of this software, even if advised of the possibility of such damage.</p>',
				    			'<p>@package	: DebugDisplay<br />',
				    				'@author		: Bj&ouml;rn Bartels &lt;bartels@bjoernbartels.earth&gt;, [bjoernbartels.earth] &lt;info@bjoernbartels.earth&gt;<br />',
				    				//'@author		: Bj&ouml;rn Bartels &lt;bb@p-ad.de&gt;, P.AD. Werbeagentur GmbH &lt;info@p-ad.de&gt;</p>',
				    			'<p>@copyright	: &copy; 2014, [bjoernbartels.earth] &lt;info@bjoernbartels.earth&gt;. All rights reserved.<br />',
			    					'@license	: BSD License</p>',
			    				'<p>@modified	: 04/2014<br />',
		    						'@created	: 03/2014<br />',
		    						'@version	: 1.0.0</p>',
					    	'</div>',
					    '</div>',

				    '</div>',
				    '<div class="panel dataContainer" id="debugDataDisplayPanel">',
				    '</div>',
				    '<div id="debugDataDisplaydebugDataDisplaySuggestTarget">','</div>',
				    '<div id="debugDataDisplayActivity">','</div>'
				],
				oPanel = document.createElement('DIV');
				oPanel.id = "debugDataDisplay";
				addClass(oPanel, 'debugDataDisplayContainer');
				oPanel.innerHTML = sPANEL.join("");
				document.getElementsByTagName('BODY')[0].appendChild(oPanel);
			}
			if (!document.getElementById('debugDataDisplay')) {
				throw "no display panel found";
			}
			
			fillSettingsForm();
			initEvents();
			initDisplayEvents();
			debugDataDisplayActivityHide();
			if ( (settings.searchEnabled === true) || (settings.debugDataDisplaySuggestEnabled === true) ) {
				initdebugDataDisplaySuggestSearch();
			}
			return (this);
		};

		
		// DebugDisplay DOM events
		
		/**
		 * initialize data items DOM events
		 * 
		 * @returns	DebugDisplay
		 */
		var initEvents = function ( rootelement ) {
			if ( !(rootelement instanceof HTMLElement)) {
				rootelement = document;
			}
			var aObjects = rootelement.getElementsByClassName('type_object'),
				aArrays = rootelement.getElementsByClassName('type_array'),
				aKeys = rootelement.getElementsByClassName('key'),
				aContainers = rootelement.getElementsByClassName('dataContainer'),
				aAllreadyExpanded = rootelement.getElementsByClassName('opened');
			// hide all (sub) data displays
			for (con in aContainers) {
				if ( (con > -1) && aContainers[con].style ) {
					aContainers[con].style.display = 'none';
				}
			}
			for (link in aAllreadyExpanded) {
				if ((aAllreadyExpanded[link] instanceof HTMLElement) && aAllreadyExpanded[link].nextSibling && aAllreadyExpanded[link].nextSibling.style) {
					aAllreadyExpanded[link].nextSibling.style.display = 'block';
				}
			}
			
			// expand/collapse object items
			for (li in aObjects) {
				if (aObjects[li].children && aObjects[li].children[1] && aObjects[li].children[2]) {
					if (!aObjects[li].children[1].hasDebugEvent) {
						addEvent(aObjects[li].children[1], 'click', function (oEvent) {
							if (this.nextSibling && (this.nextSibling.innerHTML != '')) {
								toggleVisibility(this.nextSibling);
							} else {
								debugMsg(
									'create new object sub-display:', 
									this.previousSibling['data-path'], 
									this.previousSibling, 
									this.nextSibling,
									eval('window["'+settings.name+'"].debugdata().'+this.previousSibling['data-path'])
								);
								var oDataContainer;
								if (this.nextSibling) {
									this.parentElement.removeChild(this.nextSibling);
								}
								var mData = eval('window["'+settings.name+'"].debugdata().'+this.previousSibling['data-path']);
								if ( !((mData instanceof HTMLElement) && (mData.id == "debugDataDisplay")) ) {
									oDataContainer = document.createElement('DIV');
									addClass(oDataContainer, 'dataContainer');
									debugDataDisplayShow(
											oDataContainer,
											mData,
											this.previousSibling['data-path'],
											settings.displayDepthMax-1
									);
									this.parentElement.appendChild(oDataContainer);
									initEvents(oDataContainer);
									oDataContainer.style.display = 'block';
									document.getElementById('debugDataDisplayPanel').style.display = 'block';
								}
							}
							toggleClass(this, 'opened', 'closed');
							if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
							if (oEvent.preventDefault) { oEvent.preventDefault(); } 
							return (false);
						});
						aObjects[li].children[1].hasDebugEvent = true;
					}
				}
			}
			
			// expand/collapse array items
			for (li in aArrays) {
				if (aArrays[li].children && aArrays[li].children[1] && aArrays[li].children[2]) {
					if (!aArrays[li].children[1].hasDebugEvent) {
						addEvent(aArrays[li].children[1], 'click', function (oEvent) {
							//toggleVisibility(this.nextSibling);
							if (this.nextSibling && (this.nextSibling.innerHTML != '')) {
								toggleVisibility(this.nextSibling);
							} else {
								debugMsg(
									'create new array sub-display:', 
									this.previousSibling['data-path'], 
									this.previousSibling, 
									this.nextSibling,
									eval('window["'+settings.name+'"].debugdata().'+this.previousSibling['data-path'])
								);
								var oDataContainer;
								if (this.nextSibling) {
									this.parentElement.removeChild(this.nextSibling);
								}
								var mData = eval('window["'+settings.name+'"].debugdata().'+this.previousSibling['data-path']);
								if ( !((mData instanceof HTMLElement) && (mData.id == "debugDataDisplay")) ) {
									oDataContainer = document.createElement('DIV');
									addClass(oDataContainer, 'dataContainer');
									debugDataDisplayShow(
											oDataContainer,
											mData,
											this.previousSibling['data-path'],
											settings.displayDepthMax-1
									);
									this.parentElement.appendChild(oDataContainer);
									initEvents(oDataContainer);
									oDataContainer.style.display = 'block';
									document.getElementById('debugDataDisplayPanel').style.display = 'block';
								}
							}
							
							toggleClass(this, 'opened', 'closed');
							if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
							if (oEvent.preventDefault) { oEvent.preventDefault(); } 
							return (false);
						});
					}
					aArrays[li].children[1].hasDebugEvent = true;
				}
			}
			
			// select path/key on double-click
			for (li in aKeys) {
				if (!aKeys[li].hasDebugEvent) {
					addEvent(aKeys[li], 'dblclick', function (oEvent) {
						document.getElementById('debugDataDisplaySearchInput').value = this['data-path'];
						debugDataDisplayActivityShow();
						debugDataDisplaySearch( document.getElementById('debugDataDisplaySearchInput').value );
						historyTruncate();
						historyAdd(document.getElementById('debugDataDisplaySearchInput').value);
						debugDataDisplayActivityHide();
						if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
						if (oEvent.preventDefault) { oEvent.preventDefault(); } 
						return (false);
					});
					aKeys[li].hasDebugEvent = true;
				}
			}
			return (this);
		};
		
		
		/**
		 * initialize DebugDisplay manu panel events
		 * 
		 * @returns	DebugDisplay
		 */
		var initDisplayEvents = function ( ) {
			toggleVisibility(document.getElementById('debugDataDisplay_close'));
			toggleVisibility(document.getElementById('debugDataDisplayHelp'));
			toggleVisibility(document.getElementById('debugDataDisplaySettings'));
			toggleVisibility(document.getElementById('debugDataDisplayMenu'));
			toggleDataDisplay(document.getElementById('debugDataDisplay'));
			
			// opener
			addEvent(document.getElementById('debugDataDisplay_open'), 'click', function (oEvent) {
				toggleVisibility(document.getElementById('debugDataDisplay_open'));
				toggleVisibility(document.getElementById('debugDataDisplay_close'));
				toggleVisibility(document.getElementById('debugDataDisplayPanel'));
				toggleVisibility(document.getElementById('debugDataDisplayMenu'));
				toggleDataDisplay(document.getElementById('debugDataDisplay'));
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			addEvent(document.getElementById('debugDataDisplay_close'), 'click', function (oEvent) {
				toggleVisibility(document.getElementById('debugDataDisplay_open'));
				toggleVisibility(document.getElementById('debugDataDisplay_close'));
				toggleVisibility(document.getElementById('debugDataDisplayPanel'));
				toggleVisibility(document.getElementById('debugDataDisplayMenu'));
				toggleDataDisplay(document.getElementById('debugDataDisplay'));
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
				
			});
			
			// collapse/expand
			addEvent(document.getElementById('debugDataDisplay_expandall'), 'click', function (oEvent) {
				debugDataDisplayExpandAll();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			addEvent(document.getElementById('debugDataDisplay_collapseall'), 'click', function (oEvent) {
				debugDataDisplayCollapseAll();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			
			// search
			addEvent(document.getElementById('debugDataDisplay_search'), 'click', function (oEvent) {
				debugDataDisplayActivityShow();
				debugDataDisplaySearch( document.getElementById('debugDataDisplaySearchInput').value );
				historyTruncate();
				historyAdd(document.getElementById('debugDataDisplaySearchInput').value);
				debugDataDisplayActivityHide();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			addEvent(document.getElementById('debugDataDisplaySearchInput'), 'keyup', function (oEvent) {
				if (oEvent.keyCode == 13) {
					debugDataDisplayActivityShow();
					debugDataDisplaySearch( document.getElementById('debugDataDisplaySearchInput').value );
					historyTruncate();
					historyAdd(document.getElementById('debugDataDisplaySearchInput').value);
					debugDataDisplayActivityHide();
					if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
					if (oEvent.preventDefault) { oEvent.preventDefault(); } 
					return (false);
				} else if (document.getElementById('debugDataDisplaySearchInput').value == '') {
					debugDataDisplayActivityShow();
					debugDataDisplaySearch();
					historyTruncate();
					historyAdd('');
					debugDataDisplayActivityHide();
					if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
					if (oEvent.preventDefault) { oEvent.preventDefault(); } 
					return (false);
				}
			});
			addEvent(document.getElementById('debugDataDisplay_searchreset'), 'click', function (oEvent) {
				debugDataDisplayActivityShow();
				document.getElementById('debugDataDisplaySearchInput').value = '';
				debugDataDisplaySearch();
				historyTruncate();
				historyAdd('');
				debugDataDisplayActivityHide();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			
			// level up
			addEvent(document.getElementById('debugDataDisplay_levelup'), 'click', function (oEvent) {
				debugDataDisplayActivityShow();
				var query = document.getElementById('debugDataDisplaySearchInput').value;
				if (query != '') {
					document.getElementById('debugDataDisplaySearchInput').value = levelUp(query);
					debugDataDisplaySearch( document.getElementById('debugDataDisplaySearchInput').value );
					historyAdd(document.getElementById('debugDataDisplaySearchInput').value);
				}
				debugDataDisplayActivityHide();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});

			// refresh
			addEvent(document.getElementById('debugDataDisplay_refresh'), 'click', function (oEvent) {
				debugDataDisplayActivityShow();
				var query = document.getElementById('debugDataDisplaySearchInput').value;
				debugDataDisplaySearch( query );
				debugDataDisplayActivityHide();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});

			// history
			addEvent(document.getElementById('debugDataDisplay_historyprevious'), 'click', function (oEvent) {
				debugDataDisplayActivityShow();
				var query = historyGo(-1);
				if (typeof query != 'undefined') {
					document.getElementById('debugDataDisplaySearchInput').value = query;
					debugDataDisplaySearch( query );
				}
				debugDataDisplayActivityHide();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			addEvent(document.getElementById('debugDataDisplay_historynext'), 'click', function (oEvent) {
				debugDataDisplayActivityShow();
				var query = historyGo(+1);
				if (typeof query != 'undefined') {
					document.getElementById('debugDataDisplaySearchInput').value = query;
					debugDataDisplaySearch( query );
				}
				debugDataDisplayActivityHide();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});

			// history
			addEvent(document.getElementById('debugDataDisplay_historyprevious'), 'mouseover', function (oEvent) {
				if ( (_HISTORY_.length > 0) && ((_HISTORY_INDEX_-1) > 0) ) {
					this.title = 'previous history item: '+(_HISTORY_INDEX_-1)+'/'+_HISTORY_.length;
				} else {
					this.title = 'previous history item';
				}
			});

			// history
			addEvent(document.getElementById('debugDataDisplay_historynext'), 'mouseover', function (oEvent) {
				if ( (_HISTORY_.length >= (_HISTORY_INDEX_+1)) ) {
					this.title = 'next history item: '+(_HISTORY_INDEX_+1)+'/'+_HISTORY_.length;
				} else {
					this.title = 'next history item';
				}
			});

			// font size
			addEvent(document.getElementById('debugDataDisplay_fontsize_increase'), 'click', function (oEvent) {
				var iSize = parseInt(document.getElementById('debugDataDisplayPanel').style.fontSize);
				setFontsize(iSize+1);
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			addEvent(document.getElementById('debugDataDisplay_fontsize_decrease'), 'click', function (oEvent) {
				var iSize = parseInt(document.getElementById('debugDataDisplayPanel').style.fontSize);
				setFontsize(iSize-1);
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			addEvent(document.getElementById('debugDataDisplay_fontsize_reset'), 'click', function (oEvent) {
				setFontsize();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			
			// settings
			addEvent(document.getElementById('debugDataDisplay_settings'), 'click', function (oEvent) {
				if (document.getElementById('debugDataDisplayHelp').style.display != 'none') {
					document.getElementById('debugDataDisplayHelp').style.display = 'none';
				}
				if (document.getElementById('debugDataDisplaySettings').style.display != 'block') {
					document.getElementById('debugDataDisplaySettings').style.display = 'block';
				} else {
					document.getElementById('debugDataDisplaySettings').style.display = 'none';
				}
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			
			// help
			addEvent(document.getElementById('debugDataDisplay_help'), 'click', function (oEvent) {
				if (document.getElementById('debugDataDisplaySettings').style.display != 'none') {
					document.getElementById('debugDataDisplaySettings').style.display = 'none';
				}
				if (document.getElementById('debugDataDisplayHelp').style.display != 'block') {
					document.getElementById('debugDataDisplayHelp').style.display = 'block';
				} else {
					document.getElementById('debugDataDisplayHelp').style.display = 'none';
				}
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});
			
			// apply settings
			addEvent(document.getElementById('debugDataDisplay_apply'), 'click', function (oEvent) {
				debugDataDisplayActivityShow();
				var options = getSettingsFormValues();
				setOptions(options);
				applyOptions();
				var query = document.getElementById('debugDataDisplaySearchInput').value;
				debugDataDisplaySearch( query );
				debugDataDisplayActivityHide();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});

			// restore default settings
			addEvent(document.getElementById('debugDataDisplay_restoredefaults'), 'click', function (oEvent) {
				debugDataDisplayActivityShow();
				setOptions(_DEFAULTS_);
				fillSettingsForm(_DEFAULTS_);
				applyOptions();
				var query = document.getElementById('debugDataDisplaySearchInput').value;
				debugDataDisplaySearch( query );
				debugDataDisplayActivityHide();
				if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
				if (oEvent.preventDefault) { oEvent.preventDefault(); } 
				return (false);
			});

			if (testCookiesEnabled()) {
				// save settings to cookie
				addEvent(document.getElementById('debugDataDisplay_savecookie'), 'click', function (oEvent) {
					var options = getSettingsFormValues();
					setOptions(options);
					saveOptions(options);
					if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
					if (oEvent.preventDefault) { oEvent.preventDefault(); } 
					return (false);
				});
				// remove settings cookie
				addEvent(document.getElementById('debugDataDisplay_removecookie'), 'click', function (oEvent) {
					eraseCookie('DebugDisplay');
					if (oEvent.stopPropagation) { oEvent.stopPropagation(); } 
					if (oEvent.preventDefault) { oEvent.preventDefault(); } 
					return (false);
				});
			} else {
				document.getElementById('debugDataDisplay_savecookie').style.display = 'none';
				document.getElementById('debugDataDisplay_savecookie').nextSibling.style.display = 'none';
				document.getElementById('debugDataDisplay_removecookie').style.display = 'none';
				document.getElementById('debugDataDisplay_removecookie').nextSibling.style.display = 'none';
			}

			return (this);
		};
		
		
		// debugDataDisplaySuggest/search
		
		// listener containers
		var debugDataDisplaySuggest_loadTableListObserver;
		var debugDataDisplaySuggest_loadTableListEventElement;

		var debugDataDisplaySuggestIsInitialized = false;
		
		function debugDataDisplaySuggestSearch (input, conf) {
			
		    // valid this reference even in subfunctions
		    var self = this;

		    // for entity conversion
		    var entity = function (str) {
		        entityElement.innerHTML = str;
		        return entityElement.innerHTML;
		    };

		    // for entity conversion
		    var entityElement = document.createElement("div");
		    
			// title of debugDataDisplaySuggestions
			var masthead = entity("debugDataDisplaySuggest hits:");
			
			// minimum amount of characters to start debugDataDisplaySuggest request
			var minCharacters = 1;
			// max amount of items to display
			var maxAmount = 99;
		    // the xmlhttprequest
		    var req = null;
		    // the input label thet the debugDataDisplaySuggest is added onto
		    var input = input;
		    // the target element where the typhoon table will be appended
			var target	= document.getElementById("debugDataDisplaydebugDataDisplaySuggestTarget");
			// the checkbox for turning debugDataDisplaySuggest off
		    var checkbox = null;
		    // the config object
		    var config = conf;
		    // the table element for debugDataDisplaySuggestions
		    var tableElement = null;
		    // selected item
		    var selected = -1;
		    // all items
		    var all = new Array();
		    // last answer
		    var lastAnswer = null;
		    //var log = new logger(0);
		    var isIE = typeof(window.ActiveXObject) != 'undefined';

		    var eventHandler = function(event) {
		    	if (!isIE) {
		        	var realEvent = getEvent(event);
		    		//window[settings.name].debugDataDisplaySuggest.handle(event);
		    		if (realEvent) {
		    			window[settings.name].debugDataDisplaySuggest_loadTableListEventElement = realEvent;
		    		}
		    		if (window[settings.name].debugDataDisplaySuggest_loadTableListObserver) clearTimeout(window[settings.name].debugDataDisplaySuggest_loadTableListObserver);
		    		var eventCmd = 'window["'+settings.name+'"].debugDataDisplaySuggest.handle(window["'+settings.name+'"].debugDataDisplaySuggest_loadTableListEventElement)';
		    		window[settings.name].debugDataDisplaySuggest_loadTableListObserver = setTimeout(eventCmd, 225);
		    		/* */
		    	} else {
		    		window[settings.name].debugDataDisplaySuggest.handle(event);
		    	}
		    	
			};
		    
		    var hidedebugDataDisplaySuggestions = function(event) {
		    	hideLayer();
		    	//window[settings.name].debugDataDisplaySuggest.hide();
		    };

		    var activeSwitcher = function(event) {
		    	window[settings.name].debugDataDisplaySuggest.switchActive();
		    };
		    var submitter = function(event) {
		    	window[settings.name].debugDataDisplaySuggest.submit(event);
		    };
		    
		    var suppressReturn = function(event) {
		        var realEvent = (window.event) ? window.event : event; 
		        if (realEvent.keyCode == 13) {
		        	if (typeof realEvent.preventDefault == 'function') { realEvent.preventDefault(); }
		        	if (typeof realEvent.stopPropagation == 'function') { realEvent.stopPropagation(); }
		        	return false;
		        }
		        
		    };
		    

		    /*
		     * wird am Anfang aufgerufen, initialisiert alles
		     */
		    var init = function () {
		        /* cookie-erkennung erstmal fuer's produktiv-deployment rausgenommen */
		        /* wenn ich cookies setzen kann, will ich die Ausblendecheckbox einfuegen 
		         * und evtl. gar nicht initialisieren, falls schon der Cookie gesetzt ist.
		         */
		        /* (testCookiesEnabled()) {
		            var cookieVal = readCookie("typhoonActive");
		            if (cookieVal == "false") {
		                insertDeactivationCB(false);
		                // checkbox einf�gen, nicht initialisieren
		            } else {
		                insertDeactivationCB(true);
		                initializeListeners();
		                createCookie("typhoonActive", "true", 365);
		                // checkbox, init
		            }
		        } else {
		            // nur initialisieren, checkbox nicht einf�gen.
		            initializeListeners();
		        }*/
		        initializeListeners();
		    };

		    var initializeListeners = function () {
		        input.setAttribute("autocomplete", "off", 0);
		        addEvent(input, "keyup", eventHandler);
		    	input.onkeypress = function(event) { var realEvent = (window.event) ? window.event : event; if (realEvent.keyCode == 13) return false; };
		        addEvent(document.getElementsByTagName("body")[0], "click", hidedebugDataDisplaySuggestions);
		    };

		    var removeListeners = function () {
		        input.removeAttribute("autocomplete");
		        removeEvent(input, "keyup", eventHandler);
		        removeEvent(document.getElementsByTagName("body")[0], "click", hidedebugDataDisplaySuggestions);
		    };

		    var insertDeactivationCB = function (checked) {
		        checkbox = createCheckbox(checked);
		        var container = document.createElement("div");
				container.className = "deactivation_cb";
		        container.appendChild(checkbox);
		        container.appendChild(document.createTextNode(" Vorschläge anzeigen"));
		        input.parentNode.appendChild(container);
		        addEvent(checkbox, "change", activeSwitcher);
		    };

		    var createNode = function (tag, content) {
		        var newEl = document.createElement(tag);
		        var newElContent = document.createTextNode(content);
		        newEl.appendChild(newElContent);
		        return newEl;
		    };

		    var createCheckbox = function (checked) {
		        var cb = document.createElement("input");
		        cb.setAttribute("type", "checkbox", 0);
		        if (checked) {
		            cb.setAttribute("checked", "checked", 0);
		            cb.checked = true;
		        }
		        return cb; 
		    };

		    var switchActive = function () {
		        var activated = checkbox.checked;
		        createCookie("typhoonActive", ((activated) ? "true" : "false"), 365);
		        if (activated) {
		            initializeListeners();
		        } else {
		            removeListeners();
		        }
		    };

		    /*
		     * initialisiert/reinitialisiert die table elemente
		     */ 
		    var createTableElement = function () {
		        var table = document.createElement("table");
		        table.setAttribute("cellpadding", "0", 0);
		        table.setAttribute("cellspacing", "0", 0);
		        if (target.id != 'typhoon_pop_bd') {
		            var pos = debugDataDisplaySuggestSearch_getPosition(input);
		            table.style.top = pos.y+"px";
		            table.style.left = pos.x+"px";
		            table.style.position = "absolute";
		        }
		        table.setAttribute("id", "debugDataDisplaySuggestcontainer", 0);
		        // Append the table to the target Element
				target.appendChild(table);
		        addEvent(table, "click", submitter);
		        return table;
		    };
		    
		    var createBodyElement = function (table) {
		        var body = document.createElement("tbody");
		        table.appendChild(body);
		        return body;
		    };

		    //browser fork
		    var getTextContentFromNode = function (element) {
		        try {
		            if (element.textContent) return element.textContent;
		        }
		        catch(e) {
		        }
		        if (element.text) return element.text;
		        var children = element.childNodes;
		        var result = "";
		        for (var i = 0; i < children.length; i++) {
		            var node = children[i];
		            if ( (node.nodeType >= 3) && (node.nodeType <= 6) ) {
		                result += node.nodeValue;
		            }
		            else if (node.nodeType == 1) {
		                result += textContent(node);
		            }
		        }
		        // Workaround for konqueror : it can't set element.textContent for some reason, while it doesn't support it... so we use element.text...
		        element.text = result;
		        return result;
		    };

		    // erzeugt ein span mit class=<tag> und inhalt des ersten tags
		    var createSpan = function (tag, xml) {
		    
		    	var max_stringlength	=	conf.max_stringlength; // 50;
		    	
		    	switch (config.mnd) {
		    		case 3:
		    			var currencySymbol = 'CHF';
		    			break;    		
		    		case 6:
		    			var currencySymbol = 'CHF';
		    			break;
		    		case 7:
		    			var currencySymbol = 'CHF';
		    			break;
		    		case 8:
		    			var currencySymbol = 'CHF';
		    			break;
		    		case 9:
		    			var currencySymbol = 'CHF';
		    			break;    		
		    		case 13:
		    			var currencySymbol = 'CHF';
		    			break;    		
		    		case 15:
		    			var currencySymbol = 'CHF';
		    			break;
		    		case 18:
		    			var currencySymbol = 'CHF';
		    			break;
		    		default:
		    			var currencySymbol = '&euro;';
		    			break;
		    	}
		    	
		        switch (tag) {
		        	case 'shop' :
		        		value = (typeof xml['attributes']['S'] != 'undefined') ? String(xml['attributes']['S']) : "";
		        	break;
		        	case 'title' :
		        		value = (typeof xml['name'] != 'undefined') ? String(xml['name']) : "";
		        	break;
		        	default:
		        		value = (typeof xml[tag] != 'undefined') ? String(xml[tag]) : "";
		        }
		        
		        // sonderfall preis
		        if (value != "" && tag == "price") {
		            while (value.length < 3) {
		                value = "0" + value;
		            }
		            if (currencySymbol == 'CHF') {
		                value = value.substring(0,value.length - 2) + "." + value.substring(value.length - 2, value.length);
		                value = currencySymbol + " " + value;
		            }
			    else {
		                value = value.substring(0,value.length - 2) + "," + value.substring(value.length - 2, value.length);
		                value = entity(currencySymbol) + " " + value;
		            }
		        }
		        // sonderfall autoren
		        if ( (value != "" && tag == "author") && (value.length > max_stringlength) ) {
		            value = value.substring(0, max_stringlength) + "...";
		            // + "&euro;"
		        }
		        // sonderfall titel
		        if ( (value != "") && (tag == "title") && (value.length > max_stringlength) ) {
		            value = value.substring(0, max_stringlength) + "...";
		            // + "&euro;"
		        }
		        // sonderfall shop
		        if ( (value != "") && (tag == "shop") ) {
		            value = capitalize(value);
		            // + "&euro;"
		        }
		        var element = createNode("span", value);
		        if ((tag == "title") || (tag == "author")) {
		            var innerHTML = element.innerHTML;
		            var sq = document.getElementsByName(config.searchElementName)[0] ;
		            if (sq) {
		            	var squery = sq.value;
		            	var bolder = '<strong>' + '$&' + '</strong>';
		        		innerHTML = String(innerHTML).replace( new RegExp(squery, 'i'), bolder );
		            }
		            element.innerHTML = innerHTML;
		        }
		        element.className = tag;
		        return element;
		    };
			
			var createTermSpan = function (tag, xml) {
		    
		    	var max_stringlength	=	conf.max_stringlength; //  50;
		    	
		        var value	= (typeof xml['name'] != 'undefined') ? String(xml['name']) : "";
		        var element	= createNode("span", value);
		        
		        var innerHTML = element.innerHTML;
		        var sq = document.getElementsByName(config.searchElementName)[0] ;
		        if (sq) {
		        	var squery = sq.value;
		        	var bolder = '<strong>' + '$&' + '</strong>';
		    		innerHTML = String(innerHTML).replace( new RegExp(squery, 'i'), bolder );
		        }
		        element.innerHTML = innerHTML;
		        element.className = tag;
		        
		        return element;
		    };


		    // erzeugt ein div mit class=<tag> und fuegt die elemente des arrays als kinder hinzu
		    var createTr = function (tag) {
		        var element = document.createElement("tr");
		        element.className = tag;
		        return element;
		    };

		    var createTd = function (tag, array) {
		        var element = document.createElement("td");
		        element.className = tag;
		        element.setAttribute("nowrap","nowrap", 0);
		        for (i = 0; i < array.length; i++) {
		            element.appendChild(array[i]);
		        }
		        return element;
		    };
		    
		    var createImg = function (xml) {
		        // var imageUrlElement = xml.getElementsByTagName("image")[0];
		        var content = ''; // getTextContentFromNode(imageUrlElement);
		        if (typeof xml['imageURL'] != 'undefined') {
		        	content = String(xml['imageURL']);
		        }
		        if ( (xml['imageURL'] != null) && (content != null) && (content != "") ) {
		            var element = document.createElement("img");
		            element.setAttribute("src", content, 0);
		            return element;
		        }
		        else {
		            return document.createElement("span");
		        }
		    };

		    var createStartSearch = function (textLeft, textRight, headerClass) {
		        var first = createTr("search");
		        var link = document.createElement("span");
		        
		        var header = document.createElement("span");
		        header.className = "typhoon-info-header";
		        header.appendChild(document.createTextNode(textLeft));		
		        link.appendChild(header);
				
		        if (textRight != "") {
					var infotext = document.createElement("span");
					infotext.className = "typhoon-info-text";
					infotext.appendChild(document.createTextNode(textRight));
					link.appendChild(infotext);
				}
				
		        var td = createTd("search", new Array(link));
		        td.setAttribute("colspan", "2", 0);
		        td.className = "typhoon-general-header";
		        if (headerClass != "") {
		        	td.className = headerClass;
		        }
		        first.appendChild(td);
		        return first;
		    };

		    var createNoResults = function () {
		        var first = createTr("noresults");
		        var msg = document.createElement("span");
		        var header = document.createElement("span");
		        header.className = "typhoon-info-header-noresults";
		        header.appendChild(document.createTextNode("Die Direktsuche ergab leider keine Ergebnisse. Auf gut Glück ..."));
		        msg.appendChild(header);
		        var td1 = createTd("noresults", new Array());
		        td1.setAttribute("width", "0%", 0);
		        var td2 = createTd("noresults", new Array(msg));
		        td2.setAttribute("colspan", "2", 0);
		        first.appendChild(td1);
		        first.appendChild(td2);
		        return first;
		    };

		    var setBooks = function (father, books) {
					// do not display more items than allowed
					var maxBooks = (books.length > maxAmount) ? maxAmount : books.length;

					if (maxBooks == 0) {
						hidedebugDataDisplaySuggestions();
					} else {
						var firstIndex = all.length;
						var idxOffset = 0;
						if (displayProductHeader) {
							all[firstIndex] = createStartSearch(masthead, "", "");
							father.appendChild(all[firstIndex]);
							addEvent(all[firstIndex], 'mouseover', function(event) { DebugDisplay.debugDataDisplaySuggest.select(firstIndex); });
							idxOffset = 1;
						}
						selected = 0;
						for (var i = 0; i < maxBooks; i++) {
							var elImg = createNode("span", "");
							elImg.className = "typhoon-image";
							elImg.appendChild(createImg(books[i]));
							var elShop		= (displayShop)		? createSpan("shop", books[i]) 			: false;
							var elTitle		= (displayTitle)	? createSpan("title", books[i]) 		: false;
							var elAuthor	= (displayAuthor)	? createSpan("author", books[i]) 		: false;
							var elPrice		= (displayPrice)	? createSpan("price", books[i]) 		: false;
							
							var trElement	= createTr("book");
							var coverTd		= (displayCover)	? createTd("cover", new Array(elImg)) 	: false;
		                    var shopTd		= (displayShop)		? createTd("shop", new Array(elShop)) 	: false;
		                    if (trElement) {
								if (displayCover) {
									trElement.appendChild(coverTd);
								}
								if (displayAuthor) {
									var titleAndAuthorTd = createTd("titleAndAuthor", new Array(elTitle, elAuthor));
								} else {
									var titleAndAuthorTd = createTd("titleAndAuthor", new Array(elTitle));
								}
								trElement.appendChild(titleAndAuthorTd);
			
								if (displayPrice) {
									var priceTd = createTd("price", new Array(elPrice));
									trElement.appendChild(priceTd);
								}
								
								if (displayShop) {
									trElement.appendChild(shopTd);
								}
			
								if (typeof books[i].attributes.id != 'undefined')	{ trElement.artikel		= (String(books[i].attributes.id) != "") ? String(books[i].attributes.id) : ""; }	// getTextContentFromNode(books[i].getElementsByTagName("articleid")[0]);
								if (typeof books[i].name != 'undefined')		{ trElement.query		= (String(books[i].name) != "") ? String(books[i].name) : ""; }		// getTextContentFromNode(books[i].getElementsByTagName("articleid")[0]);
								if (typeof books[i].attributes.S != 'undefined')	{ trElement.category	= (String(books[i].attributes.S) != "") ? String(books[i].attributes.S) : "ANY"; }	// getTextContentFromNode(books[i].getElementsByTagName("articleid")[0]);
								eval("addEvent(trElement, 'mouseover', function(event) { DebugDisplay.debugDataDisplaySuggest.select(" + (firstIndex + i + idxOffset) + "); });");
								father.appendChild(trElement);
								all[firstIndex + i + idxOffset] = trElement;
		                    }
						}
						/*if (displaySearchStart) {
							all[firstIndex + maxBooks + idxOffset ]= createStartSearch("", config.advancedSearchLabel, "typhoon-fullsearch-header");
							father.appendChild(all[firstIndex + maxBooks + idxOffset]);
							eval("addEvent(all["+(firstIndex + maxBooks + idxOffset)+"], 'mouseover', function(event) { DebugDisplay.debugDataDisplaySuggest.select(" + (firstIndex + maxBooks + idxOffset) + "); });");
						}*/
					}
					//moveSelection(0);
		    };

		    var setTerms = function (father, terms) {
					// do not display more items than allowed
					var maxTerms = (terms.length > maxAmount) ? maxAmount : terms.length;

					if (maxTerms == 0) {
						hidedebugDataDisplaySuggestions();
					} else {
						var firstIndex = all.length;
						var idxOffset = 0;
						if (displayTermHeader) {
							all[firstIndex] = createStartSearch(masttermhead, "", "typhoon-terms-header");
							father.appendChild(all[firstIndex]);
							addEvent(all[firstIndex], 'mouseover', function(event) { DebugDisplay.debugDataDisplaySuggest.select(firstIndex); });
							idxOffset = 1;
						}
						selected = 0;
						for (var i = 0; i < maxTerms; i++) {
							var elShop = {};
							if ((typeof terms[i].attributes.S == 'undefined') || (terms[i].attributes.S == '')) {
								elShop				= createNode("span", "Suche"); //  in allen Kategorien");
							} else {
								elShop				= createNode("span", "Suche in "+capitalize(String(terms[i].attributes.S)) );
							}
							elShop.className="shop";
							var elTitle				= createTermSpan("term", terms[i]);
							
							var trElement			= createTr("book");
							var titleAndAuthorTd	= createTd("titleAndAuthor", new Array(elTitle));
		                    var shopTd				= createTd("shopsearch", new Array(elShop));
		                    //titleAndAuthorTd.setAttribute("colspan", "2", 0);
							if (trElement) {
			                    trElement.appendChild(titleAndAuthorTd);
								trElement.appendChild(shopTd);
								trElement.isSearchTerm	= true;
								trElement.searchTerm	= terms[i].name;
								trElement.category		= (terms[i].attributes.S != "") ? terms[i].attributes.S : "ANY";
								
								eval("addEvent(trElement, 'mouseover', function(event) { DebugDisplay.debugDataDisplaySuggest.select(" + (firstIndex + i + idxOffset) + "); });");
								father.appendChild(trElement);
								all[firstIndex + i + idxOffset] = trElement;
							}
						}
					}
					//moveSelection(0);
		    };

		    var displaydebugDataDisplaySuggestions = function (req) {
		        var table	= createTableElement();
		        var body	= createBodyElement(table);
		        
		        var debugDataDisplaySuggestResult = ( (req != null && req.readyState && req.readyState == 4 && req.status == 200) && 
		        					  (typeof req.responseText != 'undefined') && (req.responseText != '') ) ? JSON.parse(req.responseText) : [];
		        
		        var books	= 	[];
		        var terms	= 	[];

		        for (idx in debugDataDisplaySuggestResult) {
		        	if (typeof debugDataDisplaySuggestResult[idx] != 'function') {
		            	var resultObject = debugDataDisplaySuggestResult[idx];
		            	if ( (typeof resultObject.type != 'undefined') && (resultObject.type == 'productName') ) {
		            		books.push(resultObject);
		            	} else if ( (typeof resultObject.type != 'undefined') && (resultObject.type == 'searchTerm') ) {
		            		terms.push(resultObject);
		            	}
		        	}
		        }
		        
				while (body.hasChildNodes()) {
					body.removeChild(father.firstChild);
				}
				all = new Array();
				maxSuggesstions = 0;
		        if (config.trmFrst) {
		            if (config.trmActv) {
			    		setTerms(body, terms);
			    		maxSuggesstions += terms.length;
			    	}
		            if (config.artActv) {
			    		setBooks(body, books);
			    		maxSuggesstions += books.length;
			    	}
		    	} else {
		            if (config.artActv) {
			    		setBooks(body, books);
			    		maxSuggesstions += books.length;
			    	}
		            if (config.trmActv) {
			    		setTerms(body, terms);
			    		maxSuggesstions += terms.length;
			    	}
		    	}
		        if ( displaySearchStart && ((terms.length > 0) || (books.length > 0)) ) {
		        	var idxOffset = all.length + 0;
					all[idxOffset] = createStartSearch("", config.advancedSearchLabel, "typhoon-fullsearch-header");
					all[idxOffset].isAdvancedSearch = true;
					body.appendChild(all[idxOffset]);
					eval("addEvent(all["+(idxOffset)+"], 'mouseover', function(event) { DebugDisplay.debugDataDisplaySuggest.select(" + (idxOffset) + "); });");
		        }

		        if (!tableElement || (tableElement == null)) {
		            if (debugDataDisplaySuggestResult.length > 0) {
		    	        if ( (config.trmFrst && config.trmActv) && displayTermHeader ) {
		    	            setSelection(0);
		    	        } else if ( (!config.trmFrst && config.artActv) && displayProductHeader ) {
		    	            setSelection(0);
		    	        } else {
		    	            setSelection(-1);
		    	        }
		    	        table.style.visibility = "visible";
		                tableElement = table;
		                tableElement.style.visibility = "visible";
		                target.appendChild(tableElement);
		            }
		        } else {
		        	if (debugDataDisplaySuggestResult.length > 0) {
		    	        if ( (config.trmFrst && config.trmActv) && displayTermHeader ) {
		    	            setSelection(0);
		    	        } else if ( (!config.trmFrst && config.artActv) && displayProductHeader ) {
		    	            setSelection(0);
		    	        } else {
		    	            setSelection(-1);
		    	        }
		            	replaceEntries(table);
		            } else {
		                hideLayer();
		            }
		        }
		        lastAnswer = req.responseText;
		    };

		    var clearEntries = function ( ) {
		    	if (tableElement && tableElement.firstChild) {
		    		tableElement.removeChild(tableElement.firstChild);
		    	}
		    	return (tableElement);
		    };

		    var replaceEntries = function ( table ) {
		    	if (tableElement && table) {
		    		//tableElement.replaceChild(table.firstChild, tableElement.firstChild);
		    	}
		    	return (table);
		    };

		    var insertEntries = function ( table ) {
		    	if (tableElement && table && !tableElement.firstChild && table.firstChild) {
		    		tableElement.appendChild(table.firstChild);
		    	}
		    	return (tableElement);
		    };

		    var showdebugDataDisplaySuggestions = function () {

		    	if (!isIE) { displaydebugDataDisplaySuggestions(req); } 
		        
		        if (req != null && req.readyState && req.readyState == 4) {
		            if (req.status && req.status != null && req.status == 200) {
		                if (req.responseXML != null && (tableElement == null || lastAnswer != req.responseText)) {

						    displaydebugDataDisplaySuggestions(req);

		                    req = null;
		                    
		                }
		            }
				    /*else {
				        if ((typeof console != 'undefined') && (typeof console.log == 'function')) {
				        	console.log("There was a problem retrieving the search result data:\n" + req.status + " - " + req.statusText+"");
				        }
		            }*/
		        }
		    };

		    // self is called from html
		    var getdebugDataDisplaySuggestions = function (word) {
		        if ( (word.length < settings.searchMinChar) ) {
		            /* if (tableElement && tableElement.style) {
		                tableElement.style.visibility = "hidden";
		            } */
		            hideLayer();
		            lastAnswer = null;
		            return;
		        }
		        
		        // clear and reset search area to inital 
		        // debugDataDisplaySearch( '' );
		        debugDataDisplayClear ( );
		        debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), _DATA_ );
		        
				var results = debugDataSearch( word );

			    if (results._count > 0) {
			    	debugDataDisplayClear();
			        debugDataDisplayShow(
			        	document.getElementById('debugDataDisplayPanel'),
			        	//{ word : results._all }
			        	results._all
			        );
			        historyAdd(word);
			        document.getElementById('debugDataDisplayPanel').style.display = 'block';
			        // or... displaydebugDataDisplaySuggestions(results._all)
			    }
		    };

		    var addShopFilterIfNecessary = function (word) {
		        var select = document.getElementById(config.searchgroupElementName);
		        if ( (select != null) && (select.value != 'ANY') ) {
		            var shops = select.value.split('_');
		            var i = 0;
		            var searchstring = encodeURI(word);
		            for (i = 0; i < shops.length; i++) {
		                if (i != 0) searchstring += ' OR';
		                var shopname = shops[i];
		                // spezielles handling umlaute
		                //if (shopname == 'HOERBUCH') shopname = 'H�RBUCH';
		                if (shopname == 'EBOOK') shopname = 'EBOOK';
		                if (shopname == 'ELEKTRO') shopname = 'ELEKTRONIK';
		                if (shopname == 'FILM') shopname = 'FILM';
		                if (shopname == 'SPIEL') shopname = 'SPIEL';
		                if (shopname == 'GESELLSCHAFTSSPIEL') shopname = 'GESELLSCHAFTSSPIEL';
		                searchstring += "&filterSUCHWARENGRUPPE=" + encodeURI(shopname);
		            }
		            return searchstring;
		        }
		        return word;
		    };

		    var handleEvent = function (event) {
		        var realEvent = (isIE) ? event : window[settings.name].debugDataDisplaySuggest.getEvent(event);
		        if ( realEvent && (typeof realEvent.keyCode != 'undefined') ) {
		            if ( (realEvent.keyCode == 38) || (realEvent.keyCode == 40) || (realEvent.keyCode == 13) ) {
		                switch (realEvent.keyCode) {
		                    case 38:
		                    	window[settings.name].debugDataDisplaySuggest.moveSelection(-1);
		                    	if (typeof realEvent.preventDefault == 'function') { realEvent.preventDefault(); }
		                    	if (typeof realEvent.stopPropagation == 'function') { realEvent.stopPropagation(); }
		                    	if (isIE) { return false; }
		                        return;
		                    case 40:
		                    	window[settings.name].debugDataDisplaySuggest.moveSelection(1);
		                    	if (typeof realEvent.preventDefault == 'function') { realEvent.preventDefault(); }
		                    	if (typeof realEvent.stopPropagation == 'function') { realEvent.stopPropagation(); }
		                    	if (isIE) { return false; }
		                        return;
		                    case 13:
		                    	window[settings.name].debugDataDisplaySuggest.submitSelection();
		                    	if (typeof realEvent.preventDefault == 'function') { realEvent.preventDefault(); }
		                    	if (typeof realEvent.stopPropagation == 'function') { realEvent.stopPropagation(); }
		                    	if (isIE) { return false; }
		                    	return;
		                }
		            } else if ( (realEvent.keyCode == 27) || (event.keyCode == 27) ) {
		            	hideLayer();
		            	if (typeof realEvent.preventDefault == 'function') { realEvent.preventDefault(); }
		            	if (typeof realEvent.stopPropagation == 'function') { realEvent.stopPropagation(); }
		            	if (isIE) { return false; }
		            	return;
		            }
		        	var sq = document.getElementById('debugDataDisplaySearchInput') ;
		    		hideLayer();

		        	if ( isIE ) {
		        		var sqValue = sq.value;
		            } else {
		            	var sqValue = getEventTarget(realEvent).value;
		            }
		        	if ( String(sqValue).length >= settings.searchMinChar ) {
		        		window[settings.name].debugDataDisplaySuggest.getdebugDataDisplaySuggestions(sqValue);
		        	} else {
		        		hideLayer();
		        	}
		        }
		    };

		    var appendSessionID = function (sURL) {
		    	if ( (typeof config.sid != 'undefined') && (config.sid != '') && config.sid ) {
		    		var sessionURL =  [
		    		    String(sURL), ';jsessionid=', String(config.sid)
		    		].join('');
		    		return (sessionURL);
		    	} else {
		    		return (sURL);
		    	}
		    };

		    var submitSelection = function () {
		        hideLayer();
		        var element = all[selected];

		        if (typeof element == 'undefined') {
		            //input.form.submit();
		            return ;
		        }
		        
		    	var sq = document.getElementsByName(config.searchElementName)[0] ;
		    	var userInput = sq.value;
		        if ( !isIE && sq && (typeof element.query != 'undefined') ) { sq.value = element.query; }
		    	var sswg = document.getElementsByName(config.searchgroupElementName)[0] ;
		    	var inputSswg = sswg.value;
		    	if ( !isIE && sswg && (typeof element.category != 'undefined') ) { sswg.value = element.category; }
		        
		        if ( (typeof element != 'undefined') && element.isSearchTerm ) {

		            var add = (String(config.searchurl).indexOf("?") >= 0);
		            var sURL = config.searchurl + ((add) ? "&" : "?") +"sswg=" + element.category + "&" + config.searchElementName + "=" + element.searchTerm + "&fftrkui=" + userInput + "&timestamp=" + new Date().getTime();
		            window.location.href = appendSessionID (sURL);
		            
		        } else if ( (typeof element != 'undefined') && (element.artikel) ) {

		            var sURL = config.url + "/"+ "ID" + element.artikel + ".html";
		            var add = (String(sURL).indexOf("?") >= 0);
		            sURL += ((add) ? "&" : "?") +"sswg=" + inputSswg + "&" + config.searchElementName + "=" + sq.value; //element.searchTerm;
		            window.location.href = appendSessionID (sURL);
		            
		        } else if ( (typeof element != 'undefined') && (element.isAdvancedSearch) ) {

		            var sURL = config.searchurl; // + "/"+ "ID" + element.artikel + ".html";
		            var add = (String(sURL).indexOf("?") >= 0);
		            sURL += ((add) ? "&" : "?") +"sswg=" + sswg.value + "&timestamp=" + new Date().getTime(); // + "&" + config.searchElementName + "=" + sq.value; //element.searchTerm;
		            window.location.href = appendSessionID (sURL);
		            
		        }
		        else {
		            input.form.submit();
		        }
		    };

		    var moveSelection = function (direction) {
		        if (direction > 0) {
		            if ( selected < (all.length - 1) ) {
		                selected = selected + 1 ;
		            }
		        }
		        else {
		            if (selected > 0) {
		            	selected = selected - 1 ;
		            }
		        }
		        applySelection();
		    };

		    var setSelection = function (selection) {
		        if ( (selection >= 0) && (selection < all.length) ) {
		            selected = selection;
		        } else {
		        	selected = -1;
		        }
		        applySelection();
		    };

		    var applySelection = function () {
		        for (i = 0; i < all.length; i++) {
		            if (i == selected) {
		                all[i].className = "typhoon-selected-row";
		            } else {
		                all[i].className = "typhoon-unselected-row";
		            }
		        }
		    };
			
		    var getEvent = function (event) {
		        return (window.event) ? window.event : event;
		    };

		    var getEventTarget = function (event) {
		        var realEvent = getEvent(event); 
		        return ( (realEvent.target) ? realEvent.target : realEvent.srcElement );
		    };

		    var debugDataDisplaySuggestSearch_point = function (x, y) {
		        this.x = x;
		        this.y = y;
		    };

		    var debugDataDisplaySuggestSearch_getPosition = function (element) {
		        if (element.nodeType == 3) { // defeat KHTML bug
		            element = element.parentNode;
		        }
		        return new debugDataDisplaySuggestSearch_point(debugDataDisplaySuggestSearch_findPosX(element), debugDataDisplaySuggestSearch_findPosY(element) + element.offsetHeight);
		    };
		 
		    var debugDataDisplaySuggestSearch_findPosX = function (obj) {
		        var curleft = 0;
		        var origobj = obj;
		        if (obj.offsetParent)
		        {
		            while (obj.offsetParent)
		            {
		                curleft += obj.offsetLeft;
		                obj = obj.offsetParent;
		            }
		        }
		        else if (obj.x) {
		            curleft += obj.x;
		        }
		        return curleft;
		    };

		    var debugDataDisplaySuggestSearch_findPosY = function (obj) {
		        var curtop = 0;
		        if (obj.offsetParent)
		        {
		            while (obj.offsetParent)
		            {
		                curtop += obj.offsetTop;
		                obj = obj.offsetParent;
		            }
		        }
		        else if (obj.y) {
		            curtop += obj.y;
		        }
		        return curtop;
		    };

		    var hideLayer = function () {
		    	if (target) {
		    		var tables = target.getElementsByTagName('table');
		    		for (i=0; i < tables.length; i++) {
		    			if (tables[i].nodeType == 1) target.removeChild(tables[i]);
		    		} /*
		    		for (table in tables) {
		    			if (table.nodeType == 1) target.removeChild(table);
		    		} */
		    	}
		        /* if (tableElement) {
		            tableElement.parentNode.removeChild(tableElement);
		        } */
		        tableElement = null;
		    };

		    /*
		     * declare public methods here
		     */
		    self.handle				= handleEvent;
		    self.hide				= hideLayer;
		    self.show				= showdebugDataDisplaySuggestions;
		    self.select				= setSelection;
		    self.submit				= submitSelection;
		    self.switchActive		= switchActive;
		    
		    self.getEvent			=	getEvent;
		    self.getEventTarget		=	getEventTarget;
		    self.getdebugDataDisplaySuggestions		=	getdebugDataDisplaySuggestions;
		    self.submitSelection	=	submitSelection;
		    self.moveSelection		=	moveSelection;
		    /*
		    this.handle				= handleEvent;
		    this.hide				= hideLayer;
		    this.show				= showdebugDataDisplaySuggestions;
		    this.select				= setSelection;
		    this.submit				= submitSelection;
		    this.switchActive		= switchActive;
		    
		    this.getEvent			=	getEvent;
		    this.getEventTarget		=	getEventTarget;
		    this.getdebugDataDisplaySuggestions		=	getdebugDataDisplaySuggestions;
		    this.submitSelection	=	submitSelection;
		    this.moveSelection		=	moveSelection;
		    */
		    // initialize the debugDataDisplaySuggestion layer
		    init();
	
		    return self;
		}

		var initdebugDataDisplaySuggestSearch =  function () {
		    if (!debugDataDisplaySuggestIsInitialized) {
		        var el = document.getElementById('debugDataDisplaySearchInput'),
		        	cfg = new debugDataDisplaySuggestSearchConfig (
	        			_NOW_, // tknstr, // 1
	        			0, // mndint, 
	        			0, // poolID, 
	        			_NOW_, // sidstr, 
	        			'start search', // advancedSearchLabel, 
	        			30 // max_stringlength // 15
	        		);
		        if ((el) && !(cfg == "undefined") && cfg.tkn != "") {
		            _self.debugDataDisplaySuggest = _debugDataDisplaySuggest_ = new debugDataDisplaySuggestSearch(el, cfg);
		        }
		        debugDataDisplaySuggestIsInitialized = true;
		    }
		};
		var initdebugDataDisplaySuggest = initdebugDataDisplaySuggestSearch;

		var debugDataDisplaySuggestSearchConfig = function (
			tknstr, // 1
			mndint, 
			poolID, 
			sidstr, 
			advancedSearchLabel, 
			max_stringlength // 15
		) {
			this.tkn = tknstr;
			this.mnd = mndint;
			this.poolID = poolID;
			this.sid = 
		    	(!document.cookies && sidstr && (String(sidstr) != '') && (String(sidstr) != '')) ? 
		    			String(sidstr) : false;
		    	// sidstr;
		    this.advancedSearchLabel = ((advancedSearchLabel) ? advancedSearchLabel : "start search");
		    this.max_stringlength = ((max_stringlength) ? max_stringlength : 50);
		   
		};
		

		// addEvent(window, "load", initdebugDataDisplaySuggestSearch);
		
		
		
		
		// object init

		var initObject = function ( data2debug, settings ) {
			if ( (typeof settings.autocreate == 'undefined') || (settings.autocreate === true) ) {
				createDebugDataDisplayPanel();
			}
			if ( (typeof settings.autodebug == 'undefined') || (settings.autodebug === true) ) {
				var panel = document.getElementById('debugDataDisplay');
				if (!panel) createDebugDataDisplayPanel();
				debugDataDisplayShow ( document.getElementById('debugDataDisplayPanel'), data2debug );
				/*var aObjects = document.getElementsByClassName('type_object'),
					aArrays = document.getElementsByClassName('type_array'),
					aContainers = document.getElementsByClassName('dataContainer');
				for (con in aContainers) {
					if ( (con > -1) && aContainers[con].style ) {
						aContainers[con].style.display = 'none';
					}
				}*/
			

			}
			setFontsize();
			applyOptions();
			document.getElementById('debugDataDisplayPanel').style.display = 'block';
			document.getElementById('debugDataDisplayPanel').style.display = 'none';
			return (this);
		};
		
		// assemble settings
		
		if (typeof data2debug == 'undefined') {
			data2debug = _DEBUG_;
		}
		if (typeof settings == 'undefined') {
			settings = _DEFAULTS_;
		}
		var defaultConfig	= extend({}, _DEFAULTS_), 
			settings		= extend(defaultConfig, settings);
		
		if (testCookiesEnabled()) {
			var options = loadOptions();
			settings = extend(settings, options);
		}

		// init object

		var _DATA_ = _DEBUG_;
		
		if (typeof data2debug.root != 'undefined') {
			//initObject( data2debug.root, settings );
			var _DATA_ = data2debug.root;
		} else if (typeof data2debug != 'undefined') {
			//initObject( data2debug, settings );
			var _DATA_ = data2debug;
		} else {
			//initObject( _DEBUG_, settings );
		}

		// public methods and properties
		
		window[settings.name] = _self;

		_self.options	= _DEFAULTS_;
		//self.debugdata	= _DATA_;
		
		_self.init		= initObject;
		_self.debug		= debugDataDisplayShow;
		_self.show		= createDebugDataDisplayPanel;
		_self.create		= createDebugDataDisplayPanel;
		
		_self.debugdata	= function () { return _DATA_; };
		_self.settings	= function () { return settings; };

		_self.addEvent		= addEvent;
		_self.removeEvent	= removeEvent;
		_self.triggerEvent	= triggerEvent;

		//window[settings.name] = _self;

		initObject( _DATA_, settings );

		_self.debugDataDisplaySuggest	= _debugDataDisplaySuggest_;

		//window[settings.name] = _self;

		return _self;
		
	};
}
