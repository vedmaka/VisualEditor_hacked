/*!
 * VisualEditor UserInterface MWFileSearchWidget class.
 * hacked
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw*/

/**
 * Creates an ve.ui.MWFileSearchWidget object.
 *
 * @class
 * @extends OO.ui.SearchWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {number} [size] Vertical size of thumbnails
 */
ve.ui.MWFileSearchWidget = function VeUiMWFileSearchWidget( config ) {
	// Configuration intialization
	config = ve.extendObject( {
		'placeholder': ve.msg( 'visualeditor-media-input-placeholder' ),
		'value': mw.config.get( 'wgTitle' )
	}, config );

	// Parent constructor
	OO.ui.SearchWidget.call( this, config );

	// Properties
	this.sources = {};
	this.size = config.size || 150;
	this.queryTimeout = null;
	this.titles = {};
	this.queryMediaSourcesCallback = ve.bind( this.queryMediaSources, this );

	// Events
	this.$results.on( 'scroll', ve.bind( this.onResultsScroll, this ) );

	// Initialization
	this.$element.addClass( 've-ui-MWFileSearchWidget' );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWFileSearchWidget, OO.ui.SearchWidget );

/* Methods */

/**
 * Set the fileRepo sources for the media search
 * @param {Object} sources The sources object
 */
ve.ui.MWFileSearchWidget.prototype.setSources = function ( sources ) {
	this.sources = sources;
};

/**
 * Handle select widget select events.
 *
 * @param {string} value New value
 */
ve.ui.MWFileSearchWidget.prototype.onQueryChange = function () {
	var i, len;

	// Parent method
	OO.ui.SearchWidget.prototype.onQueryChange.call( this );

	// Reset
	this.titles = {};
	for ( i = 0, len = this.sources.length; i < len; i++ ) {
		delete this.sources[i].gsroffset;
	}

	// Queue
	clearTimeout( this.queryTimeout );
	this.queryTimeout = setTimeout( this.queryMediaSourcesCallback, 100 );
};

/**
 * Handle results scroll events.
 *
 * @param {jQuery.Event} e Scroll event
 */
ve.ui.MWFileSearchWidget.prototype.onResultsScroll = function () {
	var position = this.$results.scrollTop() + this.$results.outerHeight(),
		threshold = this.results.$element.outerHeight() - this.size;
	if ( !this.query.isPending() && position > threshold ) {
		this.queryMediaSources();
	}
};

ve.ui.MWFileSearchWidget.prototype.queryMediaSources = function() {

	ve.init.mw.Target.static.apiRequest({
			'action': 'opensearch',
			'search': this.query.getValue(),
			'namespace': 6,
			'suggest': ''
	}).done( ve.bind( this.queryMediaSources2, this ) );

};

/**
 * Query all sources for media.
 *
 * @method
 */
ve.ui.MWFileSearchWidget.prototype.queryMediaSources2 = function (titles) {
	var i, len, source, url,
		value = this.query.getValue();

	if ( value === '' ) {
		return;
	}

	var nTitles = [];

	if( titles == undefined ) {
		titles = '';
	}else{
		$(titles[1]).each(function(i,v){
			if( v.indexOf('.csv') != -1 || v.indexOf('.txt') != -1 ) {
				nTitles.push(v);
			}
		});
		titles[1] = [];
		titles[1] = nTitles;
	}

	for ( i = 0, len = this.sources.length; i < len; i++ ) {
		source = this.sources[i];
		// If we don't have either 'apiurl' or 'scriptDirUrl'
		// the source is invalid, and we will skip it
		if ( source.apiurl || source.scriptDirUrl !== undefined ) {
			if ( source.request ) {
				source.request.abort();
			}
			if ( !source.gsroffset ) {
				source.gsroffset = 0;
			}
			if ( source.local ) {
				url = mw.util.wikiScript( 'api' );
			} else {
				// If 'apiurl' is set, use that. Otherwise, build the url
				// from scriptDirUrl and /api.php suffix
				url = source.apiurl || ( source.scriptDirUrl + '/api.php' );
			}

			this.query.pushPending();

			source.request = ve.init.mw.Target.static.apiRequest( {
			 'action': 'query',
			 'namespace': 6,
			 'limit': 20,
			 'offset': source.gsroffset,
			 'prop': 'info|pageprops|imageinfo',
			 'iiprop': 'dimensions|mediatype|url',
			 'iiurlheight': this.size,
			 'titles': ( titles[1] || [] ).join( '|' )
			 }, {
			 'url': url,
			 // This request won't be cached since the JSON-P callback is unique. However make sure
			 // to allow jQuery to cache otherwise so it won't e.g. add "&_=(random)" which will
			 // trigger a MediaWiki API error for invalid parameter "_".
			 'cache': true,
			 // TODO: Only use JSON-P for cross-domain.
			 // jQuery has this logic built-in (if url is not same-origin ..)
			 // but isn't working for some reason.
			 'dataType': 'jsonp'
			 } )
			 .done( ve.bind( this.onMediaQueryDone, this, source ) )
			 .always( ve.bind( this.onMediaQueryAlways, this, source ) );

			/*source.request = ve.init.mw.Target.static.apiRequest( {
				'action': 'query',
				'generator': 'search',
				//'gsrwhat': 'text',
				'gsrsearch': value,
				'gsrnamespace': 6,
				'gsrlimit': 20,
				'gsroffset': source.gsroffset,
				'prop': 'imageinfo',
				'iiprop': 'dimensions|mediatype|url',
				'iiurlheight': this.size,
				'titles': ( titles[1] || [] ).join( '|' )
			}, {
				'url': url,
				// This request won't be cached since the JSON-P callback is unique. However make sure
				// to allow jQuery to cache otherwise so it won't e.g. add "&_=(random)" which will
				// trigger a MediaWiki API error for invalid parameter "_".
				'cache': true,
				// TODO: Only use JSON-P for cross-domain.
				// jQuery has this logic built-in (if url is not same-origin ..)
				// but isn't working for some reason.
				'dataType': 'jsonp'
			} )
				.done( ve.bind( this.onMediaQueryDone, this, source ) )
				.always( ve.bind( this.onMediaQueryAlways, this, source ) );*/

			source.value = value;
		}
	}
};

/**
 * Handle media query response events.
 *
 * @method
 * @param {Object} source Media query source
 */
ve.ui.MWFileSearchWidget.prototype.onMediaQueryAlways = function ( source ) {
	source.request = null;
	this.query.popPending();
};

/**
 * Handle media query load events.
 *
 * @method
 * @param {Object} source Media query source
 * @param {Object} data Media query response
 */
ve.ui.MWFileSearchWidget.prototype.onMediaQueryDone = function ( source, data ) {
	if ( !data.query || !data.query.pages ) {
		return;
	}

	var page, title,
		items = [],
		pages = data.query.pages,
		value = this.query.getValue();

	if ( value === '' || value !== source.value ) {
		return;
	}

	if ( data['query-continue'] && data['query-continue'].search ) {
		source.gsroffset = data['query-continue'].search.gsroffset;
	}

	for ( page in pages ) {
		// Verify that imageinfo exists
		// In case it does not, skip the image to avoid errors in
		// ve.ui.MWMediaResultWidget
		if ( pages[page].imageinfo && pages[page].imageinfo.length > 0 ) {
			title = new mw.Title( pages[page].title ).getMainText();
			if ( !( title in this.titles ) ) {
				this.titles[title] = true;
				items.push(
					new ve.ui.MWFileResultWidget(
						pages[page],
						{ '$': this.$, 'size': this.size }
					)
				);
			}
		}
	}

	this.results.addItems( items );
};
