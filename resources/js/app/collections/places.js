/**
* Module for the Places Collection
**/
define([
	'app/models/place',
], function(Place){
	var Places = Backbone.Collection.extend({
		model: Place,
	});

	return Places;
});