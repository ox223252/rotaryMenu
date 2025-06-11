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
			items:{
				r: 175,
				fold:{
					width: 80,
					height: 80,
				},
				main:{
					width: 100,
					height: 100,
					scale:{
						width:2,
						height:2,
					}
				},
				others:{
					width: 60,
					height: 60,
				},
				close:{
					width: 40,
					height: 40,
					y: 65,
					x: 85,
					content: "X",
					text: "red",
					display: true,
				}
			},
			transitionDelay: 0.1,
			transitionDureation: 0.5,
			colors:{
				text: "black",
				shadow: "black",
				backItem: "white",
				backMenu: "black",
				border: "black",
				hover: "grey",
			},
			callback:{
				notification:(el,status,index)=>{}
			},
			escape: true,
			zIndex:1,
		};

		this.params = RotaryMenu.objMerge ( this.params, params );

		if ( !this.params.target )
		{
			throw "need target";
		}

		for ( let key of Object.keys ( this.params.colors ) )
		{
			let color = this.params.target.style.getPropertyValue ( "--"+key );
			if ( "" == color )
			{
				color = this.params?.colors?. [ key ];
				this.params.target.style.setProperty ( "--"+key, this.params?.colors?. [ key ] );
			}

			if ( 0 == color?.indexOf ( "--" ) )
			{
				this.params.target.style.setProperty ( "--"+key, "var(" + color + ")" )
			}
		}

		let indexOfChild = 0;

		for ( let el of this.params.target.children )
		{
			if ( "LI" !== el.nodeName )
			{
				el.parentNode.removeChild ( el );
				continue;
			}

			el.style.setProperty ( "--index", indexOfChild );

			if ( el == el.parentNode.children[ 0 ] )
			{
				this.menuIcon = el;
				continue;
			}

			let d1 = document.createElement ( "div" );
			let d2 = document.createElement ( "div" );

			d1.appendChild ( d2 );
			d1.classList.add ( "rotaryMenuDiv" );
			d2.innerHTML = el.innerHTML;
			el.innerHTML = "";

			el.appendChild ( d1 );

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

		// color check
			for ( let i = 0; i < this.params.colors.length; i++ )
			{
				if ( 0 == this.params.colors[ i ].indexOf ( "--" ) )
				{
					this.params.colors[ i ] = "var("+this.params.color[ i ]+")";
				}
			}

		fetch ( this.baseUrl + "/rotaryMenu.css" )
			.then ( r=>r.text ( ) )
			.then ( r=>r.replace ( /;ID;/g, "#"+this.id ) )
			.then ( r=>r.replace ( /;IFW;/g, this.params.items.fold.width ) )
			.then ( r=>r.replace ( /;IFH;/g, this.params.items.fold.height ) )
			.then ( r=>r.replace ( /;IMW;/g, this.params.items.main.width ) )
			.then ( r=>r.replace ( /;IMH;/g, this.params.items.main.height ) )
			.then ( r=>r.replace ( /;IMSW;/g, this.params.items.main.scale.width ) )
			.then ( r=>r.replace ( /;IMSH;/g, this.params.items.main.scale.height ) )
			.then ( r=>r.replace ( /;IOW;/g, this.params.items.others.width ) )
			.then ( r=>r.replace ( /;IOH;/g, this.params.items.others.height ) )
			.then ( r=>r.replace ( /;ICX;/g, this.params.items.close.x ) )
			.then ( r=>r.replace ( /;ICY;/g, this.params.items.close.y ) )
			.then ( r=>r.replace ( /;ICW;/g, this.params.items.close.width ) )
			.then ( r=>r.replace ( /;ICH;/g, this.params.items.close.height ) )
			.then ( r=>r.replace ( /;R;/g, this.params.items.r ) )
			.then ( r=>r.replace ( /;Z;/g, this.params.zIndex ) )
			.then ( r=>r.replace ( /;Z2;/g, this.params.zIndex + 1 ) )
			.then ( r=>r.replace ( /;NBITEM;/g, indexOfChild ) )
			.then ( r=>r.replace ( /;D1;/g, this.params.transitionDelay ) )
			.then ( r=>r.replace ( /;D2;/g, this.params.transitionDureation ) )
			.then ( r=>r.replace ( /;D3;/g, indexOfChild * this.params.transitionDelay ) )
			.then ( r=>r.replace ( /\n/g, ' ' ) )
			.then ( r=>this.style.innerText = r )
		
		this.menuIcon.addEventListener ( "click", ()=>{
			this.params.target.classList.toggle( "active" )
			this.#notifyCheck ( );
		});

		if ( this.params.escape )
		{ // use ESCAPE key to quit menu

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
		}

		if ( this.params?.items?.close?.display )
		{
			let close = document.createElement ( "div" );
			this.menuIcon.appendChild ( close );
			close.innerHTML = this.params?.items?.close?.content;
			close.classList.add ( "close" );

			let color = close.style.getPropertyValue ( "--text" );
			if ( "" == color )
			{
				color = this.params?.items?.close?.text;
				close.style.setProperty ( "--text", this.params?.items?.close?.text );
			}

			if ( 0 == color?.indexOf ( "--" ) )
			{
				close.style.setProperty ( "--text", "var(" + color + ")" )
			}
		}
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

	static objMerge ( obj1, obj2 )
	{
		let d = {...obj1};

		for ( let s in obj2 )
		{
			switch ( obj2[s].constructor.name )
			{
				case "Object":
				{
					if ( !d[s] )
					{ // if property doesn't exist deep cpy
						d[s]={...obj2[s]};
					}
					else
					{
						d[s] = this.objMerge ( obj1[s], obj2[s] );
					}
					break;
				}
				case "Array":
				{
					d[s]=[...obj2[s]];
					break;
				}
				default:
				{
					console.log( obj2[s].constructor.name )
				}
				case 'Number':
				case 'String':
				{
					d[s]=obj2[s];
					break;
				}
			}
		}

		return d
	}
}
