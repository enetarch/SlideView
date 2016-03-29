/* ====================================================================
 * slideShow
 * 
 * Requirements:
 * 		Display a movie on first slide
 * 		Do not display movie as slides cycle
 * 		Skip movie if it can't be played in a browser
 * 		Cycle through slides
 * 		Allow users to choose a specific slide to view
 * 		Allow users to browse previous and next slides
 * 		Each slide will have additional text data to be placed in 
 * 			labels - position controlled by CSS
 *		When user selects next image, the transition should be smooth
 * 		Allow text to change on slides programatically
 * 
 * Todos
 * 		Review mobile specifications
 * 
 * Description:
 * 		Given the HTML TAG name, class-name, or ID, find the child  
 * 		FIGURE tags, then cycle through them, using CSS animation to 
 * 		fade to the background color.
 * 
 * Syntax: 
 * 		var x = new slideShow (control, data);
 * 
 * Parameters:
 * 		control - descriptor / selector used to find the target HTML tag 
 * 				with the FIGURE tags to manipulate.
 *  
 * 		data - is a JSON object providing URLS, types, captions, and
 * 				loop information.  The control stores this data for
 * 				use as it loops through the slides.
 * 
 * Static:
 * 		jQuery names into DOM ...
 *		slides - location where movies and figure TAGs should be stored.
 *		movie_template - location of movie template to use
 *		image_template - location of image template to use
 *		slide_selector_template - location of radio button option to use
 *		prevnext_buttons - location of next and previous buttons
 *		button_prev - location of previous button
 *		button_next - location of next button
 *		slide_selector - location where position picking radio buttons are placed
 *		current_slide - locations of radio buttons
 * 
 * 		CSS names 
 *		fade_Out - used to animate images slides
 *		fade_In - used to animate images slides
 *		fade_Out_Faster - used to animate images slides - faster
 *		fade_In_Faster - used to animate images slides - faster
 * 
 * 		JavaScript Event Names
 *		endAnimation - all events in all browsers that capture animation 
 * 			end events
 * 
 * Properties:
 *		control - jQuery pointer to this Controls Instance
 *		slide_selector - jQuery pointer to position radio buttons 
 *		slides - jQuery pointer to list of images and movies 
 *		figures - jQuery list of images and movies found in slides
 *		position - current slide being shown
 *		_data - copy of data parameter
 * 		isiPhone - don't run movies on iPhones
 * 
 * Methods:
 *		_addEventHandlers - adds general event handlers onto the DOM
 * 			concerning current slide selections, and previous and next
 * 			buttons.
 * 
 *		_onPrevSlide - captures UX request to display the previous slide
 * 
 *		_onNextSlide - captures UX request to display the next slide
 * 
 *		_onChangePosition - captures UX request to display a specific slide
 * 
 *		_changeSlide - updates the slide selector and which slides transition
 * 
 *		_setSlideSelector - sets the current position of the slide selector 
 *
 * 		_setTransition - turns on the CSS animation
 * 
 * 		_clearTransition - turns off the CSS animation
 * 
 * 		_cycle - animates all found FIGURE tags found in the target 
 * 				HTML tag.
 * 
 *		_loadPosition - for each JSON object in images and movies list, 
 * 			a corresponding radio button is added to the slide selector.
 * 
 *		_loadFigures - reads JSON object passed into construct, and adds
 * 			images and movies found into DOM using template.
 * 
 * Globals:
 * 		jQuery - cross platform public library js to manipulate the DOM
 * 
 * CSS:
 * 
 * Tests:
 * 
 * Rational:
 * 		The slideshow object transitions from one slide to the next
 * 		using CSS animation. The animation causes the opacity of 2
 * 		images to change.  One fading in, another fading out.
 * 
 * 		The slideshow object does not transition directly from one 
 * 		slide to the next. It stores the next slide that it is going to
 * 		transition to. 
 * 
 * 		If the user changes which slide they want to see next, that slide
 * 		is swapped out with the current transition in slide, and the 
 * 		animation fade in and out is completed faster.
 * 
 * 		However, if a movie is playing at the time the user request a
 * 		different slide, that slide begins it's transition in normally.
 * 		
 * 
 * Notes:
 * 		A position delegate should be used to trigger the proper slide 
 * 		to show, as well as update the slide selector (radio buttons).
 * 
 * 
 * ====================================================================
 */

var slideShow = function (control, list) 
{
	var self = this;
	
	self.control = control;
	self._data = list;
	
	self.isiPhone = isiPhone();
	
	self.slides = $(control).children (slideShow.STATIC.slides);
	self.slide_selector = $(control).children (slideShow.STATIC.slide_selector);
	self.prevnext_buttons = $(control).children (slideShow.STATIC.prevnext_buttons);
	
	self._loadFigures 
	(
		slideShow.STATIC.movie_template, 
		slideShow.STATIC.image_template, 
		list
	);
	self._initSelector (slideShow.STATIC.selector_template, list);
	
	self.figures = $(self.slides).children("figure");

	self._addEventHandlers.call (this);
	
	self._changeSlide (0);
};

