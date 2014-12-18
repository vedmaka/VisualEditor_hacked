/*!
 * VisualEditor UserInterface MWFileResultWidget class.
 * hacked
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * Creates an ve.ui.MWFileResultWidget object.
 *
 * @class
 * @extends OO.ui.OptionWidget
 *
 * @constructor
 * @param {Mixed} data Item data
 * @param {Object} [config] Configuration options
 * @cfg {number} [size] Media thumbnail size
 */
ve.ui.MWFileResultWidget = function VeUiMWFileResultWidget( data, config ) {
	// Configuration intialization
	config = config || {};

	// Parent constructor
	OO.ui.OptionWidget.call( this, data, config );

	// Properties
	this.size = config.size || 150;
	this.$thumb = this.buildThumbnail();
	this.$overlay = this.$( '<div>' );

	// Initialization
	this.setLabel( new mw.Title( this.data.title ).getNameText() );
	this.$overlay.addClass( 've-ui-MWFileResultWidget-overlay' );
	this.$element
		.addClass( 've-ui-MWFileResultWidget ve-ui-texture-pending' )
		.css( { 'width': this.size, 'height': this.size } )
		.prepend( this.$thumb, this.$overlay );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWFileResultWidget, OO.ui.OptionWidget );

/* Methods */

/** */
ve.ui.MWFileResultWidget.prototype.onThumbnailLoad = function () {
	this.$thumb.first().addClass( 've-ui-texture-transparency' );
	this.$element
		.addClass( 've-ui-MWFileResultWidget-done' )
		.removeClass( 've-ui-texture-pending' );
};

/** */
ve.ui.MWFileResultWidget.prototype.onThumbnailError = function () {
	this.$thumb.last()
		.css( 'background-image', '' )
		.addClass( 've-ui-texture-alert' );
	this.$element
		.addClass( 've-ui-MWFileResultWidget-error' )
		.removeClass( 've-ui-texture-pending' );
};

/**
 * Build a thumbnail.
 *
 * @method
 * @returns {jQuery} Thumbnail element
 */
ve.ui.MWFileResultWidget.prototype.buildThumbnail = function () {
	var info = this.data.imageinfo[0],
		image = new Image(),
		$image = this.$( image ),
		$back = this.$( '<div>' ),
		$front = this.$( '<div>' ),
		$thumb = $back.add( $front );

	// Preload image
	$image
		.load( ve.bind( this.onThumbnailLoad, this ) )
		.error( ve.bind( this.onThumbnailError, this ) );
	image.src = info.thumburl;

	$thumb.addClass( 've-ui-MWFileResultWidget-thumbnail' );
	$thumb.last().css( 'background-image', 'url(' + info.thumburl + ')' );
	if ( info.width >= this.size && info.height >= this.size ) {
		$front.addClass( 've-ui-MWFileResultWidget-crop' );
		$thumb.css( { 'width': '100%', 'height': '100%' } );
	} else {
		$thumb.css( {
			'width': info.thumbwidth,
			'height': info.thumbheight,
			'left': '50%',
			'top': '50%',
			'margin-left': Math.round( -info.thumbwidth / 2 ),
			'margin-top': Math.round( -info.thumbheight / 2 )
		} );
	}

	return $thumb;
};
