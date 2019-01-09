
defineThreeUniverse(function (THREE, UNIVERSE, options) {
    var queryTexture = null;
    return new Promise(function (resolve, reject) {

        var geometry = new THREE.PlaneBufferGeometry(2000, 2000, 1, 1);

        options.requestAnimationFrame(()=>{});

            // var groundTexture = textures[0];
            // groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
            // groundTexture.repeat.set(25, 25);
            // groundTexture.anisotropy = 16;

            // var queryTexture= textures[1];
            // var displacementMap = queryTexture.texture;

            // var mesh = new THREE.Water( geometry, {
			// 	color: params.color,
			// 	scale: params.scale,
			// 	flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
			// 	textureWidth: 1024,
			// 	textureHeight: 1024
            // } );
            
            
            // var material = new THREE.MeshLambertMaterial({
            //     color:'#4285F4', 
            //     transparent:true,
            //     opacity :0.9
            // });

            let code = `// Found this on GLSL sandbox. I really liked it, changed a few things and made it tileable.
            // :)
            // by David Hoskins.
            
            
            // Water turbulence effect by joltz0r 2013-07-04, improved 2013-07-07
            
            
            // Redefine below to see the tiling...
            // #define SHOW_TILING
            
            #define TAU 6.28318530718
            #define MAX_ITER 6
            
            void mainImage( out vec4 fragColor, in vec2 fragCoord ) 
            {
                float time = iTime * .1+23.0;
                // uv should be the 0-1 uv of texture...
                vec2 uv = fragCoord.xy / iResolution.xy*vec2(4.0,4.0);
                
            #ifdef SHOW_TILING
                vec2 p = mod(uv*TAU*2.0, TAU)-250.0;
            #else
                vec2 p = mod(uv*TAU, TAU)-250.0;
            #endif
                vec2 i = vec2(p);
                float c = 1.0;
                float inten = .005;
            
                for (int n = 0; n < MAX_ITER; n++) 
                {
                    float t = time * (1.0 - (3.5 / float(n+1)));
                    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
                    c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
                }
                c /= float(MAX_ITER);
                c = 1.17-pow(c, 1.4);
                vec3 colour = vec3(pow(abs(c), 8.0));
                colour = clamp(colour + vec3(0.0, 0.35, 0.5), 0.0, 1.0);
                
            
                #ifdef SHOW_TILING
                // Flash tile borders...
                vec2 pixel = 2.0 / iResolution.xy;
                uv *= 2.0;
            
                float f = floor(mod(iTime*.5, 2.0)); 	// Flash value.
                vec2 first = step(pixel, uv) * f;		   	// Rule out first screen pixels and flash.
                uv  = step(fract(uv), pixel);				// Add one line of pixels per tile.
                colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line
                
                #endif
                fragColor = vec4(colour, 0.7);
            }`
            var material = new THREE.ShaderToyMaterial(code)

            var mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = - Math.PI / 2;
            mesh.position.y= -40;
            mesh.receiveShadow = true;

            

            // var originalRaycast = mesh.raycast;
            // mesh.raycast = function (raycaster, intersects) {
            //     originalRaycast.call(mesh, raycaster, intersects);
            //     var thisobjectsIntersects = intersects.filter((element) => element.object == mesh);
            //     if (thisobjectsIntersects.length) {
            //         let uv = new THREE.Vector2().copy(thisobjectsIntersects[0].uv);
            //         displacementMap.transformUv(uv);
            //         var hightpixel = queryTexture.getPixelAtUv(uv.x, uv.y);
            //         var hightVal = hightpixel.r / 255 * material.displacementScale + material.displacementBias;
            //     }

            //     thisobjectsIntersects.forEach(element => {
            //         element.point.y = hightVal;

            //     });



            // }

            UNIVERSE.GroundManager.add(mesh);            
            resolve(mesh);

        });







});