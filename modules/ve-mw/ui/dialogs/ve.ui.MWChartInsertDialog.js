/*!
 * VisualEditor user interface MediaInsertDialog class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * Dialog for inserting MediaWiki media objects.
 *
 * @class
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.MWChartInsertDialog = function VeUiMWChartInsertDialog( config ) {
	// Configuration initialization
	config = ve.extendObject( { 'size': 'large' }, config );

	// Parent constructor
	ve.ui.Dialog.call( this, config );

	// Properties
	this.item = null;
	this.referenceModel = null;
	this.sources = {};
};

/* Inheritance */

OO.inheritClass( ve.ui.MWChartInsertDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MWChartInsertDialog.static.name = 'chartInsert';

ve.ui.MWChartInsertDialog.static.title =
	'Insert CSV Chart';

ve.ui.MWChartInsertDialog.static.icon = 'picture';



/* Methods */

/**
 * Handle search result selection.
 *
 * @param {ve.ui.MWMediaResultWidget|null} item Selected item
 */
ve.ui.MWChartInsertDialog.prototype.onSearchSelect = function ( item ) {
	this.item = item;
	if ( item ) {
		//this.close( { 'action': 'insert' } );
		//Start graph processing

		this.search.$element.hide();
		this.$spinner.show();
		//this.helpText.$element.html('Please wait..');
		this.helpText.$element.hide();

		/**
		 * Here we should do few things:
		 * 1. Initialize Google-graphs library
		 * 2. Fetch content from CSV file and convert it into DataTables (extension?)
		 * 3. Feed Graph with content and display it
		 */

	}
};

/**
 * @inheritdoc
 */
ve.ui.MWChartInsertDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.Dialog.prototype.initialize.call( this );

	this.defaultThumbSize = mw.config.get( 'wgVisualEditorConfig' )
		.defaultUserOptions.defaultthumbsize;

	//Texts
	this.helpText = new OO.ui.Widget({
		'$': this.$,
		'$content': 'Please start typing to search and select CSV file to be drawn:',
		'classes': ['helpText-widget']
	});

	//Buttons
	this.applyButton = new OO.ui.ButtonWidget( {
		'$': this.$,
		'label': 'Save graph',
		'flags': ['primary']
	} );

	// Widget
	this.search = new ve.ui.MWFileSearchWidget( {
		'$': this.$
	} );

	// Initialization
	this.search.$element.addClass( 've-ui-MWChartInsertDialog-select' );

	// Events
	this.search.connect( this, { 'select': 'onSearchSelect' } );
	this.applyButton.connect( this, { 'click': [ 'close', { 'action': 'insert' } ] } );

	//Set spinner
	this.$spinner = this.$( '<div>' ).addClass( 've-specialchar-spinner' );

	//Append to layout
	this.$body.append( this.$spinner );
	this.$body.append( this.search.$element );
	this.$body.append( this.helpText.$element );
	this.$foot.append( this.applyButton.$element );

};

/**
 * @inheritdoc
 */
ve.ui.MWChartInsertDialog.prototype.setup = function ( data ) {
	// Parent method
	ve.ui.Dialog.prototype.setup.call( this, data );

	// Show a spinner while we check for file repos.
	// this will only be done once per session.
	//
	// This is in .setup rather than .initialize so that
	// the user has visual indication (spinner) during the
	// ajax request
	this.$spinner.show();
	this.search.$element.hide();

	// Get the repos from the API first
	// The ajax request will only be done once per session
	this.getFileRepos().done( ve.bind( function ( repos ) {
		if ( repos ) {
			this.sources = repos;
			this.search.setSources( this.sources );
		}
		// Done, hide the spinner
		this.$spinner.hide();

		// Show the search and query the media sources
		this.search.$element.show();
		this.search.queryMediaSources();

		// Initialization
		// This must be done only after there are proper
		// sources defined
		this.search.getQuery().$input.focus().select();
		this.search.getResults().selectItem();
		this.search.getResults().highlightItem();
	}, this ) );
};

/**
 * Get the object of file repos to use for the media search
 * @returns {jQuery.Promise}
 */
ve.ui.MWChartInsertDialog.prototype.getFileRepos = function () {
	var deferred = $.Deferred();

	// We will only ask for the ajax call if this.sources
	// isn't already set up
	if ( ve.isEmptyObject( this.sources ) ) {
		// Take sources from api.php?action=query&meta=filerepoinfo&format=jsonfm
		// The decision whether to take 'url' or 'apiurl' per each repository is made
		// in the MWMediaSearchWidget depending on whether it is local and has apiurl
		// defined at all.
		ve.init.mw.Target.static.apiRequest( {
			'action': 'query',
			'meta': 'filerepoinfo'
		} )
		.done( function ( resp ) {
			deferred.resolve( resp.query.repos );
		} )
		.fail( function () {
			deferred.resolve( [ {
				'url': mw.util.wikiScript( 'api' ),
				'local': true
			} ] );
		} );
	} else {
		// There was no need to ask for the resources again
		// return false so we can skip setting the sources
		deferred.resolve( false );
	}

	return deferred.promise();

};

/**
 * @inheritdoc
 */
ve.ui.MWChartInsertDialog.prototype.teardown = function ( data ) {
	var info, newDimensions, scalable;
	// Data initialization
	data = data || {};

	if ( data.action === 'insert' ) {

		/**
		 * In this section we should do few things:
		 *
		 * 1. Check which action is performing
		 * 2. Get stored information from google graphs and prepare transclusion model
		 * 3. Push transclusion model into surface
		 * TODO: inspector actions
		 */

		info = this.item.imageinfo[0];
		// Create a scalable for calculations
		scalable = new ve.dm.Scalable( {
			'originalDimensions': {
				'width': info.width,
				'height': info.height
			}
		} );
		// Resize to default thumbnail size, but only if the image itself
		// isn't smaller than the default size
		if ( info.width > this.defaultThumbSize ) {
			newDimensions = scalable.getDimensionsFromValue( {
				'width': this.defaultThumbSize
			} );
		} else {
			newDimensions = {
				'width': info.width,
				'height': info.height
			};
		}

		/*this.getFragment().collapseRangeToEnd().insertContent(
			[
			{
				'type': 'mwBlockImage',
				'attributes': {
					'type': 'thumb',
					'align': 'default',
					// Per https://www.mediawiki.org/w/?diff=931265&oldid=prev
					'href': './' + this.item.title,
					'src': info.thumburl,
					'width': newDimensions.width,
					'height': newDimensions.height,
					'resource': './' + this.item.title,
					'defaultSize': true
				}
			},
			{ 'type': 'mwImageCaption' },
			{ 'type': '/mwImageCaption' },
			{ 'type': '/mwBlockImage' }
		] ).collapseRangeToEnd().select();*/

		this.getFragment().collapseRangeToEnd();
		this.referenceModel = new ve.dm.MWAlienExtensionNode();


	}

	this.search.clear();

	// Parent method
	ve.ui.Dialog.prototype.teardown.call( this, data );
};

/* Registration */

ve.ui.dialogFactory.register( ve.ui.MWChartInsertDialog );