// ====================================================

slideShow.STATIC = 
{
	// DOM selectors
	slides : "#slides",
	movie_template : "#slideShow-movie-template",
	image_template : "#slideShow-image-template",
	selector_template : "#slideShow-selector-template",
	prevnext_buttons : "#nextprev",
	button_prev : "#button-prev",
	button_next : "#button-next",
	slide_selector : "#slide-selector",
	current_slide : "#current-slide",
	
	// CSS
	fade : "fade",
	fade_faster : "fade-faster",
	
	// EVENTS
	endAnimation : "webkitTransitionEnd transitionend ended",
};

slideShow.prototype.control = "";
slideShow.prototype.slide_selector = {};
slideShow.prototype.slides = {};
slideShow.prototype.figures = [];
slideShow.prototype.slide_fading = 0;
slideShow.prototype._data = null;
slideShow.prototype.isiPhone = false;

// ====================================================

slideShow.prototype._addEventHandlers = function ()
{
	var self = this;
	
	$(self.control).children(slideShow.STATIC.slide_selector).on 
	("change", 
		function () 
		{ 
			console.log ("====== ====== ====== =======");
			console.log ("slide selector changed");
			self._onChangePosition.call (self); 
		}
	);

	$(self.prevnext_buttons).children(slideShow.STATIC.button_prev).on 
	("click", 
		function () 
		{ self._onPrevSlide.call (self); }
	);

	$(self.prevnext_buttons).children(slideShow.STATIC.button_next).on 
	("click", 
		function () 
		{ self._onNextSlide.call (self); }
	);
};

// ====================================================

slideShow.prototype._onPrevSlide = function ()
{
	var self = this;
	var nPos = self.slide_fading;
	
	nPos = self.getPrevSlide (nPos);
	
	self._viewSlide (nPos);
};

slideShow.prototype._onNextSlide = function ()
{
	var self = this;
	var nPos = self.slide_fading;
	
	nPos = self.getNextSlide (nPos);

	self._viewSlide (nPos);
};	

slideShow.prototype._onChangePosition = function ()
{
	var self = this;
	
	var radioButtons = $(self.slide_selector).
		children (slideShow.STATIC.current_slide);
		
	var nPos = -1;
	radioButtons.each (
		function (index, item)
		{
			if (item.checked)
				nPos = $(item).val();
		});

	// there must be a better way to retrieve the value of the current
	// selected radio button.
	
	self._viewSlide (nPos);
};

// ====================================================

slideShow.prototype._setSlideSelector = function (nPos)
{
	var self = this;
	var figure = self.figures [nPos];

	var radioButtons = $(self.slide_selector).
		children (slideShow.STATIC.current_slide);
		
	radioButtons[nPos].checked = true;
};

// ====================================================

slideShow.prototype._cycle = function ()
{
	var self = this;
	var nPos = self.slide_fading;
	var fadeOut = self.getNextSlide (nPos);
	
	console.log ("====== ====== ====== =======");
	console.log ("cycling slides");
	console.log ("slide " + self.slide_fading + " done transitioning - in our out");
	console.log ("fading out slide " + fadeOut + " now");
	
	self._changeSlide (fadeOut);
};

slideShow.prototype._viewSlide = function (fadeInNow)
{
	var self = this;
	var oFadeOut = self.slide_fading;
	
	// console.clear();
	console.log ("====== ====== ====== =======");
	console.log ("_viewSlide");
	console.log ("fading out slide " + oFadeOut );
	console.log ("fading in slide " + fadeInNow);
	
	self._clearAllEventHandlers ();
	self._setTransitionsToFast ();
	
	self._setSlideSelector (fadeInNow);

	self.slide_fading = fadeInNow;
	
	self._setEventHandler (fadeInNow);
	self._setTransition_Faster (fadeInNow);	

	console.log ("slide_fading = " + self.slide_fading );
};

// this assumes that the current slide has an opacity of 1.
slideShow.prototype._changeSlide = function (fadeOut)
{
	var self = this;

	console.log ("====== ====== ====== =======");
	console.log ("changing slides");
	console.log ("fade out slide " + fadeOut );

	self.slide_fading = fadeOut;
	self._setSlideSelector (fadeOut);
	
	self._clearAllEventHandlers ();
	self._clearAllTransitions ();
	
	self._setEventHandler (fadeOut);
	self._setTransition (fadeOut);	
};

// ====================================================

slideShow.prototype._setEventHandlers = function ()
{
	var self = this;
	for (var t=0; t<self.figures.length; t++)
		self._setEventHandler (t);
}

slideShow.prototype._setEventHandler = function (nPos)
{
	var self = this;
	var figure = self.figures [nPos];
	var thsSlide = nPos;
	
	console.log ("setting event handlers on slide " + nPos);
	
	switch (self._data[nPos].type)
	{
		case "movie" : 
		{
			var movie = $(figure).children ("video")[0]

			$(movie).on (slideShow.STATIC.endAnimation, 
				function () 
				{ 
					console.log ("event handler for movie fired");
					self._cycle.call (self); 
				}
			);
			
			movie.play();
			break;
		} 

		case "image" : 
		{
			$(figure).on (slideShow.STATIC.endAnimation, 
				function (event) 
				{ 
					// console.clear();
					console.log ("event handler for slide [ " + thsSlide + " ] fired");
					console.log ("figure.class = " + $(figure).attr ("class"));
					
					self._cycle.call (self);
				}
			);
			
			break;
		} 
	}
};

