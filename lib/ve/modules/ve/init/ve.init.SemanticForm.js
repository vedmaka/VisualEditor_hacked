/*!
 * VisualEditor SemanticForm class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global alert */

/**
 * Debug bar
 *
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.init.SemanticForm = function VeUiSemanticForm() {

	this.$element = $( '<div>' ).addClass( 've-init-SemanticForm' );
	this.$formHolder = $( this.constructor.static.dividerTemplate );
	this.$formTitle = $( this.constructor.static.titleTemplate );
	this.$formDesc = $( this.constructor.static.descriptionTemplate );

	this.$element.css('margin','30px -10px -10px -15px');

	this.$formTitle.css('margin','-10px -10px -10px -15px');
	this.$formTitle.css('background-color','rgb(222, 239, 247)');
	this.$formTitle.css('text-indent','15px');
	this.$formTitle.css('padding','0 10px 2px 0');
	this.$formTitle.css('box-shadow','0px 2px 1px -1px rgba(10, 10, 37, 0.44)');
	this.$formTitle.find('h4').css('color','rgb(56, 94, 108)');

	this.$formDesc.css('color','gray');
	this.$formDesc.css('font-size','14px');
	this.$formDesc.css('margin','30px 0 0px 0');

	this.$formHolder.css('background-color','rgb(246, 250, 252)');
	this.$formHolder.css('padding','10px 10px 15px 15px');
	this.$formHolder.css('background-color','rgb(246, 250, 252)');

	//this.$formTitle

	this.$element.append(
		this.$formHolder
	);

	this.target = null;

	this.sfFormName = null;
	this.sfFormTarget = null;
};

ve.init.SemanticForm.static = {};

ve.init.SemanticForm.prototype.setForm = function( form ) {
	this.sfFormName = form;
};

ve.init.SemanticForm.prototype.setTarget = function( targetName ) {
	this.sfFormTarget = targetName;
};

/**
 * Divider HTML template
 *
 * @property {string}
 */
ve.init.SemanticForm.static.dividerTemplate = '<div id="ve-form-content"></div>';
ve.init.SemanticForm.static.titleTemplate = '<div id="ve-form-content-title"><h4>Page properties</h4></div>';
ve.init.SemanticForm.static.descriptionTemplate = '<div id="ve-form-content-description">Please fill page additional properties into fields below.</div>';

/**
 * Attach debug bar to a surface
 *
 * @param {ve.ui.Surface} surface Surface
 */
ve.init.SemanticForm.prototype.attachToSurface = function ( surface, target ) {
	this.surface = surface;
	this.surface.model.connect( this, { 'select':  this.onSurfaceSelect } );
	// Fire on load
	this.onSurfaceSelect( this.surface.getModel().getSelection() );
	//Load form
	this.loadForm();
	//Set surface modified to activate save button
	setTimeout( function() {
		target.edited = true;
		target.toolbarSaveButton.setDisabled(false);
	}, 1000);

	target.connect( this, {'save': 'onSave'});

};

ve.init.SemanticForm.prototype.saveForm = function( rev ) {

	var xhr, deferred = $.Deferred();

	var serializedForm = $('#sfForm').serialize();

	var postData = {
		'action': 'testsmwinject',
		'format': 'json',
		'form': this.sfFormName,
		'target': this.sfFormTarget,
		'mode': 'save',
		'data': serializedForm
	};
	if( rev != undefined ) {
		postData.rev = rev;
	}

	//postData = $.extend( {}, serializedData, postData );

	xhr = ve.init.mw.Target.static.apiRequest( postData, {
		'type': 'POST'
	} )
		.done( ve.bind( this.onFormSaveSuccess, this, deferred ) )
		.fail( ve.bind( this.onFormLoadError, this, deferred ) );

	return deferred.promise( { abort: xhr.abort } );

};

ve.init.SemanticForm.prototype.onSave = function( content, categorieshtml, newrevid) {
	console.log('onSave');
	//console.log(content, categorieshtml, newrevid);
	//At this stage VE saved all contents, now we should call our api to update semantic props

	this.saveForm( newrevid );

};

ve.init.SemanticForm.prototype.onFormSaveSuccess = function( deferred ) {
	console.log('apisaved');
	deferred.resolve();
};

ve.init.SemanticForm.prototype.onSaveAsyncComplete = function() {
	console.log('onSaveAsyncComplete');
};


/**
 * Get surface the debug bar is attached to
 *
 * @returns {ve.ui.Surface|null} Surface
 */
ve.init.SemanticForm.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Handle select events on the attached surface
 *
 * @param {ve.Range} range
 */
ve.init.SemanticForm.prototype.onSurfaceSelect = function ( range ) {
	if ( range ) {
		//-
	}
};

ve.init.SemanticForm.prototype.loadForm = function() {

	var self = this;
	this.loadFormApi().done( function(html, modules) {

		if( modules ) {
			mw.loader.load(modules);
		}

		self.$formHolder.html('');
		self.$formHolder
			.append( self.$formTitle)
			.append( self.$formDesc )
			.append($(html));

	});

};

ve.init.SemanticForm.prototype.parseForm = function() {

	this.parseFormApi().done( function(result) {

		console.log(result);

	});

};

ve.init.SemanticForm.prototype.parseFormApi = function() {

	var xhr,
		deferred = $.Deferred();

	var serializedForm = $('#sfForm').serialize();

	var postData = {
		'action': 'testsmwinject',
		'format': 'json',
		'form': this.sfFormName,
		'target': this.sfFormTarget,
		'mode': 'parse',
		'data': serializedForm
	};

	//postData = $.extend( {}, serializedData, postData );

	xhr = ve.init.mw.Target.static.apiRequest( postData, {
		'type': 'POST'
		//'url': mw.util.wikiScript( 'api' ) + '?' + serializedForm
	} )
		.done( ve.bind( this.onFormParseSuccess, this, deferred ) )
		.fail( ve.bind( this.onFormLoadError, this, deferred ) );

	return deferred.promise( { abort: xhr.abort } );

};

ve.init.SemanticForm.prototype.loadFormApi = function() {

	var xhr,
		deferred = $.Deferred();

	xhr = ve.init.mw.Target.static.apiRequest( {
		'action': 'testsmwinject',
		'format': 'json',
		'form': this.sfFormName,
		'target': this.sfFormTarget,
		'mode': 'render'
	}, { 'type': 'GET' } )
		.done( ve.bind( this.onFormLoadSuccess, this, deferred ) )
		.fail( ve.bind( this.onFormLoadError, this, deferred ) );

	return deferred.promise( { abort: xhr.abort } );

};

ve.init.SemanticForm.prototype.onFormParseSuccess = function( deferred, response ) {

	var data = response.testsmwinject, contentNodes = data.content;
	deferred.resolve( contentNodes );

};

ve.init.SemanticForm.prototype.onFormLoadSuccess = function( deferred, response ) {

	var data = response.testsmwinject, contentNodes = data.content;
	deferred.resolve( contentNodes, data.modules );

};

ve.init.SemanticForm.prototype.onFormLoadError = function( deferred ) {
	deferred.reject();
};