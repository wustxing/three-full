import { TempNode } from '../../nodes/TempNode.js'
/**
 * @author sunag / http://www.sunag.com.br/
 */

var Math1Node = function( a, method ) {

	TempNode.call( this );

	this.a = a;

	this.method = method || Math1Node.SIN;

};

Math1Node.RAD = 'radians';
Math1Node.DEG = 'degrees';
Math1Node.EXP = 'exp';
Math1Node.EXP2 = 'exp2';
Math1Node.LOG = 'log';
Math1Node.LOG2 = 'log2';
Math1Node.SQRT = 'sqrt';
Math1Node.INV_SQRT = 'inversesqrt';
Math1Node.FLOOR = 'floor';
Math1Node.CEIL = 'ceil';
Math1Node.NORMALIZE = 'normalize';
Math1Node.FRACT = 'fract';
Math1Node.SAT = 'saturate';
Math1Node.SIN = 'sin';
Math1Node.COS = 'cos';
Math1Node.TAN = 'tan';
Math1Node.ASIN = 'asin';
Math1Node.ACOS = 'acos';
Math1Node.ARCTAN = 'atan';
Math1Node.ABS = 'abs';
Math1Node.SIGN = 'sign';
Math1Node.LENGTH = 'length';
Math1Node.NEGATE = 'negate';
Math1Node.INVERT = 'invert';

Math1Node.prototype = Object.create( TempNode.prototype );
Math1Node.prototype.constructor = Math1Node;

Math1Node.prototype.getType = function( builder ) {

	switch ( this.method ) {
		case Math1Node.LENGTH:
			return 'fv1';
	}

	return this.a.getType( builder );

};

Math1Node.prototype.generate = function( builder, output ) {

	var material = builder.material;

	var type = this.getType( builder );

	var result = this.a.build( builder, type );

	switch ( this.method ) {

		case Math1Node.NEGATE:
			result = '(-' + result + ')';
			break;

		case Math1Node.INVERT:
			result = '(1.0-' + result + ')';
			break;

		default:
			result = this.method + '(' + result + ')';
			break;
	}

	return builder.format( result, type, output );

};

export { Math1Node }
