require: './Model';

exports: Collection

// (function(context){

var Silence = require('../mixins/silence');

var Collection = new Class({
    Implements: [Events, Options, Silence],

    _models: [],

    options: {
        // onAdd: function(){},
        // onRemove: function(){},
        // onEmpty: function(){},
        Model: Model,
        silent: false
    },

    initialize: function(models, options){
        this.setup(models, options);
    },

    setup: function(models, options){
        this.setOptions(options);

        this._Model = this.options.Model;

        // Silent property determines whether model will excute signals
        this.silence(this.options.silent);

        if (models) {
            this.add(models);
        }

        return this;
    },

    hasModel: function(model){
        return this._models.contains(model);
    },

    /**
     * Private add method
     * @param  {Class} model A Model instance
     * @return {Class} Collection Instance
     */
    _add: function(model){
        model = new this._Model(model);

        if (!this.hasModel(model)) {

            // Remove the model if it destroys itself.
            model.addEvent('destroy', this.remove.bind(this));

            this._models.push(model);

            this.signalAdd(model);
        }

        return this;
    },

    /**
     * Add a model or models
     * @param {Class || Array} A single Model instance or an array of Model instances
     * @return {Class} Collection Instance
     *
     * @example
     * collectionInstance.add(model);
     * collectionInstance.add(model, model);
     * collectionInstance.add([model, model, model]);
     */
    add: function(){
        var models = Array.from(arguments).flatten(),
            len = models.length,
            i = 0;

        while(len--){
            this._add(models[i++]);
        }

        return this;
    },

    /**
     * Get model by index
     * Overloaded to return an array of models if more than one 'index'
     * argument is passed
     *
     * @param  {Number} index Index of model to return
     * @return {Class || Array} Model instance or Array of Model instances
     */
    get: function(index){
        var len = arguments.length, i = 0, results;

        if (len > 1) {
            results = [];

            while(len--){
                results.push(this.get(arguments[i++]));
            }

            return results;
        }

        return this._models[index];
    },

    /**
     * Private remove method
     * @param  {Class} model A Model instance
     * @return {Class} Collection Instance
     */
    _remove: function(model){
        this._models.erase(model);
        
        this.signalRemove(model);

        return this;
    },

    /**
     * Remove a model or models
     * @param {Class || Array} A single Model instance or an array of Model instances
     * @return {Class} Collection Instance
     *
     * @example
     * collectionInstance.remove(model);
     * collectionInstance.remove(model, model);
     * collectionInstance.remove([model, model, model]);
     */
    remove: function(){
        var models = Array.from(arguments).flatten(),
            l = models.length,
            i = 0;

        while(l--){
            this._remove(models[i++]);
        }

        return this;
    },

    /**
     * Replace an existing model with a new one
     * @param  {Class} oldModel A Model instance that will be replaced with the new
     * @param  {Object || Class} newModel An object or Model instance that will replace the old
     * @param  {Boolean} signal A switch to signal add and remove event listeners
     * @return {Class} Collection Instance
     */
    replace: function(oldModel, newModel, signal){
        var index;

        if (oldModel && newModel) {
            index = this.indexOf(oldModel);

            if (index > -1) {
                newModel = new this._Model(newModel);

                this._models.splice(index, 1, newModel);

                if (signal) {
                    this.signalAdd(newModel);

                    this.signalRemove(oldModel);
                }
            }
        }

        return this;
    },

    empty: function(){
        this.remove.apply(this, this._models);

        this.signalEmpty();

        return this;
    },
    
    signalAdd: function(model){
        !this.isSilent() && this.fireEvent('add', [this, model]);
        return this;
    },
    
    signalRemove: function(model){
        !this.isSilent() && this.fireEvent('remove', [this, model]);
        return this;
    },
    
    signalEmpty: function(){
        !this.isSilent() && this.fireEvent('empty', this);
        return this;
    },

    toJSON: function(){
        return this.map(function(model){
            return model.toJSON();
        });
    }
});

['forEach', 'each', 'invoke', 'every', 'filter', 'clean',  'indexOf', 'map', 'some', 'associate', 'link', 'contains', 'getLast', 'getRandom', 'flatten', 'pick'].each(function(method){
    Collection.implement(method, function(){
        return Array.prototype[method].apply(this._models, arguments);
    });
});

// }(typeof exports != 'undefined' ? exports : window));