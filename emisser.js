var EventEmitter= require('events').EventEmitter,
  inherits= require('inherits')

var _emit= EventEmitter.prototype.emit,
  _slice= Array.prototype.slice

function Emisser(){
	EventEmitter.call(this)

	/// Long term storage for Emitted events
	var _store= {}
	Object.defineProperty(this, '_store', {
		get: function(){
			return _store
		},
		set: function(val){
			_store= val
		}
	})

	var self= this,
	  _nexts= {},
	  _nexting= false
	/// Emit all _nexts, which are in-flight listeners needing their data
	function emitToNexts(){
		var nexts= _nexts
		_nexts= {}
		_nexting= false

		for(var name in nexts){
			var listeners= nexts[name]
			for(var i in self._store[name]){
				for(var j in listeners){
					listeners[j].apply(self, _store[i])
				}
			}
		}
		if(Object.keys(_next).length > 0 && !_nexting){
			_nexting= true
			setTimeout(emitToNexts, 0)
		}
	}

	/// New listeners
	// define emission
	function emissionToNewListener(name, listener){
		if(!_store[name])
			return
		_nexts[name].push(listener)
		if(!_nexting){
			_nexting= true
			setTimeout(emitToNexts, 0)
		}
	}
	// make a variable for mission
	Object.defineProperty(this, 'handleEmissionToNewListener', {
		get: function(){
			return emissionToNewListener
		},
		set: function(val){
			emissionToNewListener= val
		}
	})
	this.on('newListener', function(a, b, c, d){
		_call(emissionToNewListener, this, arguments, a, b, c, d)
	})
}
inherits(Emisser, EventEmitter)

Emisser.prototype.emit= (function emit(name, a, b, c){
	var args= _slice.call(arguments, 0),
	  arr= this._store[name] || (this._store[name] = [])
	arr.push(args)
	return _call(_emit, this, args, name, a, b, c)	
})

function _call(fn, self, args, a, b, c, d){
	if(args.length == 1){
		return fn.call(self, a)
	}else if(args.length == 2){
		return fn.call(self, a, b)
	}else if(args.length == 0){
		return fn.call(self)
	}else if(args.length == 3){
		return fn.call(self, a, b, c)
	}else if(args.length == 4){
		return fn.call(self, a, b, c, d)
	}else{
		return fn.apply(self, args)
	}
}

module.exports= Emisser
