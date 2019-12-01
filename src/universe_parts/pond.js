
defineThreeUniverse(function (THREE, UNIVERSE, options) {




    function objloaderPromise(path) {
        return new Promise(function (resolve, reject) {
            (new THREE.OBJLoader()).load(options.baseUrl + path, resolve, null, reject)

        });
    }




    function stoneObject(obj, map, nmap) {
        return new Promise((resolve, reject) => {

            var normalmap = UNIVERSE.TextureLoader.load(options.baseUrl + 'resource/' + nmap);
            var diffselmap = UNIVERSE.TextureLoader.load(options.baseUrl + 'resource/' + map);
            Promise.all([normalmap, diffselmap, objloaderPromise('resource/' + obj)])
                .then(([normalmap, diffusemap, obj]) => {

                    var geom = obj.getObjectByName("Stone_2_");
                    geom.material.map = diffusemap;
                    geom.material.normalmap = normalmap;
                    resolve(geom);

                })

        })


    }



    var WaterShader = function (parameters, others) {

        THREE.MeshLambertMaterial.call(this, parameters);

    }

    WaterShader.prototype = Object.create(THREE.MeshLambertMaterial.prototype);

    WaterShader.prototype.onBeforeCompile = function (shader) {

        this.uniforms = shader.uniforms;
        this.uniforms.iTime = { value: 0 }



        shader.vertexShader = `
#define LAMBERT
#define USE_MAP
varying vec3 vLightFront;
uniform float iTime;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <bsdfs>
#include <lights_pars_begin>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <lights_lambert_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}
        `
        shader.fragmentShader = `
        #define USE_MAP
        uniform vec3 diffuse;
        uniform vec3 emissive;
        uniform float opacity;
        uniform float iTime;
        varying vec3 vLightFront;
        #ifdef DOUBLE_SIDED
            varying vec3 vLightBack;
        #endif
        #include <common>
        #include <packing>
        #include <dithering_pars_fragment>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>
        #include <uv2_pars_fragment>
        #include <map_pars_fragment>
        #include <alphamap_pars_fragment>
        #include <aomap_pars_fragment>
        #include <lightmap_pars_fragment>
        #include <emissivemap_pars_fragment>
        #include <envmap_pars_fragment>
        #include <bsdfs>
        #include <lights_pars_begin>
        #include <fog_pars_fragment>
        #include <shadowmap_pars_fragment>
        #include <shadowmask_pars_fragment>
        #include <specularmap_pars_fragment>
        #include <logdepthbuf_pars_fragment>
        #include <clipping_planes_pars_fragment>
        void main() {
            #include <clipping_planes_fragment>
            vec4 diffuseColor = vec4( diffuse, opacity );
            ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
            vec3 totalEmissiveRadiance = emissive;
            #include <logdepthbuf_fragment>
            #include <map_fragment>
            

            // #define SHOW_TILING
            #define TAU 6.28318530718
            #define MAX_ITER 6
            

            vec2 uv = vUv;
            
            
            
            vec2 iResolution = vec2(256.0,256.0);
            float time = iTime * .1+23.0;
            
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
                colour = clamp(colour + vec3(0.0, 0.25, 0.5), 0.0, 1.0);
                
            
                #ifdef SHOW_TILING
                // Flash tile borders...
                vec2 pixel = 2.0 / iResolution.xy;
                uv *= 2.0;
            
                float f = floor(mod(iTime*.5, 2.0)); 	// Flash value.
                vec2 first = step(pixel, uv) * f;		   	// Rule out first screen pixels and flash.
                uv  = step(fract(uv), pixel);				// Add one line of pixels per tile.
                colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line
                
                #endif
                diffuseColor = vec4(colour, 0.2);
            



            #include <color_fragment>
            #include <alphamap_fragment>
            #include <alphatest_fragment>
            #include <specularmap_fragment>
            #include <emissivemap_fragment>
            // accumulation
            reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );
            #include <lightmap_fragment>
            reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );
            #ifdef DOUBLE_SIDED
                reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
            #else
                reflectedLight.directDiffuse = vLightFront;
            #endif
            reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();
            // modulation
            #include <aomap_fragment>
            vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
            #include <envmap_fragment>


            gl_FragColor = vec4( outgoingLight, diffuseColor.a );

            
            #include <tonemapping_fragment>
            #include <encodings_fragment>
            #include <fog_fragment>
            #include <premultiplied_alpha_fragment>
            #include <dithering_fragment>
        }
        `

    }

























    return new Promise(function (resolve, reject) {


        var geometry = new THREE.PlaneBufferGeometry(2000, 2000, 1, 1);
        var clock = new THREE.Clock();




        var material = new WaterShader({});
        options.requestAnimationFrame(() => {
            if (material.uniforms) {
                material.uniforms.iTime.value = clock.getElapsedTime() ;    
            }
            
        });


        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = - Math.PI / 2;
        mesh.position.y = -40;
        mesh.receiveShadow = true;

        UNIVERSE.GroundManager.add(mesh);


        stoneObject('stones/stone1/Stone Pack1_Stone_2.obj', 'stones/stone1/Stone_2_DiffuseMap.jpg', 'stones/stone1/Stone_2 NormalsMap.jpg').then((stone) => {
            stone.castShadow = true;
            var stone1 = stone.clone();
            stone1.position.set(100, -430, 0);
            mesh.add(stone1);

            var stone2 = stone.clone();
            stone2.rotateZ(Math.PI / 2 * 30);
            stone2.scale.set(2, 3, 2);
            stone2.position.set(100, 700, 0);
            mesh.add(stone2);

            var stone3 = stone.clone();
            stone3.rotateZ(Math.PI / 2 * 15);
            stone3.scale.set(3, 2, 2);
            stone3.position.set(270, 700, 0);
            mesh.add(stone3);


            var stone4 = stone.clone();
            stone4.rotateZ(Math.PI / 2 * 2.5)
            stone4.scale.set(2, 2, 3);
            stone4.position.set(-900, -150, 0);
            mesh.add(stone4);



            resolve(mesh);
        })




    });







});