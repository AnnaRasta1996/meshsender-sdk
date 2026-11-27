/* MeshSender Open SDK browser bundle — third-party notices preserved at EOF by esbuild. */
"use strict";
var MeshSenderSDK = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // (disabled):crypto
  var require_crypto = __commonJS({
    "(disabled):crypto"() {
    }
  });

  // node_modules/tweetnacl/nacl-fast.js
  var require_nacl_fast = __commonJS({
    "node_modules/tweetnacl/nacl-fast.js"(exports, module) {
      (function(nacl2) {
        "use strict";
        var gf = function(init) {
          var i, r = new Float64Array(16);
          if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
          return r;
        };
        var randombytes = function() {
          throw new Error("no PRNG");
        };
        var _0 = new Uint8Array(16);
        var _9 = new Uint8Array(32);
        _9[0] = 9;
        var gf0 = gf(), gf1 = gf([1]), _121665 = gf([56129, 1]), D = gf([30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505, 36039, 65139, 11119, 27886, 20995]), D2 = gf([61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010, 6542, 64743, 22239, 55772, 9222]), X = gf([54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982, 57905, 49316, 21502, 52590, 14035, 8553]), Y = gf([26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214]), I = gf([41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153, 11085, 57099, 20417, 9344, 11139]);
        function ts64(x, i, h, l) {
          x[i] = h >> 24 & 255;
          x[i + 1] = h >> 16 & 255;
          x[i + 2] = h >> 8 & 255;
          x[i + 3] = h & 255;
          x[i + 4] = l >> 24 & 255;
          x[i + 5] = l >> 16 & 255;
          x[i + 6] = l >> 8 & 255;
          x[i + 7] = l & 255;
        }
        function vn(x, xi, y, yi, n) {
          var i, d = 0;
          for (i = 0; i < n; i++) d |= x[xi + i] ^ y[yi + i];
          return (1 & d - 1 >>> 8) - 1;
        }
        function crypto_verify_16(x, xi, y, yi) {
          return vn(x, xi, y, yi, 16);
        }
        function crypto_verify_32(x, xi, y, yi) {
          return vn(x, xi, y, yi, 32);
        }
        function core_salsa20(o, p, k, c) {
          var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
          var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
          for (var i = 0; i < 20; i += 2) {
            u = x0 + x12 | 0;
            x4 ^= u << 7 | u >>> 32 - 7;
            u = x4 + x0 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x4 | 0;
            x12 ^= u << 13 | u >>> 32 - 13;
            u = x12 + x8 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x1 | 0;
            x9 ^= u << 7 | u >>> 32 - 7;
            u = x9 + x5 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x9 | 0;
            x1 ^= u << 13 | u >>> 32 - 13;
            u = x1 + x13 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x6 | 0;
            x14 ^= u << 7 | u >>> 32 - 7;
            u = x14 + x10 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x14 | 0;
            x6 ^= u << 13 | u >>> 32 - 13;
            u = x6 + x2 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x11 | 0;
            x3 ^= u << 7 | u >>> 32 - 7;
            u = x3 + x15 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x3 | 0;
            x11 ^= u << 13 | u >>> 32 - 13;
            u = x11 + x7 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
            u = x0 + x3 | 0;
            x1 ^= u << 7 | u >>> 32 - 7;
            u = x1 + x0 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x1 | 0;
            x3 ^= u << 13 | u >>> 32 - 13;
            u = x3 + x2 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x4 | 0;
            x6 ^= u << 7 | u >>> 32 - 7;
            u = x6 + x5 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x6 | 0;
            x4 ^= u << 13 | u >>> 32 - 13;
            u = x4 + x7 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x9 | 0;
            x11 ^= u << 7 | u >>> 32 - 7;
            u = x11 + x10 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x11 | 0;
            x9 ^= u << 13 | u >>> 32 - 13;
            u = x9 + x8 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x14 | 0;
            x12 ^= u << 7 | u >>> 32 - 7;
            u = x12 + x15 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x12 | 0;
            x14 ^= u << 13 | u >>> 32 - 13;
            u = x14 + x13 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
          }
          x0 = x0 + j0 | 0;
          x1 = x1 + j1 | 0;
          x2 = x2 + j2 | 0;
          x3 = x3 + j3 | 0;
          x4 = x4 + j4 | 0;
          x5 = x5 + j5 | 0;
          x6 = x6 + j6 | 0;
          x7 = x7 + j7 | 0;
          x8 = x8 + j8 | 0;
          x9 = x9 + j9 | 0;
          x10 = x10 + j10 | 0;
          x11 = x11 + j11 | 0;
          x12 = x12 + j12 | 0;
          x13 = x13 + j13 | 0;
          x14 = x14 + j14 | 0;
          x15 = x15 + j15 | 0;
          o[0] = x0 >>> 0 & 255;
          o[1] = x0 >>> 8 & 255;
          o[2] = x0 >>> 16 & 255;
          o[3] = x0 >>> 24 & 255;
          o[4] = x1 >>> 0 & 255;
          o[5] = x1 >>> 8 & 255;
          o[6] = x1 >>> 16 & 255;
          o[7] = x1 >>> 24 & 255;
          o[8] = x2 >>> 0 & 255;
          o[9] = x2 >>> 8 & 255;
          o[10] = x2 >>> 16 & 255;
          o[11] = x2 >>> 24 & 255;
          o[12] = x3 >>> 0 & 255;
          o[13] = x3 >>> 8 & 255;
          o[14] = x3 >>> 16 & 255;
          o[15] = x3 >>> 24 & 255;
          o[16] = x4 >>> 0 & 255;
          o[17] = x4 >>> 8 & 255;
          o[18] = x4 >>> 16 & 255;
          o[19] = x4 >>> 24 & 255;
          o[20] = x5 >>> 0 & 255;
          o[21] = x5 >>> 8 & 255;
          o[22] = x5 >>> 16 & 255;
          o[23] = x5 >>> 24 & 255;
          o[24] = x6 >>> 0 & 255;
          o[25] = x6 >>> 8 & 255;
          o[26] = x6 >>> 16 & 255;
          o[27] = x6 >>> 24 & 255;
          o[28] = x7 >>> 0 & 255;
          o[29] = x7 >>> 8 & 255;
          o[30] = x7 >>> 16 & 255;
          o[31] = x7 >>> 24 & 255;
          o[32] = x8 >>> 0 & 255;
          o[33] = x8 >>> 8 & 255;
          o[34] = x8 >>> 16 & 255;
          o[35] = x8 >>> 24 & 255;
          o[36] = x9 >>> 0 & 255;
          o[37] = x9 >>> 8 & 255;
          o[38] = x9 >>> 16 & 255;
          o[39] = x9 >>> 24 & 255;
          o[40] = x10 >>> 0 & 255;
          o[41] = x10 >>> 8 & 255;
          o[42] = x10 >>> 16 & 255;
          o[43] = x10 >>> 24 & 255;
          o[44] = x11 >>> 0 & 255;
          o[45] = x11 >>> 8 & 255;
          o[46] = x11 >>> 16 & 255;
          o[47] = x11 >>> 24 & 255;
          o[48] = x12 >>> 0 & 255;
          o[49] = x12 >>> 8 & 255;
          o[50] = x12 >>> 16 & 255;
          o[51] = x12 >>> 24 & 255;
          o[52] = x13 >>> 0 & 255;
          o[53] = x13 >>> 8 & 255;
          o[54] = x13 >>> 16 & 255;
          o[55] = x13 >>> 24 & 255;
          o[56] = x14 >>> 0 & 255;
          o[57] = x14 >>> 8 & 255;
          o[58] = x14 >>> 16 & 255;
          o[59] = x14 >>> 24 & 255;
          o[60] = x15 >>> 0 & 255;
          o[61] = x15 >>> 8 & 255;
          o[62] = x15 >>> 16 & 255;
          o[63] = x15 >>> 24 & 255;
        }
        function core_hsalsa20(o, p, k, c) {
          var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
          var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
          for (var i = 0; i < 20; i += 2) {
            u = x0 + x12 | 0;
            x4 ^= u << 7 | u >>> 32 - 7;
            u = x4 + x0 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x4 | 0;
            x12 ^= u << 13 | u >>> 32 - 13;
            u = x12 + x8 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x1 | 0;
            x9 ^= u << 7 | u >>> 32 - 7;
            u = x9 + x5 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x9 | 0;
            x1 ^= u << 13 | u >>> 32 - 13;
            u = x1 + x13 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x6 | 0;
            x14 ^= u << 7 | u >>> 32 - 7;
            u = x14 + x10 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x14 | 0;
            x6 ^= u << 13 | u >>> 32 - 13;
            u = x6 + x2 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x11 | 0;
            x3 ^= u << 7 | u >>> 32 - 7;
            u = x3 + x15 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x3 | 0;
            x11 ^= u << 13 | u >>> 32 - 13;
            u = x11 + x7 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
            u = x0 + x3 | 0;
            x1 ^= u << 7 | u >>> 32 - 7;
            u = x1 + x0 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x1 | 0;
            x3 ^= u << 13 | u >>> 32 - 13;
            u = x3 + x2 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x4 | 0;
            x6 ^= u << 7 | u >>> 32 - 7;
            u = x6 + x5 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x6 | 0;
            x4 ^= u << 13 | u >>> 32 - 13;
            u = x4 + x7 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x9 | 0;
            x11 ^= u << 7 | u >>> 32 - 7;
            u = x11 + x10 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x11 | 0;
            x9 ^= u << 13 | u >>> 32 - 13;
            u = x9 + x8 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x14 | 0;
            x12 ^= u << 7 | u >>> 32 - 7;
            u = x12 + x15 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x12 | 0;
            x14 ^= u << 13 | u >>> 32 - 13;
            u = x14 + x13 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
          }
          o[0] = x0 >>> 0 & 255;
          o[1] = x0 >>> 8 & 255;
          o[2] = x0 >>> 16 & 255;
          o[3] = x0 >>> 24 & 255;
          o[4] = x5 >>> 0 & 255;
          o[5] = x5 >>> 8 & 255;
          o[6] = x5 >>> 16 & 255;
          o[7] = x5 >>> 24 & 255;
          o[8] = x10 >>> 0 & 255;
          o[9] = x10 >>> 8 & 255;
          o[10] = x10 >>> 16 & 255;
          o[11] = x10 >>> 24 & 255;
          o[12] = x15 >>> 0 & 255;
          o[13] = x15 >>> 8 & 255;
          o[14] = x15 >>> 16 & 255;
          o[15] = x15 >>> 24 & 255;
          o[16] = x6 >>> 0 & 255;
          o[17] = x6 >>> 8 & 255;
          o[18] = x6 >>> 16 & 255;
          o[19] = x6 >>> 24 & 255;
          o[20] = x7 >>> 0 & 255;
          o[21] = x7 >>> 8 & 255;
          o[22] = x7 >>> 16 & 255;
          o[23] = x7 >>> 24 & 255;
          o[24] = x8 >>> 0 & 255;
          o[25] = x8 >>> 8 & 255;
          o[26] = x8 >>> 16 & 255;
          o[27] = x8 >>> 24 & 255;
          o[28] = x9 >>> 0 & 255;
          o[29] = x9 >>> 8 & 255;
          o[30] = x9 >>> 16 & 255;
          o[31] = x9 >>> 24 & 255;
        }
        function crypto_core_salsa20(out, inp, k, c) {
          core_salsa20(out, inp, k, c);
        }
        function crypto_core_hsalsa20(out, inp, k, c) {
          core_hsalsa20(out, inp, k, c);
        }
        var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
        function crypto_stream_salsa20_xor(c, cpos, m, mpos, b, n, k) {
          var z = new Uint8Array(16), x = new Uint8Array(64);
          var u, i;
          for (i = 0; i < 16; i++) z[i] = 0;
          for (i = 0; i < 8; i++) z[i] = n[i];
          while (b >= 64) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < 64; i++) c[cpos + i] = m[mpos + i] ^ x[i];
            u = 1;
            for (i = 8; i < 16; i++) {
              u = u + (z[i] & 255) | 0;
              z[i] = u & 255;
              u >>>= 8;
            }
            b -= 64;
            cpos += 64;
            mpos += 64;
          }
          if (b > 0) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < b; i++) c[cpos + i] = m[mpos + i] ^ x[i];
          }
          return 0;
        }
        function crypto_stream_salsa20(c, cpos, b, n, k) {
          var z = new Uint8Array(16), x = new Uint8Array(64);
          var u, i;
          for (i = 0; i < 16; i++) z[i] = 0;
          for (i = 0; i < 8; i++) z[i] = n[i];
          while (b >= 64) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < 64; i++) c[cpos + i] = x[i];
            u = 1;
            for (i = 8; i < 16; i++) {
              u = u + (z[i] & 255) | 0;
              z[i] = u & 255;
              u >>>= 8;
            }
            b -= 64;
            cpos += 64;
          }
          if (b > 0) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < b; i++) c[cpos + i] = x[i];
          }
          return 0;
        }
        function crypto_stream(c, cpos, d, n, k) {
          var s = new Uint8Array(32);
          crypto_core_hsalsa20(s, n, k, sigma);
          var sn = new Uint8Array(8);
          for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
          return crypto_stream_salsa20(c, cpos, d, sn, s);
        }
        function crypto_stream_xor(c, cpos, m, mpos, d, n, k) {
          var s = new Uint8Array(32);
          crypto_core_hsalsa20(s, n, k, sigma);
          var sn = new Uint8Array(8);
          for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
          return crypto_stream_salsa20_xor(c, cpos, m, mpos, d, sn, s);
        }
        var poly1305 = function(key) {
          this.buffer = new Uint8Array(16);
          this.r = new Uint16Array(10);
          this.h = new Uint16Array(10);
          this.pad = new Uint16Array(8);
          this.leftover = 0;
          this.fin = 0;
          var t0, t1, t2, t3, t4, t5, t6, t7;
          t0 = key[0] & 255 | (key[1] & 255) << 8;
          this.r[0] = t0 & 8191;
          t1 = key[2] & 255 | (key[3] & 255) << 8;
          this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
          t2 = key[4] & 255 | (key[5] & 255) << 8;
          this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
          t3 = key[6] & 255 | (key[7] & 255) << 8;
          this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
          t4 = key[8] & 255 | (key[9] & 255) << 8;
          this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
          this.r[5] = t4 >>> 1 & 8190;
          t5 = key[10] & 255 | (key[11] & 255) << 8;
          this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
          t6 = key[12] & 255 | (key[13] & 255) << 8;
          this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
          t7 = key[14] & 255 | (key[15] & 255) << 8;
          this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
          this.r[9] = t7 >>> 5 & 127;
          this.pad[0] = key[16] & 255 | (key[17] & 255) << 8;
          this.pad[1] = key[18] & 255 | (key[19] & 255) << 8;
          this.pad[2] = key[20] & 255 | (key[21] & 255) << 8;
          this.pad[3] = key[22] & 255 | (key[23] & 255) << 8;
          this.pad[4] = key[24] & 255 | (key[25] & 255) << 8;
          this.pad[5] = key[26] & 255 | (key[27] & 255) << 8;
          this.pad[6] = key[28] & 255 | (key[29] & 255) << 8;
          this.pad[7] = key[30] & 255 | (key[31] & 255) << 8;
        };
        poly1305.prototype.blocks = function(m, mpos, bytes) {
          var hibit = this.fin ? 0 : 1 << 11;
          var t0, t1, t2, t3, t4, t5, t6, t7, c;
          var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
          var h0 = this.h[0], h1 = this.h[1], h2 = this.h[2], h3 = this.h[3], h4 = this.h[4], h5 = this.h[5], h6 = this.h[6], h7 = this.h[7], h8 = this.h[8], h9 = this.h[9];
          var r0 = this.r[0], r1 = this.r[1], r2 = this.r[2], r3 = this.r[3], r4 = this.r[4], r5 = this.r[5], r6 = this.r[6], r7 = this.r[7], r8 = this.r[8], r9 = this.r[9];
          while (bytes >= 16) {
            t0 = m[mpos + 0] & 255 | (m[mpos + 1] & 255) << 8;
            h0 += t0 & 8191;
            t1 = m[mpos + 2] & 255 | (m[mpos + 3] & 255) << 8;
            h1 += (t0 >>> 13 | t1 << 3) & 8191;
            t2 = m[mpos + 4] & 255 | (m[mpos + 5] & 255) << 8;
            h2 += (t1 >>> 10 | t2 << 6) & 8191;
            t3 = m[mpos + 6] & 255 | (m[mpos + 7] & 255) << 8;
            h3 += (t2 >>> 7 | t3 << 9) & 8191;
            t4 = m[mpos + 8] & 255 | (m[mpos + 9] & 255) << 8;
            h4 += (t3 >>> 4 | t4 << 12) & 8191;
            h5 += t4 >>> 1 & 8191;
            t5 = m[mpos + 10] & 255 | (m[mpos + 11] & 255) << 8;
            h6 += (t4 >>> 14 | t5 << 2) & 8191;
            t6 = m[mpos + 12] & 255 | (m[mpos + 13] & 255) << 8;
            h7 += (t5 >>> 11 | t6 << 5) & 8191;
            t7 = m[mpos + 14] & 255 | (m[mpos + 15] & 255) << 8;
            h8 += (t6 >>> 8 | t7 << 8) & 8191;
            h9 += t7 >>> 5 | hibit;
            c = 0;
            d0 = c;
            d0 += h0 * r0;
            d0 += h1 * (5 * r9);
            d0 += h2 * (5 * r8);
            d0 += h3 * (5 * r7);
            d0 += h4 * (5 * r6);
            c = d0 >>> 13;
            d0 &= 8191;
            d0 += h5 * (5 * r5);
            d0 += h6 * (5 * r4);
            d0 += h7 * (5 * r3);
            d0 += h8 * (5 * r2);
            d0 += h9 * (5 * r1);
            c += d0 >>> 13;
            d0 &= 8191;
            d1 = c;
            d1 += h0 * r1;
            d1 += h1 * r0;
            d1 += h2 * (5 * r9);
            d1 += h3 * (5 * r8);
            d1 += h4 * (5 * r7);
            c = d1 >>> 13;
            d1 &= 8191;
            d1 += h5 * (5 * r6);
            d1 += h6 * (5 * r5);
            d1 += h7 * (5 * r4);
            d1 += h8 * (5 * r3);
            d1 += h9 * (5 * r2);
            c += d1 >>> 13;
            d1 &= 8191;
            d2 = c;
            d2 += h0 * r2;
            d2 += h1 * r1;
            d2 += h2 * r0;
            d2 += h3 * (5 * r9);
            d2 += h4 * (5 * r8);
            c = d2 >>> 13;
            d2 &= 8191;
            d2 += h5 * (5 * r7);
            d2 += h6 * (5 * r6);
            d2 += h7 * (5 * r5);
            d2 += h8 * (5 * r4);
            d2 += h9 * (5 * r3);
            c += d2 >>> 13;
            d2 &= 8191;
            d3 = c;
            d3 += h0 * r3;
            d3 += h1 * r2;
            d3 += h2 * r1;
            d3 += h3 * r0;
            d3 += h4 * (5 * r9);
            c = d3 >>> 13;
            d3 &= 8191;
            d3 += h5 * (5 * r8);
            d3 += h6 * (5 * r7);
            d3 += h7 * (5 * r6);
            d3 += h8 * (5 * r5);
            d3 += h9 * (5 * r4);
            c += d3 >>> 13;
            d3 &= 8191;
            d4 = c;
            d4 += h0 * r4;
            d4 += h1 * r3;
            d4 += h2 * r2;
            d4 += h3 * r1;
            d4 += h4 * r0;
            c = d4 >>> 13;
            d4 &= 8191;
            d4 += h5 * (5 * r9);
            d4 += h6 * (5 * r8);
            d4 += h7 * (5 * r7);
            d4 += h8 * (5 * r6);
            d4 += h9 * (5 * r5);
            c += d4 >>> 13;
            d4 &= 8191;
            d5 = c;
            d5 += h0 * r5;
            d5 += h1 * r4;
            d5 += h2 * r3;
            d5 += h3 * r2;
            d5 += h4 * r1;
            c = d5 >>> 13;
            d5 &= 8191;
            d5 += h5 * r0;
            d5 += h6 * (5 * r9);
            d5 += h7 * (5 * r8);
            d5 += h8 * (5 * r7);
            d5 += h9 * (5 * r6);
            c += d5 >>> 13;
            d5 &= 8191;
            d6 = c;
            d6 += h0 * r6;
            d6 += h1 * r5;
            d6 += h2 * r4;
            d6 += h3 * r3;
            d6 += h4 * r2;
            c = d6 >>> 13;
            d6 &= 8191;
            d6 += h5 * r1;
            d6 += h6 * r0;
            d6 += h7 * (5 * r9);
            d6 += h8 * (5 * r8);
            d6 += h9 * (5 * r7);
            c += d6 >>> 13;
            d6 &= 8191;
            d7 = c;
            d7 += h0 * r7;
            d7 += h1 * r6;
            d7 += h2 * r5;
            d7 += h3 * r4;
            d7 += h4 * r3;
            c = d7 >>> 13;
            d7 &= 8191;
            d7 += h5 * r2;
            d7 += h6 * r1;
            d7 += h7 * r0;
            d7 += h8 * (5 * r9);
            d7 += h9 * (5 * r8);
            c += d7 >>> 13;
            d7 &= 8191;
            d8 = c;
            d8 += h0 * r8;
            d8 += h1 * r7;
            d8 += h2 * r6;
            d8 += h3 * r5;
            d8 += h4 * r4;
            c = d8 >>> 13;
            d8 &= 8191;
            d8 += h5 * r3;
            d8 += h6 * r2;
            d8 += h7 * r1;
            d8 += h8 * r0;
            d8 += h9 * (5 * r9);
            c += d8 >>> 13;
            d8 &= 8191;
            d9 = c;
            d9 += h0 * r9;
            d9 += h1 * r8;
            d9 += h2 * r7;
            d9 += h3 * r6;
            d9 += h4 * r5;
            c = d9 >>> 13;
            d9 &= 8191;
            d9 += h5 * r4;
            d9 += h6 * r3;
            d9 += h7 * r2;
            d9 += h8 * r1;
            d9 += h9 * r0;
            c += d9 >>> 13;
            d9 &= 8191;
            c = (c << 2) + c | 0;
            c = c + d0 | 0;
            d0 = c & 8191;
            c = c >>> 13;
            d1 += c;
            h0 = d0;
            h1 = d1;
            h2 = d2;
            h3 = d3;
            h4 = d4;
            h5 = d5;
            h6 = d6;
            h7 = d7;
            h8 = d8;
            h9 = d9;
            mpos += 16;
            bytes -= 16;
          }
          this.h[0] = h0;
          this.h[1] = h1;
          this.h[2] = h2;
          this.h[3] = h3;
          this.h[4] = h4;
          this.h[5] = h5;
          this.h[6] = h6;
          this.h[7] = h7;
          this.h[8] = h8;
          this.h[9] = h9;
        };
        poly1305.prototype.finish = function(mac, macpos) {
          var g = new Uint16Array(10);
          var c, mask, f, i;
          if (this.leftover) {
            i = this.leftover;
            this.buffer[i++] = 1;
            for (; i < 16; i++) this.buffer[i] = 0;
            this.fin = 1;
            this.blocks(this.buffer, 0, 16);
          }
          c = this.h[1] >>> 13;
          this.h[1] &= 8191;
          for (i = 2; i < 10; i++) {
            this.h[i] += c;
            c = this.h[i] >>> 13;
            this.h[i] &= 8191;
          }
          this.h[0] += c * 5;
          c = this.h[0] >>> 13;
          this.h[0] &= 8191;
          this.h[1] += c;
          c = this.h[1] >>> 13;
          this.h[1] &= 8191;
          this.h[2] += c;
          g[0] = this.h[0] + 5;
          c = g[0] >>> 13;
          g[0] &= 8191;
          for (i = 1; i < 10; i++) {
            g[i] = this.h[i] + c;
            c = g[i] >>> 13;
            g[i] &= 8191;
          }
          g[9] -= 1 << 13;
          mask = (c ^ 1) - 1;
          for (i = 0; i < 10; i++) g[i] &= mask;
          mask = ~mask;
          for (i = 0; i < 10; i++) this.h[i] = this.h[i] & mask | g[i];
          this.h[0] = (this.h[0] | this.h[1] << 13) & 65535;
          this.h[1] = (this.h[1] >>> 3 | this.h[2] << 10) & 65535;
          this.h[2] = (this.h[2] >>> 6 | this.h[3] << 7) & 65535;
          this.h[3] = (this.h[3] >>> 9 | this.h[4] << 4) & 65535;
          this.h[4] = (this.h[4] >>> 12 | this.h[5] << 1 | this.h[6] << 14) & 65535;
          this.h[5] = (this.h[6] >>> 2 | this.h[7] << 11) & 65535;
          this.h[6] = (this.h[7] >>> 5 | this.h[8] << 8) & 65535;
          this.h[7] = (this.h[8] >>> 8 | this.h[9] << 5) & 65535;
          f = this.h[0] + this.pad[0];
          this.h[0] = f & 65535;
          for (i = 1; i < 8; i++) {
            f = (this.h[i] + this.pad[i] | 0) + (f >>> 16) | 0;
            this.h[i] = f & 65535;
          }
          mac[macpos + 0] = this.h[0] >>> 0 & 255;
          mac[macpos + 1] = this.h[0] >>> 8 & 255;
          mac[macpos + 2] = this.h[1] >>> 0 & 255;
          mac[macpos + 3] = this.h[1] >>> 8 & 255;
          mac[macpos + 4] = this.h[2] >>> 0 & 255;
          mac[macpos + 5] = this.h[2] >>> 8 & 255;
          mac[macpos + 6] = this.h[3] >>> 0 & 255;
          mac[macpos + 7] = this.h[3] >>> 8 & 255;
          mac[macpos + 8] = this.h[4] >>> 0 & 255;
          mac[macpos + 9] = this.h[4] >>> 8 & 255;
          mac[macpos + 10] = this.h[5] >>> 0 & 255;
          mac[macpos + 11] = this.h[5] >>> 8 & 255;
          mac[macpos + 12] = this.h[6] >>> 0 & 255;
          mac[macpos + 13] = this.h[6] >>> 8 & 255;
          mac[macpos + 14] = this.h[7] >>> 0 & 255;
          mac[macpos + 15] = this.h[7] >>> 8 & 255;
        };
        poly1305.prototype.update = function(m, mpos, bytes) {
          var i, want;
          if (this.leftover) {
            want = 16 - this.leftover;
            if (want > bytes)
              want = bytes;
            for (i = 0; i < want; i++)
              this.buffer[this.leftover + i] = m[mpos + i];
            bytes -= want;
            mpos += want;
            this.leftover += want;
            if (this.leftover < 16)
              return;
            this.blocks(this.buffer, 0, 16);
            this.leftover = 0;
          }
          if (bytes >= 16) {
            want = bytes - bytes % 16;
            this.blocks(m, mpos, want);
            mpos += want;
            bytes -= want;
          }
          if (bytes) {
            for (i = 0; i < bytes; i++)
              this.buffer[this.leftover + i] = m[mpos + i];
            this.leftover += bytes;
          }
        };
        function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
          var s = new poly1305(k);
          s.update(m, mpos, n);
          s.finish(out, outpos);
          return 0;
        }
        function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
          var x = new Uint8Array(16);
          crypto_onetimeauth(x, 0, m, mpos, n, k);
          return crypto_verify_16(h, hpos, x, 0);
        }
        function crypto_secretbox(c, m, d, n, k) {
          var i;
          if (d < 32) return -1;
          crypto_stream_xor(c, 0, m, 0, d, n, k);
          crypto_onetimeauth(c, 16, c, 32, d - 32, c);
          for (i = 0; i < 16; i++) c[i] = 0;
          return 0;
        }
        function crypto_secretbox_open(m, c, d, n, k) {
          var i;
          var x = new Uint8Array(32);
          if (d < 32) return -1;
          crypto_stream(x, 0, 32, n, k);
          if (crypto_onetimeauth_verify(c, 16, c, 32, d - 32, x) !== 0) return -1;
          crypto_stream_xor(m, 0, c, 0, d, n, k);
          for (i = 0; i < 32; i++) m[i] = 0;
          return 0;
        }
        function set25519(r, a) {
          var i;
          for (i = 0; i < 16; i++) r[i] = a[i] | 0;
        }
        function car25519(o) {
          var i, v, c = 1;
          for (i = 0; i < 16; i++) {
            v = o[i] + c + 65535;
            c = Math.floor(v / 65536);
            o[i] = v - c * 65536;
          }
          o[0] += c - 1 + 37 * (c - 1);
        }
        function sel25519(p, q, b) {
          var t, c = ~(b - 1);
          for (var i = 0; i < 16; i++) {
            t = c & (p[i] ^ q[i]);
            p[i] ^= t;
            q[i] ^= t;
          }
        }
        function pack25519(o, n) {
          var i, j, b;
          var m = gf(), t = gf();
          for (i = 0; i < 16; i++) t[i] = n[i];
          car25519(t);
          car25519(t);
          car25519(t);
          for (j = 0; j < 2; j++) {
            m[0] = t[0] - 65517;
            for (i = 1; i < 15; i++) {
              m[i] = t[i] - 65535 - (m[i - 1] >> 16 & 1);
              m[i - 1] &= 65535;
            }
            m[15] = t[15] - 32767 - (m[14] >> 16 & 1);
            b = m[15] >> 16 & 1;
            m[14] &= 65535;
            sel25519(t, m, 1 - b);
          }
          for (i = 0; i < 16; i++) {
            o[2 * i] = t[i] & 255;
            o[2 * i + 1] = t[i] >> 8;
          }
        }
        function neq25519(a, b) {
          var c = new Uint8Array(32), d = new Uint8Array(32);
          pack25519(c, a);
          pack25519(d, b);
          return crypto_verify_32(c, 0, d, 0);
        }
        function par25519(a) {
          var d = new Uint8Array(32);
          pack25519(d, a);
          return d[0] & 1;
        }
        function unpack25519(o, n) {
          var i;
          for (i = 0; i < 16; i++) o[i] = n[2 * i] + (n[2 * i + 1] << 8);
          o[15] &= 32767;
        }
        function A(o, a, b) {
          for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
        }
        function Z(o, a, b) {
          for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
        }
        function M(o, a, b) {
          var v, c, t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0, t8 = 0, t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0, t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0, t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0, b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
          v = a[0];
          t0 += v * b0;
          t1 += v * b1;
          t2 += v * b2;
          t3 += v * b3;
          t4 += v * b4;
          t5 += v * b5;
          t6 += v * b6;
          t7 += v * b7;
          t8 += v * b8;
          t9 += v * b9;
          t10 += v * b10;
          t11 += v * b11;
          t12 += v * b12;
          t13 += v * b13;
          t14 += v * b14;
          t15 += v * b15;
          v = a[1];
          t1 += v * b0;
          t2 += v * b1;
          t3 += v * b2;
          t4 += v * b3;
          t5 += v * b4;
          t6 += v * b5;
          t7 += v * b6;
          t8 += v * b7;
          t9 += v * b8;
          t10 += v * b9;
          t11 += v * b10;
          t12 += v * b11;
          t13 += v * b12;
          t14 += v * b13;
          t15 += v * b14;
          t16 += v * b15;
          v = a[2];
          t2 += v * b0;
          t3 += v * b1;
          t4 += v * b2;
          t5 += v * b3;
          t6 += v * b4;
          t7 += v * b5;
          t8 += v * b6;
          t9 += v * b7;
          t10 += v * b8;
          t11 += v * b9;
          t12 += v * b10;
          t13 += v * b11;
          t14 += v * b12;
          t15 += v * b13;
          t16 += v * b14;
          t17 += v * b15;
          v = a[3];
          t3 += v * b0;
          t4 += v * b1;
          t5 += v * b2;
          t6 += v * b3;
          t7 += v * b4;
          t8 += v * b5;
          t9 += v * b6;
          t10 += v * b7;
          t11 += v * b8;
          t12 += v * b9;
          t13 += v * b10;
          t14 += v * b11;
          t15 += v * b12;
          t16 += v * b13;
          t17 += v * b14;
          t18 += v * b15;
          v = a[4];
          t4 += v * b0;
          t5 += v * b1;
          t6 += v * b2;
          t7 += v * b3;
          t8 += v * b4;
          t9 += v * b5;
          t10 += v * b6;
          t11 += v * b7;
          t12 += v * b8;
          t13 += v * b9;
          t14 += v * b10;
          t15 += v * b11;
          t16 += v * b12;
          t17 += v * b13;
          t18 += v * b14;
          t19 += v * b15;
          v = a[5];
          t5 += v * b0;
          t6 += v * b1;
          t7 += v * b2;
          t8 += v * b3;
          t9 += v * b4;
          t10 += v * b5;
          t11 += v * b6;
          t12 += v * b7;
          t13 += v * b8;
          t14 += v * b9;
          t15 += v * b10;
          t16 += v * b11;
          t17 += v * b12;
          t18 += v * b13;
          t19 += v * b14;
          t20 += v * b15;
          v = a[6];
          t6 += v * b0;
          t7 += v * b1;
          t8 += v * b2;
          t9 += v * b3;
          t10 += v * b4;
          t11 += v * b5;
          t12 += v * b6;
          t13 += v * b7;
          t14 += v * b8;
          t15 += v * b9;
          t16 += v * b10;
          t17 += v * b11;
          t18 += v * b12;
          t19 += v * b13;
          t20 += v * b14;
          t21 += v * b15;
          v = a[7];
          t7 += v * b0;
          t8 += v * b1;
          t9 += v * b2;
          t10 += v * b3;
          t11 += v * b4;
          t12 += v * b5;
          t13 += v * b6;
          t14 += v * b7;
          t15 += v * b8;
          t16 += v * b9;
          t17 += v * b10;
          t18 += v * b11;
          t19 += v * b12;
          t20 += v * b13;
          t21 += v * b14;
          t22 += v * b15;
          v = a[8];
          t8 += v * b0;
          t9 += v * b1;
          t10 += v * b2;
          t11 += v * b3;
          t12 += v * b4;
          t13 += v * b5;
          t14 += v * b6;
          t15 += v * b7;
          t16 += v * b8;
          t17 += v * b9;
          t18 += v * b10;
          t19 += v * b11;
          t20 += v * b12;
          t21 += v * b13;
          t22 += v * b14;
          t23 += v * b15;
          v = a[9];
          t9 += v * b0;
          t10 += v * b1;
          t11 += v * b2;
          t12 += v * b3;
          t13 += v * b4;
          t14 += v * b5;
          t15 += v * b6;
          t16 += v * b7;
          t17 += v * b8;
          t18 += v * b9;
          t19 += v * b10;
          t20 += v * b11;
          t21 += v * b12;
          t22 += v * b13;
          t23 += v * b14;
          t24 += v * b15;
          v = a[10];
          t10 += v * b0;
          t11 += v * b1;
          t12 += v * b2;
          t13 += v * b3;
          t14 += v * b4;
          t15 += v * b5;
          t16 += v * b6;
          t17 += v * b7;
          t18 += v * b8;
          t19 += v * b9;
          t20 += v * b10;
          t21 += v * b11;
          t22 += v * b12;
          t23 += v * b13;
          t24 += v * b14;
          t25 += v * b15;
          v = a[11];
          t11 += v * b0;
          t12 += v * b1;
          t13 += v * b2;
          t14 += v * b3;
          t15 += v * b4;
          t16 += v * b5;
          t17 += v * b6;
          t18 += v * b7;
          t19 += v * b8;
          t20 += v * b9;
          t21 += v * b10;
          t22 += v * b11;
          t23 += v * b12;
          t24 += v * b13;
          t25 += v * b14;
          t26 += v * b15;
          v = a[12];
          t12 += v * b0;
          t13 += v * b1;
          t14 += v * b2;
          t15 += v * b3;
          t16 += v * b4;
          t17 += v * b5;
          t18 += v * b6;
          t19 += v * b7;
          t20 += v * b8;
          t21 += v * b9;
          t22 += v * b10;
          t23 += v * b11;
          t24 += v * b12;
          t25 += v * b13;
          t26 += v * b14;
          t27 += v * b15;
          v = a[13];
          t13 += v * b0;
          t14 += v * b1;
          t15 += v * b2;
          t16 += v * b3;
          t17 += v * b4;
          t18 += v * b5;
          t19 += v * b6;
          t20 += v * b7;
          t21 += v * b8;
          t22 += v * b9;
          t23 += v * b10;
          t24 += v * b11;
          t25 += v * b12;
          t26 += v * b13;
          t27 += v * b14;
          t28 += v * b15;
          v = a[14];
          t14 += v * b0;
          t15 += v * b1;
          t16 += v * b2;
          t17 += v * b3;
          t18 += v * b4;
          t19 += v * b5;
          t20 += v * b6;
          t21 += v * b7;
          t22 += v * b8;
          t23 += v * b9;
          t24 += v * b10;
          t25 += v * b11;
          t26 += v * b12;
          t27 += v * b13;
          t28 += v * b14;
          t29 += v * b15;
          v = a[15];
          t15 += v * b0;
          t16 += v * b1;
          t17 += v * b2;
          t18 += v * b3;
          t19 += v * b4;
          t20 += v * b5;
          t21 += v * b6;
          t22 += v * b7;
          t23 += v * b8;
          t24 += v * b9;
          t25 += v * b10;
          t26 += v * b11;
          t27 += v * b12;
          t28 += v * b13;
          t29 += v * b14;
          t30 += v * b15;
          t0 += 38 * t16;
          t1 += 38 * t17;
          t2 += 38 * t18;
          t3 += 38 * t19;
          t4 += 38 * t20;
          t5 += 38 * t21;
          t6 += 38 * t22;
          t7 += 38 * t23;
          t8 += 38 * t24;
          t9 += 38 * t25;
          t10 += 38 * t26;
          t11 += 38 * t27;
          t12 += 38 * t28;
          t13 += 38 * t29;
          t14 += 38 * t30;
          c = 1;
          v = t0 + c + 65535;
          c = Math.floor(v / 65536);
          t0 = v - c * 65536;
          v = t1 + c + 65535;
          c = Math.floor(v / 65536);
          t1 = v - c * 65536;
          v = t2 + c + 65535;
          c = Math.floor(v / 65536);
          t2 = v - c * 65536;
          v = t3 + c + 65535;
          c = Math.floor(v / 65536);
          t3 = v - c * 65536;
          v = t4 + c + 65535;
          c = Math.floor(v / 65536);
          t4 = v - c * 65536;
          v = t5 + c + 65535;
          c = Math.floor(v / 65536);
          t5 = v - c * 65536;
          v = t6 + c + 65535;
          c = Math.floor(v / 65536);
          t6 = v - c * 65536;
          v = t7 + c + 65535;
          c = Math.floor(v / 65536);
          t7 = v - c * 65536;
          v = t8 + c + 65535;
          c = Math.floor(v / 65536);
          t8 = v - c * 65536;
          v = t9 + c + 65535;
          c = Math.floor(v / 65536);
          t9 = v - c * 65536;
          v = t10 + c + 65535;
          c = Math.floor(v / 65536);
          t10 = v - c * 65536;
          v = t11 + c + 65535;
          c = Math.floor(v / 65536);
          t11 = v - c * 65536;
          v = t12 + c + 65535;
          c = Math.floor(v / 65536);
          t12 = v - c * 65536;
          v = t13 + c + 65535;
          c = Math.floor(v / 65536);
          t13 = v - c * 65536;
          v = t14 + c + 65535;
          c = Math.floor(v / 65536);
          t14 = v - c * 65536;
          v = t15 + c + 65535;
          c = Math.floor(v / 65536);
          t15 = v - c * 65536;
          t0 += c - 1 + 37 * (c - 1);
          c = 1;
          v = t0 + c + 65535;
          c = Math.floor(v / 65536);
          t0 = v - c * 65536;
          v = t1 + c + 65535;
          c = Math.floor(v / 65536);
          t1 = v - c * 65536;
          v = t2 + c + 65535;
          c = Math.floor(v / 65536);
          t2 = v - c * 65536;
          v = t3 + c + 65535;
          c = Math.floor(v / 65536);
          t3 = v - c * 65536;
          v = t4 + c + 65535;
          c = Math.floor(v / 65536);
          t4 = v - c * 65536;
          v = t5 + c + 65535;
          c = Math.floor(v / 65536);
          t5 = v - c * 65536;
          v = t6 + c + 65535;
          c = Math.floor(v / 65536);
          t6 = v - c * 65536;
          v = t7 + c + 65535;
          c = Math.floor(v / 65536);
          t7 = v - c * 65536;
          v = t8 + c + 65535;
          c = Math.floor(v / 65536);
          t8 = v - c * 65536;
          v = t9 + c + 65535;
          c = Math.floor(v / 65536);
          t9 = v - c * 65536;
          v = t10 + c + 65535;
          c = Math.floor(v / 65536);
          t10 = v - c * 65536;
          v = t11 + c + 65535;
          c = Math.floor(v / 65536);
          t11 = v - c * 65536;
          v = t12 + c + 65535;
          c = Math.floor(v / 65536);
          t12 = v - c * 65536;
          v = t13 + c + 65535;
          c = Math.floor(v / 65536);
          t13 = v - c * 65536;
          v = t14 + c + 65535;
          c = Math.floor(v / 65536);
          t14 = v - c * 65536;
          v = t15 + c + 65535;
          c = Math.floor(v / 65536);
          t15 = v - c * 65536;
          t0 += c - 1 + 37 * (c - 1);
          o[0] = t0;
          o[1] = t1;
          o[2] = t2;
          o[3] = t3;
          o[4] = t4;
          o[5] = t5;
          o[6] = t6;
          o[7] = t7;
          o[8] = t8;
          o[9] = t9;
          o[10] = t10;
          o[11] = t11;
          o[12] = t12;
          o[13] = t13;
          o[14] = t14;
          o[15] = t15;
        }
        function S(o, a) {
          M(o, a, a);
        }
        function inv25519(o, i) {
          var c = gf();
          var a;
          for (a = 0; a < 16; a++) c[a] = i[a];
          for (a = 253; a >= 0; a--) {
            S(c, c);
            if (a !== 2 && a !== 4) M(c, c, i);
          }
          for (a = 0; a < 16; a++) o[a] = c[a];
        }
        function pow2523(o, i) {
          var c = gf();
          var a;
          for (a = 0; a < 16; a++) c[a] = i[a];
          for (a = 250; a >= 0; a--) {
            S(c, c);
            if (a !== 1) M(c, c, i);
          }
          for (a = 0; a < 16; a++) o[a] = c[a];
        }
        function crypto_scalarmult(q, n, p) {
          var z = new Uint8Array(32);
          var x = new Float64Array(80), r, i;
          var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf();
          for (i = 0; i < 31; i++) z[i] = n[i];
          z[31] = n[31] & 127 | 64;
          z[0] &= 248;
          unpack25519(x, p);
          for (i = 0; i < 16; i++) {
            b[i] = x[i];
            d[i] = a[i] = c[i] = 0;
          }
          a[0] = d[0] = 1;
          for (i = 254; i >= 0; --i) {
            r = z[i >>> 3] >>> (i & 7) & 1;
            sel25519(a, b, r);
            sel25519(c, d, r);
            A(e, a, c);
            Z(a, a, c);
            A(c, b, d);
            Z(b, b, d);
            S(d, e);
            S(f, a);
            M(a, c, a);
            M(c, b, e);
            A(e, a, c);
            Z(a, a, c);
            S(b, a);
            Z(c, d, f);
            M(a, c, _121665);
            A(a, a, d);
            M(c, c, a);
            M(a, d, f);
            M(d, b, x);
            S(b, e);
            sel25519(a, b, r);
            sel25519(c, d, r);
          }
          for (i = 0; i < 16; i++) {
            x[i + 16] = a[i];
            x[i + 32] = c[i];
            x[i + 48] = b[i];
            x[i + 64] = d[i];
          }
          var x32 = x.subarray(32);
          var x16 = x.subarray(16);
          inv25519(x32, x32);
          M(x16, x16, x32);
          pack25519(q, x16);
          return 0;
        }
        function crypto_scalarmult_base(q, n) {
          return crypto_scalarmult(q, n, _9);
        }
        function crypto_box_keypair(y, x) {
          randombytes(x, 32);
          return crypto_scalarmult_base(y, x);
        }
        function crypto_box_beforenm(k, y, x) {
          var s = new Uint8Array(32);
          crypto_scalarmult(s, x, y);
          return crypto_core_hsalsa20(k, _0, s, sigma);
        }
        var crypto_box_afternm = crypto_secretbox;
        var crypto_box_open_afternm = crypto_secretbox_open;
        function crypto_box(c, m, d, n, y, x) {
          var k = new Uint8Array(32);
          crypto_box_beforenm(k, y, x);
          return crypto_box_afternm(c, m, d, n, k);
        }
        function crypto_box_open(m, c, d, n, y, x) {
          var k = new Uint8Array(32);
          crypto_box_beforenm(k, y, x);
          return crypto_box_open_afternm(m, c, d, n, k);
        }
        var K = [
          1116352408,
          3609767458,
          1899447441,
          602891725,
          3049323471,
          3964484399,
          3921009573,
          2173295548,
          961987163,
          4081628472,
          1508970993,
          3053834265,
          2453635748,
          2937671579,
          2870763221,
          3664609560,
          3624381080,
          2734883394,
          310598401,
          1164996542,
          607225278,
          1323610764,
          1426881987,
          3590304994,
          1925078388,
          4068182383,
          2162078206,
          991336113,
          2614888103,
          633803317,
          3248222580,
          3479774868,
          3835390401,
          2666613458,
          4022224774,
          944711139,
          264347078,
          2341262773,
          604807628,
          2007800933,
          770255983,
          1495990901,
          1249150122,
          1856431235,
          1555081692,
          3175218132,
          1996064986,
          2198950837,
          2554220882,
          3999719339,
          2821834349,
          766784016,
          2952996808,
          2566594879,
          3210313671,
          3203337956,
          3336571891,
          1034457026,
          3584528711,
          2466948901,
          113926993,
          3758326383,
          338241895,
          168717936,
          666307205,
          1188179964,
          773529912,
          1546045734,
          1294757372,
          1522805485,
          1396182291,
          2643833823,
          1695183700,
          2343527390,
          1986661051,
          1014477480,
          2177026350,
          1206759142,
          2456956037,
          344077627,
          2730485921,
          1290863460,
          2820302411,
          3158454273,
          3259730800,
          3505952657,
          3345764771,
          106217008,
          3516065817,
          3606008344,
          3600352804,
          1432725776,
          4094571909,
          1467031594,
          275423344,
          851169720,
          430227734,
          3100823752,
          506948616,
          1363258195,
          659060556,
          3750685593,
          883997877,
          3785050280,
          958139571,
          3318307427,
          1322822218,
          3812723403,
          1537002063,
          2003034995,
          1747873779,
          3602036899,
          1955562222,
          1575990012,
          2024104815,
          1125592928,
          2227730452,
          2716904306,
          2361852424,
          442776044,
          2428436474,
          593698344,
          2756734187,
          3733110249,
          3204031479,
          2999351573,
          3329325298,
          3815920427,
          3391569614,
          3928383900,
          3515267271,
          566280711,
          3940187606,
          3454069534,
          4118630271,
          4000239992,
          116418474,
          1914138554,
          174292421,
          2731055270,
          289380356,
          3203993006,
          460393269,
          320620315,
          685471733,
          587496836,
          852142971,
          1086792851,
          1017036298,
          365543100,
          1126000580,
          2618297676,
          1288033470,
          3409855158,
          1501505948,
          4234509866,
          1607167915,
          987167468,
          1816402316,
          1246189591
        ];
        function crypto_hashblocks_hl(hh, hl, m, n) {
          var wh = new Int32Array(16), wl = new Int32Array(16), bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7, bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7, th, tl, i, j, h, l, a, b, c, d;
          var ah0 = hh[0], ah1 = hh[1], ah2 = hh[2], ah3 = hh[3], ah4 = hh[4], ah5 = hh[5], ah6 = hh[6], ah7 = hh[7], al0 = hl[0], al1 = hl[1], al2 = hl[2], al3 = hl[3], al4 = hl[4], al5 = hl[5], al6 = hl[6], al7 = hl[7];
          var pos = 0;
          while (n >= 128) {
            for (i = 0; i < 16; i++) {
              j = 8 * i + pos;
              wh[i] = m[j + 0] << 24 | m[j + 1] << 16 | m[j + 2] << 8 | m[j + 3];
              wl[i] = m[j + 4] << 24 | m[j + 5] << 16 | m[j + 6] << 8 | m[j + 7];
            }
            for (i = 0; i < 80; i++) {
              bh0 = ah0;
              bh1 = ah1;
              bh2 = ah2;
              bh3 = ah3;
              bh4 = ah4;
              bh5 = ah5;
              bh6 = ah6;
              bh7 = ah7;
              bl0 = al0;
              bl1 = al1;
              bl2 = al2;
              bl3 = al3;
              bl4 = al4;
              bl5 = al5;
              bl6 = al6;
              bl7 = al7;
              h = ah7;
              l = al7;
              a = l & 65535;
              b = l >>> 16;
              c = h & 65535;
              d = h >>> 16;
              h = (ah4 >>> 14 | al4 << 32 - 14) ^ (ah4 >>> 18 | al4 << 32 - 18) ^ (al4 >>> 41 - 32 | ah4 << 32 - (41 - 32));
              l = (al4 >>> 14 | ah4 << 32 - 14) ^ (al4 >>> 18 | ah4 << 32 - 18) ^ (ah4 >>> 41 - 32 | al4 << 32 - (41 - 32));
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = ah4 & ah5 ^ ~ah4 & ah6;
              l = al4 & al5 ^ ~al4 & al6;
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = K[i * 2];
              l = K[i * 2 + 1];
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = wh[i % 16];
              l = wl[i % 16];
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              th = c & 65535 | d << 16;
              tl = a & 65535 | b << 16;
              h = th;
              l = tl;
              a = l & 65535;
              b = l >>> 16;
              c = h & 65535;
              d = h >>> 16;
              h = (ah0 >>> 28 | al0 << 32 - 28) ^ (al0 >>> 34 - 32 | ah0 << 32 - (34 - 32)) ^ (al0 >>> 39 - 32 | ah0 << 32 - (39 - 32));
              l = (al0 >>> 28 | ah0 << 32 - 28) ^ (ah0 >>> 34 - 32 | al0 << 32 - (34 - 32)) ^ (ah0 >>> 39 - 32 | al0 << 32 - (39 - 32));
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = ah0 & ah1 ^ ah0 & ah2 ^ ah1 & ah2;
              l = al0 & al1 ^ al0 & al2 ^ al1 & al2;
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              bh7 = c & 65535 | d << 16;
              bl7 = a & 65535 | b << 16;
              h = bh3;
              l = bl3;
              a = l & 65535;
              b = l >>> 16;
              c = h & 65535;
              d = h >>> 16;
              h = th;
              l = tl;
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              bh3 = c & 65535 | d << 16;
              bl3 = a & 65535 | b << 16;
              ah1 = bh0;
              ah2 = bh1;
              ah3 = bh2;
              ah4 = bh3;
              ah5 = bh4;
              ah6 = bh5;
              ah7 = bh6;
              ah0 = bh7;
              al1 = bl0;
              al2 = bl1;
              al3 = bl2;
              al4 = bl3;
              al5 = bl4;
              al6 = bl5;
              al7 = bl6;
              al0 = bl7;
              if (i % 16 === 15) {
                for (j = 0; j < 16; j++) {
                  h = wh[j];
                  l = wl[j];
                  a = l & 65535;
                  b = l >>> 16;
                  c = h & 65535;
                  d = h >>> 16;
                  h = wh[(j + 9) % 16];
                  l = wl[(j + 9) % 16];
                  a += l & 65535;
                  b += l >>> 16;
                  c += h & 65535;
                  d += h >>> 16;
                  th = wh[(j + 1) % 16];
                  tl = wl[(j + 1) % 16];
                  h = (th >>> 1 | tl << 32 - 1) ^ (th >>> 8 | tl << 32 - 8) ^ th >>> 7;
                  l = (tl >>> 1 | th << 32 - 1) ^ (tl >>> 8 | th << 32 - 8) ^ (tl >>> 7 | th << 32 - 7);
                  a += l & 65535;
                  b += l >>> 16;
                  c += h & 65535;
                  d += h >>> 16;
                  th = wh[(j + 14) % 16];
                  tl = wl[(j + 14) % 16];
                  h = (th >>> 19 | tl << 32 - 19) ^ (tl >>> 61 - 32 | th << 32 - (61 - 32)) ^ th >>> 6;
                  l = (tl >>> 19 | th << 32 - 19) ^ (th >>> 61 - 32 | tl << 32 - (61 - 32)) ^ (tl >>> 6 | th << 32 - 6);
                  a += l & 65535;
                  b += l >>> 16;
                  c += h & 65535;
                  d += h >>> 16;
                  b += a >>> 16;
                  c += b >>> 16;
                  d += c >>> 16;
                  wh[j] = c & 65535 | d << 16;
                  wl[j] = a & 65535 | b << 16;
                }
              }
            }
            h = ah0;
            l = al0;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[0];
            l = hl[0];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[0] = ah0 = c & 65535 | d << 16;
            hl[0] = al0 = a & 65535 | b << 16;
            h = ah1;
            l = al1;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[1];
            l = hl[1];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[1] = ah1 = c & 65535 | d << 16;
            hl[1] = al1 = a & 65535 | b << 16;
            h = ah2;
            l = al2;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[2];
            l = hl[2];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[2] = ah2 = c & 65535 | d << 16;
            hl[2] = al2 = a & 65535 | b << 16;
            h = ah3;
            l = al3;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[3];
            l = hl[3];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[3] = ah3 = c & 65535 | d << 16;
            hl[3] = al3 = a & 65535 | b << 16;
            h = ah4;
            l = al4;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[4];
            l = hl[4];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[4] = ah4 = c & 65535 | d << 16;
            hl[4] = al4 = a & 65535 | b << 16;
            h = ah5;
            l = al5;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[5];
            l = hl[5];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[5] = ah5 = c & 65535 | d << 16;
            hl[5] = al5 = a & 65535 | b << 16;
            h = ah6;
            l = al6;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[6];
            l = hl[6];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[6] = ah6 = c & 65535 | d << 16;
            hl[6] = al6 = a & 65535 | b << 16;
            h = ah7;
            l = al7;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[7];
            l = hl[7];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[7] = ah7 = c & 65535 | d << 16;
            hl[7] = al7 = a & 65535 | b << 16;
            pos += 128;
            n -= 128;
          }
          return n;
        }
        function crypto_hash(out, m, n) {
          var hh = new Int32Array(8), hl = new Int32Array(8), x = new Uint8Array(256), i, b = n;
          hh[0] = 1779033703;
          hh[1] = 3144134277;
          hh[2] = 1013904242;
          hh[3] = 2773480762;
          hh[4] = 1359893119;
          hh[5] = 2600822924;
          hh[6] = 528734635;
          hh[7] = 1541459225;
          hl[0] = 4089235720;
          hl[1] = 2227873595;
          hl[2] = 4271175723;
          hl[3] = 1595750129;
          hl[4] = 2917565137;
          hl[5] = 725511199;
          hl[6] = 4215389547;
          hl[7] = 327033209;
          crypto_hashblocks_hl(hh, hl, m, n);
          n %= 128;
          for (i = 0; i < n; i++) x[i] = m[b - n + i];
          x[n] = 128;
          n = 256 - 128 * (n < 112 ? 1 : 0);
          x[n - 9] = 0;
          ts64(x, n - 8, b / 536870912 | 0, b << 3);
          crypto_hashblocks_hl(hh, hl, x, n);
          for (i = 0; i < 8; i++) ts64(out, 8 * i, hh[i], hl[i]);
          return 0;
        }
        function add(p, q) {
          var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf(), g = gf(), h = gf(), t = gf();
          Z(a, p[1], p[0]);
          Z(t, q[1], q[0]);
          M(a, a, t);
          A(b, p[0], p[1]);
          A(t, q[0], q[1]);
          M(b, b, t);
          M(c, p[3], q[3]);
          M(c, c, D2);
          M(d, p[2], q[2]);
          A(d, d, d);
          Z(e, b, a);
          Z(f, d, c);
          A(g, d, c);
          A(h, b, a);
          M(p[0], e, f);
          M(p[1], h, g);
          M(p[2], g, f);
          M(p[3], e, h);
        }
        function cswap(p, q, b) {
          var i;
          for (i = 0; i < 4; i++) {
            sel25519(p[i], q[i], b);
          }
        }
        function pack(r, p) {
          var tx = gf(), ty = gf(), zi = gf();
          inv25519(zi, p[2]);
          M(tx, p[0], zi);
          M(ty, p[1], zi);
          pack25519(r, ty);
          r[31] ^= par25519(tx) << 7;
        }
        function scalarmult(p, q, s) {
          var b, i;
          set25519(p[0], gf0);
          set25519(p[1], gf1);
          set25519(p[2], gf1);
          set25519(p[3], gf0);
          for (i = 255; i >= 0; --i) {
            b = s[i / 8 | 0] >> (i & 7) & 1;
            cswap(p, q, b);
            add(q, p);
            add(p, p);
            cswap(p, q, b);
          }
        }
        function scalarbase(p, s) {
          var q = [gf(), gf(), gf(), gf()];
          set25519(q[0], X);
          set25519(q[1], Y);
          set25519(q[2], gf1);
          M(q[3], X, Y);
          scalarmult(p, q, s);
        }
        function crypto_sign_keypair(pk, sk, seeded) {
          var d = new Uint8Array(64);
          var p = [gf(), gf(), gf(), gf()];
          var i;
          if (!seeded) randombytes(sk, 32);
          crypto_hash(d, sk, 32);
          d[0] &= 248;
          d[31] &= 127;
          d[31] |= 64;
          scalarbase(p, d);
          pack(pk, p);
          for (i = 0; i < 32; i++) sk[i + 32] = pk[i];
          return 0;
        }
        var L = new Float64Array([237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16]);
        function modL(r, x) {
          var carry, i, j, k;
          for (i = 63; i >= 32; --i) {
            carry = 0;
            for (j = i - 32, k = i - 12; j < k; ++j) {
              x[j] += carry - 16 * x[i] * L[j - (i - 32)];
              carry = Math.floor((x[j] + 128) / 256);
              x[j] -= carry * 256;
            }
            x[j] += carry;
            x[i] = 0;
          }
          carry = 0;
          for (j = 0; j < 32; j++) {
            x[j] += carry - (x[31] >> 4) * L[j];
            carry = x[j] >> 8;
            x[j] &= 255;
          }
          for (j = 0; j < 32; j++) x[j] -= carry * L[j];
          for (i = 0; i < 32; i++) {
            x[i + 1] += x[i] >> 8;
            r[i] = x[i] & 255;
          }
        }
        function reduce(r) {
          var x = new Float64Array(64), i;
          for (i = 0; i < 64; i++) x[i] = r[i];
          for (i = 0; i < 64; i++) r[i] = 0;
          modL(r, x);
        }
        function crypto_sign(sm, m, n, sk) {
          var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
          var i, j, x = new Float64Array(64);
          var p = [gf(), gf(), gf(), gf()];
          crypto_hash(d, sk, 32);
          d[0] &= 248;
          d[31] &= 127;
          d[31] |= 64;
          var smlen = n + 64;
          for (i = 0; i < n; i++) sm[64 + i] = m[i];
          for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];
          crypto_hash(r, sm.subarray(32), n + 32);
          reduce(r);
          scalarbase(p, r);
          pack(sm, p);
          for (i = 32; i < 64; i++) sm[i] = sk[i];
          crypto_hash(h, sm, n + 64);
          reduce(h);
          for (i = 0; i < 64; i++) x[i] = 0;
          for (i = 0; i < 32; i++) x[i] = r[i];
          for (i = 0; i < 32; i++) {
            for (j = 0; j < 32; j++) {
              x[i + j] += h[i] * d[j];
            }
          }
          modL(sm.subarray(32), x);
          return smlen;
        }
        function unpackneg(r, p) {
          var t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
          set25519(r[2], gf1);
          unpack25519(r[1], p);
          S(num, r[1]);
          M(den, num, D);
          Z(num, num, r[2]);
          A(den, r[2], den);
          S(den2, den);
          S(den4, den2);
          M(den6, den4, den2);
          M(t, den6, num);
          M(t, t, den);
          pow2523(t, t);
          M(t, t, num);
          M(t, t, den);
          M(t, t, den);
          M(r[0], t, den);
          S(chk, r[0]);
          M(chk, chk, den);
          if (neq25519(chk, num)) M(r[0], r[0], I);
          S(chk, r[0]);
          M(chk, chk, den);
          if (neq25519(chk, num)) return -1;
          if (par25519(r[0]) === p[31] >> 7) Z(r[0], gf0, r[0]);
          M(r[3], r[0], r[1]);
          return 0;
        }
        function crypto_sign_open(m, sm, n, pk) {
          var i;
          var t = new Uint8Array(32), h = new Uint8Array(64);
          var p = [gf(), gf(), gf(), gf()], q = [gf(), gf(), gf(), gf()];
          if (n < 64) return -1;
          if (unpackneg(q, pk)) return -1;
          for (i = 0; i < n; i++) m[i] = sm[i];
          for (i = 0; i < 32; i++) m[i + 32] = pk[i];
          crypto_hash(h, m, n);
          reduce(h);
          scalarmult(p, q, h);
          scalarbase(q, sm.subarray(32));
          add(p, q);
          pack(t, p);
          n -= 64;
          if (crypto_verify_32(sm, 0, t, 0)) {
            for (i = 0; i < n; i++) m[i] = 0;
            return -1;
          }
          for (i = 0; i < n; i++) m[i] = sm[i + 64];
          return n;
        }
        var crypto_secretbox_KEYBYTES = 32, crypto_secretbox_NONCEBYTES = 24, crypto_secretbox_ZEROBYTES = 32, crypto_secretbox_BOXZEROBYTES = 16, crypto_scalarmult_BYTES = 32, crypto_scalarmult_SCALARBYTES = 32, crypto_box_PUBLICKEYBYTES = 32, crypto_box_SECRETKEYBYTES = 32, crypto_box_BEFORENMBYTES = 32, crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES, crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES, crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES, crypto_sign_BYTES = 64, crypto_sign_PUBLICKEYBYTES = 32, crypto_sign_SECRETKEYBYTES = 64, crypto_sign_SEEDBYTES = 32, crypto_hash_BYTES = 64;
        nacl2.lowlevel = {
          crypto_core_hsalsa20,
          crypto_stream_xor,
          crypto_stream,
          crypto_stream_salsa20_xor,
          crypto_stream_salsa20,
          crypto_onetimeauth,
          crypto_onetimeauth_verify,
          crypto_verify_16,
          crypto_verify_32,
          crypto_secretbox,
          crypto_secretbox_open,
          crypto_scalarmult,
          crypto_scalarmult_base,
          crypto_box_beforenm,
          crypto_box_afternm,
          crypto_box,
          crypto_box_open,
          crypto_box_keypair,
          crypto_hash,
          crypto_sign,
          crypto_sign_keypair,
          crypto_sign_open,
          crypto_secretbox_KEYBYTES,
          crypto_secretbox_NONCEBYTES,
          crypto_secretbox_ZEROBYTES,
          crypto_secretbox_BOXZEROBYTES,
          crypto_scalarmult_BYTES,
          crypto_scalarmult_SCALARBYTES,
          crypto_box_PUBLICKEYBYTES,
          crypto_box_SECRETKEYBYTES,
          crypto_box_BEFORENMBYTES,
          crypto_box_NONCEBYTES,
          crypto_box_ZEROBYTES,
          crypto_box_BOXZEROBYTES,
          crypto_sign_BYTES,
          crypto_sign_PUBLICKEYBYTES,
          crypto_sign_SECRETKEYBYTES,
          crypto_sign_SEEDBYTES,
          crypto_hash_BYTES,
          gf,
          D,
          L,
          pack25519,
          unpack25519,
          M,
          A,
          S,
          Z,
          pow2523,
          add,
          set25519,
          modL,
          scalarmult,
          scalarbase
        };
        function checkLengths(k, n) {
          if (k.length !== crypto_secretbox_KEYBYTES) throw new Error("bad key size");
          if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error("bad nonce size");
        }
        function checkBoxLengths(pk, sk) {
          if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error("bad public key size");
          if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error("bad secret key size");
        }
        function checkArrayTypes() {
          for (var i = 0; i < arguments.length; i++) {
            if (!(arguments[i] instanceof Uint8Array))
              throw new TypeError("unexpected type, use Uint8Array");
          }
        }
        function cleanup(arr) {
          for (var i = 0; i < arr.length; i++) arr[i] = 0;
        }
        nacl2.randomBytes = function(n) {
          var b = new Uint8Array(n);
          randombytes(b, n);
          return b;
        };
        nacl2.secretbox = function(msg, nonce, key) {
          checkArrayTypes(msg, nonce, key);
          checkLengths(key, nonce);
          var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
          var c = new Uint8Array(m.length);
          for (var i = 0; i < msg.length; i++) m[i + crypto_secretbox_ZEROBYTES] = msg[i];
          crypto_secretbox(c, m, m.length, nonce, key);
          return c.subarray(crypto_secretbox_BOXZEROBYTES);
        };
        nacl2.secretbox.open = function(box, nonce, key) {
          checkArrayTypes(box, nonce, key);
          checkLengths(key, nonce);
          var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
          var m = new Uint8Array(c.length);
          for (var i = 0; i < box.length; i++) c[i + crypto_secretbox_BOXZEROBYTES] = box[i];
          if (c.length < 32) return null;
          if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
          return m.subarray(crypto_secretbox_ZEROBYTES);
        };
        nacl2.secretbox.keyLength = crypto_secretbox_KEYBYTES;
        nacl2.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
        nacl2.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;
        nacl2.scalarMult = function(n, p) {
          checkArrayTypes(n, p);
          if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
          if (p.length !== crypto_scalarmult_BYTES) throw new Error("bad p size");
          var q = new Uint8Array(crypto_scalarmult_BYTES);
          crypto_scalarmult(q, n, p);
          return q;
        };
        nacl2.scalarMult.base = function(n) {
          checkArrayTypes(n);
          if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
          var q = new Uint8Array(crypto_scalarmult_BYTES);
          crypto_scalarmult_base(q, n);
          return q;
        };
        nacl2.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
        nacl2.scalarMult.groupElementLength = crypto_scalarmult_BYTES;
        nacl2.box = function(msg, nonce, publicKey, secretKey) {
          var k = nacl2.box.before(publicKey, secretKey);
          return nacl2.secretbox(msg, nonce, k);
        };
        nacl2.box.before = function(publicKey, secretKey) {
          checkArrayTypes(publicKey, secretKey);
          checkBoxLengths(publicKey, secretKey);
          var k = new Uint8Array(crypto_box_BEFORENMBYTES);
          crypto_box_beforenm(k, publicKey, secretKey);
          return k;
        };
        nacl2.box.after = nacl2.secretbox;
        nacl2.box.open = function(msg, nonce, publicKey, secretKey) {
          var k = nacl2.box.before(publicKey, secretKey);
          return nacl2.secretbox.open(msg, nonce, k);
        };
        nacl2.box.open.after = nacl2.secretbox.open;
        nacl2.box.keyPair = function() {
          var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
          crypto_box_keypair(pk, sk);
          return { publicKey: pk, secretKey: sk };
        };
        nacl2.box.keyPair.fromSecretKey = function(secretKey) {
          checkArrayTypes(secretKey);
          if (secretKey.length !== crypto_box_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
          crypto_scalarmult_base(pk, secretKey);
          return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
        };
        nacl2.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
        nacl2.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
        nacl2.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
        nacl2.box.nonceLength = crypto_box_NONCEBYTES;
        nacl2.box.overheadLength = nacl2.secretbox.overheadLength;
        nacl2.sign = function(msg, secretKey) {
          checkArrayTypes(msg, secretKey);
          if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var signedMsg = new Uint8Array(crypto_sign_BYTES + msg.length);
          crypto_sign(signedMsg, msg, msg.length, secretKey);
          return signedMsg;
        };
        nacl2.sign.open = function(signedMsg, publicKey) {
          checkArrayTypes(signedMsg, publicKey);
          if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
            throw new Error("bad public key size");
          var tmp = new Uint8Array(signedMsg.length);
          var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
          if (mlen < 0) return null;
          var m = new Uint8Array(mlen);
          for (var i = 0; i < m.length; i++) m[i] = tmp[i];
          return m;
        };
        nacl2.sign.detached = function(msg, secretKey) {
          var signedMsg = nacl2.sign(msg, secretKey);
          var sig = new Uint8Array(crypto_sign_BYTES);
          for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
          return sig;
        };
        nacl2.sign.detached.verify = function(msg, sig, publicKey) {
          checkArrayTypes(msg, sig, publicKey);
          if (sig.length !== crypto_sign_BYTES)
            throw new Error("bad signature size");
          if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
            throw new Error("bad public key size");
          var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
          var m = new Uint8Array(crypto_sign_BYTES + msg.length);
          var i;
          for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
          for (i = 0; i < msg.length; i++) sm[i + crypto_sign_BYTES] = msg[i];
          return crypto_sign_open(m, sm, sm.length, publicKey) >= 0;
        };
        nacl2.sign.keyPair = function() {
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
          crypto_sign_keypair(pk, sk);
          return { publicKey: pk, secretKey: sk };
        };
        nacl2.sign.keyPair.fromSecretKey = function(secretKey) {
          checkArrayTypes(secretKey);
          if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32 + i];
          return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
        };
        nacl2.sign.keyPair.fromSeed = function(seed) {
          checkArrayTypes(seed);
          if (seed.length !== crypto_sign_SEEDBYTES)
            throw new Error("bad seed size");
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
          for (var i = 0; i < 32; i++) sk[i] = seed[i];
          crypto_sign_keypair(pk, sk, true);
          return { publicKey: pk, secretKey: sk };
        };
        nacl2.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
        nacl2.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
        nacl2.sign.seedLength = crypto_sign_SEEDBYTES;
        nacl2.sign.signatureLength = crypto_sign_BYTES;
        nacl2.hash = function(msg) {
          checkArrayTypes(msg);
          var h = new Uint8Array(crypto_hash_BYTES);
          crypto_hash(h, msg, msg.length);
          return h;
        };
        nacl2.hash.hashLength = crypto_hash_BYTES;
        nacl2.verify = function(x, y) {
          checkArrayTypes(x, y);
          if (x.length === 0 || y.length === 0) return false;
          if (x.length !== y.length) return false;
          return vn(x, 0, y, 0, x.length) === 0 ? true : false;
        };
        nacl2.setPRNG = function(fn) {
          randombytes = fn;
        };
        (function() {
          var crypto = typeof self !== "undefined" ? self.crypto || self.msCrypto : null;
          if (crypto && crypto.getRandomValues) {
            var QUOTA = 65536;
            nacl2.setPRNG(function(x, n) {
              var i, v = new Uint8Array(n);
              for (i = 0; i < n; i += QUOTA) {
                crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
              }
              for (i = 0; i < n; i++) x[i] = v[i];
              cleanup(v);
            });
          } else if (typeof __require !== "undefined") {
            crypto = require_crypto();
            if (crypto && crypto.randomBytes) {
              nacl2.setPRNG(function(x, n) {
                var i, v = crypto.randomBytes(n);
                for (i = 0; i < n; i++) x[i] = v[i];
                cleanup(v);
              });
            }
          }
        })();
      })(typeof module !== "undefined" && module.exports ? module.exports : self.nacl = self.nacl || {});
    }
  });

  // node_modules/tweetnacl-util/nacl-util.js
  var require_nacl_util = __commonJS({
    "node_modules/tweetnacl-util/nacl-util.js"(exports, module) {
      (function(root, f) {
        "use strict";
        if (typeof module !== "undefined" && module.exports) module.exports = f();
        else if (root.nacl) root.nacl.util = f();
        else {
          root.nacl = {};
          root.nacl.util = f();
        }
      })(exports, function() {
        "use strict";
        var util = {};
        function validateBase64(s) {
          if (!/^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(s)) {
            throw new TypeError("invalid encoding");
          }
        }
        util.decodeUTF8 = function(s) {
          if (typeof s !== "string") throw new TypeError("expected string");
          var i, d = unescape(encodeURIComponent(s)), b = new Uint8Array(d.length);
          for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
          return b;
        };
        util.encodeUTF8 = function(arr) {
          var i, s = [];
          for (i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
          return decodeURIComponent(escape(s.join("")));
        };
        if (typeof atob === "undefined") {
          if (typeof Buffer.from !== "undefined") {
            util.encodeBase64 = function(arr) {
              return Buffer.from(arr).toString("base64");
            };
            util.decodeBase64 = function(s) {
              validateBase64(s);
              return new Uint8Array(Array.prototype.slice.call(Buffer.from(s, "base64"), 0));
            };
          } else {
            util.encodeBase64 = function(arr) {
              return new Buffer(arr).toString("base64");
            };
            util.decodeBase64 = function(s) {
              validateBase64(s);
              return new Uint8Array(Array.prototype.slice.call(new Buffer(s, "base64"), 0));
            };
          }
        } else {
          util.encodeBase64 = function(arr) {
            var i, s = [], len = arr.length;
            for (i = 0; i < len; i++) s.push(String.fromCharCode(arr[i]));
            return btoa(s.join(""));
          };
          util.decodeBase64 = function(s) {
            validateBase64(s);
            var i, d = atob(s), b = new Uint8Array(d.length);
            for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
            return b;
          };
        }
        return util;
      });
    }
  });

  // src/browser-entry.ts
  var browser_entry_exports = {};
  __export(browser_entry_exports, {
    BROWSER_BUNDLE: () => BROWSER_BUNDLE,
    CPX_DECIMALS: () => CPX_DECIMALS,
    CPX_DECIMALS_EXPECTED: () => CPX_DECIMALS_EXPECTED,
    CPX_MAINNET_MINT_ADDRESS: () => CPX_MAINNET_MINT_ADDRESS,
    CPX_RAW_SCALE: () => CPX_RAW_SCALE,
    DEFAULT_MAINNET_RPC: () => DEFAULT_MAINNET_RPC,
    DELIVERY_PROOF_READINESS: () => DELIVERY_PROOF_READINESS,
    DG2_RULE: () => DG2_RULE,
    ECONOMY_READINESS: () => ECONOMY_READINESS,
    FEATURE_READINESS_MATRIX: () => FEATURE_READINESS_MATRIX,
    FIRST5000_NODE_COUNT: () => FIRST5000_NODE_COUNT,
    FIRST5000_PER_NODE_RAW: () => FIRST5000_PER_NODE_RAW,
    FIRST5000_TOTAL_RAW: () => FIRST5000_TOTAL_RAW,
    GLOBAL_BUDGET_DENOMINATOR: () => GLOBAL_BUDGET_DENOMINATOR,
    GLOBAL_BUDGET_NUMERATOR: () => GLOBAL_BUDGET_NUMERATOR,
    MARKET_BURN_DENOMINATOR: () => MARKET_BURN_DENOMINATOR,
    MARKET_BURN_NUMERATOR: () => MARKET_BURN_NUMERATOR,
    MARKET_READINESS: () => MARKET_READINESS,
    MESHSENDER_PROGRAM_ID: () => MESHSENDER_PROGRAM_ID,
    NETWORK_LAB_READINESS: () => NETWORK_LAB_READINESS,
    NODE_PASSPORT_READINESS: () => NODE_PASSPORT_READINESS,
    NODE_REWARD_CAP_RAW: () => NODE_REWARD_CAP_RAW,
    OFFLINE_SERVICE_BURN_EUR: () => OFFLINE_SERVICE_BURN_EUR,
    PLATFORM_FEE: () => PLATFORM_FEE,
    PUBLIC_RPC_READINESS: () => PUBLIC_RPC_READINESS,
    REFERRAL_MAX_EDGES: () => REFERRAL_MAX_EDGES,
    REFERRAL_REFERRER_DEN: () => REFERRAL_REFERRER_DEN,
    REFERRAL_REFERRER_NUM: () => REFERRAL_REFERRER_NUM,
    REFERRAL_RELAY_DEN: () => REFERRAL_RELAY_DEN,
    REFERRAL_RELAY_NUM: () => REFERRAL_RELAY_NUM,
    RELAY_EVIDENCE_READINESS: () => RELAY_EVIDENCE_READINESS,
    RELAY_REWARD_CPX_CEILING_RAW: () => RELAY_REWARD_CPX_CEILING_RAW,
    RELAY_REWARD_EUR_TARGET: () => RELAY_REWARD_EUR_TARGET,
    REWARD_PERIOD_DURATION_MS: () => REWARD_PERIOD_DURATION_MS,
    Readiness: () => Readiness,
    SDK_DEMO_AGREEMENT_DOMAIN: () => SDK_DEMO_AGREEMENT_DOMAIN,
    SDK_DEMO_DELIVERY_PROOF_DOMAIN: () => SDK_DEMO_DELIVERY_PROOF_DOMAIN,
    SDK_DEMO_PASSPORT_DOMAIN: () => SDK_DEMO_PASSPORT_DOMAIN,
    SDK_DEMO_RELAY_FOLD_DOMAIN: () => SDK_DEMO_RELAY_FOLD_DOMAIN,
    SDK_DEMO_RELAY_LEAF_DOMAIN: () => SDK_DEMO_RELAY_LEAF_DOMAIN,
    SDK_DEMO_RELAY_ROUTE_SEED_DOMAIN: () => SDK_DEMO_RELAY_ROUTE_SEED_DOMAIN,
    SDK_EDITION: () => SDK_EDITION,
    SDK_NAME: () => SDK_NAME,
    SDK_VERSION: () => SDK_VERSION,
    SECONDARY_MAINNET_RPC: () => SECONDARY_MAINNET_RPC,
    SPL_TOKEN_PROGRAM_ID: () => SPL_TOKEN_PROGRAM_ID,
    allocateSequentialRelayRewards: () => allocateSequentialRelayRewards,
    applyHighConfidenceWeightOrBlock: () => applyHighConfidenceWeightOrBlock,
    buildCanonicalDeliveryMessage: () => buildCanonicalDeliveryMessage,
    buildPagedRelayEvidence: () => buildPagedRelayEvidence,
    buildRelayHopsFromDeliveryRoute: () => buildRelayHopsFromDeliveryRoute,
    computeLeafHex: () => computeLeafHex,
    computeRouteSeedHex: () => computeRouteSeedHex,
    createBleSimAdapter: () => createBleSimAdapter,
    createDefaultSimTransportBundle: () => createDefaultSimTransportBundle,
    createDeliveryProofFromSimulation: () => createDeliveryProofFromSimulation,
    createDemoDeliveryProof: () => createDemoDeliveryProof,
    createDemoPublicPassport: () => createDemoPublicPassport,
    createInternetSimAdapter: () => createInternetSimAdapter,
    createLoraSimAdapter: () => createLoraSimAdapter,
    createPassportVerifier: () => createPassportVerifier,
    createPhysicalHardwarePendingStub: () => createPhysicalHardwarePendingStub,
    createWifiDirectSimAdapter: () => createWifiDirectSimAdapter,
    deriveCommonRewardPeriodId: () => deriveCommonRewardPeriodId,
    digestPayload: () => digestPayload,
    extractRelayForwardTimestampsFromEvents: () => extractRelayForwardTimestampsFromEvents,
    fetchInspectCpxMint: () => fetchInspectCpxMint,
    fetchInspectProgram: () => fetchInspectProgram,
    fetchInspectProgramDualRpc: () => fetchInspectProgramDualRpc,
    first5000Allocation: () => first5000Allocation,
    foldCommitment: () => foldCommitment,
    generateDemoKeyPair: () => generateDemoKeyPair,
    globalPeriodPoolHardCapRaw: () => globalPeriodPoolHardCapRaw,
    hashMarketAgreement: () => hashMarketAgreement,
    marketBurnRawExactOrFail: () => marketBurnRawExactOrFail,
    nodeCapLimitedNominalRaw: () => nodeCapLimitedNominalRaw,
    nodeRemainingRaw: () => nodeRemainingRaw,
    nominalRelayRewardCpxRawFromEurPriceDecimal: () => nominalRelayRewardCpxRawFromEurPriceDecimal,
    offlineServiceBurnCpxRawFromEurPriceDecimal: () => offlineServiceBurnCpxRawFromEurPriceDecimal,
    parseDecimalToRational: () => parseDecimalToRational,
    quoteDeliveryEconomy: () => quoteDeliveryEconomy,
    quoteDirectMarketPayment: () => quoteDirectMarketPayment,
    rationalCpxToRawDg2: () => rationalCpxToRawDg2,
    rawToCpxDecimal: () => rawToCpxDecimal,
    reduceRational: () => reduceRational,
    referralSplitRawExactOrFail: () => referralSplitRawExactOrFail,
    runOfflineStoreCarryForward: () => runOfflineStoreCarryForward,
    runSimulatedDeliveryPipeline: () => runSimulatedDeliveryPipeline,
    signAgreementHash: () => signAgreementHash,
    signDemoRelayHop: () => signDemoRelayHop,
    simulateBilateralDeal: () => simulateBilateralDeal,
    simulatePayableRelayReward: () => simulatePayableRelayReward,
    tamperDemoDeliveryProof: () => tamperDemoDeliveryProof,
    verifyBilateralAgreement: () => verifyBilateralAgreement,
    verifyDemoDeliveryProof: () => verifyDemoDeliveryProof,
    verifyDemoRelayHop: () => verifyDemoRelayHop,
    verifyPagedRelayEvidence: () => verifyPagedRelayEvidence,
    verifyPublicPassport: () => verifyPublicPassport
  });

  // src/readiness.ts
  var Readiness = {
    LIVE_READ_ONLY: "LIVE_READ_ONLY",
    VERIFIED_SYNTHETIC: "VERIFIED_SYNTHETIC",
    SIMULATED: "SIMULATED",
    PENDING: "PENDING"
  };
  var FEATURE_READINESS_MATRIX = [
    {
      feature: "Network Lab (offline store-carry-forward simulation)",
      readiness: Readiness.SIMULATED,
      notes: "Deterministic synthetic topology/mobility/outages; no proprietary routing."
    },
    {
      feature: "Transport adapters (Internet / BLE / Wi-Fi Direct / LoRa)",
      readiness: Readiness.SIMULATED,
      notes: "Public interfaces + simulated adapters. Physical hardware PENDING."
    },
    {
      feature: "Delivery proof crypto (Ed25519 + synthetic fixtures)",
      readiness: Readiness.VERIFIED_SYNTHETIC,
      notes: "Illustrative SDK demo protocol. Production wire formats not exported."
    },
    {
      feature: "Relay evidence paging + rolling commitments",
      readiness: Readiness.VERIFIED_SYNTHETIC,
      notes: "Illustrative commitment domains. No private anti-fraud internals."
    },
    {
      feature: "Node Passport public verify interfaces",
      readiness: Readiness.VERIFIED_SYNTHETIC,
      notes: "Public identity demos only. No seeds/Keychain/recovery."
    },
    {
      feature: "Solana mainnet read-only (program / mint / balances / tx)",
      readiness: Readiness.LIVE_READ_ONLY,
      notes: "Public RPC inspection only. No signing, spend, or deploy."
    },
    {
      feature: "Economy BigInt quotes (burn / relay / caps / referral / first-5000)",
      readiness: Readiness.VERIFIED_SYNTHETIC,
      notes: "Locked Master Guide rules + DG2. No settlement execution engine."
    },
    {
      feature: "Paradox Market agreement + payment simulation",
      readiness: Readiness.SIMULATED,
      notes: "Synthetic bilateral verify + 0.10% burn quote. Marketplace UX PENDING."
    },
    {
      feature: "Physical BLE / Wi-Fi Direct / LoRa devices",
      readiness: Readiness.PENDING,
      notes: "Hardware adapters not shipped in this SDK."
    },
    {
      feature: "Production settlement / paid-mesh mainnet writes",
      readiness: Readiness.PENDING,
      notes: "Economic gates remain OFF. Not part of this Open SDK."
    },
    {
      feature: "Two-device live agreement exchange (U54F8)",
      readiness: Readiness.PENDING,
      notes: "Product remediation still pending."
    }
  ];

  // node_modules/@noble/hashes/esm/utils.js
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function abytes(b, ...lengths) {
    if (!isBytes(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error("digestInto() expects output buffer of length at least " + min);
    }
  }
  function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  var hasHexBuiltin = /* @__PURE__ */ (() => (
    // @ts-ignore
    typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
  ))();
  var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex(bytes) {
    abytes(bytes);
    if (hasHexBuiltin)
      return bytes.toHex();
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += hexes[bytes[i]];
    }
    return hex;
  }
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    abytes(data);
    return data;
  }
  var Hash = class {
  };
  function createHasher(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }

  // node_modules/@noble/hashes/esm/_md.js
  function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE);
    const _32n = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
  }
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }
  var HashMD = class extends Hash {
    constructor(blockLen, outputLen, padOffset, isLE) {
      super();
      this.finished = false;
      this.length = 0;
      this.pos = 0;
      this.destroyed = false;
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      data = toBytes(data);
      abytes(data);
      const { view, buffer, blockLen } = this;
      const len = data.length;
      for (let pos = 0; pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (; blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      clean(this.buffer.subarray(pos));
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos; i < blockLen; i++)
        buffer[i] = 0;
      setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
      this.process(view, 0);
      const oview = createView(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0; i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to || (to = new this.constructor());
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  };
  var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);

  // node_modules/@noble/hashes/esm/sha2.js
  var SHA256_K = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
  var SHA256 = class extends HashMD {
    constructor(outputLen = 32) {
      super(64, outputLen, 8, false);
      this.A = SHA256_IV[0] | 0;
      this.B = SHA256_IV[1] | 0;
      this.C = SHA256_IV[2] | 0;
      this.D = SHA256_IV[3] | 0;
      this.E = SHA256_IV[4] | 0;
      this.F = SHA256_IV[5] | 0;
      this.G = SHA256_IV[6] | 0;
      this.H = SHA256_IV[7] | 0;
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16; i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0; i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      clean(SHA256_W);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      clean(this.buffer);
    }
  };
  var sha256 = /* @__PURE__ */ createHasher(() => new SHA256());

  // src/crypto/sha256.ts
  function sha256Hex(data) {
    const bytes = typeof data === "string" ? utf8ToBytes(data) : data;
    return bytesToHex(sha256(bytes));
  }
  function isSha256Hex(value) {
    return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
  }
  function utf8Bytes(text) {
    return utf8ToBytes(text);
  }

  // src/network-lab/offlineSimulation.ts
  var NETWORK_LAB_READINESS = Readiness.SIMULATED;
  function undirectedKey(a, b) {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }
  function isOutaged(node, atMs, outages) {
    const windows = outages?.[node] ?? [];
    return windows.some((w) => atMs >= w.startMs && atMs < w.endMs);
  }
  function runOfflineStoreCarryForward(input) {
    if (!input.nodes.includes(input.packet.from) || !input.nodes.includes(input.packet.to)) {
      throw new Error("PACKET_ENDPOINT_NOT_IN_NODES");
    }
    const edgeSet = new Set(input.edges.map((e) => undirectedKey(e.a, e.b)));
    const topologyDigestHex = sha256Hex(
      JSON.stringify({
        seed: input.seed,
        nodes: [...input.nodes].sort(),
        edges: [...edgeSet].sort()
      })
    );
    const payloadDigestHex = sha256Hex(input.packet.payload);
    const expiresAtMs = input.packet.createdAtMs + input.packet.ttlMs;
    const events = [];
    const carrierRoutes = /* @__PURE__ */ new Map();
    carrierRoutes.set(input.packet.from, [input.packet.from]);
    const hasPacket = /* @__PURE__ */ new Set([input.packet.from]);
    events.push({ type: "CREATED", atMs: input.packet.createdAtMs, packetId: input.packet.packetId });
    let delivered = false;
    let deliveryAtMs = null;
    let deliveryRoute = null;
    let hops = null;
    let duplicateSuppressions = 0;
    let expired = false;
    const mobility = [...input.mobility].sort((a, b) => a.atMs - b.atMs);
    for (const step of mobility) {
      if (delivered || expired) break;
      if (step.atMs < input.packet.createdAtMs) {
        events.push({ type: "IGNORED_MOBILITY_BEFORE_CREATE", atMs: step.atMs });
        continue;
      }
      if (step.atMs >= expiresAtMs) {
        expired = true;
        events.push({ type: "EXPIRED", atMs: expiresAtMs, packetId: input.packet.packetId });
        break;
      }
      for (const n of input.nodes) {
        if (isOutaged(n, step.atMs, input.outages)) {
          events.push({ type: "OUTAGE", atMs: step.atMs, node: n, active: true });
        }
      }
      const liveMeeting = step.meeting.filter(
        (n) => input.nodes.includes(n) && !isOutaged(n, step.atMs, input.outages)
      );
      const carriersHere = liveMeeting.filter((n) => hasPacket.has(n));
      if (carriersHere.length === 0) continue;
      for (const carrier of carriersHere) {
        events.push({
          type: "CARRIED",
          atMs: step.atMs,
          packetId: input.packet.packetId,
          carrier
        });
      }
      const peers = [...liveMeeting].sort();
      for (const peer of peers) {
        if (delivered) break;
        const donors = carriersHere.filter((c) => c !== peer && edgeSet.has(undirectedKey(c, peer))).sort();
        if (donors.length === 0) continue;
        if (hasPacket.has(peer)) {
          duplicateSuppressions += 1;
          events.push({
            type: "DUPLICATE_SUPPRESSED",
            atMs: step.atMs,
            packetId: input.packet.packetId,
            at: peer
          });
          continue;
        }
        const fromCarrier = donors[0];
        const parentRoute = carrierRoutes.get(fromCarrier);
        const routeAfter = [...parentRoute, peer];
        carrierRoutes.set(peer, routeAfter);
        hasPacket.add(peer);
        events.push({
          type: "FORWARDED",
          atMs: step.atMs,
          packetId: input.packet.packetId,
          from: fromCarrier,
          to: peer,
          routeAfter
        });
        if (peer === input.packet.to) {
          delivered = true;
          deliveryAtMs = step.atMs;
          deliveryRoute = routeAfter;
          hops = routeAfter.length - 1;
          events.push({
            type: "DELIVERED",
            atMs: step.atMs,
            packetId: input.packet.packetId,
            via: peer,
            hops,
            route: routeAfter
          });
        }
      }
    }
    if (!delivered && !expired) {
      const last = mobility[mobility.length - 1]?.atMs ?? input.packet.createdAtMs;
      if (last >= expiresAtMs) {
        expired = true;
        events.push({ type: "EXPIRED", atMs: expiresAtMs, packetId: input.packet.packetId });
      }
    }
    const carrierRoutesObj = {};
    for (const [k, v] of carrierRoutes) carrierRoutesObj[k] = v;
    return {
      readiness: NETWORK_LAB_READINESS,
      delivered,
      deliveryAtMs,
      hops,
      deliveryRoute,
      carrierRoutes: carrierRoutesObj,
      events,
      finalCarriers: [...hasPacket],
      duplicateSuppressions,
      expired,
      topologyDigestHex,
      payloadDigestHex
    };
  }

  // src/transport/adapters.ts
  function mulberry32(seed) {
    let t = seed >>> 0;
    return () => {
      t += 1831565813;
      let r = Math.imul(t ^ t >>> 15, 1 | t);
      r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }
  function createSimulatedAdapter(kind, opts) {
    const state = {
      latencyMs: opts?.latencyMs ?? 25,
      failRate: opts?.failRate ?? 0,
      rng: opts?.rng ?? mulberry32(kind.length * 997)
    };
    return {
      kind,
      readiness: Readiness.SIMULATED,
      async send(envelope) {
        if (envelope.kind !== kind) {
          return { ok: false, readiness: Readiness.SIMULATED, reason: "KIND_MISMATCH" };
        }
        if (state.rng() < state.failRate) {
          return { ok: false, readiness: Readiness.SIMULATED, reason: "SIMULATED_DROP" };
        }
        const deliveredAtMs = envelope.createdAtMs + state.latencyMs;
        return { ok: true, readiness: Readiness.SIMULATED, deliveredAtMs };
      }
    };
  }
  function createInternetSimAdapter(opts) {
    return createSimulatedAdapter("internet", { latencyMs: 15, ...opts });
  }
  function createBleSimAdapter(opts) {
    return createSimulatedAdapter("ble", { latencyMs: 40, ...opts });
  }
  function createWifiDirectSimAdapter(opts) {
    return createSimulatedAdapter("wifi_direct", { latencyMs: 30, ...opts });
  }
  function createLoraSimAdapter(opts) {
    return createSimulatedAdapter("lora", { latencyMs: 120, ...opts });
  }
  function createPhysicalHardwarePendingStub(kind) {
    return {
      kind,
      readiness: Readiness.PENDING,
      async send() {
        return {
          ok: false,
          readiness: Readiness.PENDING,
          reason: "PHYSICAL_HARDWARE_PENDING"
        };
      }
    };
  }
  function createDefaultSimTransportBundle() {
    return {
      internet: createInternetSimAdapter(),
      ble: createBleSimAdapter(),
      wifi_direct: createWifiDirectSimAdapter(),
      lora: createLoraSimAdapter()
    };
  }

  // src/crypto/ed25519.ts
  var import_tweetnacl = __toESM(require_nacl_fast(), 1);
  var import_tweetnacl_util = __toESM(require_nacl_util(), 1);
  var { decodeBase64, encodeBase64, decodeUTF8 } = import_tweetnacl_util.default;
  function generateDemoKeyPair(seed) {
    const kp = seed ? import_tweetnacl.default.sign.keyPair.fromSeed(seed) : import_tweetnacl.default.sign.keyPair();
    return {
      publicKey: kp.publicKey,
      secretKey: kp.secretKey,
      publicKeyB64: encodeBase64(kp.publicKey)
    };
  }
  function signUtf8Detached(message, secretKey) {
    return encodeBase64(import_tweetnacl.default.sign.detached(decodeUTF8(message), secretKey));
  }
  function verifyUtf8Detached(message, signatureB64, publicKey) {
    try {
      return import_tweetnacl.default.sign.detached.verify(
        decodeUTF8(message),
        decodeBase64(signatureB64),
        publicKey
      );
    } catch {
      return false;
    }
  }
  function decodePublicKeyB64(publicKeyB64) {
    const bytes = decodeBase64(publicKeyB64.trim());
    if (bytes.length !== 32) {
      throw new Error("PUBLIC_KEY_LENGTH_INVALID");
    }
    return bytes;
  }

  // src/delivery-proofs/demoProof.ts
  var DELIVERY_PROOF_READINESS = Readiness.VERIFIED_SYNTHETIC;
  var SDK_DEMO_DELIVERY_PROOF_DOMAIN = "meshsender.sdk.demo.delivery-proof.v1";
  var TRANSPORTS = /* @__PURE__ */ new Set([
    "ble",
    "wifi_direct",
    "lora",
    "internet",
    "unknown"
  ]);
  function assertClaims(claims) {
    const messageId = claims.messageId.trim();
    const fromNodeId = claims.fromNodeId.trim();
    const toNodeId = claims.toNodeId.trim();
    const payloadDigestHex = claims.payloadDigestHex.trim().toLowerCase();
    if (!messageId || !fromNodeId || !toNodeId) throw new Error("CLAIMS_EMPTY_ID");
    if (!Number.isSafeInteger(claims.deliveredAtMs) || claims.deliveredAtMs < 0) {
      throw new Error("DELIVERED_AT_INVALID");
    }
    if (!Number.isSafeInteger(claims.hops) || claims.hops < 0) throw new Error("HOPS_INVALID");
    if (!TRANSPORTS.has(claims.ingressTransport)) throw new Error("TRANSPORT_INVALID");
    if (!isSha256Hex(payloadDigestHex)) throw new Error("PAYLOAD_DIGEST_INVALID");
    return {
      messageId,
      fromNodeId,
      toNodeId,
      deliveredAtMs: claims.deliveredAtMs,
      hops: claims.hops,
      ingressTransport: claims.ingressTransport,
      payloadDigestHex
    };
  }
  function buildCanonicalDeliveryMessage(claims) {
    const c = assertClaims(claims);
    return [
      SDK_DEMO_DELIVERY_PROOF_DOMAIN,
      `messageId=${c.messageId}`,
      `fromNodeId=${c.fromNodeId}`,
      `toNodeId=${c.toNodeId}`,
      `deliveredAtMs=${c.deliveredAtMs}`,
      `hops=${c.hops}`,
      `ingressTransport=${c.ingressTransport}`,
      `payloadDigestHex=${c.payloadDigestHex}`
    ].join("\n");
  }
  function createDemoDeliveryProof(input) {
    const claims = assertClaims(input.claims);
    const canonicalMessage = buildCanonicalDeliveryMessage(claims);
    return {
      ...claims,
      protocol: SDK_DEMO_DELIVERY_PROOF_DOMAIN,
      signerPublicKeyB64: input.signer.publicKeyB64,
      signatureB64: signUtf8Detached(canonicalMessage, input.signer.secretKey),
      readiness: DELIVERY_PROOF_READINESS,
      disclosure: "ILLUSTRATIVE_SDK_DEMO_PROTOCOL",
      canonicalMessage
    };
  }
  function verifyDemoDeliveryProof(proof, expectedSignerPublicKeyB64) {
    if (proof.protocol !== SDK_DEMO_DELIVERY_PROOF_DOMAIN) {
      return { ok: false, reason: "PROTOCOL_MISMATCH", readiness: DELIVERY_PROOF_READINESS };
    }
    let claims;
    try {
      claims = assertClaims(proof);
    } catch (e) {
      return {
        ok: false,
        reason: e instanceof Error ? e.message : "CLAIMS_INVALID",
        readiness: DELIVERY_PROOF_READINESS
      };
    }
    const expected = expectedSignerPublicKeyB64.trim();
    if (!expected) {
      return { ok: false, reason: "EXPECTED_SIGNER_REQUIRED", readiness: DELIVERY_PROOF_READINESS };
    }
    if (proof.signerPublicKeyB64.trim() !== expected) {
      return { ok: false, reason: "WRONG_SIGNER", readiness: DELIVERY_PROOF_READINESS };
    }
    try {
      const pk = decodePublicKeyB64(expected);
      const message = buildCanonicalDeliveryMessage(claims);
      if (proof.canonicalMessage && proof.canonicalMessage !== message) {
        return { ok: false, reason: "CANONICAL_MISMATCH", readiness: DELIVERY_PROOF_READINESS };
      }
      const ok = verifyUtf8Detached(message, proof.signatureB64, pk);
      return ok ? { ok: true, readiness: DELIVERY_PROOF_READINESS } : { ok: false, reason: "SIGNATURE_INVALID", readiness: DELIVERY_PROOF_READINESS };
    } catch {
      return { ok: false, reason: "VERIFY_EXCEPTION", readiness: DELIVERY_PROOF_READINESS };
    }
  }
  function tamperDemoDeliveryProof(proof, patch) {
    const nextClaims = { ...proof, ...patch };
    const canonicalMessage = (() => {
      try {
        return buildCanonicalDeliveryMessage(nextClaims);
      } catch {
        return proof.canonicalMessage;
      }
    })();
    return { ...proof, ...patch, canonicalMessage };
  }
  function digestPayload(payload) {
    return sha256Hex(payload);
  }
  function createDeliveryProofFromSimulation(input) {
    return createDemoDeliveryProof({
      claims: {
        messageId: input.messageId,
        fromNodeId: input.fromNodeId,
        toNodeId: input.toNodeId,
        deliveredAtMs: input.deliveredAtMs,
        hops: input.hops,
        ingressTransport: input.ingressTransport,
        payloadDigestHex: input.payloadDigestHex
      },
      signer: input.recipientSigner
    });
  }

  // src/relay-evidence/pagedCommitment.ts
  var RELAY_EVIDENCE_READINESS = Readiness.VERIFIED_SYNTHETIC;
  var SDK_DEMO_RELAY_ROUTE_SEED_DOMAIN = "meshsender.sdk.demo.relay-route-seed.v1";
  var SDK_DEMO_RELAY_LEAF_DOMAIN = "meshsender.sdk.demo.relay-leaf.v1";
  var SDK_DEMO_RELAY_FOLD_DOMAIN = "meshsender.sdk.demo.relay-fold.v1";
  function utf8ByteLength(value) {
    return utf8Bytes(value).length;
  }
  function hopAttestationMessage(input) {
    return [
      SDK_DEMO_RELAY_LEAF_DOMAIN,
      `messageId=${input.messageId.trim()}`,
      `absoluteRelayIndex=${input.hop.absoluteRelayIndex}`,
      `relayNodeId=${input.hop.relayNodeId.trim()}`,
      `previousNodeId=${input.hop.previousNodeId.trim()}`,
      `forwardedAtMs=${input.hop.forwardedAtMs}`,
      `ingressTransport=${input.hop.ingressTransport}`,
      `signerPublicKeyB64=${input.signerPublicKeyB64.trim()}`,
      `rewardRawDecimal=${input.hop.rewardRawDecimal.trim()}`
    ].join("\n");
  }
  function computeRouteSeedHex(input) {
    return sha256Hex(
      [
        SDK_DEMO_RELAY_ROUTE_SEED_DOMAIN,
        `messageId=${input.messageId.trim()}`,
        `intentDigestHex=${input.intentDigestHex.trim().toLowerCase()}`,
        `nonceB64=${input.nonceB64.trim()}`,
        `senderDigestHex=${input.senderDigestHex.trim().toLowerCase()}`,
        `recipientDigestHex=${input.recipientDigestHex.trim().toLowerCase()}`
      ].join("\n")
    );
  }
  function computeLeafHex(hop, messageId) {
    return sha256Hex(
      [
        SDK_DEMO_RELAY_LEAF_DOMAIN,
        `messageId=${messageId}`,
        `absoluteRelayIndex=${hop.absoluteRelayIndex}`,
        `relayNodeId=${hop.relayNodeId}`,
        `previousNodeId=${hop.previousNodeId}`,
        `forwardedAtMs=${hop.forwardedAtMs}`,
        `ingressTransport=${hop.ingressTransport}`,
        `signerPublicKeyB64=${hop.signerPublicKeyB64}`,
        `signatureB64=${hop.signatureB64}`,
        `rewardRawDecimal=${hop.rewardRawDecimal}`
      ].join("\n")
    );
  }
  function foldCommitment(previousHex, leafHex) {
    if (!isSha256Hex(previousHex) || !isSha256Hex(leafHex)) {
      throw new Error("COMMITMENT_HEX_INVALID");
    }
    return sha256Hex([SDK_DEMO_RELAY_FOLD_DOMAIN, previousHex, leafHex].join("\n"));
  }
  function signDemoRelayHop(input) {
    if (!Number.isSafeInteger(input.hop.absoluteRelayIndex) || input.hop.absoluteRelayIndex < 0) {
      throw new Error("RELAY_INDEX_INVALID");
    }
    const msg = hopAttestationMessage({
      messageId: input.messageId,
      hop: input.hop,
      signerPublicKeyB64: input.signer.publicKeyB64
    });
    return {
      ...input.hop,
      signerPublicKeyB64: input.signer.publicKeyB64,
      signatureB64: signUtf8Detached(msg, input.signer.secretKey)
    };
  }
  function verifyDemoRelayHop(messageId, hop, expectedSignerPublicKeyB64) {
    const expected = expectedSignerPublicKeyB64.trim();
    if (!expected) return { ok: false, reason: "EXPECTED_SIGNER_REQUIRED" };
    if (hop.signerPublicKeyB64.trim() !== expected) return { ok: false, reason: "WRONG_SIGNER" };
    try {
      const pk = decodePublicKeyB64(expected);
      const msg = hopAttestationMessage({
        messageId,
        hop,
        signerPublicKeyB64: hop.signerPublicKeyB64
      });
      return verifyUtf8Detached(msg, hop.signatureB64, pk) ? { ok: true } : { ok: false, reason: "SIGNATURE_INVALID" };
    } catch {
      return { ok: false, reason: "VERIFY_EXCEPTION" };
    }
  }
  function buildPagedRelayEvidence(input) {
    if (input.expectedSignerPublicKeysB64.length !== input.hops.length) {
      throw new Error("EXPECTED_SIGNERS_LENGTH_MISMATCH");
    }
    for (let i = 0; i < input.hops.length; i++) {
      const hop = input.hops[i];
      const v = verifyDemoRelayHop(
        input.messageId,
        hop,
        input.expectedSignerPublicKeysB64[i]
      );
      if (!v.ok) throw new Error(`RELAY_HOP_INVALID:${i}:${v.reason}`);
    }
    const routeSeedHex = computeRouteSeedHex(input);
    const maxPageBodyBytes = input.maxPageBodyBytes ?? 28 * 1024;
    const pages = [];
    let cursor = 0;
    let incoming = routeSeedHex;
    let pageIndex = 0;
    while (cursor < input.hops.length) {
      let trialOutgoing = incoming;
      let acceptedEnd = cursor;
      let end = cursor;
      while (end < input.hops.length) {
        const slice = input.hops.slice(cursor, end + 1);
        let rolling = incoming;
        for (const hop of slice) {
          rolling = foldCommitment(rolling, computeLeafHex(hop, input.messageId));
        }
        const trialPage = {
          pageIndex,
          firstAbsoluteRelayIndex: cursor,
          incomingCommitmentHex: incoming,
          outgoingCommitmentHex: rolling,
          isFinalPage: end === input.hops.length - 1,
          hops: slice
        };
        const bytes = utf8ByteLength(JSON.stringify(trialPage));
        if (bytes > maxPageBodyBytes && slice.length > 1) break;
        if (bytes > maxPageBodyBytes && slice.length === 1) {
          throw new Error("SINGLE_HOP_EXCEEDS_PAGE_BUDGET");
        }
        trialOutgoing = rolling;
        acceptedEnd = end + 1;
        end += 1;
      }
      const hops = input.hops.slice(cursor, acceptedEnd);
      pages.push({
        pageIndex,
        firstAbsoluteRelayIndex: cursor,
        incomingCommitmentHex: incoming,
        outgoingCommitmentHex: trialOutgoing,
        isFinalPage: acceptedEnd === input.hops.length,
        hops
      });
      incoming = trialOutgoing;
      cursor = acceptedEnd;
      pageIndex += 1;
    }
    return {
      readiness: RELAY_EVIDENCE_READINESS,
      disclosure: "ILLUSTRATIVE_SDK_DEMO_PROTOCOL",
      messageId: input.messageId,
      intentDigestHex: input.intentDigestHex.trim().toLowerCase(),
      nonceB64: input.nonceB64.trim(),
      senderDigestHex: input.senderDigestHex.trim().toLowerCase(),
      recipientDigestHex: input.recipientDigestHex.trim().toLowerCase(),
      routeSeedHex,
      rootCommitmentHex: incoming,
      pages,
      verifiedHopCount: input.hops.length
    };
  }
  function verifyPagedRelayEvidence(input) {
    const b = input.bundle;
    if (b.disclosure !== "ILLUSTRATIVE_SDK_DEMO_PROTOCOL") {
      return { ok: false, reason: "DISCLOSURE_MISMATCH", readiness: RELAY_EVIDENCE_READINESS };
    }
    const flat = b.pages.flatMap((p) => p.hops);
    if (flat.length !== input.expectedSignerPublicKeysB64.length) {
      return { ok: false, reason: "SIGNER_COUNT_MISMATCH", readiness: RELAY_EVIDENCE_READINESS };
    }
    if (flat.length !== b.verifiedHopCount) {
      return { ok: false, reason: "HOP_COUNT_MISMATCH", readiness: RELAY_EVIDENCE_READINESS };
    }
    for (let i = 0; i < flat.length; i++) {
      const hop = flat[i];
      if (hop.absoluteRelayIndex !== i) {
        return { ok: false, reason: `INDEX_GAP:${i}`, readiness: RELAY_EVIDENCE_READINESS };
      }
      if (i === 0) {
      } else if (hop.previousNodeId !== flat[i - 1].relayNodeId) {
        return { ok: false, reason: `ROUTE_CONTINUITY:${i}`, readiness: RELAY_EVIDENCE_READINESS };
      }
      const sig = verifyDemoRelayHop(b.messageId, hop, input.expectedSignerPublicKeysB64[i]);
      if (!sig.ok) {
        return {
          ok: false,
          reason: `HOP_SIG:${i}:${sig.reason}`,
          readiness: RELAY_EVIDENCE_READINESS
        };
      }
    }
    let expectedIncoming = computeRouteSeedHex(b);
    if (expectedIncoming !== b.routeSeedHex) {
      return { ok: false, reason: "ROUTE_SEED_MISMATCH", readiness: RELAY_EVIDENCE_READINESS };
    }
    for (let p = 0; p < b.pages.length; p++) {
      const page = b.pages[p];
      if (page.pageIndex !== p) {
        return { ok: false, reason: `PAGE_INDEX:${p}`, readiness: RELAY_EVIDENCE_READINESS };
      }
      if (page.incomingCommitmentHex !== expectedIncoming) {
        return { ok: false, reason: `PAGE_INCOMING:${p}`, readiness: RELAY_EVIDENCE_READINESS };
      }
      if (page.firstAbsoluteRelayIndex !== page.hops[0]?.absoluteRelayIndex) {
        return { ok: false, reason: `PAGE_FIRST_INDEX:${p}`, readiness: RELAY_EVIDENCE_READINESS };
      }
      let rolling = page.incomingCommitmentHex;
      for (const hop of page.hops) {
        rolling = foldCommitment(rolling, computeLeafHex(hop, b.messageId));
      }
      if (rolling !== page.outgoingCommitmentHex) {
        return { ok: false, reason: `PAGE_OUTGOING:${p}`, readiness: RELAY_EVIDENCE_READINESS };
      }
      const isLast = p === b.pages.length - 1;
      if (page.isFinalPage !== isLast) {
        return { ok: false, reason: `PAGE_FINAL_FLAG:${p}`, readiness: RELAY_EVIDENCE_READINESS };
      }
      expectedIncoming = rolling;
    }
    if (b.rootCommitmentHex !== expectedIncoming) {
      return { ok: false, reason: "ROOT_MISMATCH", readiness: RELAY_EVIDENCE_READINESS };
    }
    if (b.rootCommitmentHex !== input.expectedRootCommitmentHex.trim().toLowerCase()) {
      return { ok: false, reason: "EXPECTED_ROOT_MISMATCH", readiness: RELAY_EVIDENCE_READINESS };
    }
    return { ok: true, readiness: RELAY_EVIDENCE_READINESS };
  }
  function buildRelayHopsFromDeliveryRoute(input) {
    if (input.deliveryRoute.length < 3) {
      throw new Error("DELIVERY_ROUTE_NEEDS_INTERMEDIATE_RELAY");
    }
    const relays = input.deliveryRoute.slice(1, -1);
    if (relays.length !== input.hopSigners.length) {
      throw new Error("HOP_SIGNER_COUNT_MISMATCH");
    }
    if (relays.length !== input.forwardedAtMsByHop.length) {
      throw new Error("HOP_TIME_COUNT_MISMATCH");
    }
    if (relays.length !== input.rewardRawDecimalByHop.length) {
      throw new Error("HOP_REWARD_COUNT_MISMATCH");
    }
    const hops = [];
    const expectedSignerPublicKeysB64 = [];
    for (let i = 0; i < relays.length; i++) {
      const hop = signDemoRelayHop({
        messageId: input.messageId,
        signer: input.hopSigners[i],
        hop: {
          absoluteRelayIndex: i,
          relayNodeId: relays[i],
          previousNodeId: input.deliveryRoute[i],
          forwardedAtMs: input.forwardedAtMsByHop[i],
          ingressTransport: input.ingressTransport ?? "ble",
          rewardRawDecimal: input.rewardRawDecimalByHop[i]
        }
      });
      hops.push(hop);
      expectedSignerPublicKeysB64.push(input.hopSigners[i].publicKeyB64);
    }
    return { hops, expectedSignerPublicKeysB64 };
  }

  // src/node-passport/publicIdentity.ts
  var NODE_PASSPORT_READINESS = Readiness.VERIFIED_SYNTHETIC;
  var SDK_DEMO_PASSPORT_DOMAIN = "meshsender.sdk.demo.node-passport.v1";
  function attestationMessage(input) {
    return [
      SDK_DEMO_PASSPORT_DOMAIN,
      `nodeId=${input.nodeId.trim()}`,
      `signPublicKeyB64=${input.signPublicKeyB64.trim()}`,
      `identityDigestHex=${input.identityDigestHex.trim().toLowerCase()}`,
      `issuedAtMs=${input.issuedAtMs}`
    ].join("\n");
  }
  function createDemoPublicPassport(input) {
    const issuedAtMs = input.issuedAtMs ?? 1;
    const nodeId = input.nodeId.trim();
    if (!nodeId) throw new Error("NODE_ID_REQUIRED");
    const identityDigestHex = sha256Hex(
      `${SDK_DEMO_PASSPORT_DOMAIN}|${nodeId}|${input.signer.publicKeyB64}`
    );
    const msg = attestationMessage({
      nodeId,
      signPublicKeyB64: input.signer.publicKeyB64,
      identityDigestHex,
      issuedAtMs
    });
    return {
      readiness: NODE_PASSPORT_READINESS,
      protocol: SDK_DEMO_PASSPORT_DOMAIN,
      nodeId,
      signPublicKeyB64: input.signer.publicKeyB64,
      identityDigestHex,
      issuedAtMs,
      attestationB64: signUtf8Detached(msg, input.signer.secretKey),
      disclosure: "SYNTHETIC_POSSESSION_PROOF_NOT_PRODUCTION_IDENTITY_AUTHORITY",
      authorityClaim: "NONE_SYNTHETIC_DEMO_ONLY"
    };
  }
  function verifyPublicPassport(passport, expectedSignerPublicKeyB64) {
    const authority = "SYNTHETIC_POSSESSION_PROOF_ONLY";
    if (passport.protocol !== SDK_DEMO_PASSPORT_DOMAIN) {
      return { ok: false, reason: "PROTOCOL_MISMATCH", readiness: NODE_PASSPORT_READINESS, authority };
    }
    const expected = expectedSignerPublicKeyB64.trim();
    if (!expected) {
      return {
        ok: false,
        reason: "EXPECTED_SIGNER_REQUIRED",
        readiness: NODE_PASSPORT_READINESS,
        authority
      };
    }
    if (passport.signPublicKeyB64.trim() !== expected) {
      return { ok: false, reason: "WRONG_SIGNER", readiness: NODE_PASSPORT_READINESS, authority };
    }
    try {
      const pk = decodePublicKeyB64(expected);
      const expectedDigest = sha256Hex(
        `${SDK_DEMO_PASSPORT_DOMAIN}|${passport.nodeId}|${passport.signPublicKeyB64}`
      );
      if (expectedDigest !== passport.identityDigestHex.trim().toLowerCase()) {
        return {
          ok: false,
          reason: "IDENTITY_DIGEST_MISMATCH",
          readiness: NODE_PASSPORT_READINESS,
          authority
        };
      }
      const msg = attestationMessage(passport);
      const ok = verifyUtf8Detached(msg, passport.attestationB64, pk);
      return ok ? { ok: true, readiness: NODE_PASSPORT_READINESS, authority } : { ok: false, reason: "ATTESTATION_INVALID", readiness: NODE_PASSPORT_READINESS, authority };
    } catch {
      return { ok: false, reason: "VERIFY_EXCEPTION", readiness: NODE_PASSPORT_READINESS, authority };
    }
  }
  function createPassportVerifier() {
    return {
      verify(passport, expectedSignerPublicKeyB64) {
        const r = verifyPublicPassport(passport, expectedSignerPublicKeyB64);
        return { ok: r.ok, reason: r.reason };
      }
    };
  }

  // src/economy/canonicalQuotes.ts
  var ECONOMY_READINESS = Readiness.VERIFIED_SYNTHETIC;
  var CPX_DECIMALS = 6;
  var CPX_RAW_SCALE = 1000000n;
  var OFFLINE_SERVICE_BURN_EUR = "0.0005";
  var RELAY_REWARD_EUR_TARGET = "0.005";
  var RELAY_REWARD_CPX_CEILING_RAW = 1000000n;
  var NODE_REWARD_CAP_RAW = 1000n * CPX_RAW_SCALE;
  var GLOBAL_BUDGET_NUMERATOR = 5n;
  var GLOBAL_BUDGET_DENOMINATOR = 10000n;
  var MARKET_BURN_NUMERATOR = 1n;
  var MARKET_BURN_DENOMINATOR = 1000n;
  var REFERRAL_REFERRER_NUM = 3n;
  var REFERRAL_REFERRER_DEN = 100n;
  var REFERRAL_RELAY_NUM = 97n;
  var REFERRAL_RELAY_DEN = 100n;
  var REFERRAL_MAX_EDGES = 5;
  var FIRST5000_NODE_COUNT = 5e3;
  var FIRST5000_PER_NODE_RAW = 100n * CPX_RAW_SCALE;
  var FIRST5000_TOTAL_RAW = 500000n * CPX_RAW_SCALE;
  var REWARD_PERIOD_DURATION_MS = 30n * 24n * 60n * 60n * 1000n;
  var DG2_RULE = "nearest_representable_6_decimals_ties_round_up";
  var PLATFORM_FEE = 0;
  function assertPositiveDenominator(d) {
    if (d <= 0n) throw new Error("ECONOMY_DENOMINATOR_MUST_BE_POSITIVE");
  }
  function assertNonNegative(v, label) {
    if (v < 0n) throw new Error(`ECONOMY_NEGATIVE:${label}`);
  }
  function divRem(dividend, divisor) {
    assertPositiveDenominator(divisor);
    assertNonNegative(dividend, "dividend");
    return {
      quotient: dividend / divisor,
      remainder: dividend % divisor,
      dividend,
      divisor
    };
  }
  function gcd(a, b) {
    let x = a < 0n ? -a : a;
    let y = b < 0n ? -b : b;
    while (y !== 0n) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x === 0n ? 1n : x;
  }
  function reduceRational(r) {
    assertPositiveDenominator(r.denominator);
    assertNonNegative(r.numerator, "numerator");
    const g = gcd(r.numerator, r.denominator);
    return { numerator: r.numerator / g, denominator: r.denominator / g };
  }
  function parseDecimalToRational(decimal) {
    const trimmed = decimal.trim();
    if (!/^\d+(\.\d+)?$/.test(trimmed)) {
      throw new Error(`ECONOMY_INVALID_DECIMAL:${decimal}`);
    }
    const parts = trimmed.split(".");
    const whole = parts[0] ?? "0";
    const frac = parts[1] ?? "";
    const denominator = frac.length === 0 ? 1n : 10n ** BigInt(frac.length);
    const numerator = BigInt(whole) * denominator + BigInt(frac === "" ? "0" : frac);
    return reduceRational({ numerator, denominator });
  }
  function rawToCpxDecimal(raw) {
    assertNonNegative(raw, "raw");
    const whole = raw / CPX_RAW_SCALE;
    const frac = raw % CPX_RAW_SCALE;
    return `${whole}.${frac.toString().padStart(CPX_DECIMALS, "0")}`;
  }
  function rationalCpxToRawDg2(rationalCpx) {
    assertPositiveDenominator(rationalCpx.denominator);
    assertNonNegative(rationalCpx.numerator, "numerator");
    const rem = divRem(rationalCpx.numerator * CPX_RAW_SCALE, rationalCpx.denominator);
    if (rem.remainder === 0n) return { ok: true, raw: rem.quotient, exact: true };
    const raw = rem.remainder * 2n >= rem.divisor ? rem.quotient + 1n : rem.quotient;
    return { ok: true, raw, exact: false };
  }
  function offlineServiceBurnCpxRawFromEurPriceDecimal(cpxEurPriceDecimal) {
    const price = parseDecimalToRational(cpxEurPriceDecimal);
    if (price.numerator === 0n) throw new Error("ECONOMY_PRICE_MUST_BE_POSITIVE");
    const burnEur = parseDecimalToRational(OFFLINE_SERVICE_BURN_EUR);
    const exactCpx = reduceRational({
      numerator: burnEur.numerator * price.denominator,
      denominator: burnEur.denominator * price.numerator
    });
    const converted = rationalCpxToRawDg2(exactCpx);
    if (converted.raw <= 0n) throw new Error("ECONOMY_OFFLINE_BURN_ZERO_RAW");
    return {
      ok: true,
      serviceBurnCpxRaw: converted.raw,
      exact: converted.exact,
      roundingRule: DG2_RULE
    };
  }
  function nominalRelayRewardCpxRawFromEurPriceDecimal(cpxEurPriceDecimal) {
    const price = parseDecimalToRational(cpxEurPriceDecimal);
    if (price.numerator === 0n) throw new Error("ECONOMY_PRICE_MUST_BE_POSITIVE");
    const eur = parseDecimalToRational(RELAY_REWARD_EUR_TARGET);
    let uncapped = reduceRational({
      numerator: eur.numerator * price.denominator,
      denominator: eur.denominator * price.numerator
    });
    if (uncapped.numerator > uncapped.denominator) {
      uncapped = { numerator: 1n, denominator: 1n };
    }
    const converted = rationalCpxToRawDg2(uncapped);
    if (converted.raw > RELAY_REWARD_CPX_CEILING_RAW) {
      throw new Error("ECONOMY_NOMINAL_ABOVE_CEILING");
    }
    return {
      ok: true,
      nominalRewardCpxRaw: converted.raw,
      exactRaw: converted.exact,
      rewardSource: "REWARD_RESERVE",
      senderFundsRelayCpx: false
    };
  }
  function nodeRemainingRaw(alreadyEarnedRaw) {
    assertNonNegative(alreadyEarnedRaw, "alreadyEarnedRaw");
    const rem = NODE_REWARD_CAP_RAW - alreadyEarnedRaw;
    return rem > 0n ? rem : 0n;
  }
  function nodeCapLimitedNominalRaw(input) {
    if (input.nominalRewardRaw < 0n || input.nominalRewardRaw > RELAY_REWARD_CPX_CEILING_RAW) {
      throw new Error("ECONOMY_NOMINAL_OUT_OF_RANGE");
    }
    if (input.alreadyCountedNodePeriodRaw < 0n || input.alreadyCountedNodePeriodRaw > NODE_REWARD_CAP_RAW) {
      throw new Error("ECONOMY_COUNTED_OUT_OF_RANGE");
    }
    const remaining = nodeRemainingRaw(input.alreadyCountedNodePeriodRaw);
    const limited = input.nominalRewardRaw < remaining ? input.nominalRewardRaw : remaining;
    return { ok: true, nodeCapLimitedNominalRaw: limited, nodeRemainingRaw: remaining };
  }
  function globalPeriodPoolHardCapRaw(rewardReserveRawAtPeriodStart) {
    return divRem(
      rewardReserveRawAtPeriodStart * GLOBAL_BUDGET_NUMERATOR,
      GLOBAL_BUDGET_DENOMINATOR
    ).quotient;
  }
  function referralSplitRawExactOrFail(actualRewardRaw) {
    assertNonNegative(actualRewardRaw, "actualRewardRaw");
    const rem = divRem(actualRewardRaw * REFERRAL_REFERRER_NUM, REFERRAL_REFERRER_DEN);
    if (rem.remainder !== 0n) {
      throw new Error(`ECONOMY_REFERRAL_INEXACT_RAW:rem=${rem.remainder}`);
    }
    return { referrerRaw: rem.quotient, relayRaw: actualRewardRaw - rem.quotient };
  }
  function marketBurnRawExactOrFail(principalCpxRaw) {
    assertNonNegative(principalCpxRaw, "principalCpxRaw");
    const rem = divRem(principalCpxRaw * MARKET_BURN_NUMERATOR, MARKET_BURN_DENOMINATOR);
    if (rem.remainder !== 0n) {
      throw new Error(`ECONOMY_MARKET_BURN_INEXACT_RAW:rem=${rem.remainder}`);
    }
    return rem.quotient;
  }
  function first5000Allocation() {
    return {
      nodeCount: FIRST5000_NODE_COUNT,
      perNodeRaw: FIRST5000_PER_NODE_RAW,
      totalRaw: FIRST5000_TOTAL_RAW,
      insideGlobalPool: false
    };
  }
  function deriveCommonRewardPeriodId(input) {
    if (input.genesisUtcMs === null || input.genesisUtcMs === void 0) {
      return { ok: false, reason: "DG1_GENESIS_UNRESOLVED" };
    }
    if (input.trustedTimestampMs < input.genesisUtcMs) {
      return { ok: false, reason: "BEFORE_GENESIS" };
    }
    const delta = input.trustedTimestampMs - input.genesisUtcMs;
    return { ok: true, periodId: delta / REWARD_PERIOD_DURATION_MS };
  }
  function applyHighConfidenceWeightOrBlock(_input) {
    throw new Error("DG3_HIGH_CONFIDENCE_WEIGHT_USE_UNRESOLVED");
  }
  function simulatePayableRelayReward(input) {
    const capped = nodeCapLimitedNominalRaw({
      nominalRewardRaw: input.nominalRewardRaw,
      alreadyCountedNodePeriodRaw: input.alreadyCountedNodePeriodRaw
    });
    assertNonNegative(input.globalRemainingRaw, "globalRemainingRaw");
    const actual = capped.nodeCapLimitedNominalRaw < input.globalRemainingRaw ? capped.nodeCapLimitedNominalRaw : input.globalRemainingRaw;
    if (actual > capped.nodeCapLimitedNominalRaw || actual > input.globalRemainingRaw) {
      throw new Error("ECONOMY_CAP_EXCEEDED");
    }
    return {
      ok: true,
      nodeLimitedRaw: capped.nodeCapLimitedNominalRaw,
      actualPayableRaw: actual,
      neverExceedsCaps: true
    };
  }
  function allocateSequentialRelayRewards(input) {
    if (!Number.isInteger(input.relayCount) || input.relayCount < 0) {
      throw new Error("ECONOMY_INVALID_RELAY_COUNT");
    }
    assertNonNegative(input.globalRemainingRaw, "globalRemainingRaw");
    let remaining = input.globalRemainingRaw;
    const perRelayPayableRaw = [];
    let totalPayableRaw = 0n;
    for (let i = 0; i < input.relayCount; i++) {
      const counted = input.alreadyCountedNodePeriodRawByRelay?.[i] ?? input.alreadyCountedNodePeriodRawByRelay?.[0] ?? 0n;
      const step = simulatePayableRelayReward({
        nominalRewardRaw: input.nominalRewardRaw,
        alreadyCountedNodePeriodRaw: counted,
        globalRemainingRaw: remaining
      });
      perRelayPayableRaw.push(step.actualPayableRaw);
      totalPayableRaw += step.actualPayableRaw;
      remaining -= step.actualPayableRaw;
      if (remaining < 0n) throw new Error("ECONOMY_BUDGET_UNDERFLOW");
    }
    if (totalPayableRaw > input.globalRemainingRaw) {
      throw new Error("ECONOMY_AGGREGATE_EXCEEDS_GLOBAL");
    }
    return {
      ok: true,
      perRelayPayableRaw,
      totalPayableRaw,
      globalRemainingAfterRaw: remaining,
      neverExceedsCaps: true
    };
  }
  function quoteDeliveryEconomy(input) {
    const burn = offlineServiceBurnCpxRawFromEurPriceDecimal(input.cpxEurPriceDecimal);
    const nominal = nominalRelayRewardCpxRawFromEurPriceDecimal(input.cpxEurPriceDecimal);
    const reserve = input.rewardReserveRawAtPeriodStart ?? 1500000000000n * CPX_RAW_SCALE;
    const pool = globalPeriodPoolHardCapRaw(reserve);
    const globalAlready = input.globalAlreadyPaidRaw ?? 0n;
    assertNonNegative(globalAlready, "globalAlreadyPaidRaw");
    const globalRemainingRaw = pool > globalAlready ? pool - globalAlready : 0n;
    const payable = simulatePayableRelayReward({
      nominalRewardRaw: nominal.nominalRewardCpxRaw,
      alreadyCountedNodePeriodRaw: input.alreadyCountedNodePeriodRaw ?? 0n,
      globalRemainingRaw
    });
    if (input.actualPayableRawForReferral !== void 0 && input.actualPayableRawForReferral !== payable.actualPayableRaw) {
      throw new Error("REFERRAL_INPUT_MUST_MATCH_SIMULATED_PAYABLE");
    }
    let referral;
    try {
      referral = referralSplitRawExactOrFail(payable.actualPayableRaw);
    } catch (e) {
      referral = { blocked: e instanceof Error ? e.message : String(e) };
    }
    return {
      readiness: ECONOMY_READINESS,
      cpxEurPrice: input.cpxEurPriceDecimal,
      offlineBurnRaw: burn.serviceBurnCpxRaw,
      offlineBurnCpx: rawToCpxDecimal(burn.serviceBurnCpxRaw),
      nominalRelayRaw: nominal.nominalRewardCpxRaw,
      nominalRelayCpx: rawToCpxDecimal(nominal.nominalRewardCpxRaw),
      nodeLimitedRaw: payable.nodeLimitedRaw,
      actualPayableRaw: payable.actualPayableRaw,
      globalPoolHardCapRaw: pool,
      globalRemainingRaw,
      referral,
      first5000: first5000Allocation(),
      platformFee: PLATFORM_FEE,
      settlementExecution: "BLOCKED_NOT_IN_OPEN_SDK"
    };
  }

  // src/market/paradoxMarket.ts
  var MARKET_READINESS = Readiness.SIMULATED;
  var SDK_DEMO_AGREEMENT_DOMAIN = "meshsender.sdk.demo.market-agreement.v1";
  function canonicalAgreementJson(draft) {
    return [
      SDK_DEMO_AGREEMENT_DOMAIN,
      `agreementId=${draft.agreementId.trim()}`,
      `category=${draft.category}`,
      `title=${draft.title.trim()}`,
      `principalCpxDecimal=${draft.principalCpxDecimal.trim()}`,
      `buyerNodeId=${draft.buyerNodeId.trim()}`,
      `sellerNodeId=${draft.sellerNodeId.trim()}`,
      `createdAtMs=${draft.createdAtMs}`,
      `rentRemainsEur=${draft.rentRemainsEur === true ? "true" : "false"}`,
      `notes=${(draft.notes ?? "").trim()}`
    ].join("\n");
  }
  function hashMarketAgreement(draft) {
    const canonicalJson = canonicalAgreementJson(draft);
    return { agreementHashHex: sha256Hex(canonicalJson), canonicalJson };
  }
  function signAgreementHash(agreementHashHex, signer) {
    if (!isSha256Hex(agreementHashHex.trim().toLowerCase())) {
      throw new Error("AGREEMENT_HASH_INVALID");
    }
    const msg = `${SDK_DEMO_AGREEMENT_DOMAIN}|hash=${agreementHashHex.trim().toLowerCase()}`;
    return signUtf8Detached(msg, signer.secretKey);
  }
  function verifyBilateralAgreement(input) {
    const hash = input.agreementHashHex.trim().toLowerCase();
    if (!isSha256Hex(hash)) {
      return { ok: false, reason: "AGREEMENT_HASH_INVALID", readiness: MARKET_READINESS };
    }
    const expectedBuyer = input.expectedBuyerPublicKeyB64.trim();
    const expectedSeller = input.expectedSellerPublicKeyB64.trim();
    if (!expectedBuyer || !expectedSeller) {
      return { ok: false, reason: "EXPECTED_SIGNERS_REQUIRED", readiness: MARKET_READINESS };
    }
    if (expectedBuyer === expectedSeller) {
      return { ok: false, reason: "SAME_PARTY_BILATERAL_REJECTED", readiness: MARKET_READINESS };
    }
    if (input.signatures.buyerPublicKeyB64.trim() !== expectedBuyer) {
      return { ok: false, reason: "WRONG_BUYER_SIGNER", readiness: MARKET_READINESS };
    }
    if (input.signatures.sellerPublicKeyB64.trim() !== expectedSeller) {
      return { ok: false, reason: "WRONG_SELLER_SIGNER", readiness: MARKET_READINESS };
    }
    const msg = `${SDK_DEMO_AGREEMENT_DOMAIN}|hash=${hash}`;
    try {
      const buyerOk = verifyUtf8Detached(
        msg,
        input.signatures.buyerSignatureB64,
        decodePublicKeyB64(expectedBuyer)
      );
      const sellerOk = verifyUtf8Detached(
        msg,
        input.signatures.sellerSignatureB64,
        decodePublicKeyB64(expectedSeller)
      );
      if (!buyerOk || !sellerOk) {
        return { ok: false, reason: "SIGNATURE_INVALID", readiness: MARKET_READINESS };
      }
      return { ok: true, readiness: MARKET_READINESS };
    } catch {
      return { ok: false, reason: "VERIFY_EXCEPTION", readiness: MARKET_READINESS };
    }
  }
  function quoteDirectMarketPayment(input) {
    const rational = parseDecimalToRational(input.principalCpxDecimal);
    const converted = rationalCpxToRawDg2(rational);
    if (!converted.exact) {
      throw new Error("MARKET_PRINCIPAL_NOT_EXACTLY_REPRESENTABLE");
    }
    if (converted.raw <= 0n) {
      throw new Error("MARKET_PRINCIPAL_MUST_BE_POSITIVE");
    }
    const parts = input.principalCpxDecimal.trim().split(".");
    const frac = parts[1] ?? "";
    if (frac.length > CPX_DECIMALS) {
      throw new Error("MARKET_PRINCIPAL_TOO_PRECISE");
    }
    const principalRaw = converted.raw;
    const burnRaw = marketBurnRawExactOrFail(principalRaw);
    const total = principalRaw + burnRaw;
    return {
      readiness: ECONOMY_READINESS,
      category: input.category,
      principalRaw,
      principalCpx: rawToCpxDecimal(principalRaw),
      recipientReceivesRaw: principalRaw,
      recipientReceivesCpx: rawToCpxDecimal(principalRaw),
      buyerExtraBurnRaw: burnRaw,
      buyerExtraBurnCpx: rawToCpxDecimal(burnRaw),
      buyerTotalRaw: total,
      buyerTotalCpx: rawToCpxDecimal(total),
      platformCommission: PLATFORM_FEE,
      custodialEscrow: false,
      marketplaceOperationalClaim: "NOT_CLAIMED_UNFINISHED_FEATURES_PENDING"
    };
  }
  function simulateBilateralDeal(input) {
    if (input.buyer.publicKeyB64 === input.seller.publicKeyB64) {
      throw new Error("SAME_PARTY_BILATERAL_REJECTED");
    }
    const hash = hashMarketAgreement(input.draft);
    const signatures = {
      buyerPublicKeyB64: input.buyer.publicKeyB64,
      sellerPublicKeyB64: input.seller.publicKeyB64,
      buyerSignatureB64: signAgreementHash(hash.agreementHashHex, input.buyer),
      sellerSignatureB64: signAgreementHash(hash.agreementHashHex, input.seller)
    };
    const v = verifyBilateralAgreement({
      agreementHashHex: hash.agreementHashHex,
      signatures,
      expectedBuyerPublicKeyB64: input.buyer.publicKeyB64,
      expectedSellerPublicKeyB64: input.seller.publicKeyB64
    });
    const payment = quoteDirectMarketPayment({
      category: input.draft.category,
      principalCpxDecimal: input.draft.principalCpxDecimal
    });
    return {
      readiness: MARKET_READINESS,
      hash,
      signatures,
      verified: v.ok,
      verifyReason: v.reason,
      payment
    };
  }

  // src/pipeline/simulatedDeliveryPipeline.ts
  function extractRelayForwardTimestampsFromEvents(events, deliveryRoute) {
    const relays = deliveryRoute.slice(1, -1);
    const times = [];
    for (let i = 0; i < relays.length; i++) {
      const relay = relays[i];
      const next = deliveryRoute[i + 2];
      const ev = events.find(
        (e) => e.type === "FORWARDED" && e.from === relay && e.to === next
      );
      if (!ev || ev.type !== "FORWARDED") {
        throw new Error(`MISSING_ROUTE_FORWARD_EVENT:${relay}->${next}`);
      }
      times.push(ev.atMs);
    }
    return times;
  }
  function runSimulatedDeliveryPipeline(input) {
    const simulation = runOfflineStoreCarryForward(input.simulationInput);
    if (!simulation.delivered || simulation.deliveryAtMs == null || simulation.hops == null || !simulation.deliveryRoute) {
      return { ok: false, reason: "DELIVERY_NOT_SUCCESSFUL", simulation };
    }
    const recipientSigner = generateDemoKeyPair();
    const proof = createDeliveryProofFromSimulation({
      messageId: input.simulationInput.packet.packetId,
      fromNodeId: input.simulationInput.packet.from,
      toNodeId: input.simulationInput.packet.to,
      deliveredAtMs: simulation.deliveryAtMs,
      hops: simulation.hops,
      ingressTransport: "ble",
      payloadDigestHex: simulation.payloadDigestHex,
      recipientSigner
    });
    const proofCheck = verifyDemoDeliveryProof(proof, recipientSigner.publicKeyB64);
    if (!proofCheck.ok) {
      return {
        ok: false,
        reason: "PROOF_VERIFY_FAILED",
        simulation,
        detail: proofCheck.reason
      };
    }
    const economy = quoteDeliveryEconomy({
      cpxEurPriceDecimal: input.cpxEurPriceDecimal ?? "0.0005",
      alreadyCountedNodePeriodRaw: input.alreadyCountedNodePeriodRaw ?? 0n,
      rewardReserveRawAtPeriodStart: input.rewardReserveRawAtPeriodStart,
      globalAlreadyPaidRaw: input.globalAlreadyPaidRaw
    });
    let relay = void 0;
    if (input.buildRelay !== false && simulation.deliveryRoute.length >= 3) {
      const intermediates = simulation.deliveryRoute.length - 2;
      const hopSigners = Array.from({ length: intermediates }, () => generateDemoKeyPair());
      const times = extractRelayForwardTimestampsFromEvents(
        simulation.events,
        simulation.deliveryRoute
      );
      let globalRemainingRaw = economy.globalRemainingRaw;
      if (input.globalRemainingRawOverride !== void 0) {
        if (input.globalRemainingRawOverride < 0n) {
          throw new Error("ECONOMY_GLOBAL_OVERRIDE_NEGATIVE");
        }
        globalRemainingRaw = input.globalRemainingRawOverride < economy.globalRemainingRaw ? input.globalRemainingRawOverride : economy.globalRemainingRaw;
      }
      const countedByRelay = input.alreadyCountedNodePeriodRawByRelay ?? Array.from({ length: intermediates }, () => input.alreadyCountedNodePeriodRaw ?? 0n);
      const allocation = allocateSequentialRelayRewards({
        relayCount: intermediates,
        nominalRewardRaw: economy.nominalRelayRaw,
        alreadyCountedNodePeriodRawByRelay: countedByRelay,
        globalRemainingRaw
      });
      const built = buildRelayHopsFromDeliveryRoute({
        messageId: input.simulationInput.packet.packetId,
        deliveryRoute: simulation.deliveryRoute,
        hopSigners,
        forwardedAtMsByHop: times,
        rewardRawDecimalByHop: allocation.perRelayPayableRaw.map((r) => r.toString())
      });
      const bundle = buildPagedRelayEvidence({
        messageId: input.simulationInput.packet.packetId,
        intentDigestHex: digestPayload(`intent:${input.simulationInput.packet.packetId}`),
        nonceB64: "cGlwZWxpbmUtbm9uY2U=",
        senderDigestHex: digestPayload(input.simulationInput.packet.from),
        recipientDigestHex: digestPayload(input.simulationInput.packet.to),
        hops: built.hops,
        expectedSignerPublicKeysB64: built.expectedSignerPublicKeysB64
      });
      const v = verifyPagedRelayEvidence({
        bundle,
        expectedSignerPublicKeysB64: built.expectedSignerPublicKeysB64,
        expectedRootCommitmentHex: bundle.rootCommitmentHex
      });
      if (!v.ok) {
        return {
          ok: false,
          reason: "RELAY_VERIFY_FAILED",
          simulation,
          detail: v.reason
        };
      }
      relay = {
        bundle,
        expectedSigners: built.expectedSignerPublicKeysB64,
        verified: true,
        perRelayPayableRaw: allocation.perRelayPayableRaw,
        totalPayableRaw: allocation.totalPayableRaw,
        forwardedAtMsByHop: times
      };
    }
    return {
      ok: true,
      simulation,
      recipientSigner,
      proof,
      proofVerified: true,
      relay,
      economy
    };
  }

  // src/solana/publicIdentifiers.ts
  var CPX_MAINNET_MINT_ADDRESS = "9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X";
  var MESHSENDER_PROGRAM_ID = "GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg";
  var CPX_DECIMALS_EXPECTED = 6;
  var SPL_TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
  var DEFAULT_MAINNET_RPC = "https://api.mainnet-beta.solana.com";
  var SECONDARY_MAINNET_RPC = "https://solana-rpc.publicnode.com";

  // src/solana/publicRpcFetch.ts
  var PUBLIC_RPC_READINESS = Readiness.LIVE_READ_ONLY;
  async function rpc(rpcUrl, method, params) {
    try {
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
      });
      const json = await res.json();
      if (json.error) return { ok: false, error: json.error.message || "RPC_ERROR" };
      return { ok: true, result: json.result };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
  async function fetchInspectCpxMint(rpcUrl = DEFAULT_MAINNET_RPC) {
    const slot = await rpc(rpcUrl, "getSlot", []);
    const acc = await rpc(rpcUrl, "getAccountInfo", [
      CPX_MAINNET_MINT_ADDRESS,
      { encoding: "jsonParsed" }
    ]);
    if (!acc.ok) {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: "RPC_ERROR",
        error: acc.error,
        rpcUrl
      };
    }
    const value = acc.result?.value;
    if (!value) {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: "RPC_ERROR",
        error: "MINT_ACCOUNT_NOT_FOUND",
        rpcUrl
      };
    }
    const owner = value.owner ?? "";
    const parsedType = value.data?.parsed?.type ?? "unknown";
    const info = value.data?.parsed?.info ?? {};
    if (owner !== SPL_TOKEN_PROGRAM_ID || parsedType !== "mint") {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: "RPC_ERROR",
        error: `UNEXPECTED_MINT:${owner}:${parsedType}`,
        rpcUrl
      };
    }
    const supply = await rpc(rpcUrl, "getTokenSupply", [CPX_MAINNET_MINT_ADDRESS]);
    if (!supply.ok) {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: "RPC_ERROR",
        error: supply.error,
        rpcUrl
      };
    }
    const s = supply.result.value;
    if (s.decimals !== CPX_DECIMALS_EXPECTED) {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: "RPC_ERROR",
        error: `UNEXPECTED_DECIMALS:${s.decimals}`,
        rpcUrl
      };
    }
    const mintAuthorityFieldPresent = Object.prototype.hasOwnProperty.call(info, "mintAuthority");
    const freezeAuthorityFieldPresent = Object.prototype.hasOwnProperty.call(info, "freezeAuthority");
    const mintAuthority = !mintAuthorityFieldPresent ? null : info.mintAuthority == null ? null : String(info.mintAuthority);
    const freezeAuthority = !freezeAuthorityFieldPresent ? null : info.freezeAuthority == null ? null : String(info.freezeAuthority);
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: "MINT_VERIFIED",
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      rpcUrl,
      slot: slot.ok ? slot.result : null,
      accountOwner: owner,
      parsedType,
      decimals: s.decimals,
      supplyRaw: s.amount,
      supplyUi: s.uiAmountString ?? "",
      mintAuthority,
      freezeAuthority,
      mintAuthorityFieldPresent,
      freezeAuthorityFieldPresent,
      mintAuthorityRevoked: mintAuthorityFieldPresent ? info.mintAuthority === null : null,
      freezeAuthorityRevoked: freezeAuthorityFieldPresent ? info.freezeAuthority === null : null
    };
  }
  async function fetchInspectProgram(rpcUrl = DEFAULT_MAINNET_RPC) {
    const slot = await rpc(rpcUrl, "getSlot", []);
    const acc = await rpc(rpcUrl, "getAccountInfo", [MESHSENDER_PROGRAM_ID, { encoding: "base64" }]);
    if (!acc.ok) {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: "RPC_ERROR",
        programId: MESHSENDER_PROGRAM_ID,
        rpcUrl,
        slot: null,
        executable: null,
        ownerProgram: null,
        error: acc.error
      };
    }
    const value = acc.result?.value;
    if (!value) {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: "PROGRAM_NOT_FOUND",
        programId: MESHSENDER_PROGRAM_ID,
        rpcUrl,
        slot: slot.ok ? slot.result : null,
        executable: null,
        ownerProgram: null
      };
    }
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: value.executable ? "PROGRAM_EXECUTABLE" : "PROGRAM_NOT_EXECUTABLE",
      programId: MESHSENDER_PROGRAM_ID,
      rpcUrl,
      slot: slot.ok ? slot.result : null,
      executable: !!value.executable,
      ownerProgram: value.owner ?? null
    };
  }
  async function fetchInspectProgramDualRpc(rpcUrls = [DEFAULT_MAINNET_RPC, SECONDARY_MAINNET_RPC]) {
    const results = [];
    for (const url of rpcUrls) results.push(await fetchInspectProgram(url));
    const statuses = new Set(results.map((r) => r.status));
    let agreement = "MIXED_OR_ERROR";
    if (statuses.size === 1 && statuses.has("PROGRAM_EXECUTABLE")) agreement = "ALL_EXECUTABLE";
    else if (statuses.size === 1 && statuses.has("PROGRAM_NOT_FOUND")) agreement = "ALL_NOT_FOUND";
    else if (statuses.size === 1 && statuses.has("PROGRAM_NOT_EXECUTABLE"))
      agreement = "ALL_NOT_EXECUTABLE";
    return { readiness: PUBLIC_RPC_READINESS, results, agreement };
  }

  // src/browser-entry.ts
  var SDK_NAME = "@meshsender/sdk";
  var SDK_VERSION = "0.1.0-hackathon";
  var SDK_EDITION = "HACKATHON_FLAGSHIP";
  var BROWSER_BUNDLE = true;
  return __toCommonJS(browser_entry_exports);
})();
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
