//The animator
let Animate = {};

//Easings

//Linear, in goes x, out comes x
Animate.linear = (x) => x;

//Quadratic
Animate.easeIn  = (x) => x * x;
Animate.easeOut = (x) => 1 - (1 - x) * (1 - x);
Animate.easeInOut = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
Animate.easeOutBounce = (x) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}
Animate.easeInOutBack = bezier(0.68, -0.55, 0.27, 1.55);

Animate.wobbleto = function(obj, end) {
    return new Promise((resolve, reject) => {
        let start = {
            x: obj.x,
            y: obj.y,
        }

        if (end.duration == undefined) end.duration = 0;
        if (end.easing == undefined) end.easing = Animate.linear; 

        var startTime = Date.now();

        function loop() {

            let ticker = Date.now() - startTime;
            let delta = ticker/end.duration;
            let ease = end.easing(delta);

            let wobble1 = Math.sin(ticker/100) * 20;

            if (delta >= 1 || end.duration === 0) {
                obj.x = end.x;
                obj.y = end.y;
                
                resolve();
                return;
            }

            
            let lerp = (a, b, n) => {
                return (1 - n) * a + n * b;
            }


            obj.x = lerp(start.x,end.x,ease);
            obj.y = lerp(start.y,end.y,ease);
            obj.y += wobble1;
            obj.animationID = requestAnimationFrame(loop);

        }
        cancelAnimationFrame(obj.animationID);
        loop();

    });
}



//Animate to
Animate.to = function(obj,end) {

    //Make it a promise:
    return new Promise( (resolve,reject) => {

        //Set up initial state parameters
        //We need to know where we started for this to work
        //Just x and y to start
        var start = {
            x : obj.x,
            y : obj.y,
            scale: {
                x : obj.scale.x,
                y : obj.scale.y
            },
            angle : obj.angle,
            tint : obj.tint,
            alpha : obj.alpha
        }

        //Set some defaults
        if (end.duration == undefined) end.duration = 0;
        if (end.easing == undefined) end.easing = Animate.linear;

        //We need to know when we've started animating
        var startTime = Date.now();

        //This will be our personal animation loop
        function loop() {

            //Calculate our delta
            let ticker = Date.now() - startTime;
            let delta = ticker/end.duration;
            let ease = end.easing(delta);

            //Fire our custom loop function, if there is one
            if (end.loop != undefined) end.loop(obj,end,{ticker,delta,ease});

            //If we're done, just snap to the end!
            if (delta >= 1) {
                if (end.x != undefined) obj.x = end.x;
                if (end.y != undefined)obj.y = end.y;
                if (end.scale != undefined) obj.scale.set(end.scale.x,end.scale.y);
                if (end.angle != undefined) obj.angle = end.angle;
                if (end.tint != undefined) obj.tint = end.tint;
                if (end.alpha != undefined) obj.alpha = end.alpha;
                console.log("Done!");
                
                resolve();
                return;
            }

            //Interpolation function
            let lerp = (a, b, n) => {
                return (1 - n) * a + n * b;
            }

            //Interpolate (lerp) our x coordinate
            if (end.x != undefined)
                obj.x = lerp(start.x,end.x,ease);

            //Lerp our y coordinate
            if (end.y != undefined)
                obj.y = lerp(start.y,end.y,ease);

            //Lerp our scale
            if (end.scale != undefined)
                obj.scale.set(lerp(start.scale.x,end.scale.x,ease), 
                            lerp(start.scale.y,end.scale.y,ease)
                );

            //Lerp our rotation -- we'll need to clean this up, but later
            if (end.angle != undefined)
                obj.angle = lerp(start.angle,end.angle,ease);

            //Lerp our tint -- we'll also need to clean this up for each channel, but later
            if (end.tint != undefined) {
                // https://gist.github.com/nikolas/b0cce2261f1382159b507dd492e1ceef

                let sRed = (start.tint & 0xff0000) >> 16;
                let sGreen = (start.tint & 0x00ff00) >> 8;
                let sBlue = (start.tint & 0x0000ff);

                let eRed = (end.tint & 0xff0000) >> 16;
                let eGreen = (end.tint &0x00ff00) >> 8;
                let eBlue = (end.tint & 0x0000ff);

                let rRed = Math.round(lerp(sRed, eRed, ease));
                let rGreen = Math.round(lerp(sGreen, eGreen, ease));
                let rBlue = Math.round(lerp(sBlue, eBlue, ease));

                obj.tint = (rRed << 16) + (rGreen << 8) + (rBlue | 0);
            }

            //Lerp our alpha
            if (end.alpha != undefined)
                obj.alpha = lerp(start.alpha,end.alpha,ease);

            //Start the loop going!
            obj.animationID = requestAnimationFrame(loop);

        }

        //Clear the animation ID so there aren't competing loops
        cancelAnimationFrame(obj.animationID);

        //Begin the loop!
        loop();

    //End Promise
    });

};

//Stop an object animating
Animate.stop = function(obj) {
        
    cancelAnimationFrame(obj.animationID);

};

//Personal animation loop
Animate.loop = function(obj,loopFunc) {

    //No state parameters

    //We need to know when we've started animating
    var startTime = Date.now();

    //This will be our personal animation loop
    function loop() {

        //Calculate our parameters
        var params = {
            ticker : Date.now() - startTime
        };
        
        //In here it's just our own code
        loopFunc(params);

        //Start the loop going!
        obj.animationID = requestAnimationFrame(loop);

    }

    //Clear the animation ID so there aren't competing loops
    cancelAnimationFrame(obj.animationID);

    //Begin the loop!
    loop();

};