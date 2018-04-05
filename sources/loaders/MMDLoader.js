import { Loader } from './Loader.js'
import { VectorKeyframeTrack } from '../animation/tracks/VectorKeyframeTrack.js'
import { QuaternionKeyframeTrack } from '../animation/tracks/QuaternionKeyframeTrack.js'
import { NumberKeyframeTrack } from '../animation/tracks/NumberKeyframeTrack.js'
import { LinearInterpolant } from '../math/interpolants/LinearInterpolant.js'
import { AudioListener } from '../audio/AudioListener.js'
import { Audio } from '../audio/Audio.js'
import { AudioLoader } from './AudioLoader.js'
import { Quaternion } from '../math/Quaternion.js'
import { Euler } from '../math/Euler.js'
import { Vector3 } from '../math/Vector3.js'
import { AnimationClip } from '../animation/AnimationClip.js'
import { FileLoader } from './FileLoader.js'
import { BufferGeometry } from '../core/BufferGeometry.js'
import { Float32BufferAttribute } from '../core/BufferAttribute.js'
import { TextureLoader } from './TextureLoader.js'
import { TGALoader } from './TGALoader.js'
import { Color } from '../math/Color.js'
import { MeshToonMaterial } from '../materials/MeshToonMaterial.js'
import { SkinnedMesh } from '../objects/SkinnedMesh.js'
import { MMDPhysics } from '../animation/MMDPhysics.js'
import { AnimationMixer } from '../animation/AnimationMixer.js'
import { CCDIKSolver } from '../animation/CCDIKSolver.js'
import {
	FrontSide,
	DoubleSide,
	CustomBlending,
	SrcAlphaFactor,
	OneMinusSrcAlphaFactor,
	DstAlphaFactor,
	MultiplyOperation,
	AddOperation,
	SphericalReflectionMapping,
	RepeatWrapping
} from '../constants.js'
import { DefaultLoadingManager } from './LoadingManager.js'
import { LoaderUtils } from './LoaderUtils.js'
import { Interpolant } from '../math/Interpolant.js'
import { _Math } from '../math/Math.js'



var MMDLoader = function ( manager ) {

	Loader.call( this );
	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
	this.parser = new MMDParser.Parser();
	this.textureCrossOrigin = null;

};

MMDLoader.prototype = Object.create( Loader.prototype );
MMDLoader.prototype.constructor = MMDLoader;


MMDLoader.prototype.defaultToonTextures = [
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/bWiiMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh8aBHZBl14e8wAAAABJRU5ErkJggg==',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOUlEQVRYR+3WMREAMAwDsYY/yoDI7MLwIiP40+RJklfcCCBAgAABAgTqArfb/QMCCBAgQIAAgbbAB3z/e0F3js2cAAAAAElFTkSuQmCC',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/B5ilMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh81dWyx0gFwKAAAAABJRU5ErkJggg==',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOklEQVRYR+3WoREAMAwDsWb/UQtCy9wxTOQJ/oQ8SXKKGwEECBAgQIBAXeDt7f4BAQQIECBAgEBb4AOz8Hzx7WLY4wAAAABJRU5ErkJggg==',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABPUlEQVRYR+1XwW7CMAy1+f9fZOMysSEOEweEOPRNdm3HbdOyIhAcklPrOs/PLy9RygBALxzcCDQFmgJNgaZAU6Ap0BR4PwX8gsRMVLssMRH5HcpzJEaWL7EVg9F1IHRlyqQohgVr4FGUlUcMJSjcUlDw0zvjeun70cLWmneoyf7NgBTQSniBTQQSuJAZsOnnaczjIMb5hCiuHKxokCrJfVnrctyZL0PkJAJe1HMil4nxeyi3Ypfn1kX51jpPvo/JeCNC4PhVdHdJw2XjBR8brF8PEIhNVn12AgP7uHsTBguBn53MUZCqv7Lp07Pn5k1Ro+uWmUNn7D+M57rtk7aG0Vo73xyF/fbFf0bPJjDXngnGocDTdFhygZjwUQrMNrDcmZlQT50VJ/g/UwNyHpu778+yW+/ksOz/BFo54P4AsUXMfRq7XWsAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACMElEQVRYR+2Xv4pTQRTGf2dubhLdICiii2KnYKHVolhauKWPoGAnNr6BD6CvIVaihYuI2i1ia0BY0MZGRHQXjZj/mSPnnskfNWiWZUlzJ5k7M2cm833nO5Mziej2DWWJRUoCpQKlAntSQCqgw39/iUWAGmh37jrRnVsKlgpiqmkoGVABA7E57fvY+pJDdgKqF6HzFCSADkDq+F6AHABtQ+UMVE5D7zXod7fFNhTEckTbj5XQgHzNN+5tQvc5NG7C6BNkp6D3EmpXHDR+dQAjFLchW3VS9rlw3JBh+B7ys5Cf9z0GW1C/7P32AyBAOAz1q4jGliIH3YPuBnSfQX4OGreTIgEYQb/pBDtPnEQ4CivXYPAWBk13oHrB54yA9QuSn2H4AcKRpEILDt0BUzj+RLR1V5EqjD66NPRBVpLcQwjHoHYJOhsQv6U4mnzmrIXJCFr4LDwm/xBUoboG9XX4cc9VKdYoSA2yk5NQLJaKDUjTBoveG3Z2TElTxwjNK4M3LEZgUdDdruvcXzKBpStgp2NPiWi3ks9ZXxIoFVi+AvHLdc9TqtjL3/aYjpPlrzOcEnK62Szhimdd7xX232zFDTgtxezOu3WNMRLjiKgjtOhHVMd1loynVHvOgjuIIJMaELEqhJAV/RCSLbWTcfPFakFgFlALTRRvx+ok6Hlp/Q+v3fmx90bMyUzaEAhmM3KvHlXTL5DxnbGf/1M8RNNACLL5MNtPxP/mypJAqcDSFfgFhpYqWUzhTEAAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII='
];


MMDLoader.prototype.setTextureCrossOrigin = function ( value ) {

	this.textureCrossOrigin = value;

};

MMDLoader.prototype.load = function ( modelUrl, vmdUrls, callback, onProgress, onError ) {

	var scope = this;

	this.loadModel( modelUrl, function ( mesh ) {

		scope.loadVmds( vmdUrls, function ( vmd ) {

			scope.pourVmdIntoModel( mesh, vmd );
			callback( mesh );

		}, onProgress, onError );

	}, onProgress, onError );

};

MMDLoader.prototype.loadModel = function ( url, callback, onProgress, onError ) {

	var scope = this;

	var texturePath = LoaderUtils.extractUrlBase( url );
	var modelExtension = this.extractExtension( url );

	this.loadFileAsBuffer( url, function ( buffer ) {

		callback( scope.createModel( buffer, modelExtension, texturePath, onProgress, onError ) );

	}, onProgress, onError );

};

MMDLoader.prototype.createModel = function ( buffer, modelExtension, texturePath, onProgress, onError ) {

	return this.createMesh( this.parseModel( buffer, modelExtension ), texturePath, onProgress, onError );

};

MMDLoader.prototype.loadVmd = function ( url, callback, onProgress, onError ) {

	var scope = this;

	this.loadFileAsBuffer( url, function ( buffer ) {

		callback( scope.parseVmd( buffer ) );

	}, onProgress, onError );

};

MMDLoader.prototype.loadVmds = function ( urls, callback, onProgress, onError ) {

	var scope = this;

	var vmds = [];
	urls = urls.slice();

	function run() {

		var url = urls.shift();

		scope.loadVmd( url, function ( vmd ) {

			vmds.push( vmd );

			if ( urls.length > 0 ) {

				run();

			} else {

				callback( scope.mergeVmds( vmds ) );

			}

		}, onProgress, onError );

	}

	run();

};

MMDLoader.prototype.loadAudio = function ( url, callback, onProgress, onError ) {

	var listener = new AudioListener();
	var audio = new Audio( listener );
	var loader = new AudioLoader( this.manager );

	loader.load( url, function ( buffer ) {

		audio.setBuffer( buffer );
		callback( audio, listener );

	}, onProgress, onError );

};

