class RotaryMenu {
	#notification = [];
	#path = undefined;

	constructor ( params )
	{
		this.#path = document.currentScript?.src || document.currentScript?.previousElementSibling?.src;

		if ( !this.#path )	
		{
			this.#path = Array.from ( document.scripts )
				.map ( s=> s.src )
				.filter ( s=>s.toLowerCase ( ).indexOf ( this.constructor.name.toLowerCase ( ) ) > 0 )[ 0 ];
		}

		if ( !this.#path )
		{
			throw "can't define path of script";
		}

		this.params = {
			x: 60,
			y: 60,
			r: 130,
			// items:{ // not needed: use general X/Y
			// 	x:60,
			// 	y:60,
			// },
			transitionDelay: 0.1,
			transitionDureation: 0.5, 
			color: [ "red","blue","yellow","orange","green","pink","lightgreen","lightblue" ],
			callback:{
				notification:(el,status,index)=>{}
			},
			zIndex:1,
		};

		Object.assign ( this.params, params );

		if ( !this.params.target )
		{
			throw "need target";
		}

		let indexOfChild = 0;

		for ( let el of this.params.target.children )
		{
			if ( "LI" !== el.nodeName )
			{
				el.parentNode.removeChild ( el );
				continue;
			}

			let color = undefined;
			if ( this.params?.color?.constructor.name )
			{
				color = this.params.color[ indexOfChild ] || "black";
			}
			else if ( "random" === this.params.color )
			{
				color = "rgb("+(Math.random()*256)+","+(Math.random()*256)+","+(Math.random()*256)+")"
			}

			let d1 = document.createElement ( "div" );
			let d2 = document.createElement ( "div" );

			d1.appendChild ( d2 );
			d2.innerHTML = el.innerHTML;
			el.innerHTML = "";

			el.appendChild ( d1 );

			el.style.setProperty ( "--index", indexOfChild );
			el.style.setProperty ( "--color", color );
			el.classList.add( "icon" );
			indexOfChild++;
		}

		this.id = this.params.target.id;

		if ( !this.id )
		{
			this.id = "menu_"+Math.random ( );
			this.params.target.id = this.id;
		}

		this.style = document.createElement ( "style" );
		document.head.appendChild ( this.style );

		this.baseUrl = this.#path.slice ( 0, this.#path.lastIndexOf ( "/" ) )

		fetch ( this.baseUrl + "/rotaryMenu.css" )
			.then ( r=>r.text ( ) )
			.then ( r=>r.replace ( /;ID;/g, "#"+this.id ) )
			.then ( r=>r.replace ( /;X;/g, this.params.x ) )
			.then ( r=>r.replace ( /;X2;/g, this.params.x / 2 ) )
			.then ( r=>r.replace ( /;Y;/g, this.params.y ) )
			.then ( r=>r.replace ( /;Y2;/g, this.params.y / 2 ) )
			.then ( r=>r.replace ( /;R;/g, this.params.r ) )
			.then ( r=>r.replace ( /;Z;/g, this.params.zIndex ) )
			.then ( r=>r.replace ( /;Z2;/g, this.params.zIndex + 1 ) )
			.then ( r=>r.replace ( /;NBITEM;/g, indexOfChild ) )
			.then ( r=>r.replace ( /;D1;/g, this.params.transitionDelay ) )
			.then ( r=>r.replace ( /;D2;/g, this.params.transitionDureation ) )
			.then ( r=>r.replace ( /;D3;/g, indexOfChild * this.params.transitionDelay ) )
			.then ( r=>r.replace ( /;X3;/g, this.params?.items?.x || this.params.x ) )
			.then ( r=>r.replace ( /;Y3;/g, this.params?.items?.y || this.params.y ) )
			.then ( r=>this.style.innerText = r );
		
		this.menuIcon = document.createElement ( "li" );
		this.params.target.prepend ( this.menuIcon )

		this.menuIcon.addEventListener ( "click", ()=>{
			this.params.target.classList.toggle( "active" )
			this.#notifyCheck ( );
		});

		document.addEventListener ( "keydown", (event)=>{
			if ( event.defaultPrevented )
			{
				return; // Do nothing if the event was already processed
			}

			if ( "Escape" == event.key )
			{
				this.params.target.classList.toggle( "active" );
				this.#notifyCheck ( );
				event.preventDefault ( );
			}
			else
			{
				return;
			}
		});

		fetch ( this.baseUrl + "/p2.svg" )
			.then ( r=>r.text ( ) )
			.then ( r=>this.menuIcon.innerHTML = r )
	}

	notify ( index, status )
	{
		if ( "String" == index?.constructor.name )
		{
			index = this.#getIndexFromId ( index );
		}
		else if ( isNaN ( index )
			|| ( 0 > index ) )
		{
			throw "index not a number";
		}
		else
		{
			index++;
		}

		if ( this.params.target.children.length <= index )
		{
			throw "index out of list";
		}

		this.#notification[ index ] = status;
		
		this.#notifyCheck ( );
	}

	#notifyCheck ( )
	{
		this.params.callback.notification ( this.menuIcon, ( this.#notification.some ( v=>v ) ), 0 );
		
		if ( this.params.target.classList.contains( "active" ) )
		{
			console.log ( this.#notification )
			for ( let index = 1; index < this.#notification.length; index++ )
			{
				this.params.callback.notification ( this.params.target.children[ index ], ( this.#notification[ index ] ), index );
			}
		}
	}

	#getIndexFromId ( id )
	{
		for ( let i = 1; i < this.params.target.children.length; i++ )
		{
			if ( id != this.params.target.children[ i ].id )
			{
				continue;
			}

			return i;
		}

		throw "unknow ID: "+id;
	}
}