slideShow.prototype._clearAllEventHandlers = function ()
{
	var self = this;
	for (var t=0; t<self.figures.length; t++)
		self._clearEventHandler (t);
}

slideShow.prototype._clearEventHandler = function (nPos)
{
	var self = this;
	var figure = self.figures [nPos];

	switch (self._data[nPos].type)
	{
		case "movie" : 
		{
			var movie = $(figure).children ("video")[0]
			
			$(movie).off (slideShow.STATIC.endAnimation);
			
			movie.pause();
			break;
		} 

		case "image" : 
		{
			$(figure).off (slideShow.STATIC.endAnimation); 
			break;
		} 
	}
};

// ====================================================

slideShow.prototype._setTransition = function (nPos)
{
	var self = this;
	var figure = self.figures [nPos];

	switch (self._data[nPos].type)
	{
		case "movie" : 
		{
			$(figure).addClass("show");
			break;
		} 

		case "image" : 
		{
			$(figure).addClass (slideShow.STATIC.fade);
			break;
		} 
	}
};


slideShow.prototype._clearAllTransitions = function ()
{
	var self = this;
	for (var t=0; t<self.figures.length; t++)
		self._clearTransition (t);
}

slideShow.prototype._clearTransition = function (nPos)
{
	var self = this;
	var figure = self.figures [nPos];
	
	switch (self._data[nPos].type)
	{
		case "movie" : 
		{
			$(figure).removeClass("show");
			
			break;
		} 

		case "image" : 
		{
			$(figure).removeClass (slideShow.STATIC.fade);
			$(figure).removeClass (slideShow.STATIC.fade_faster);
			break;
		} 
	}
};

// ====================================================

slideShow.prototype._setTransitionsToFast = function ()
{
	var self = this;
	
	
	for (var t=0; t< self.figures.length; t++)
	{
		var figure = self.figures [t];
		var jFigure = $(figure);
		if (jFigure.attr ("class") == slideShow.STATIC.fade)
		{
			jFigure.addClass (slideShow.STATIC.fade_faster);
			jFigure.removeClass (slideShow.STATIC.fade);
		}
	}
}

slideShow.prototype._setTransition_Faster = function (nPos)
{
	var self = this;
	var figure = self.figures [nPos];

	$(figure).addClass (slideShow.STATIC.fade);
	$(figure).addClass (slideShow.STATIC.fade_faster);
};


// ====================================================

slideShow.prototype.isMovie = function (nPos)
{
	var self = this;
	return (self._data[nPos].type == "movie")
};

slideShow.prototype.getNextSlide = function (nPos)
{
	var self = this;
	var nLen = self.figures.length;
	
	var next = ((nPos+1) % nLen);

	if (self.isMovie(next))
		next = ((next+1) % nLen);

	return (next);
};

slideShow.prototype.getPrevSlide = function (nPos)
{
	var self = this;
	var nLen = self.figures.length;
	
	var prev  = ((nPos-1) % nLen);
	if (prev < 0) prev = nLen -1;
	
	if (self.isMovie(prev))
	{
		prev = ((prev-1) % nLen);
		if (prev < 0) prev = nLen -1;
	}
	
	return (prev);
};

// ====================================================

slideShow.prototype._initSelector = function (template, list)
{
	var self = this;
	
	var option_temp = $(template);
	var szHTML = option_temp.html();
	var t = 0;
	
	list.forEach (
	function (item, index)
	{
		var szPost = "";
		
		szPost = szHTML.replace ("[?=value ?]", t);
		szPost = szPost.replace ("[?=class ?]", item.type);
		
		self.slide_selector.append (szPost);

		t++;		
	});	
};

slideShow.prototype._loadFigures = function (movie_template, image_template, list)
{
	var self = this;
	
	var image_temp = $(image_template);
	var movie_temp = $(movie_template);
	var szHTML = "";
	var t = 0;
	
	list.forEach (
	function (item, index)
	{
		var szImage = item.url;
		var szCaption = item.caption;
		var szPost = "";
	
		switch (item.type)
		{
			case "image" : szHTML = image_temp.html(); break;
			case "movie" : szHTML = movie_temp.html(); break;
		}
		
		szPost = szHTML.replace ("[?=image ?]", szImage);
		szPost = szPost.replace ("[?=caption ?]", szCaption);
		szPost = szPost.replace ("[?=t ]", t);
		
		t++;
		
		self.slides.append (szPost);
	});
};

// =====================================================================

function isiPhone()
{
    return (
        //Detect iPhone
        (navigator.platform.indexOf("iPhone") != -1) ||
        //Detect iPod
        (navigator.platform.indexOf("iPod") != -1)
    );
}