MMDLoader.prototype.loadVpd = function ( url, callback, onProgress, onError, params ) {

	var scope = this;

	var func = ( ( params && params.charcode === 'unicode' ) ? this.loadFileAsText : this.loadFileAsShiftJISText ).bind( this );

	func( url, function ( text ) {

		callback( scope.parseVpd( text ) );

	}, onProgress, onError );

};

MMDLoader.prototype.parseModel = function ( buffer, modelExtension ) {

	// Should I judge from model data header?
	switch ( modelExtension.toLowerCase() ) {

		case 'pmd':
			return this.parsePmd( buffer );

		case 'pmx':
			return this.parsePmx( buffer );

		default:
			throw 'extension ' + modelExtension + ' is not supported.';

	}

};

MMDLoader.prototype.parsePmd = function ( buffer ) {

	return this.parser.parsePmd( buffer, true );

};

MMDLoader.prototype.parsePmx = function ( buffer ) {

	return this.parser.parsePmx( buffer, true );

};

MMDLoader.prototype.parseVmd = function ( buffer ) {

	return this.parser.parseVmd( buffer, true );

};

MMDLoader.prototype.parseVpd = function ( text ) {

	return this.parser.parseVpd( text, true );

};

MMDLoader.prototype.mergeVmds = function ( vmds ) {

	return this.parser.mergeVmds( vmds );

};

MMDLoader.prototype.pourVmdIntoModel = function ( mesh, vmd, name ) {

	this.createAnimation( mesh, vmd, name );

};

MMDLoader.prototype.pourVmdIntoCamera = function ( camera, vmd, name ) {

	var helper = new MMDLoader.DataCreationHelper();

	var initAnimation = function () {

		var orderedMotions = helper.createOrderedMotionArray( vmd.cameras );

		var times = [];
		var centers = [];
		var quaternions = [];
		var positions = [];
		var fovs = [];

		var cInterpolations = [];
		var qInterpolations = [];
		var pInterpolations = [];
		var fInterpolations = [];

		var quaternion = new Quaternion();
		var euler = new Euler();
		var position = new Vector3();
		var center = new Vector3();

		var pushVector3 = function ( array, vec ) {

			array.push( vec.x );
			array.push( vec.y );
			array.push( vec.z );

		};

		var pushQuaternion = function ( array, q ) {

			array.push( q.x );
			array.push( q.y );
			array.push( q.z );
			array.push( q.w );

		};

		var pushInterpolation = function ( array, interpolation, index ) {

			array.push( interpolation[ index * 4 + 0 ] / 127 ); // x1
			array.push( interpolation[ index * 4 + 1 ] / 127 ); // x2
			array.push( interpolation[ index * 4 + 2 ] / 127 ); // y1
			array.push( interpolation[ index * 4 + 3 ] / 127 ); // y2

		};

		var createTrack = function ( node, type, times, values, interpolations ) {

			
			if ( times.length > 2 ) {

				times = times.slice();
				values = values.slice();
				interpolations = interpolations.slice();

				var stride = values.length / times.length;
				var interpolateStride = ( stride === 3 ) ? 12 : 4; // 3: Vector3, others: Quaternion or Number

				var index = 1;

				for ( var aheadIndex = 2, endIndex = times.length; aheadIndex < endIndex; aheadIndex ++ ) {

					for ( var i = 0; i < stride; i ++ ) {

						if ( values[ index * stride + i ] !== values[ ( index - 1 ) * stride + i ] ||
							values[ index * stride + i ] !== values[ aheadIndex * stride + i ] ) {

							index ++;
							break;

						}

					}

					if ( aheadIndex > index ) {

						times[ index ] = times[ aheadIndex ];

						for ( var i = 0; i < stride; i ++ ) {

							values[ index * stride + i ] = values[ aheadIndex * stride + i ];

						}

						for ( var i = 0; i < interpolateStride; i ++ ) {

							interpolations[ index * interpolateStride + i ] = interpolations[ aheadIndex * interpolateStride + i ];

						}

					}

				}

				times.length = index + 1;
				values.length = ( index + 1 ) * stride;
				interpolations.length = ( index + 1 ) * interpolateStride;

			}

			return new MMDLoader[ type ]( node, times, values, interpolations );

		};

		for ( var i = 0; i < orderedMotions.length; i ++ ) {

			var m = orderedMotions[ i ];

			var time = m.frameNum / 30;
			var pos = m.position;
			var rot = m.rotation;
			var distance = m.distance;
			var fov = m.fov;
			var interpolation = m.interpolation;

			position.set( 0, 0, - distance );
			center.set( pos[ 0 ], pos[ 1 ], pos[ 2 ] );

			euler.set( - rot[ 0 ], - rot[ 1 ], - rot[ 2 ] );
			quaternion.setFromEuler( euler );

			position.add( center );
			position.applyQuaternion( quaternion );

			
			if ( times.length > 0 && time < times[ times.length - 1 ] + ( 1 / 30 ) * 1.5 ) {

				times[ times.length - 1 ] = time - 1e-13;

			}

			times.push( time );

			pushVector3( centers, center );
			pushQuaternion( quaternions, quaternion );
			pushVector3( positions, position );

			fovs.push( fov );

			for ( var j = 0; j < 3; j ++ ) {

				pushInterpolation( cInterpolations, interpolation, j );

			}

			pushInterpolation( qInterpolations, interpolation, 3 );

			// use same one parameter for x, y, z axis.
			for ( var j = 0; j < 3; j ++ ) {

				pushInterpolation( pInterpolations, interpolation, 4 );

			}

			pushInterpolation( fInterpolations, interpolation, 5 );

		}

		if ( times.length === 0 ) return;

		var tracks = [];

		tracks.push( createTrack( '.center', 'VectorKeyframeTrackEx', times, centers, cInterpolations ) );
		tracks.push( createTrack( '.quaternion', 'QuaternionKeyframeTrackEx', times, quaternions, qInterpolations ) );
		tracks.push( createTrack( '.position', 'VectorKeyframeTrackEx', times, positions, pInterpolations ) );
		tracks.push( createTrack( '.fov', 'NumberKeyframeTrackEx', times, fovs, fInterpolations ) );

		var clip = new AnimationClip( name === undefined ? _Math.generateUUID() : name, - 1, tracks );

		if ( camera.center === undefined ) camera.center = new Vector3( 0, 0, 0 );
		if ( camera.animations === undefined ) camera.animations = [];
		camera.animations.push( clip );

	};

	initAnimation();

};

MMDLoader.prototype.extractExtension = function ( url ) {

	var index = url.lastIndexOf( '.' );

	if ( index < 0 ) {

		return null;

	}

	return url.slice( index + 1 );

};

MMDLoader.prototype.loadFile = function ( url, onLoad, onProgress, onError, responseType, mimeType ) {

	var loader = new FileLoader( this.manager );

	if ( mimeType !== undefined ) loader.setMimeType( mimeType );

	loader.setResponseType( responseType );

	var request = loader.load( url, function ( result ) {

		onLoad( result );

	}, onProgress, onError );

	return request;

};

MMDLoader.prototype.loadFileAsBuffer = function ( url, onLoad, onProgress, onError ) {

	this.loadFile( url, onLoad, onProgress, onError, 'arraybuffer' );

};

MMDLoader.prototype.loadFileAsText = function ( url, onLoad, onProgress, onError ) {

	this.loadFile( url, onLoad, onProgress, onError, 'text' );

};

MMDLoader.prototype.loadFileAsShiftJISText = function ( url, onLoad, onProgress, onError ) {

	this.loadFile( url, onLoad, onProgress, onError, 'text', 'text/plain; charset=shift_jis' );

};

