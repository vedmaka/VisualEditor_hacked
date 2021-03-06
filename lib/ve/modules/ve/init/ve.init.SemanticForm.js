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
	//this.$formDesc = $( this.constructor.static.descriptionTemplate );

	this.$element.css('margin','30px -10px -10px -15px');

	this.$formTitle.css('margin','-10px -10px 10px -15px');
	this.$formTitle.css('background-color','rgb(222, 239, 247)');
	this.$formTitle.css('text-indent','15px');
	this.$formTitle.css('padding','0 10px 2px 0');
	this.$formTitle.css('box-shadow','0px 2px 1px -1px rgba(10, 10, 37, 0.44)');
	this.$formTitle.find('h4').css('color','rgb(56, 94, 108)');

	//this.$formDesc.css('color','gray');
	//this.$formDesc.css('font-size','14px');
	//this.$formDesc.css('margin','30px 0 0px 0');

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

	this.formSaving = null;

	this.formSerialized = null;
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
ve.init.SemanticForm.static.titleTemplate = '<div id="ve-form-content-title"><h4>Short facts</h4></div>';
ve.init.SemanticForm.static.descriptionTemplate = '<div id="ve-form-content-description">Please fill page additional properties into fields below.</div>';

ve.init.SemanticForm.prototype.onDestroy = function () {

		console.log('sf destroy');
		this.surface.getModel().disconnect(this);
		this.target.disconnect(this);
		this.$element.remove();

};

/**
 * Attach debug bar to a surface
 *
 * @param {ve.ui.Surface} surface Surface
 */
ve.init.SemanticForm.prototype.attachToSurface = function ( surface, target ) {
	this.surface = surface;
	this.target = target;
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

	target.connect( this, {'save': 'onSaveComplete'});
	target.connect( this, {'saveInitiated': 'onSave'});
	//target.connect( this, {'saveWorkflowBegin': 'onSaveDialog'});
	//this.target.pageExists = true;

	//Override target save dialog check
	target.toolbarSaveButton.disconnect( target );
	target.toolbarSaveButton.connect( this, { 'click': 'onToolbarSaveButtonClick' } );

	//By default we think that form is validated
	this.formValdated = true;
	this.formValidationMessage = 'Error in form fields, please see bottom of page for details.';

};

ve.init.SemanticForm.prototype.onToolbarSaveButtonClick = function() {

	var self = this;

	//Validate form
	if( $(this.$element).find('.dynatreeInput').size() ) {
		//Check for mandatory tree inputs
		$.each( $(this.$element).find('.dynatreeInput'), function(i,v){
			if( $(v).hasClass('mandatoryField') ) {
				//at least 1 should be selected
				var selected = 0;
				selected = $(v).find('input[checked="checked"]').size();
				if( !selected ) {
					self.formValdated = false;
					self.formValidationMessage = 'You should select at least one item for Countries & Industries page fields.';
				}
				if ( selected > 3 ) {
					self.formValdated = false;
					self.formValidationMessage = 'Page Countries & Industries fields can have maximum 3 items selected.';
				}
			}
		});
	}

	if( this.formValdated ) {

		//Copied from Target event handler
		if (this.target.edited || this.target.restoring) {
			this.target.showSaveDialog();
		}

	}else{

		//Show message & reset validation
		alert( this.formValidationMessage );
		$(document).scrollTop( $($('.ve-init-SemanticForm').get(0)).position().top );
		this.formValdated = true;

	}

};

ve.init.SemanticForm.prototype.saveForm = function( rev ) {

	var xhr, deferred = $.Deferred();

	var serializedForm = this.formSerialized;

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

ve.init.SemanticForm.prototype.onSave = function( content, categorieshtml, newrevid ) {

	console.log('onSave initiated');
	//console.log(content, categorieshtml, newrevid);
	//At this stage VE saved all contents, now we should call our api to update semantic props

	//this.target.pageExists = true;
	//this.formSaving = this.saveForm( newrevid );
	this.formSerialized = $('#sfForm').serialize();

};

ve.init.SemanticForm.prototype.onFormSaveSuccess = function( deferred ) {
	console.log('apisaved');
	deferred.resolve();
};

ve.init.SemanticForm.prototype.onSaveComplete = function( content, categorieshtml, newrevid ) {

	this.target.pageExists = true; //prevent page from reloading by passing existence flag
	this.formSaving = this.saveForm( newrevid );

	var xself = this;

	this.formSaving.done( function()
	{
		console.log('formSaving.done');
		//if( xself.target.pageExists ) {
			document.location.href = mw.util.getUrl() + '?action=purge';
		//}
	});
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
	this.loadFormApi().done( function(html, modules, varaibles) {

		if( modules ) {
			mw.loader.load(modules);
		}

        if( varaibles ) {
            //$.each(varaibles, function(i,v){
                //window[i] = v;
            //});
            if( varaibles.sfgAutocompleteValues ) {
                window.sfgAutocompleteValues = varaibles.sfgAutocompleteValues;
            }
        }

		self.$formHolder.html('');
		self.$formHolder
			.append( self.$formTitle)
			//.append( self.$formDesc )
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
	deferred.resolve( contentNodes, data.modules, data.variables );

};

ve.init.SemanticForm.prototype.onFormLoadError = function( deferred ) {
	console.log('Error: testSMWInject error');
	deferred.reject();
};