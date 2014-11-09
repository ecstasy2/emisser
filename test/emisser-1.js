var tape= require('tape'),
  emisser= require('emisser')

var _slice= Array.prototype.slice

var _fixtureEvents= [
	['data', 1],
	['data', 2, 'a'],
	['data', 3, 'one', 'two', 'three', 'four', 'five'],
	['moo', 'cow']
]

function _expect(t, eventNames, description, unhandled){
	eventNames= eventNames instanceof Array ? eventNames : [eventNames]
	var i= 0
	return function expect(){
		var fix
		while(!fix){
			// make sure there's a fixture to get
			if(i >= _fixtureEvents.length){
				if(unhandled)
					unhandled()
				return
			}
			// get the next fixture
			fix= _fixtureEvents[i++]
			// ignore it if we don't look at that eventName
			if(!~eventNames.indexOf(fix[0]))
				fix= null
		}
		fix= fix.slice(1)
		var args= _slice.call(arguments, 0)
		t.deepEquals(args, fix, description || 'expected an item from fixture')
	}
}

function feed(e){
	for(var i in _fixtureEvents){
		e.emit.apply(e, _fixtureEvents[i])
	}
}

tape('Emisser is an ok event emitter', function(t){
	t.plan(7)

	var e1= new emisser()

	var h1= _expect(t, 'data'),
	  h2= _expect(t, ['data', 'moo'])

	e1.on('data', h1)
	e1.on('data', h2)
	e1.on('moo', h2)

	feed(e1)
})