MMDLoader.prototype.createMesh = function ( model, texturePath, onProgress, onError ) {

	var scope = this;
	var geometry = new BufferGeometry();
	var materials = [];

	var buffer = {};

	buffer.vertices = [];
	buffer.uvs = [];
	buffer.normals = [];
	buffer.skinIndices = [];
	buffer.skinWeights = [];
	buffer.indices = [];

	var initVartices = function () {

		for ( var i = 0; i < model.metadata.vertexCount; i ++ ) {

			var v = model.vertices[ i ];

			for ( var j = 0, jl = v.position.length; j < jl; j ++ ) {

				buffer.vertices.push( v.position[ j ] );

			}

			for ( var j = 0, jl = v.normal.length; j < jl; j ++ ) {

				buffer.normals.push( v.normal[ j ] );

			}

			for ( var j = 0, jl = v.uv.length; j < jl; j ++ ) {

				buffer.uvs.push( v.uv[ j ] );

			}

			for ( var j = 0; j < 4; j ++ ) {

				buffer.skinIndices.push( v.skinIndices.length - 1 >= j ? v.skinIndices[ j ] : 0.0 );

			}

			for ( var j = 0; j < 4; j ++ ) {

				buffer.skinWeights.push( v.skinWeights.length - 1 >= j ? v.skinWeights[ j ] : 0.0 );

			}

		}

	};

	var initFaces = function () {

		for ( var i = 0; i < model.metadata.faceCount; i ++ ) {

			var f = model.faces[ i ];

			for ( var j = 0, jl = f.indices.length; j < jl; j ++ ) {

				buffer.indices.push( f.indices[ j ] );

			}

		}

	};

	var initBones = function () {

		var bones = [];

		var rigidBodies = model.rigidBodies;
		var dictionary = {};

		for ( var i = 0, il = rigidBodies.length; i < il; i ++ ) {

			var body = rigidBodies[ i ];
			var value = dictionary[ body.boneIndex ];

			// keeps greater number if already value is set without any special reasons
			value = value === undefined ? body.type : Math.max( body.type, value );

			dictionary[ body.boneIndex ] = value;

		}

		for ( var i = 0; i < model.metadata.boneCount; i ++ ) {

			var bone = {};
			var b = model.bones[ i ];

			bone.parent = b.parentIndex;
			bone.name = b.name;
			bone.pos = [ b.position[ 0 ], b.position[ 1 ], b.position[ 2 ] ];
			bone.rotq = [ 0, 0, 0, 1 ];
			bone.scl = [ 1, 1, 1 ];

			if ( bone.parent !== - 1 ) {

				bone.pos[ 0 ] -= model.bones[ bone.parent ].position[ 0 ];
				bone.pos[ 1 ] -= model.bones[ bone.parent ].position[ 1 ];
				bone.pos[ 2 ] -= model.bones[ bone.parent ].position[ 2 ];

			}

			bone.rigidBodyType = dictionary[ i ] !== undefined ? dictionary[ i ] : - 1;

			bones.push( bone );

		}

		geometry.bones = bones;

	};

	var initIKs = function () {

		var iks = [];

		// TODO: remove duplicated codes between PMD and PMX
		if ( model.metadata.format === 'pmd' ) {

			for ( var i = 0; i < model.metadata.ikCount; i ++ ) {

				var ik = model.iks[ i ];
				var param = {};

				param.target = ik.target;
				param.effector = ik.effector;
				param.iteration = ik.iteration;
				param.maxAngle = ik.maxAngle * 4;
				param.links = [];

				for ( var j = 0; j < ik.links.length; j ++ ) {

					var link = {};
					link.index = ik.links[ j ].index;

					if ( model.bones[ link.index ].name.indexOf( 'ひざ' ) >= 0 ) {

						link.limitation = new Vector3( 1.0, 0.0, 0.0 );

					}

					param.links.push( link );

				}

				iks.push( param );

			}

		} else {

			for ( var i = 0; i < model.metadata.boneCount; i ++ ) {

				var b = model.bones[ i ];
				var ik = b.ik;

				if ( ik === undefined ) {

					continue;

				}

				var param = {};

				param.target = i;
				param.effector = ik.effector;
				param.iteration = ik.iteration;
				param.maxAngle = ik.maxAngle;
				param.links = [];

				for ( var j = 0; j < ik.links.length; j ++ ) {

					var link = {};
					link.index = ik.links[ j ].index;
					link.enabled = true;

					if ( ik.links[ j ].angleLimitation === 1 ) {

						link.limitation = new Vector3( 1.0, 0.0, 0.0 );
						// TODO: use limitation angles
						// link.lowerLimitationAngle;
						// link.upperLimitationAngle;

					}

					param.links.push( link );

				}

				iks.push( param );

			}

		}

		geometry.iks = iks;

	};

	var initGrants = function () {

		if ( model.metadata.format === 'pmd' ) {

			return;

		}

		var grants = [];

		for ( var i = 0; i < model.metadata.boneCount; i ++ ) {

			var b = model.bones[ i ];
			var grant = b.grant;

			if ( grant === undefined ) {

				continue;

			}

			var param = {};

			param.index = i;
			param.parentIndex = grant.parentIndex;
			param.ratio = grant.ratio;
			param.isLocal = grant.isLocal;
			param.affectRotation = grant.affectRotation;
			param.affectPosition = grant.affectPosition;
			param.transformationClass = b.transformationClass;

			grants.push( param );

		}

		grants.sort( function ( a, b ) {

			return a.transformationClass - b.transformationClass;

		} );

		geometry.grants = grants;

	};

	var initMorphs = function () {

		function updateVertex( attribute, index, v, ratio ) {

			attribute.array[ index * 3 + 0 ] += v.position[ 0 ] * ratio;
			attribute.array[ index * 3 + 1 ] += v.position[ 1 ] * ratio;
			attribute.array[ index * 3 + 2 ] += v.position[ 2 ] * ratio;

		}

		function updateVertices( attribute, m, ratio ) {

			for ( var i = 0; i < m.elementCount; i ++ ) {

				var v = m.elements[ i ];

				var index;

				if ( model.metadata.format === 'pmd' ) {

					index = model.morphs[ 0 ].elements[ v.index ].index;

				} else {

					index = v.index;

				}

				updateVertex( attribute, index, v, ratio );

			}

		}

		var morphTargets = [];
		var attributes = [];

		for ( var i = 0; i < model.metadata.morphCount; i ++ ) {

			var m = model.morphs[ i ];
			var params = { name: m.name };

			var attribute = new Float32BufferAttribute( model.metadata.vertexCount * 3, 3 );
			attribute.name = m.name;

			for ( var j = 0; j < model.metadata.vertexCount * 3; j ++ ) {

				attribute.array[ j ] = buffer.vertices[ j ];

			}

			if ( model.metadata.format === 'pmd' ) {

				if ( i !== 0 ) {

					updateVertices( attribute, m, 1.0 );

				}

			} else {

				if ( m.type === 0 ) { // group

					for ( var j = 0; j < m.elementCount; j ++ ) {

						var m2 = model.morphs[ m.elements[ j ].index ];
						var ratio = m.elements[ j ].ratio;

						if ( m2.type === 1 ) {

							updateVertices( attribute, m2, ratio );

						} else {

							// TODO: implement

						}

					}

				} else if ( m.type === 1 ) { // vertex

					updateVertices( attribute, m, 1.0 );

				} else if ( m.type === 2 ) { // bone

					// TODO: implement

				} else if ( m.type === 3 ) { // uv

					// TODO: implement

				} else if ( m.type === 4 ) { // additional uv1

					// TODO: implement

				} else if ( m.type === 5 ) { // additional uv2

					// TODO: implement

				} else if ( m.type === 6 ) { // additional uv3

					// TODO: implement

				} else if ( m.type === 7 ) { // additional uv4

					// TODO: implement

				} else if ( m.type === 8 ) { // material

					// TODO: implement

				}

			}

			morphTargets.push( params );
			attributes.push( attribute );

		}

		geometry.morphTargets = morphTargets;
		geometry.morphAttributes.position = attributes;

	};

	var initMaterials = function () {

		var textures = {};
		var textureLoader = new TextureLoader( scope.manager );
		var tgaLoader = new TGALoader( scope.manager );
		var canvas = document.createElement( 'canvas' );
		var context = canvas.getContext( '2d' );
		var offset = 0;
		var materialParams = [];

		if ( scope.textureCrossOrigin !== null ) textureLoader.setCrossOrigin( scope.textureCrossOrigin );

		function loadTexture( filePath, params ) {

			if ( params === undefined ) {

				params = {};

			}

			var fullPath;

			if ( params.defaultTexturePath === true ) {

				try {

					fullPath = scope.defaultToonTextures[ parseInt( filePath.match( 'toon([0-9]{2})\.bmp$' )[ 1 ] ) ];

				} catch ( e ) {

					console.warn( 'MMDLoader: ' + filePath + ' seems like not right default texture path. Using toon00.bmp instead.' );
					fullPath = scope.defaultToonTextures[ 0 ];

				}

			} else {

				fullPath = texturePath + filePath;

			}

			if ( textures[ fullPath ] !== undefined ) return fullPath;

			var loader = Loader.Handlers.get( fullPath );

			if ( loader === null ) {

				loader = ( filePath.indexOf( '.tga' ) >= 0 ) ? tgaLoader : textureLoader;

			}

			var texture = loader.load( fullPath, function ( t ) {

				// MMD toon texture is Axis-Y oriented
				// but Three.js gradient map is Axis-X oriented.
				// So here replaces the toon texture image with the rotated one.
				if ( params.isToonTexture === true ) {

					var image = t.image;
					var width = image.width;
					var height = image.height;

					canvas.width = width;
					canvas.height = height;

					context.clearRect( 0, 0, width, height );
					context.translate( width / 2.0, height / 2.0 );
					context.rotate( 0.5 * Math.PI ); // 90.0 * Math.PI / 180.0
					context.translate( - width / 2.0, - height / 2.0 );
					context.drawImage( image, 0, 0 );

					t.image = context.getImageData( 0, 0, width, height );

				}

				t.flipY = false;
				t.wrapS = RepeatWrapping;
				t.wrapT = RepeatWrapping;

				for ( var i = 0; i < texture.readyCallbacks.length; i ++ ) {

					texture.readyCallbacks[ i ]( texture );

				}

				delete texture.readyCallbacks;

			}, onProgress, onError );

			if ( params.sphericalReflectionMapping === true ) {

				texture.mapping = SphericalReflectionMapping;

			}

			texture.readyCallbacks = [];

			textures[ fullPath ] = texture;

			return fullPath;

		}

		function getTexture( name, textures ) {

			if ( textures[ name ] === undefined ) {

				console.warn( 'MMDLoader: Undefined texture', name );

			}

			return textures[ name ];

		}

		for ( var i = 0; i < model.metadata.materialCount; i ++ ) {

			var m = model.materials[ i ];
			var params = {};

			params.faceOffset = offset;
			params.faceNum = m.faceCount;

			offset += m.faceCount;

			params.name = m.name;

			
			params.color = new Color( m.diffuse[ 0 ], m.diffuse[ 1 ], m.diffuse[ 2 ] );
			params.opacity = m.diffuse[ 3 ];
			params.specular = new Color( m.specular[ 0 ], m.specular[ 1 ], m.specular[ 2 ] );
			params.shininess = m.shininess;

			if ( params.opacity === 1.0 ) {

				params.side = FrontSide;
				params.transparent = false;

			} else {

				params.side = DoubleSide;
				params.transparent = true;

			}

			if ( model.metadata.format === 'pmd' ) {

				if ( m.fileName ) {

					var fileName = m.fileName;
					var fileNames = [];

					var index = fileName.lastIndexOf( '*' );

					if ( index >= 0 ) {

						fileNames.push( fileName.slice( 0, index ) );
						fileNames.push( fileName.slice( index + 1 ) );

					} else {

						fileNames.push( fileName );

					}

					for ( var j = 0; j < fileNames.length; j ++ ) {

						var n = fileNames[ j ];

						if ( n.indexOf( '.sph' ) >= 0 || n.indexOf( '.spa' ) >= 0 ) {

							params.envMap = loadTexture( n, { sphericalReflectionMapping: true } );

							if ( n.indexOf( '.sph' ) >= 0 ) {

								params.envMapType = MultiplyOperation;

							} else {

								params.envMapType = AddOperation;

							}

						} else {

							params.map = loadTexture( n );

						}

					}

				}

			} else {

				if ( m.textureIndex !== - 1 ) {

					var n = model.textures[ m.textureIndex ];
					params.map = loadTexture( n );

				}

				// TODO: support m.envFlag === 3
				if ( m.envTextureIndex !== - 1 && ( m.envFlag === 1 || m.envFlag == 2 ) ) {

					var n = model.textures[ m.envTextureIndex ];
					params.envMap = loadTexture( n, { sphericalReflectionMapping: true } );

					if ( m.envFlag === 1 ) {

						params.envMapType = MultiplyOperation;

					} else {

						params.envMapType = AddOperation;

					}

				}

			}

			var coef = ( params.map === undefined ) ? 1.0 : 0.2;
			params.emissive = new Color( m.ambient[ 0 ] * coef, m.ambient[ 1 ] * coef, m.ambient[ 2 ] * coef );

			materialParams.push( params );

		}

		for ( var i = 0; i < materialParams.length; i ++ ) {

			var p = materialParams[ i ];
			var p2 = model.materials[ i ];
			var m = new MeshToonMaterial();

			geometry.addGroup( p.faceOffset * 3, p.faceNum * 3, i );

			if ( p.name !== undefined ) m.name = p.name;

			m.skinning = geometry.bones.length > 0 ? true : false;
			m.morphTargets = geometry.morphTargets.length > 0 ? true : false;
			m.lights = true;
			m.side = ( model.metadata.format === 'pmx' && ( p2.flag & 0x1 ) === 1 ) ? DoubleSide : p.side;
			m.transparent = p.transparent;
			m.fog = true;

			m.blending = CustomBlending;
			m.blendSrc = SrcAlphaFactor;
			m.blendDst = OneMinusSrcAlphaFactor;
			m.blendSrcAlpha = SrcAlphaFactor;
			m.blendDstAlpha = DstAlphaFactor;

			if ( p.map !== undefined ) {

				m.faceOffset = p.faceOffset;
				m.faceNum = p.faceNum;

				// Check if this part of the texture image the material uses requires transparency
				function checkTextureTransparency( m ) {

					m.map.readyCallbacks.push( function ( t ) {

						// Is there any efficient ways?
						function createImageData( image ) {

							var c = document.createElement( 'canvas' );
							c.width = image.width;
							c.height = image.height;

							var ctx = c.getContext( '2d' );
							ctx.drawImage( image, 0, 0 );

							return ctx.getImageData( 0, 0, c.width, c.height );

						}

						function detectTextureTransparency( image, uvs, indices ) {

							var width = image.width;
							var height = image.height;
							var data = image.data;
							var threshold = 253;

							if ( data.length / ( width * height ) !== 4 ) {

								return false;

							}

							for ( var i = 0; i < indices.length; i += 3 ) {

								var centerUV = { x: 0.0, y: 0.0 };

								for ( var j = 0; j < 3; j ++ ) {

									var index = indices[ i * 3 + j ];
									var uv = { x: uvs[ index * 2 + 0 ], y: uvs[ index * 2 + 1 ] };

									if ( getAlphaByUv( image, uv ) < threshold ) {

										return true;

									}

									centerUV.x += uv.x;
									centerUV.y += uv.y;

								}

								centerUV.x /= 3;
								centerUV.y /= 3;

								if ( getAlphaByUv( image, centerUV ) < threshold ) {

									return true;

								}

							}

							return false;

						}

						
						function getAlphaByUv( image, uv ) {

							var width = image.width;
							var height = image.height;

							var x = Math.round( uv.x * width ) % width;
							var y = Math.round( uv.y * height ) % height;

							if ( x < 0 ) {

								x += width;

							}

							if ( y < 0 ) {

								y += height;

							}

							var index = y * width + x;

							return image.data[ index * 4 + 3 ];

						}

						var imageData = t.image.data !== undefined ? t.image : createImageData( t.image );
						var indices = geometry.index.array.slice( m.faceOffset * 3, m.faceOffset * 3 + m.faceNum * 3 );

						if ( detectTextureTransparency( imageData, geometry.attributes.uv.array, indices ) ) m.transparent = true;

						delete m.faceOffset;
						delete m.faceNum;

					} );

				}

				m.map = getTexture( p.map, textures );
				checkTextureTransparency( m );

			}

			if ( p.envMap !== undefined ) {

				m.envMap = getTexture( p.envMap, textures );
				m.combine = p.envMapType;

			}

			m.opacity = p.opacity;
			m.color = p.color;

			if ( p.emissive !== undefined ) {

				m.emissive = p.emissive;

			}

			m.specular = p.specular;
			m.shininess = Math.max( p.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

			if ( model.metadata.format === 'pmd' ) {

				function isDefaultToonTexture( n ) {

					if ( n.length !== 10 ) {

						return false;

					}

					return n.match( /toon(10|0[0-9]).bmp/ ) === null ? false : true;

				}

				// parameters for OutlineEffect
				m.outlineParameters = {
					thickness: p2.edgeFlag === 1 ? 0.003 : 0.0,
					color: new Color( 0.0, 0.0, 0.0 ),
					alpha: 1.0
				};

				if ( m.outlineParameters.thickness === 0.0 ) m.outlineParameters.visible = false;

				var toonFileName = ( p2.toonIndex === - 1 ) ? 'toon00.bmp' : model.toonTextures[ p2.toonIndex ].fileName;
				var uuid = loadTexture( toonFileName, { isToonTexture: true, defaultTexturePath: isDefaultToonTexture( toonFileName ) } );
				m.gradientMap = getTexture( uuid, textures );

			} else {

				// parameters for OutlineEffect
				m.outlineParameters = {
					thickness: p2.edgeSize / 300,
					color: new Color( p2.edgeColor[ 0 ], p2.edgeColor[ 1 ], p2.edgeColor[ 2 ] ),
					alpha: p2.edgeColor[ 3 ]
				};

				if ( ( p2.flag & 0x10 ) === 0 || m.outlineParameters.thickness === 0.0 ) m.outlineParameters.visible = false;

				var toonFileName, isDefaultToon;

				if ( p2.toonIndex === - 1 || p2.toonFlag !== 0 ) {

					var num = p2.toonIndex + 1;
					toonFileName = 'toon' + ( num < 10 ? '0' + num : num ) + '.bmp';
					isDefaultToon = true;

				} else {

					toonFileName = model.textures[ p2.toonIndex ];
					isDefaultToon = false;

				}

				var uuid = loadTexture( toonFileName, { isToonTexture: true, defaultTexturePath: isDefaultToon } );
				m.gradientMap = getTexture( uuid, textures );

			}

			materials.push( m );

		}

		if ( model.metadata.format === 'pmx' ) {

			function checkAlphaMorph( morph, elements ) {

				if ( morph.type !== 8 ) {

					return;

				}

				for ( var i = 0; i < elements.length; i ++ ) {

					var e = elements[ i ];

					if ( e.index === - 1 ) {

						continue;

					}

					var m = materials[ e.index ];

					if ( m.opacity !== e.diffuse[ 3 ] ) {

						m.transparent = true;

					}

				}

			}

			for ( var i = 0; i < model.morphs.length; i ++ ) {

				var morph = model.morphs[ i ];
				var elements = morph.elements;

				if ( morph.type === 0 ) {

					for ( var j = 0; j < elements.length; j ++ ) {

						var morph2 = model.morphs[ elements[ j ].index ];
						var elements2 = morph2.elements;

						checkAlphaMorph( morph2, elements2 );

					}

				} else {

					checkAlphaMorph( morph, elements );

				}

			}

		}

	};

	var initPhysics = function () {

		var rigidBodies = [];
		var constraints = [];

		for ( var i = 0; i < model.metadata.rigidBodyCount; i ++ ) {

			var b = model.rigidBodies[ i ];
			var keys = Object.keys( b );

			var p = {};

			for ( var j = 0; j < keys.length; j ++ ) {

				var key = keys[ j ];
				p[ key ] = b[ key ];

			}

			
			if ( model.metadata.format === 'pmx' ) {

				if ( p.boneIndex !== - 1 ) {

					var bone = model.bones[ p.boneIndex ];
					p.position[ 0 ] -= bone.position[ 0 ];
					p.position[ 1 ] -= bone.position[ 1 ];
					p.position[ 2 ] -= bone.position[ 2 ];

				}

			}

			rigidBodies.push( p );

		}

		for ( var i = 0; i < model.metadata.constraintCount; i ++ ) {

			var c = model.constraints[ i ];
			var keys = Object.keys( c );

			var p = {};

			for ( var j = 0; j < keys.length; j ++ ) {

				var key = keys[ j ];
				p[ key ] = c[ key ];

			}

			var bodyA = rigidBodies[ p.rigidBodyIndex1 ];
			var bodyB = rigidBodies[ p.rigidBodyIndex2 ];

			
			if ( bodyA.type !== 0 && bodyB.type === 2 ) {

				if ( bodyA.boneIndex !== - 1 && bodyB.boneIndex !== - 1 &&
				     model.bones[ bodyB.boneIndex ].parentIndex === bodyA.boneIndex ) {

					bodyB.type = 1;

				}

			}

			constraints.push( p );

		}

		geometry.rigidBodies = rigidBodies;
		geometry.constraints = constraints;

	};

	var initGeometry = function () {

		geometry.setIndex( buffer.indices );
		geometry.addAttribute( 'position', new Float32BufferAttribute( buffer.vertices, 3 ) );
		geometry.addAttribute( 'normal', new Float32BufferAttribute( buffer.normals, 3 ) );
		geometry.addAttribute( 'uv', new Float32BufferAttribute( buffer.uvs, 2 ) );
		geometry.addAttribute( 'skinIndex', new Float32BufferAttribute( buffer.skinIndices, 4 ) );
		geometry.addAttribute( 'skinWeight', new Float32BufferAttribute( buffer.skinWeights, 4 ) );

		geometry.computeBoundingSphere();
		geometry.mmdFormat = model.metadata.format;

	};

	initVartices();
	initFaces();
	initBones();
	initIKs();
	initGrants();
	initMorphs();
	initMaterials();
	initPhysics();
	initGeometry();

	var mesh = new SkinnedMesh( geometry, materials );

	// console.log( mesh ); // for console debug

	return mesh;

};

MMDLoader.prototype.createAnimation = function ( mesh, vmd, name ) {

	var helper = new MMDLoader.DataCreationHelper();

	var initMotionAnimations = function () {

		if ( vmd.metadata.motionCount === 0 ) {

			return;

		}

		var bones = mesh.geometry.bones;
		var orderedMotions = helper.createOrderedMotionArrays( bones, vmd.motions, 'boneName' );

		var tracks = [];

		var pushInterpolation = function ( array, interpolation, index ) {

			array.push( interpolation[ index + 0 ] / 127 ); // x1
			array.push( interpolation[ index + 8 ] / 127 ); // x2
			array.push( interpolation[ index + 4 ] / 127 ); // y1
			array.push( interpolation[ index + 12 ] / 127 ); // y2

		};

		for ( var i = 0; i < orderedMotions.length; i ++ ) {

			var times = [];
			var positions = [];
			var rotations = [];
			var pInterpolations = [];
			var rInterpolations = [];

			var bone = bones[ i ];
			var array = orderedMotions[ i ];

			for ( var j = 0; j < array.length; j ++ ) {

				var time = array[ j ].frameNum / 30;
				var pos = array[ j ].position;
				var rot = array[ j ].rotation;
				var interpolation = array[ j ].interpolation;

				times.push( time );

				for ( var k = 0; k < 3; k ++ ) {

					positions.push( bone.pos[ k ] + pos[ k ] );

				}

				for ( var k = 0; k < 4; k ++ ) {

					rotations.push( rot[ k ] );

				}

				for ( var k = 0; k < 3; k ++ ) {

					pushInterpolation( pInterpolations, interpolation, k );

				}

				pushInterpolation( rInterpolations, interpolation, 3 );

			}

			if ( times.length === 0 ) continue;

			var boneName = '.bones[' + bone.name + ']';

			tracks.push( new MMDLoader.VectorKeyframeTrackEx( boneName + '.position', times, positions, pInterpolations ) );
			tracks.push( new MMDLoader.QuaternionKeyframeTrackEx( boneName + '.quaternion', times, rotations, rInterpolations ) );

		}

		var clip = new AnimationClip( name === undefined ? _Math.generateUUID() : name, - 1, tracks );

		if ( mesh.geometry.animations === undefined ) mesh.geometry.animations = [];
		mesh.geometry.animations.push( clip );

	};

	var initMorphAnimations = function () {

		if ( vmd.metadata.morphCount === 0 ) {

			return;

		}

		var orderedMorphs = helper.createOrderedMotionArrays( mesh.geometry.morphTargets, vmd.morphs, 'morphName' );

		var tracks = [];

		for ( var i = 0; i < orderedMorphs.length; i ++ ) {

			var times = [];
			var values = [];
			var array = orderedMorphs[ i ];

			for ( var j = 0; j < array.length; j ++ ) {

				times.push( array[ j ].frameNum / 30 );
				values.push( array[ j ].weight );

			}

			if ( times.length === 0 ) continue;

			tracks.push( new NumberKeyframeTrack( '.morphTargetInfluences[' + i + ']', times, values ) );

		}

		var clip = new AnimationClip( name === undefined ? _Math.generateUUID() : name + 'Morph', - 1, tracks );

		if ( mesh.geometry.animations === undefined ) mesh.geometry.animations = [];
		mesh.geometry.animations.push( clip );

	};

	initMotionAnimations();
	initMorphAnimations();

};

MMDLoader.DataCreationHelper = function () {

};

MMDLoader.DataCreationHelper.prototype = {

	constructor: MMDLoader.DataCreationHelper,

	

	toCharcodeStrings: function ( s ) {

		var str = '';

		for ( var i = 0; i < s.length; i ++ ) {

			str += '0x' + ( '0000' + s[ i ].charCodeAt().toString( 16 ) ).substr( - 4 );

		}

		return str;

	},

	createDictionary: function ( array ) {

		var dict = {};

		for ( var i = 0; i < array.length; i ++ ) {

			dict[ array[ i ].name ] = i;

		}

		return dict;

	},

	initializeMotionArrays: function ( array ) {

		var result = [];

		for ( var i = 0; i < array.length; i ++ ) {

			result[ i ] = [];

		}

		return result;

	},

	sortMotionArray: function ( array ) {

		array.sort( function ( a, b ) {

			return a.frameNum - b.frameNum;

		} );

	},

	sortMotionArrays: function ( arrays ) {

		for ( var i = 0; i < arrays.length; i ++ ) {

			this.sortMotionArray( arrays[ i ] );

		}

	},

	createMotionArray: function ( array ) {

		var result = [];

		for ( var i = 0; i < array.length; i ++ ) {

			result.push( array[ i ] );

		}

		return result;

	},

	createMotionArrays: function ( array, result, dict, key ) {

		for ( var i = 0; i < array.length; i ++ ) {

			var a = array[ i ];
			var num = dict[ a[ key ] ];

			if ( num === undefined ) {

				continue;

			}

			result[ num ].push( a );

		}

	},

	createOrderedMotionArray: function ( array ) {

		var result = this.createMotionArray( array );
		this.sortMotionArray( result );
		return result;

	},

	createOrderedMotionArrays: function ( targetArray, motionArray, key ) {

		var dict = this.createDictionary( targetArray );
		var result = this.initializeMotionArrays( targetArray );
		this.createMotionArrays( motionArray, result, dict, key );
		this.sortMotionArrays( result );

		return result;

	}

};


MMDLoader.VectorKeyframeTrackEx = function ( name, times, values, interpolationParameterArray ) {

	this.interpolationParameters = new Float32Array( interpolationParameterArray );

	VectorKeyframeTrack.call( this, name, times, values );

};

MMDLoader.VectorKeyframeTrackEx.prototype = Object.create( VectorKeyframeTrack.prototype );
MMDLoader.VectorKeyframeTrackEx.prototype.constructor = MMDLoader.VectorKeyframeTrackEx;
MMDLoader.VectorKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

MMDLoader.VectorKeyframeTrackEx.prototype.InterpolantFactoryMethodCubicBezier = function ( result ) {

	return new MMDLoader.CubicBezierInterpolation( this.times, this.values, this.getValueSize(), result, this.interpolationParameters );

};

MMDLoader.VectorKeyframeTrackEx.prototype.setInterpolation = function ( interpolation ) {

	this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;

};

MMDLoader.QuaternionKeyframeTrackEx = function ( name, times, values, interpolationParameterArray ) {

	this.interpolationParameters = new Float32Array( interpolationParameterArray );

	QuaternionKeyframeTrack.call( this, name, times, values );

};

MMDLoader.QuaternionKeyframeTrackEx.prototype = Object.create( QuaternionKeyframeTrack.prototype );
MMDLoader.QuaternionKeyframeTrackEx.prototype.constructor = MMDLoader.QuaternionKeyframeTrackEx;
MMDLoader.QuaternionKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

MMDLoader.QuaternionKeyframeTrackEx.prototype.InterpolantFactoryMethodCubicBezier = function ( result ) {

	return new MMDLoader.CubicBezierInterpolation( this.times, this.values, this.getValueSize(), result, this.interpolationParameters );

};

MMDLoader.QuaternionKeyframeTrackEx.prototype.setInterpolation = function ( interpolation ) {

	this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;

};

MMDLoader.NumberKeyframeTrackEx = function ( name, times, values, interpolationParameterArray ) {

	this.interpolationParameters = new Float32Array( interpolationParameterArray );

	NumberKeyframeTrack.call( this, name, times, values );

};

MMDLoader.NumberKeyframeTrackEx.prototype = Object.create( NumberKeyframeTrack.prototype );
MMDLoader.NumberKeyframeTrackEx.prototype.constructor = MMDLoader.NumberKeyframeTrackEx;
MMDLoader.NumberKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

MMDLoader.NumberKeyframeTrackEx.prototype.InterpolantFactoryMethodCubicBezier = function ( result ) {

	return new MMDLoader.CubicBezierInterpolation( this.times, this.values, this.getValueSize(), result, this.interpolationParameters );

};

MMDLoader.NumberKeyframeTrackEx.prototype.setInterpolation = function ( interpolation ) {

	this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;

};

MMDLoader.CubicBezierInterpolation = function ( parameterPositions, sampleValues, sampleSize, resultBuffer, params ) {

	Interpolant.call( this, parameterPositions, sampleValues, sampleSize, resultBuffer );

	this.params = params;

};

MMDLoader.CubicBezierInterpolation.prototype = Object.create( LinearInterpolant.prototype );
MMDLoader.CubicBezierInterpolation.prototype.constructor = MMDLoader.CubicBezierInterpolation;

MMDLoader.CubicBezierInterpolation.prototype.interpolate_ = function ( i1, t0, t, t1 ) {

	var result = this.resultBuffer;
	var values = this.sampleValues;
	var stride = this.valueSize;

	var offset1 = i1 * stride;
	var offset0 = offset1 - stride;

	var weight1 = ( t - t0 ) / ( t1 - t0 );

	if ( stride === 4 ) { // Quaternion

		var x1 = this.params[ i1 * 4 + 0 ];
		var x2 = this.params[ i1 * 4 + 1 ];
		var y1 = this.params[ i1 * 4 + 2 ];
		var y2 = this.params[ i1 * 4 + 3 ];

		var ratio = this._calculate( x1, x2, y1, y2, weight1 );

		Quaternion.slerpFlat( result, 0, values, offset0, values, offset1, ratio );

	} else if ( stride === 3 ) { // Vector3

		for ( var i = 0; i !== stride; ++ i ) {

			var x1 = this.params[ i1 * 12 + i * 4 + 0 ];
			var x2 = this.params[ i1 * 12 + i * 4 + 1 ];
			var y1 = this.params[ i1 * 12 + i * 4 + 2 ];
			var y2 = this.params[ i1 * 12 + i * 4 + 3 ];

			var ratio = this._calculate( x1, x2, y1, y2, weight1 );

			result[ i ] = values[ offset0 + i ] * ( 1 - ratio ) + values[ offset1 + i ] * ratio;

		}

	} else { // Number

		var x1 = this.params[ i1 * 4 + 0 ];
		var x2 = this.params[ i1 * 4 + 1 ];
		var y1 = this.params[ i1 * 4 + 2 ];
		var y2 = this.params[ i1 * 4 + 3 ];

		var ratio = this._calculate( x1, x2, y1, y2, weight1 );

		result[ 0 ] = values[ offset0 ] * ( 1 - ratio ) + values[ offset1 ] * ratio;

	}

	return result;

};

MMDLoader.CubicBezierInterpolation.prototype._calculate = function ( x1, x2, y1, y2, x ) {

	

	var c = 0.5;
	var t = c;
	var s = 1.0 - t;
	var loop = 15;
	var eps = 1e-5;
	var math = Math;

	var sst3, stt3, ttt;

	for ( var i = 0; i < loop; i ++ ) {

		sst3 = 3.0 * s * s * t;
		stt3 = 3.0 * s * t * t;
		ttt = t * t * t;

		var ft = ( sst3 * x1 ) + ( stt3 * x2 ) + ( ttt ) - x;

		if ( math.abs( ft ) < eps ) break;

		c /= 2.0;

		t += ( ft < 0 ) ? c : - c;
		s = 1.0 - t;

	}

	return ( sst3 * y1 ) + ( stt3 * y2 ) + ttt;

};

var MMDAudioManager = function ( audio, listener, p ) {

	var params = ( p === null || p === undefined ) ? {} : p;

	this.audio = audio;
	this.listener = listener;

	this.elapsedTime = 0.0;
	this.currentTime = 0.0;
	this.delayTime = params.delayTime !== undefined ? params.delayTime : 0.0;

	this.audioDuration = this.audio.buffer.duration;
	this.duration = this.audioDuration + this.delayTime;

};

MMDAudioManager.prototype = {

	constructor: MMDAudioManager,

	control: function ( delta ) {

		this.elapsed += delta;
		this.currentTime += delta;

		if ( this.checkIfStopAudio() ) {

			this.audio.stop();

		}

		if ( this.checkIfStartAudio() ) {

			this.audio.play();

		}

	},

	checkIfStartAudio: function () {

		if ( this.audio.isPlaying ) {

			return false;

		}

		while ( this.currentTime >= this.duration ) {

			this.currentTime -= this.duration;

		}

		if ( this.currentTime < this.delayTime ) {

			return false;

		}

		this.audio.startTime = this.currentTime - this.delayTime;

		return true;

	},

	checkIfStopAudio: function () {

		if ( ! this.audio.isPlaying ) {

			return false;

		}

		if ( this.currentTime >= this.duration ) {

			return true;

		}

		return false;

	}

};

var MMDGrantSolver = function ( mesh ) {

	this.mesh = mesh;

};

MMDGrantSolver.prototype = {

	constructor: MMDGrantSolver,

	update: function () {

		var q = new Quaternion();

		return function () {

			for ( var i = 0; i < this.mesh.geometry.grants.length; i ++ ) {

				var g = this.mesh.geometry.grants[ i ];
				var b = this.mesh.skeleton.bones[ g.index ];
				var pb = this.mesh.skeleton.bones[ g.parentIndex ];

				if ( g.isLocal ) {

					// TODO: implement
					if ( g.affectPosition ) {

					}

					// TODO: implement
					if ( g.affectRotation ) {

					}

				} else {

					// TODO: implement
					if ( g.affectPosition ) {

					}

					if ( g.affectRotation ) {

						q.set( 0, 0, 0, 1 );
						q.slerp( pb.quaternion, g.ratio );
						b.quaternion.multiply( q );

					}

				}

			}

		};

	}()

};

var MMDHelper = function () {

	this.meshes = [];

	this.doAnimation = true;
	this.doIk = true;
	this.doGrant = true;
	this.doPhysics = true;
	this.doCameraAnimation = true;

	this.sharedPhysics = false;
	this.masterPhysics = null;

	this.audioManager = null;
	this.camera = null;

};

MMDHelper.prototype = {

	constructor: MMDHelper,

	add: function ( mesh ) {

		if ( ! ( mesh instanceof SkinnedMesh ) ) {

			throw new Error( 'MMDHelper.add() accepts only SkinnedMesh instance.' );

		}

		if ( mesh.mixer === undefined ) mesh.mixer = null;
		if ( mesh.ikSolver === undefined ) mesh.ikSolver = null;
		if ( mesh.grantSolver === undefined ) mesh.grantSolver = null;
		if ( mesh.physics === undefined ) mesh.physics = null;
		if ( mesh.looped === undefined ) mesh.looped = false;

		this.meshes.push( mesh );

		// workaround until I make IK and Physics Animation plugin
		this.initBackupBones( mesh );

	},

	setAudio: function ( audio, listener, params ) {

		this.audioManager = new MMDAudioManager( audio, listener, params );

	},

	setCamera: function ( camera ) {

		camera.mixer = null;
		this.camera = camera;

	},

	setPhysicses: function ( params ) {

		for ( var i = 0; i < this.meshes.length; i ++ ) {

			this.setPhysics( this.meshes[ i ], params );

		}

	},

	setPhysics: function ( mesh, params ) {

		params = ( params === undefined ) ? {} : Object.assign( {}, params );

		if ( params.world === undefined && this.sharedPhysics ) {

			var masterPhysics = this.getMasterPhysics();

			if ( masterPhysics !== null ) params.world = masterPhysics.world;

		}

		var warmup = params.warmup !== undefined ? params.warmup : 60;

		var physics = new MMDPhysics( mesh, params );

		if ( mesh.mixer !== null && mesh.mixer !== undefined && params.preventAnimationWarmup !== true ) {

			this.animateOneMesh( 0, mesh );
			physics.reset();

		}

		physics.warmup( warmup );

		this.updateIKParametersDependingOnPhysicsEnabled( mesh, true );

		mesh.physics = physics;

	},

	getMasterPhysics: function () {

		if ( this.masterPhysics !== null ) return this.masterPhysics;

		for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

			var physics = this.meshes[ i ].physics;

			if ( physics !== undefined && physics !== null ) {

				this.masterPhysics = physics;
				return this.masterPhysics;

			}

		}

		return null;

	},

	enablePhysics: function ( enabled ) {

		if ( enabled === true ) {

			this.doPhysics = true;

		} else {

			this.doPhysics = false;

		}

		for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

			this.updateIKParametersDependingOnPhysicsEnabled( this.meshes[ i ], enabled );

		}

	},

	updateIKParametersDependingOnPhysicsEnabled: function ( mesh, physicsEnabled ) {

		var iks = mesh.geometry.iks;
		var bones = mesh.geometry.bones;

		for ( var j = 0, jl = iks.length; j < jl; j ++ ) {

			var ik = iks[ j ];
			var links = ik.links;

			for ( var k = 0, kl = links.length; k < kl; k ++ ) {

				var link = links[ k ];

				if ( physicsEnabled === true ) {

					// disable IK of the bone the corresponding rigidBody type of which is 1 or 2
					// because its rotation will be overriden by physics
					link.enabled = bones[ link.index ].rigidBodyType > 0 ? false : true;

				} else {

					link.enabled = true;

				}

			}

		}

	},

	setAnimations: function () {

		for ( var i = 0; i < this.meshes.length; i ++ ) {

			this.setAnimation( this.meshes[ i ] );

		}

	},

	setAnimation: function ( mesh ) {

		if ( mesh.geometry.animations !== undefined ) {

			mesh.mixer = new AnimationMixer( mesh );

			// TODO: find a workaround not to access (seems like) private properties
			//       the name of them begins with "_".
			mesh.mixer.addEventListener( 'loop', function ( e ) {

				if ( e.action._clip.tracks.length > 0 &&
				     e.action._clip.tracks[ 0 ].name.indexOf( '.bones' ) !== 0 ) return;

				var mesh = e.target._root;
				mesh.looped = true;

			} );

			var foundAnimation = false;
			var foundMorphAnimation = false;

			for ( var i = 0; i < mesh.geometry.animations.length; i ++ ) {

				var clip = mesh.geometry.animations[ i ];

				var action = mesh.mixer.clipAction( clip );

				if ( clip.tracks.length > 0 && clip.tracks[ 0 ].name.indexOf( '.morphTargetInfluences' ) === 0 ) {

					if ( ! foundMorphAnimation ) {

						action.play();
						foundMorphAnimation = true;

					}

				} else {

					if ( ! foundAnimation ) {

						action.play();
						foundAnimation = true;

					}

				}

			}

			if ( foundAnimation ) {

				mesh.ikSolver = new CCDIKSolver( mesh );

				if ( mesh.geometry.grants !== undefined ) {

					mesh.grantSolver = new MMDGrantSolver( mesh );

				}

			}

		}

	},

	setCameraAnimation: function ( camera ) {

		if ( camera.animations !== undefined ) {

			camera.mixer = new AnimationMixer( camera );
			camera.mixer.clipAction( camera.animations[ 0 ] ).play();

		}

	},

	
	unifyAnimationDuration: function ( params ) {

		params = params === undefined ? {} : params;

		var max = 0.0;

		var camera = this.camera;
		var audioManager = this.audioManager;

		// check the longest duration
		for ( var i = 0; i < this.meshes.length; i ++ ) {

			var mesh = this.meshes[ i ];
			var mixer = mesh.mixer;

			if ( mixer === null ) {

				continue;

			}

			for ( var j = 0; j < mixer._actions.length; j ++ ) {

				var action = mixer._actions[ j ];
				max = Math.max( max, action._clip.duration );

			}

		}

		if ( camera !== null && camera.mixer !== null ) {

			var mixer = camera.mixer;

			for ( var i = 0; i < mixer._actions.length; i ++ ) {

				var action = mixer._actions[ i ];
				max = Math.max( max, action._clip.duration );

			}

		}

		if ( audioManager !== null ) {

			max = Math.max( max, audioManager.duration );

		}

		if ( params.afterglow !== undefined ) {

			max += params.afterglow;

		}

		// set the duration
		for ( var i = 0; i < this.meshes.length; i ++ ) {

			var mesh = this.meshes[ i ];
			var mixer = mesh.mixer;

			if ( mixer === null ) {

				continue;

			}

			for ( var j = 0; j < mixer._actions.length; j ++ ) {

				var action = mixer._actions[ j ];
				action._clip.duration = max;

			}

		}

		if ( camera !== null && camera.mixer !== null ) {

			var mixer = camera.mixer;

			for ( var i = 0; i < mixer._actions.length; i ++ ) {

				var action = mixer._actions[ i ];
				action._clip.duration = max;

			}

		}

		if ( audioManager !== null ) {

			audioManager.duration = max;

		}

	},

	controlAudio: function ( delta ) {

		if ( this.audioManager === null ) {

			return;

		}

		this.audioManager.control( delta );

	},

	animate: function ( delta ) {

		this.controlAudio( delta );

		for ( var i = 0; i < this.meshes.length; i ++ ) {

			this.animateOneMesh( delta, this.meshes[ i ] );

		}

		if ( this.sharedPhysics ) this.updateSharedPhysics( delta );

		this.animateCamera( delta );

	},

	animateOneMesh: function ( delta, mesh ) {

		var mixer = mesh.mixer;
		var ikSolver = mesh.ikSolver;
		var grantSolver = mesh.grantSolver;
		var physics = mesh.physics;

		if ( mixer !== null && this.doAnimation === true ) {

			// restore/backupBones are workaround
			// until I make IK, Grant, and Physics Animation plugin
			this.restoreBones( mesh );

			mixer.update( delta );

			this.backupBones( mesh );

		}

		if ( ikSolver !== null && this.doIk === true ) {

			ikSolver.update();

		}

		if ( grantSolver !== null && this.doGrant === true ) {

			grantSolver.update();

		}

		if ( mesh.looped === true ) {

			if ( physics !== null ) physics.reset();

			mesh.looped = false;

		}

		if ( physics !== null && this.doPhysics && ! this.sharedPhysics ) {

			physics.update( delta );

		}

	},

	updateSharedPhysics: function ( delta ) {

		if ( this.meshes.length === 0 || ! this.doPhysics || ! this.sharedPhysics ) return;

		var physics = this.getMasterPhysics();

		if ( physics === null ) return;

		for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

			var p = this.meshes[ i ].physics;

			if ( p !== null && p !== undefined ) {

				p.updateRigidBodies();

			}

		}

		physics.stepSimulation( delta );

		for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

			var p = this.meshes[ i ].physics;

			if ( p !== null && p !== undefined ) {

				p.updateBones();

			}

		}

	},

	animateCamera: function ( delta ) {

		if ( this.camera === null ) {

			return;

		}

		var mixer = this.camera.mixer;

		if ( mixer !== null && this.camera.center !== undefined && this.doCameraAnimation === true ) {

			mixer.update( delta );

			// TODO: Let PerspectiveCamera automatically update?
			this.camera.updateProjectionMatrix();

			this.camera.up.set( 0, 1, 0 );
			this.camera.up.applyQuaternion( this.camera.quaternion );
			this.camera.lookAt( this.camera.center );

		}

	},

	poseAsVpd: function ( mesh, vpd, params ) {

		if ( params === undefined ) params = {};

		if ( params.preventResetPose !== true ) mesh.pose();

		var bones = mesh.skeleton.bones;
		var bones2 = vpd.bones;

		var table = {};

		for ( var i = 0; i < bones.length; i ++ ) {

			table[ bones[ i ].name ] = i;

		}

		var thV = new Vector3();
		var thQ = new Quaternion();

		for ( var i = 0; i < bones2.length; i ++ ) {

			var b = bones2[ i ];
			var index = table[ b.name ];

			if ( index === undefined ) continue;

			var b2 = bones[ index ];
			var t = b.translation;
			var q = b.quaternion;

			thV.set( t[ 0 ], t[ 1 ], t[ 2 ] );
			thQ.set( q[ 0 ], q[ 1 ], q[ 2 ], q[ 3 ] );

			b2.position.add( thV );
			b2.quaternion.multiply( thQ );

		}

		mesh.updateMatrixWorld( true );

		if ( params.preventIk !== true ) {

			var solver = new CCDIKSolver( mesh );
			solver.update( params.saveOriginalBonesBeforeIK );

		}

		if ( params.preventGrant !== true && mesh.geometry.grants !== undefined ) {

			var solver = new MMDGrantSolver( mesh );
			solver.update();

		}

	},

	
	initBackupBones: function ( mesh ) {

		mesh.skeleton.backupBones = [];

		for ( var i = 0; i < mesh.skeleton.bones.length; i ++ ) {

			mesh.skeleton.backupBones.push( mesh.skeleton.bones[ i ].clone() );

		}

	},

	backupBones: function ( mesh ) {

		mesh.skeleton.backupBoneIsSaved = true;

		for ( var i = 0; i < mesh.skeleton.bones.length; i ++ ) {

			var b = mesh.skeleton.backupBones[ i ];
			var b2 = mesh.skeleton.bones[ i ];
			b.position.copy( b2.position );
			b.quaternion.copy( b2.quaternion );

		}

	},

	restoreBones: function ( mesh ) {

		if ( mesh.skeleton.backupBoneIsSaved !== true ) {

			return;

		}

		mesh.skeleton.backupBoneIsSaved = false;

		for ( var i = 0; i < mesh.skeleton.bones.length; i ++ ) {

			var b = mesh.skeleton.bones[ i ];
			var b2 = mesh.skeleton.backupBones[ i ];
			b.position.copy( b2.position );
			b.quaternion.copy( b2.quaternion );

		}

	}

};

export {
	MMDLoader,
	MMDAudioManager,
	MMDGrantSolver,
	MMDHelper
}
